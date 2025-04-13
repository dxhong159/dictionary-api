import { Cheerio } from "cheerio";
import {
  AudioData,
  Definition,
  DictionaryEntry,
  DictionaryResponse,
} from "../types/dictionary";
import { BaseDictionaryService } from "./base-dictionary.service";
import { Element } from "domhandler";

/**
 * Oxford Dictionary Service
 * Concrete implementation of BaseDictionaryService for Oxford Dictionary
 * Follows Single Responsibility Principle (SRP) by focusing only on Oxford-specific scraping
 */
export class OxfordDictionaryService extends BaseDictionaryService {
  constructor() {
    super("oxford");
  }

  /**
   * Looks up a word in the Oxford Learner's Dictionary
   * @param word The word to look up
   * @returns A promise resolving to DictionaryResponse
   */
  /**
   * Fetches Oxford dictionary HTML using their direct search URL which handles redirects
   * @param word The word to look up
   * @returns A cheerio object with the parsed HTML
   */
  private async fetchOxfordHtml(word: string): Promise<any> {
    try {
      // Use Oxford's direct search URL which automatically redirects to the correct word page
      const directSearchUrl = `https://www.oxfordlearnersdictionaries.com/search/english/direct/?q=${encodeURIComponent(
        word
      )}`;

      console.log(
        `Fetching Oxford definition with direct search URL: ${directSearchUrl}`
      );
      const $ = await this.fetchHtml(directSearchUrl);

      // Check if we got a valid page with dictionary content
      if ($(".entry").length > 0 || $(".webtop").length > 0) {
        console.log(`Successfully fetched Oxford definition for: ${word}`);
        return $;
      } else {
        console.log(
          `Oxford page doesn't contain expected dictionary content for: ${word}`
        );
      }
    } catch (error: any) {
      console.log(`Error fetching Oxford definition: ${error.message}`);
    }

    // If direct search fails, try the regular search as a fallback
    try {
      const searchUrl = `https://www.oxfordlearnersdictionaries.com/search/english/?q=${encodeURIComponent(
        word
      )}`;
      console.log(`Trying fallback search URL: ${searchUrl}`);
      const searchPage = await this.fetchHtml(searchUrl);

      // Check if search page has a direct link to the word
      const definitionLink = searchPage(".search-results .result a")
        .first()
        .attr("href");
      if (definitionLink) {
        console.log(`Found definition link through search: ${definitionLink}`);
        return await this.fetchHtml(definitionLink);
      }
    } catch (error: any) {
      console.log(`Search approach failed: ${error.message}`);
    }

    // If all attempts fail, throw an error
    throw new Error(
      `Could not find Oxford definition for "${word}" using any known URL pattern`
    );
  }

