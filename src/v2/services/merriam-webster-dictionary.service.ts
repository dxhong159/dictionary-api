import * as cheerio from "cheerio";
import {
  MerriamWebsterDictionaryResponse,
  MerriamDictionaryEntry,
  MerriamPartOfSpeechSection,
  MerriamDefinition,
  MerriamSenseNumber,
  MerriamWebsterPronunciation,
  MerriamExample,
  MerriamLabel,
  MerriamEtymology,
  MerriamRelatedPhrase,
} from "../types/merriam-webster";
import { Element } from "domhandler";
import { BaseDictionaryService } from "./base-dictionary.service";

/**
 * Service to scrape definitions from Merriam-Webster Dictionary
 * Implements the dictionary service interface for v2
 * Follows Single Responsibility Principle (SRP) by focusing only on Merriam-Webster specific scraping
 * Follows Liskov Substitution Principle (LSP) by properly extending BaseDictionaryService
 */
export class MerriamWebsterDictionaryService extends BaseDictionaryService<MerriamWebsterDictionaryResponse> {
  private baseUrl: string = "https://www.merriam-webster.com/dictionary";

  constructor() {
    super("Merriam-Webster");
  }

  /**
   * Makes an absolute URL from a relative URL
   * @param relativeUrl The relative URL
   * @returns The absolute URL
   * @protected
   */
  protected makeAbsoluteUrl(relativeUrl?: string): string | undefined {
    return super.makeAbsoluteUrl(
      "https://www.merriam-webster.com",
      relativeUrl
    );
  }

  /**
   * Handle errors from the API
   * @param word The word that was being looked up
   * @param error The error that occurred
   * @returns A DictionaryResponse with the error information
   * @private
   */
  private handleMerriamError(
    word: string,
    error: unknown
  ): MerriamWebsterDictionaryResponse {
    return super.handleError(word, error) as MerriamWebsterDictionaryResponse;
  }

  /**
   * Extract sense number from its container
   * @param $
   * @param element
   * @returns Parsed sense number information
   * @private
   */
  private extractSenseNumber(
    $: cheerio.CheerioAPI,
    element: Element
  ): MerriamSenseNumber | undefined {
    const senseNumberText = $(element)
      .find(".vg-sseq-entry-item-label")
      .first()
      .text()
      .trim();
    if (!senseNumberText) return undefined;

    // Parse hierarchical numbering like "1a(2)" into parts
    const mainMatch = senseNumberText.match(/^(\d+)/);
    const subLetterMatch = senseNumberText.match(/(\d+)([a-z])/);
    const subNumberMatch = senseNumberText.match(/\((\d+)\)/);

    return {
      main: mainMatch ? mainMatch[1] : senseNumberText,
      subLetter: subLetterMatch ? subLetterMatch[2] : undefined,
      subNumber: subNumberMatch ? subNumberMatch[1] : undefined,
      fullForm: senseNumberText,
    };
  }

  /**
   * Extract examples from a definition element
   * @param $
   * @param element
   * @returns Array of examples
   * @private
   */
  private extractExamples(
    $: cheerio.CheerioAPI,
    element: Element
  ): MerriamExample[] {
    const examples: MerriamExample[] = [];

    // Look for examples within various containers that might hold examples
    const exampleSelectors = [
      ".in-sentences", // Regular in-sentence examples
      ".examples li", // Examples in list items
      ".freshness-examples li", // Examples from "freshness" sections
      ".example-sentences .t", // Additional example containers
    ];

    exampleSelectors.forEach((selector) => {
      $(element)
        .find(selector)
        .each((_, exampleEl) => {
          const text = $(exampleEl).text().trim();
          if (text) {
            const example: MerriamExample = { text };

            // Try to find attribution
            const attribution = $(exampleEl)
              .find(".quote-author, .freshness-example-cite")
              .text()
              .trim();
            if (attribution) {
              example.attribution = attribution;
            }

            // Check if this is a specific type of example (literature, recent, historical)
            if ($(exampleEl).closest(".freshness-tab").length > 0) {
              const tabType = $(exampleEl)
                .closest(".freshness-tab")
                .attr("data-tab");
              if (tabType) {
                example.type = tabType;
              }
            }

            examples.push(example);
          }
        });
    });

    return examples;
  }