  async lookupWord(word: string): Promise<DictionaryResponse> {
    try {
      // Use the new method to handle Oxford's URL patterns
      const $ = await this.fetchOxfordHtml(word);
      const entries: DictionaryEntry[] = [];

      // Extract global audio URLs
      const audioData: AudioData = {};

      // Find UK audio
      $(".sound.audio_play_button.pron-uk.icon-audio").each(
        (i: number, element: Element) => {
          if (i === 0) {
            // Take first one for main audio
            const ukAudioUrl = $(element).attr("data-src-mp3");
            if (ukAudioUrl) {
              audioData.uk = ukAudioUrl;
            }
          }
        }
      );

      // Find US audio
      $(".sound.audio_play_button.pron-us.icon-audio").each(
        (i: number, element: Element) => {
          if (i === 0) {
            // Take first one for main audio
            const usAudioUrl = $(element).attr("data-src-mp3");
            if (usAudioUrl) {
              audioData.us = usAudioUrl;
            }
          }
        }
      );

      // Get the actual word from headword if available
      let headword = $(".headword").first().text().trim() || word;
      // Keep the numeric suffix intact for accuracy (like "do1")
      // This is Oxford's way of distinguishing homonyms

      // Process each entry block (different parts of speech)
      $(".entry").each((i: number, element: Element) => {
        // Get part of speech
        const partOfSpeech = $(element).find(".pos").first().text().trim();

        // Get phonetic
        const phonetic = $(element).find(".phon").first().text().trim();

        // Get entry-specific audio if available
        const entryAudioData: AudioData = {};
        const entryUkAudio = $(element)
          .find(".sound.audio_play_button.pron-uk.icon-audio")
          .first()
          .attr("data-src-mp3");
        const entryUsAudio = $(element)
          .find(".sound.audio_play_button.pron-us.icon-audio")
          .first()
          .attr("data-src-mp3");

        if (entryUkAudio) entryAudioData.uk = entryUkAudio;
        if (entryUsAudio) entryAudioData.us = entryUsAudio;

        // Process definitions
        const senseGroups = $(element).find(".sense");
        const definitions = senseGroups
          .map((j: number, sense: Element) => {
            const definition = $(sense).find(".def").first().text().trim();

            // Context information (e.g., "example of something")
            const contextInfo = $(sense).find(".cf").first().text().trim();

            // Get examples if any
            const examples = $(sense)
              .find(".x")
              .map((k: number, examp: Element) => {
                return $(examp).text().trim();
              })
              .get();

            return {
              definition,
              examples: examples.length > 0 ? examples : undefined,
              context: contextInfo || undefined,
            };
          })
          .get();

        // Get synonyms if any
        const synonymBlock = $(element).find(".synonyms");
        const synonyms =
          synonymBlock.length > 0
            ? $(synonymBlock)
                .text()
                .trim()
                .replace("Synonyms:", "")
                .split(",")
                .map((s: string) => s.trim())
            : undefined;

        // Extract idioms if any
        $(element)
          .find(".idioms .idm-g")
          .each((j: number, idiomGroup: Element) => {
            const idiomText = $(idiomGroup).find(".idm").first().text().trim();
            const idiomDefinitions: Definition[] = [];

            $(idiomGroup)
              .find(".sense")
              .each((k: number, idiomSense: Element) => {
                const idiomDef = $(idiomSense)
                  .find(".def")
                  .first()
                  .text()
                  .trim();

                const idiomExamples = $(idiomSense)
                  .find(".x")
                  .map((l: number, examp: Element) => {
                    return $(examp).text().trim();
                  })
                  .get();

                idiomDefinitions.push({
                  definition: idiomDef,
                  examples:
                    idiomExamples.length > 0 ? idiomExamples : undefined,
                });
              });

            if (idiomDefinitions.length > 0) {
              entries.push({
                word: `${headword} (${idiomText})`,
                phonetic: "",
                partOfSpeech: "idiom",
                definitions: idiomDefinitions,
                audio:
                  Object.keys(audioData).length > 0 ? audioData : undefined,
              });
            }
          });

        if (definitions.length > 0) {
          entries.push({
            word: headword,
            phonetic,
            partOfSpeech,
            definitions,
            synonyms,
            audio:
              Object.keys(entryAudioData).length > 0
                ? entryAudioData
                : audioData,
          });
        }
      });

      // If no entries were found but the page loaded
      if (entries.length === 0) {
        const redirectedWord =
          $(".headword").first().text().trim() || $(".h").first().text().trim();
        if (
          redirectedWord &&
          redirectedWord.toLowerCase() !== word.toLowerCase()
        ) {
          return {
            word,
            entries: [],
            source: this.sourceName,
            error: `No exact match found for "${word}". Oxford may have redirected to "${redirectedWord}".`,
          };
        }
      }

      return {
        word: headword,
        entries,
        source: this.sourceName,
        audio: Object.keys(audioData).length > 0 ? audioData : undefined,
      };
    } catch (error) {
      return this.handleError(word, error);
    }
  }
}