  /**
   * Extract labels for a definition
   * @param $
   * @param element
   * @returns Array of labels
   * @private
   */
  private extractLabels(
    $: cheerio.CheerioAPI,
    element: Element
  ): MerriamLabel[] {
    const labels: MerriamLabel[] = [];

    // Check for subject field label
    const subjectLabel = $(element).find(".subject-label").text().trim();
    if (subjectLabel) {
      labels.push({ type: "subject", text: subjectLabel });
    }

    // Check for register (formal, informal, etc.)
    const registerLabel = $(element).find(".usage-label").text().trim();
    if (registerLabel) {
      labels.push({ type: "register", text: registerLabel });
    }

    // Check for grammar labels
    const grammarLabel = $(element).find(".gram-label").text().trim();
    if (grammarLabel) {
      labels.push({ type: "grammar", text: grammarLabel });
    }

    return labels;
  }

  /**
   * Extract the detailed pronunciation information
   * @param $
   * @param element
   * @returns Pronunciation data
   * @private
   */
  private extractPronunciation(
    $: cheerio.CheerioAPI,
    element: Element
  ): MerriamWebsterPronunciation | undefined {
    // Tìm tất cả các phát âm trong phần tử
    const allPronElements = $(element).find(".play-pron-v2");
    if (allPronElements.length === 0) {
      // Thử tìm phát âm trong vg-ins (phần có thể được thêm vào bởi JavaScript sau khi trang tải)
      const vgInsElements = $(element).find(".vg-ins .play-pron-v2");
      if (vgInsElements.length === 0) {
        return undefined;
      }
    }

    // Lấy phần tử đầu tiên cho phát âm chính
    const mainPronElement = allPronElements.first();

    // Extract the written pronunciation (displayed text) từ phần tử chính
    let written = mainPronElement
      .clone()
      .children()
      .remove()
      .end()
      .text()
      .trim();
    if (!written) {
      // Tìm trong phần tử .mw có thể chứa chữ
      const mwElement = $(element).find(".mw, .if").first();
      if (mwElement.length > 0) {
        written = mwElement.text().trim();
      }
    }

    if (!written) return undefined;

    // Tạo đối tượng phát âm
    const pronunciation: MerriamWebsterPronunciation = { written };

    // Mảng để lưu trữ tất cả các URL âm thanh của các hình thức từ
    const allAudioUrls: { form?: string; url: string }[] = [];

    // Trích xuất URL âm thanh cho phát âm chính
    extractAudioUrl(mainPronElement, allAudioUrls);

    // Trích xuất URL âm thanh cho tất cả các hình thức từ
    allPronElements.each((_, pronElem) => {
      // Tìm hình thức từ ở phần tử gần nhất .if
      let form: string | undefined;
      const ifElement = $(pronElem).closest(".prt-a").prev(".if");
      if (ifElement.length > 0) {
        form = ifElement.text().trim();
      }

      extractAudioUrl($(pronElem), allAudioUrls, form);
    });

    // Tìm thêm trong .vg-ins nếu có
    $(element)
      .find(".vg-ins .play-pron-v2")
      .each((_, pronElem) => {
        // Tìm hình thức từ trong phần tử .if gần nhất
        const ifElement = $(pronElem).closest(".prt-a").prev(".if");
        let form: string | undefined;
        if (ifElement.length > 0) {
          form = ifElement.text().trim();
        }

        extractAudioUrl($(pronElem), allAudioUrls, form);
      });

    // Hàm trích xuất URL âm thanh từ phần tử
    function extractAudioUrl(pronElem: any, urls: any[], form?: string) {
      // Phương pháp 1: Sử dụng thuộc tính data-file và data-dir
      const dataFile = pronElem.attr("data-file");
      const dataDir = pronElem.attr("data-dir");
      const dataLang = pronElem.attr("data-lang") || "en_us";

      // Phương pháp 2: Lấy URL trực tiếp từ thuộc tính data-audio
      const audioUrl = pronElem.attr("data-audio");

      let finalUrl: string | undefined;

      if (audioUrl) {
        // Nếu URL có sẵn trong thuộc tính data-audio
        finalUrl = audioUrl;
        console.log(
          `Found audio URL from data-audio attribute for ${
            form || "main form"
          }: ${audioUrl}`
        );
      } else if (dataFile && dataDir) {
        // Xây dựng URL từ data-file và data-dir
        const lang = dataLang.replace("_", "/");
        finalUrl = `https://media.merriam-webster.com/audio/prons/${lang}/mp3/${dataDir}/${dataFile}.mp3`;
        console.log(
          `Constructed audio URL for ${form || "main form"}: ${finalUrl}`
        );
      } else {
        // Phương pháp 3: Tìm trong thuộc tính onclick
        const onClickAttr = pronElem.attr("onclick");
        if (onClickAttr) {
          const audioUrlMatch = onClickAttr.match(
            /(['"])(?:https?:\/\/[^'"]+\.mp3)\1/i
          );
          if (audioUrlMatch && audioUrlMatch[1]) {
            finalUrl = audioUrlMatch[1];
            console.log(
              `Extracted audio URL from onclick for ${
                form || "main form"
              }: ${finalUrl}`
            );
          }
        }

        // Phương pháp 4: Lấy từ thuộc tính href và xây dựng URL từ data-url
        const hrefAttr = pronElem.attr("href");
        const dataUrl = pronElem.attr("data-url");
        if ((hrefAttr || dataUrl) && dataFile && dataDir) {
          // Đảm bảo biến lang được định nghĩa trong scope này
          const lang = dataLang.replace("_", "/");
          finalUrl = `https://media.merriam-webster.com/audio/prons/${lang}/mp3/${dataDir}/${dataFile}.mp3`;
          console.log(
            `Built audio URL from href/data-url for ${
              form || "main form"
            }: ${finalUrl}`
          );
        }
      }

      // Thêm URL vào danh sách nếu tìm thấy
      if (finalUrl) {
        urls.push({ form, url: finalUrl });
      }
    }

    // Đặt URL âm thanh chính cho pronunciation
    if (allAudioUrls.length > 0) {
      pronunciation.audioUrl = allAudioUrls[0].url;

      // Nếu có nhiều URL âm thanh, thêm vào trường wordForms
      if (allAudioUrls.length > 1) {
        pronunciation.wordForms = allAudioUrls
          .filter((item) => item.form)
          .map((item) => ({
            form: item.form || "",
            audioUrl: item.url,
          }));
      }
    }

    // Check for phonetic transcription (IPA)
    const phonetic = $(element).find(".ipa").text().trim() || written;
    if (phonetic) {
      pronunciation.phonetic = phonetic;
    }

    return pronunciation;
  }

  /**
   * Extract definitions from sense blocks
   * @param $
   * @param element
   * @returns Array of definitions
   * @private
   */
  private extractDefinitions(
    $: cheerio.CheerioAPI,
    element: Element
  ): MerriamDefinition[] {
    const definitions: MerriamDefinition[] = [];

    $(element)
      .find(".vg-sseq-entry-item")
      .each((_, defItem) => {
        const senseNumber = this.extractSenseNumber($, defItem);

        // Get the definition text
        const definitionText = $(defItem).find(".sb-entry").text().trim();
        if (!definitionText) return;

        const definition: MerriamDefinition = {
          text: definitionText,
        };

        if (senseNumber) {
          definition.senseNumber = senseNumber;
        }

        // Extract examples
        const examples = this.extractExamples($, defItem);
        if (examples.length > 0) {
          definition.examples = examples;
        }

        // Extract labels
        const labels = this.extractLabels($, defItem);
        if (labels.length > 0) {
          definition.labels = labels;
        }

        // Extract usage notes
        const usageNotes: string[] = [];
        $(defItem)
          .find(".usage-note")
          .each((_, note) => {
            const noteText = $(note).text().trim();
            if (noteText) usageNotes.push(noteText);
          });

        if (usageNotes.length > 0) {
          definition.usageNotes = usageNotes;
        }

        // Extract synonyms specific to this definition
        const synonyms: string[] = [];
        $(defItem)
          .find(".synonyms-list li")
          .each((_, syn) => {
            const synText = $(syn).text().trim();
            if (synText) synonyms.push(synText);
          });

        if (synonyms.length > 0) {
          definition.synonyms = synonyms;
        }

        // Extract antonyms specific to this definition
        const antonyms: string[] = [];
        $(defItem)
          .find(".antonyms-list li")
          .each((_, ant) => {
            const antText = $(ant).text().trim();
            if (antText) antonyms.push(antText);
          });

        if (antonyms.length > 0) {
          definition.antonyms = antonyms;
        }

        definitions.push(definition);
      });

    return definitions;
  }

  /**
   * Extract etymology information
   * @param $
   * @param element
   * @returns Etymology data
   * @private
   */
  private extractEtymology(
    $: cheerio.CheerioAPI,
    element: Element
  ): MerriamEtymology | undefined {
    const etymologyText = $(element).find(".et").text().trim();
    if (!etymologyText) return undefined;

    const etymology: MerriamEtymology = {
      text: etymologyText,
    };

    // Try to extract language of origin
    const languageMatch = etymologyText.match(/from\s+([A-Z][a-z]+)/);
    if (languageMatch) {
      etymology.language = languageMatch[1];
    }

    // Try to extract first use year
    const firstUseMatch = etymologyText.match(
      /first\s+known\s+use\s+in\s+(\d{4})/i
    );
    if (firstUseMatch) {
      etymology.firstUse = firstUseMatch[1];
    }

    return etymology;
  }

  /**
   * Extract related phrases
   * @param $
   * @param word
   * @returns Array of related phrases
   * @private
   */
  private extractRelatedPhrases(
    $: cheerio.CheerioAPI,
    word: string
  ): MerriamRelatedPhrase[] {
    const phrases: MerriamRelatedPhrase[] = [];

    // Look for phrases section
    $("#phrases .drp").each((_, phraseEl) => {
      const phrase = $(phraseEl).text().trim();
      if (!phrase) return;

      // Find the associated definition
      const vgElement = $(phraseEl).next(".vg");
      const definition = vgElement.find(".sb-entry").text().trim();

      if (definition) {
        const relatedPhrase: MerriamRelatedPhrase = {
          phrase,
          definition,
        };

        // Look for examples
        const examples: MerriamExample[] = [];
        vgElement.find(".in-sentences").each((_, exampleEl) => {
          const exampleText = $(exampleEl).text().trim();
          if (exampleText) {
            examples.push({ text: exampleText });
          }
        });

        if (examples.length > 0) {
          relatedPhrase.examples = examples;
        }

        phrases.push(relatedPhrase);
      }
    });

    return phrases;
  }

  /**
   * Look up a word in Merriam-Webster Dictionary
   * @param word The word to look up
   * @returns A promise resolving to MerriamWebsterDictionaryResponse
   */
  async lookupWord(word: string): Promise<MerriamWebsterDictionaryResponse> {
    try {
      const url = `${this.baseUrl}/${encodeURIComponent(word)}`;
      const $ = await super.fetchHtml(url);

      const entries: MerriamDictionaryEntry[] = [];

      // Process dictionary entries (homonyms)
      $(".entry-word-section-container").each((index, element) => {
        // Extract homonym number (if multiple entries with same spelling)
        const homonymNumber = index + 1;

        // Extract part of speech
        const partOfSpeech = $(element)
          .find(".important-blue-link")
          .first()
          .text()
          .trim();

        if (!partOfSpeech) return; // Skip if no part of speech found

        // Create a dictionary entry for this part of speech
        const entry: MerriamDictionaryEntry = {
          word: word,
          homonymNumber,
          partOfSpeechSections: [],
        };

        // Extract pronunciation
        const pronunciation = this.extractPronunciation($, element);
        if (pronunciation) {
          entry.pronunciation = pronunciation;
        }

        // Check if there's a variety label (American/British)
        const varietyLabel = $(element).find(".language-label").text().trim();
        if (varietyLabel) {
          entry.variety = varietyLabel;
        }

        // Check for functional label (trademark, etc.)
        const functionalLabel = $(element)
          .find(".function-label")
          .text()
          .trim();
        if (functionalLabel && functionalLabel !== partOfSpeech) {
          entry.functionalLabel = functionalLabel;
        }

        // Extract etymology
        const etymology = this.extractEtymology($, element);
        if (etymology) {
          entry.etymology = etymology;
        }

        // Extract first known use
        const firstKnownUse = $(element)
          .find(".first-known-date")
          .text()
          .trim();
        if (firstKnownUse) {
          entry.firstKnownUse = firstKnownUse;
        }

        // Create part of speech section
        const partOfSpeechSection: MerriamPartOfSpeechSection = {
          partOfSpeech,
          definitions: [],
        };

        // Check if the part of speech is a functional label
        if (partOfSpeech.includes("verb")) {
          partOfSpeechSection.functional = partOfSpeech.includes("auxiliary");
        }

        // Extract inflections if available
        const inflectionText = $(element).find(".vg-ins").text().trim();
        if (inflectionText) {
          const inflections = inflectionText
            .split(";")
            .map((infl) => infl.trim())
            .filter(Boolean);

          if (inflections.length > 0) {
            partOfSpeechSection.inflections = inflections;
          }
        }

        // Extract definitions
        const definitions = this.extractDefinitions($, element);
        if (definitions.length > 0) {
          partOfSpeechSection.definitions = definitions;
        }

        // Add part of speech section to entry
        if (partOfSpeechSection.definitions.length > 0) {
          entry.partOfSpeechSections.push(partOfSpeechSection);
        }

        // Extract related phrases for this entry
        const relatedPhrases = this.extractRelatedPhrases($, word);
        if (relatedPhrases.length > 0) {
          entry.relatedPhrases = relatedPhrases;
        }

        // Extract other forms (plural, past tense, etc.)
        const otherForms: Record<string, string> = {};
        $(element)
          .find(".inflected-form")
          .each((_, formEl) => {
            const formType = $(formEl).find(".if-label").text().trim();
            const formValue = $(formEl).find(".if").text().trim();

            if (formType && formValue) {
              otherForms[formType] = formValue;
            }
          });

        if (Object.keys(otherForms).length > 0) {
          entry.otherForms = otherForms;
        }

        // Add entry to entries list if it has part of speech sections
        if (entry.partOfSpeechSections.length > 0) {
          entries.push(entry);
        }
      });

      // If no entries were found, check for suggestions
      if (entries.length === 0) {
        const suggestions = $(".spelling-suggestions a")
          .map((_, el) => $(el).text().trim())
          .get();

        return {
          word,
          entries: [],
          source: this.sourceName,
          error:
            suggestions.length > 0
              ? `Word not found. Did you mean: ${suggestions.join(", ")}?`
              : "No definitions found",
          suggestions: suggestions.length > 0 ? suggestions : undefined,
        };
      }

      return {
        word,
        entries,
        source: this.sourceName,
      };
    } catch (error) {
      return this.handleMerriamError(word, error);
    }
  }
}
