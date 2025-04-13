import * as cheerio from "cheerio";
import {
  OxfordDictionaryResponse,
  OxfordDictionaryEntry,
  OxfordLexicalEntry,
  OxfordSense,
  OxfordExample,
  OxfordPronunciation,
  OxfordLexicalCategory,
  OxfordGrammaticalFeatures,
  OxfordEtymology,
  OxfordRegister,
  OxfordDomain,
  OxfordRegion,
} from "../types/oxford";
import { Element } from "domhandler";
import { BaseDictionaryService } from "./base-dictionary.service";

/**
 * Service to scrape definitions from Oxford Dictionaries
 * Implements the dictionary service interface for v2
 * Follows Single Responsibility Principle (SRP) by focusing only on Oxford-specific scraping
 * Follows Liskov Substitution Principle (LSP) by properly extending BaseDictionaryService
 */
export class OxfordDictionaryService extends BaseDictionaryService<OxfordDictionaryResponse> {
  private baseUrl: string = "https://www.oxfordlearnersdictionaries.com";

  constructor() {
    super("Oxford");
  }

  /**
   * Makes an absolute URL from a relative URL
   * @param relativeUrl The relative URL
   * @returns The absolute URL
   * @protected
   */
  protected makeAbsoluteUrl(relativeUrl?: string): string | undefined {
    return super.makeAbsoluteUrl(
      "https://www.oxfordlearnersdictionaries.com",
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
  private handleOxfordError(
    word: string,
    error: unknown
  ): OxfordDictionaryResponse {
    return super.handleError(word, error) as OxfordDictionaryResponse;
  }

  /**
   * Fetches Oxford dictionary HTML using their direct search URL which handles redirects
   * @param word The word to look up
   * @returns A cheerio object with the parsed HTML
   * @private
   */
  private async fetchOxfordHtml(word: string): Promise<cheerio.CheerioAPI> {
    try {
      // Use Oxford's direct search URL which automatically redirects to the correct word page
      const directSearchUrl = `${
        this.baseUrl
      }/search/english/direct/?q=${encodeURIComponent(word)}`;

      console.log(
        `Fetching Oxford definition with direct search URL: ${directSearchUrl}`
      );

      const $ = await super.fetchHtml(directSearchUrl); // Sử dụng fetchHtml mặc định

      // Check if we got a valid page with dictionary content
      if ($(".entry").length > 0 || $(".webtop").length > 0) {
        console.log(`Successfully fetched Oxford definition for: ${word}`);
        console.log($.html());
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
      const searchUrl = `${this.baseUrl}/search/english/?q=${encodeURIComponent(
        word
      )}`;
      console.log(`Trying fallback search URL: ${searchUrl}`);
      const searchPage = await super.fetchHtml(searchUrl);

      // Check if search page has a direct link to the word
      const definitionLink = searchPage(".search-results .result a")
        .first()
        .attr("href");
      if (definitionLink) {
        console.log(`Found definition link through search: ${definitionLink}`);
        return await super.fetchHtml(definitionLink);
      }
    } catch (error: any) {
      console.log(`Search approach failed: ${error.message}`);
    }

    // If all attempts fail, throw an error
    throw new Error(
      `Could not find Oxford definition for "${word}" using any known URL pattern`
    );
  }

  /**
   * Extract pronunciation data from an element
   * @param $ Cheerio instance
   * @param element The element containing pronunciation
   * @returns Pronunciation data
   * @private
   */ private extractPronunciation(
    $: cheerio.CheerioAPI,
    element: Element
  ): OxfordPronunciation[] {
    const pronunciations: OxfordPronunciation[] = [];

    // Bước 1: Thu thập tất cả các audio URLs trước tiên
    // Lưu trữ cả UK và US audio URLs và phiên âm tương ứng
    interface AudioInfo {
      url: string;
      variant: string;
      phonetic?: string;
      formHint?: string; // Gợi ý về dạng của từ (do, does, did, done, doing)
    }

    // Tạo 2 arrays riêng biệt chứa audio URLs cho phát âm anh và mỹ
    const ukAudios: AudioInfo[] = [];
    const usAudios: AudioInfo[] = [];

    // Tìm tất cả các phần tử audio và lưu trữ thông tin
    $(element)
      .find(".sound.audio_play_button.icon-audio")
      .each((i, audioElem) => {
        let mp3Url = $(audioElem).attr("data-src-mp3");

        // Nếu không tìm thấy attr, thử lấy từ thuộc tính raw của element
        if (!mp3Url) {
          const outerHtml = $.html(audioElem);
          const match = outerHtml.match(/data-src-mp3=(?:["'])?([^"'\s>]+)/i);
          if (match && match[1]) {
            mp3Url = match[1];
          }
        }

        if (mp3Url) {
          const absoluteUrl = this.makeAbsoluteUrl(mp3Url);

          // Phân tích URL để tìm gợi ý về hình thức của từ
          let formHint: string | undefined;
          if (mp3Url) {
            // Trích xuất tên file từ URL (ví dụ: "does__gb_2.mp3" -> "does")
            const filenameMatch = mp3Url.match(
              /\/([a-z]+)(?:__|\w*?)_(?:gb|us)/i
            );
            if (filenameMatch && filenameMatch[1]) {
              formHint = filenameMatch[1].toLowerCase();
              console.log(`Detected word form from URL: ${formHint}`);
            }
          }

          // Tìm phiên âm gần nhất nếu có
          let nearestPhonetic: string | undefined;
          const nearestPhonElem = $(audioElem)
            .closest(".pron-g")
            .find(".phon")
            .first();
          if (nearestPhonElem.length > 0) {
            nearestPhonetic = nearestPhonElem.text().trim();
          }

          // Tìm thêm context gần nhất để xác định hình thức từ
          if (!formHint) {
            const parentContext = $(audioElem)
              .closest(".pron-g")
              .text()
              .toLowerCase();

            // Kiểm tra các hình thức từ phổ biến
            const wordForms = ["do", "does", "did", "done", "doing"];
            for (const form of wordForms) {
              if (parentContext.includes(form)) {
                formHint = form;
                console.log(`Detected word form from context: ${formHint}`);
                break;
              }
            }
          }

          // Lưu vào mảng tương ứng
          if ($(audioElem).hasClass("pron-uk")) {
            ukAudios.push({
              url: absoluteUrl ?? "",
              variant: "British English",
              phonetic: nearestPhonetic,
              formHint,
            });
            console.log(
              `UK Audio #${i}: ${absoluteUrl} (${
                nearestPhonetic || "no phonetic"
              }) - Form: ${formHint || "unknown"}`
            );
          } else if ($(audioElem).hasClass("pron-us")) {
            usAudios.push({
              url: absoluteUrl ?? "",
              variant: "American English",
              phonetic: nearestPhonetic,
              formHint,
            });
            console.log(
              `US Audio #${i}: ${absoluteUrl} (${
                nearestPhonetic || "no phonetic"
              }) - Form: ${formHint || "unknown"}`
            );
          } else {
            // Các audio khác (không phân biệt UK/US)
            ukAudios.push({
              url: absoluteUrl ?? "",
              variant: "Unknown",
              phonetic: nearestPhonetic,
              formHint,
            });
          }
        }
      });

    // Bước 2: Chuyển qua các phiên âm, và liên kết chúng với audio URLs phù hợp
    $(element)
      .find(".phon")
      .each((i, phonElem) => {
        const phonetic = $(phonElem).text().trim();
        if (!phonetic) return;

        // Tìm audio URL phù hợp dựa trên vị trí gần nhất hoặc đánh dấu UK/US
        let audioUrl: string | undefined;
        let variant: string = "Unknown";

        // Xác định biến thể UK/US dựa trên nội dung hoặc ngữ cảnh
        const isUK =
          phonetic.includes("BrE") ||
          $(phonElem).closest(".pron-g").find(".pron-uk").length > 0;
        const isUS =
          phonetic.includes("NAmE") ||
          $(phonElem).closest(".pron-g").find(".pron-us").length > 0;

        // Phát hiện hình thức từ từ ngữ cảnh xung quanh phiên âm
        const phonContext = $(phonElem).closest(".pron-g").text().toLowerCase();
        let detectedForm: string | undefined;

        // Các hình thức từ phổ biến để kiểm tra
        const wordForms = ["do", "does", "did", "done", "doing"];
        for (const form of wordForms) {
          if (phonContext.includes(form)) {
            detectedForm = form;
            console.log(
              `Found form ${form} in context of phonetic ${phonetic}`
            );
            break;
          }
        }

        // Tìm audio phù hợp nhất cho phiên âm này
        const audioArrays = isUK
          ? [ukAudios]
          : isUS
          ? [usAudios]
          : [ukAudios, usAudios];

        // Chiến lược ghép nối 1: Tìm audio khớp với cả phiên âm và hình thức từ
        for (const audioArray of audioArrays) {
          if (audioUrl) break; // Nếu đã tìm thấy, dừng tìm kiếm

          if (detectedForm) {
            const formMatch = audioArray.find(
              (a) => a.formHint === detectedForm
            );
            if (formMatch) {
              audioUrl = formMatch.url;
              variant = formMatch.variant;
              console.log(
                `Matched by word form: ${detectedForm} -> ${audioUrl}`
              );
              break;
            }
          }
        }

        // Chiến lược ghép nối 2: Sử dụng phiên âm để dự đoán hình thức từ
        if (!audioUrl) {
          // Một số phiên âm đặc trưng cho hình thức từ cụ thể
          if (phonetic.includes("/duː/")) {
            // Phiên âm cho "do" hoặc "does"
            const doForm = audioArrays[0].find(
              (a) => a.formHint === "do" || a.formHint === "does"
            );
            if (doForm) {
              audioUrl = doForm.url;
              variant = doForm.variant;
              console.log(`Matched by phonetic pattern /duː/ -> ${audioUrl}`);
            }
          } else if (phonetic.includes("/dɪd/")) {
            // Phiên âm cho "did"
            const didForm = audioArrays[0].find((a) => a.formHint === "did");
            if (didForm) {
              audioUrl = didForm.url;
              variant = didForm.variant;
              console.log(`Matched by phonetic pattern /dɪd/ -> ${audioUrl}`);
            }
          } else if (phonetic.includes("/dʌn/")) {
            // Phiên âm cho "done"
            const doneForm = audioArrays[0].find((a) => a.formHint === "done");
            if (doneForm) {
              audioUrl = doneForm.url;
              variant = doneForm.variant;
              console.log(`Matched by phonetic pattern /dʌn/ -> ${audioUrl}`);
            }
          } else if (phonetic.includes("ˈduːɪŋ")) {
            // Phiên âm cho "doing"
            const doingForm = audioArrays[0].find(
              (a) => a.formHint === "doing"
            );
            if (doingForm) {
              audioUrl = doingForm.url;
              variant = doingForm.variant;
              console.log(
                `Matched by phonetic pattern /ˈduːɪŋ/ -> ${audioUrl}`
              );
            }
          }
        }

        // Chiến lược ghép nối 3: Tìm audio có cùng phiên âm
        if (!audioUrl) {
          for (const audioArray of audioArrays) {
            const matchingAudio = audioArray.find(
              (a) => a.phonetic === phonetic
            );
            if (matchingAudio) {
              audioUrl = matchingAudio.url;
              variant = matchingAudio.variant;
              console.log(
                `Matched by exact phonetic: ${phonetic} -> ${audioUrl}`
              );
              break;
            }
          }
        }

        // Chiến lược ghép nối 4: Fallback theo vị trí tương đối
        if (!audioUrl) {
          const primaryArray = isUK
            ? ukAudios
            : isUS
            ? usAudios
            : ukAudios.length > 0
            ? ukAudios
            : usAudios;
          if (primaryArray.length > 0) {
            audioUrl = primaryArray[i % primaryArray.length].url;
            variant = isUK
              ? "British English"
              : isUS
              ? "American English"
              : primaryArray[i % primaryArray.length].variant;
            console.log(
              `Fallback match by position: index ${i} -> ${audioUrl}`
            );
          }
        }

        // Chiến lược ghép nối 5: Fallback cuối cùng - sử dụng URL đầu tiên có sẵn
        if (!audioUrl) {
          if (ukAudios.length > 0) {
            audioUrl = ukAudios[0].url;
            variant = "British English";
          } else if (usAudios.length > 0) {
            audioUrl = usAudios[0].url;
            variant = "American English";
          }
          console.log(
            `Last resort fallback: using first available audio URL -> ${audioUrl}`
          );
        }

        // Tạo đối tượng phát âm
        const pronunciation: OxfordPronunciation = {
          phonetic,
          audioUrl,
          variant,
        };

        // Thêm ghi chú nếu có
        const notes = $(phonElem)
          .closest(".pron-g")
          .find(".label")
          .text()
          .trim();
        if (notes) {
          pronunciation.notes = notes;
        }

        // Log kết quả cuối cùng để debug
        console.log(
          `Pronunciation: ${phonetic}, Audio: ${
            audioUrl || "none"
          }, Variant: ${variant}`
        );

        pronunciations.push(pronunciation);
      });

    return pronunciations;
  }

  /**
   * Extract examples from a sense block
   * @param $ Cheerio instance
   * @param senseElem The sense element
   * @returns Array of examples
   * @private
   */
  private extractExamples(
    $: cheerio.CheerioAPI,
    senseElem: Element
  ): OxfordExample[] {
    const examples: OxfordExample[] = [];

    $(senseElem)
      .find(".x")
      .each((_, exampleElem) => {
        const text = $(exampleElem).text().trim();
        if (!text) return;

        const example: OxfordExample = { text };

        // Check for source attribution
        const source = $(exampleElem).find(".cf").text().trim();
        if (source) {
          example.source = source;
        }

        // Check for notes
        const notes = $(exampleElem).find(".label").text().trim();
        if (notes) {
          example.notes = notes;
        }

        examples.push(example);
      });

    // Also check for extra examples in collapsible sections
    $(senseElem)
      .find(".collapse .unx")
      .each((_, extraExampleElem) => {
        const text = $(extraExampleElem).text().trim();
        if (text) {
          examples.push({ text });
        }
      });

    return examples;
  }

  /**
   * Extract register information (formal, informal, etc.)
   * @param $ Cheerio instance
   * @param element The element to extract from
   * @returns Array of register information
   * @private
   */
  private extractRegisters(
    $: cheerio.CheerioAPI,
    element: Element
  ): OxfordRegister[] {
    const registers: OxfordRegister[] = [];

    // Look for register labels
    $(element)
      .find(".grammar")
      .each((_, grammarElem) => {
        const text = $(grammarElem).text().trim();
        if (!text) return;

        // Some common register types
        const registerTypes = [
          "formal",
          "informal",
          "slang",
          "literary",
          "humorous",
          "technical",
        ];
        const lowerText = text.toLowerCase();

        for (const type of registerTypes) {
          if (lowerText.includes(type)) {
            registers.push({
              type,
              notes: text,
            });
            break;
          }
        }

        // If no specific type identified but it's a register note
        if (
          registers.length === 0 &&
          (lowerText.includes("used") || lowerText.includes("style"))
        ) {
          registers.push({ type: "other", notes: text });
        }
      });

    return registers;
  }

  /**
   * Extract domain information (subject field)
   * @param $ Cheerio instance
   * @param element The element to extract from
   * @returns Array of domain information
   * @private
   */
  private extractDomains(
    $: cheerio.CheerioAPI,
    element: Element
  ): OxfordDomain[] {
    const domains: OxfordDomain[] = [];

    $(element)
      .find(".domain")
      .each((_, domainElem) => {
        const text = $(domainElem).text().trim();
        if (text) {
          // Create a simple ID from the text
          const id = text.toLowerCase().replace(/[^a-z0-9]/g, "_");
          domains.push({ id, text });
        }
      });

    return domains;
  }

  /**
   * Extract region information
   * @param $ Cheerio instance
   * @param element The element to extract from
   * @returns Array of region information
   * @private
   */
  private extractRegions(
    $: cheerio.CheerioAPI,
    element: Element
  ): OxfordRegion[] {
    const regions: OxfordRegion[] = [];

    $(element)
      .find(".region")
      .each((_, regionElem) => {
        const text = $(regionElem).text().trim();
        if (text) {
          // Create a simple ID from the text
          const id = text.toLowerCase().replace(/[^a-z0-9]/g, "_");
          regions.push({ id, text });
        }
      });

    return regions;
  }

  /**
   * Extract a lexical category (part of speech)
   * @param $ Cheerio instance
   * @param element The element to extract from
   * @returns Lexical category information
   * @private
   */
  private extractLexicalCategory(
    $: cheerio.CheerioAPI,
    element: Element
  ): OxfordLexicalCategory {
    const text = $(element).find(".pos").text().trim();
    // Create a simple ID from the text
    const id = text.toLowerCase().replace(/[^a-z0-9]/g, "_");

    return { id, text };
  }

  /**
   * Extract grammatical features
   * @param $ Cheerio instance
   * @param element The element to extract from
   * @returns Array of grammatical features
   * @private
   */
  private extractGrammaticalFeatures(
    $: cheerio.CheerioAPI,
    element: Element
  ): OxfordGrammaticalFeatures[] {
    const features: OxfordGrammaticalFeatures[] = [];

    // Extract countability for nouns
    if ($(element).find(".pos").text().trim().toLowerCase() === "noun") {
      const grammarText = $(element)
        .find(".grammar")
        .text()
        .trim()
        .toLowerCase();

      if (grammarText.includes("countable")) {
        features.push({ type: "countability", value: "countable" });
      } else if (grammarText.includes("uncountable")) {
        features.push({ type: "countability", value: "uncountable" });
      } else if (grammarText.includes("singular")) {
        features.push({ type: "number", value: "singular" });
      } else if (grammarText.includes("plural")) {
        features.push({ type: "number", value: "plural" });
      }
    }

    // Extract transitivity for verbs
    if ($(element).find(".pos").text().trim().toLowerCase() === "verb") {
      const grammarText = $(element)
        .find(".grammar")
        .text()
        .trim()
        .toLowerCase();

      if (grammarText.includes("transitive")) {
        features.push({ type: "transitivity", value: "transitive" });
      } else if (grammarText.includes("intransitive")) {
        features.push({ type: "transitivity", value: "intransitive" });
      }
    }

    return features;
  }

  /**
   * Extract etymology information
   * @param $ Cheerio instance
   * @param element The element to extract from
   * @returns Etymology information or undefined
   * @private
   */
  private extractEtymology(
    $: cheerio.CheerioAPI,
    element: Element
  ): OxfordEtymology | undefined {
    // Look for etymology in Word Origin section
    const etymologyBox = $(element).find('.unbox[unbox="wordorigin"] .body');
    if (etymologyBox.length === 0) return undefined;

    const text = etymologyBox.text().trim();
    if (!text) return undefined;

    const etymology: OxfordEtymology = { text };

    // Try to extract language of origin
    const languageMatches = text.match(/from\s+([A-Z][a-z]+)(?:\s|,|\.|$)/);
    if (languageMatches && languageMatches[1]) {
      etymology.language = languageMatches[1];
    }

    // Try to extract period information
    const periodMatches = text.match(
      /(?:Old|Middle|Late|Modern|Ancient)\s+[A-Z][a-z]+/g
    );
    if (periodMatches && periodMatches.length > 0) {
      etymology.period = periodMatches[0];
    }

    return etymology;
  }

  /**
   * Extract synonyms from a sense
   * @param $ Cheerio instance
   * @param element The element to extract from
   * @returns Array of synonyms or undefined
   * @private
   */
  private extractSynonyms(
    $: cheerio.CheerioAPI,
    element: Element
  ): string[] | undefined {
    const synonyms: string[] = [];

    // Check for synonyms in the unbox sections
    $(element)
      .find('.unbox[unbox="synonyms"] .body .unbox')
      .each((_, synElem) => {
        const text = $(synElem).text().trim();
        if (!text || text === "example") return;

        // Split by bullet separator and trim each item
        const syns = text
          .split("▪")
          .map((s) => s.trim())
          .filter(Boolean);
        synonyms.push(...syns);
      });

    return synonyms.length > 0 ? synonyms : undefined;
  }

  /**
   * Extract subsenses from a sense block
   * @param $ Cheerio instance
   * @param element The sense element
   * @returns Array of subsenses
   * @private
   */
  private extractSubsenses(
    $: cheerio.CheerioAPI,
    element: Element
  ): OxfordSense[] {
    const subsenses: OxfordSense[] = [];

    // In Oxford, subsenses might be in a separate list or with special formatting
    $(element)
      .find(".subsense")
      .each((_, subsenseElem) => {
        const definition = $(subsenseElem).find(".def").text().trim();
        if (!definition) return;

        const subsense: OxfordSense = { definition };

        // Extract examples
        const examples = this.extractExamples($, subsenseElem);
        if (examples.length > 0) {
          subsense.examples = examples;
        }

        // Extract registers
        const registers = this.extractRegisters($, subsenseElem);
        if (registers.length > 0) {
          subsense.registers = registers;
        }

        // Extract domains
        const domains = this.extractDomains($, subsenseElem);
        if (domains.length > 0) {
          subsense.domains = domains;
        }

        // Extract regions
        const regions = this.extractRegions($, subsenseElem);
        if (regions.length > 0) {
          subsense.regions = regions;
        }

        subsenses.push(subsense);
      });

    return subsenses;
  }

  /**
   * Extract senses from an entry
   * @param $ Cheerio instance
   * @param element The entry element
   * @returns Array of senses
   * @private
   */
  private extractSenses(
    $: cheerio.CheerioAPI,
    element: Element
  ): OxfordSense[] {
    const senses: OxfordSense[] = [];

    $(element)
      .find(".sense")
      .each((_, senseElem) => {
        const definition = $(senseElem).find(".def").text().trim();
        if (!definition) return;

        // Create the basic sense
        const sense: OxfordSense = { definition };

        // Extract examples
        const examples = this.extractExamples($, senseElem);
        if (examples.length > 0) {
          sense.examples = examples;
        }

        // Extract registers
        const registers = this.extractRegisters($, senseElem);
        if (registers.length > 0) {
          sense.registers = registers;
        }

        // Extract domains
        const domains = this.extractDomains($, senseElem);
        if (domains.length > 0) {
          sense.domains = domains;
        }

        // Extract regions
        const regions = this.extractRegions($, senseElem);
        if (regions.length > 0) {
          sense.regions = regions;
        }

        // Extract subsenses
        const subsenses = this.extractSubsenses($, senseElem);
        if (subsenses.length > 0) {
          sense.subsenses = subsenses;
        }

        // Extract synonyms
        const synonyms = this.extractSynonyms($, senseElem);
        if (synonyms) {
          sense.synonyms = synonyms;
        }

        // Extract cross-references
        const crossReferences: string[] = [];
        $(senseElem)
          .find(".xrefs a")
          .each((_, xrefElem) => {
            const xrefText = $(xrefElem).text().trim();
            if (xrefText) {
              crossReferences.push(xrefText);
            }
          });

        if (crossReferences.length > 0) {
          sense.crossReferences = crossReferences;
        }

        // Extract notes
        const notes: string[] = [];
        $(senseElem)
          .find(".note")
          .each((_, noteElem) => {
            const noteText = $(noteElem).text().trim();
            if (noteText) {
              notes.push(noteText);
            }
          });

        if (notes.length > 0) {
          sense.notes = notes;
        }

        senses.push(sense);
      });

    return senses;
  }

  /**
   * Extract idioms from an entry
   * @param $ Cheerio instance
   * @param entry The entry element
   * @returns Array of phrases (idioms)
   * @private
   */
  private extractIdioms(
    $: cheerio.CheerioAPI,
    entry: Element
  ): { text: string; explanation?: string }[] {
    const idioms: { text: string; explanation?: string }[] = [];

    $(entry)
      .find(".idioms .idm-g")
      .each((_, idiomElem) => {
        const text = $(idiomElem).find(".idm").text().trim();
        if (!text) return;

        const explanation = $(idiomElem).find(".def").text().trim();

        idioms.push({
          text,
          ...(explanation ? { explanation } : {}),
        });
      });

    return idioms;
  }

  /**
   * Extract variant forms
   * @param $ Cheerio instance
   * @param element The element to extract from
   * @returns Array of variant forms
   * @private
   */
  private extractVariantForms(
    $: cheerio.CheerioAPI,
    element: Element
  ): { text: string; notes?: string[] }[] {
    const variants: { text: string; notes?: string[] }[] = [];

    $(element)
      .find(".variants")
      .each((_, variantElem) => {
        const text = $(variantElem).text().trim();
        if (!text) return;

        // Extract notes if any
        const notes: string[] = [];
        $(variantElem)
          .find(".label")
          .each((_, labelElem) => {
            const labelText = $(labelElem).text().trim();
            if (labelText) {
              notes.push(labelText);
            }
          });

        variants.push({
          text,
          ...(notes.length > 0 ? { notes } : {}),
        });
      });

    return variants;
  }

  /**
   * Looks up a word in the Oxford Learner's Dictionary
   * @param word The word to look up
   * @returns A promise resolving to OxfordDictionaryResponse
   */
  async lookupWord(word: string): Promise<OxfordDictionaryResponse> {
    try {
      // Sử dụng fetchOxfordHtml để xử lý việc chuyển hướng URL và lấy nội dung trang
      const $ = await this.fetchOxfordHtml(word);

      // Check if the word was found
      const wordNotFoundMsg = $(".result-header")
        .text()
        .includes("did not match");
      if (wordNotFoundMsg) {
        return {
          word,
          entries: [],
          source: this.sourceName,
          error: `No entries found for "${word}"`,
        };
      }

      const entries: OxfordDictionaryEntry[] = [];

      // Process each lexical category (part of speech) group
      $(".entry, [hclass='entry']").each((entryIndex, entryElement) => {
        // Get the headword
        const headword =
          $(entryElement)
            .find(".webtop .headword, [hclass='headword']")
            .first()
            .text()
            .trim() || word;

        // Create a new dictionary entry
        const entry: OxfordDictionaryEntry = {
          id: `${headword}-${entryIndex + 1}`,
          word: headword,
          lexicalEntries: [],
          language: "en",
        };

        // Extract the lexical entries (by part of speech)
        // Oxford HTML có thể có cấu trúc khác nhau, nên chúng ta kiểm tra cả hai trường hợp
        // Tìm cả pos-header và span.pos trực tiếp
        const posElements = $(entryElement).find(
          "h2.pos-header, span.pos, [hclass='pos']"
        );
        posElements.each((_, posHeaderElement) => {
          const lexicalCategory = this.extractLexicalCategory(
            $,
            posHeaderElement
          );

          // Find the section of content for this part of speech
          const posContent = $(posHeaderElement).closest(".top-g").siblings();

          // Create a lexical entry
          const lexicalEntry: OxfordLexicalEntry = {
            text: headword,
            lexicalCategory,
            senses: [],
          };

          // Extract pronunciations
          const pronunciations = this.extractPronunciation($, entryElement);
          if (pronunciations.length > 0) {
            lexicalEntry.pronunciations = pronunciations;
          }

          // Extract grammatical features
          const grammaticalFeatures = this.extractGrammaticalFeatures(
            $,
            entryElement
          );
          if (grammaticalFeatures.length > 0) {
            lexicalEntry.grammaticalFeatures = grammaticalFeatures;
          }

          // Extract etymology
          const etymology = this.extractEtymology($, entryElement);
          if (etymology) {
            lexicalEntry.etymologies = [etymology];
          }

          // Extract senses
          const sensesElement =
            posContent.length > 0 ? posContent[0] : entryElement;
          const senses = this.extractSenses($, sensesElement);
          lexicalEntry.senses = senses;

          // Extract phrases and idioms
          const phrases = this.extractIdioms($, entryElement);
          if (phrases.length > 0) {
            lexicalEntry.phrases = phrases;
          }

          // Extract variant forms
          const variantForms = this.extractVariantForms($, entryElement);
          if (variantForms.length > 0) {
            lexicalEntry.variantForms = variantForms;
          }

          entry.lexicalEntries.push(lexicalEntry);
        });

        // Only add entries with lexical entries
        if (entry.lexicalEntries.length > 0) {
          entries.push(entry);
        }
      });

      // If no entries were found but the page loaded, might be a redirect or special case
      if (entries.length === 0) {
        const alternativeWord = $(".result-header a").first().text().trim();
        if (alternativeWord && alternativeWord !== word) {
          return {
            word,
            entries: [],
            source: this.sourceName,
            error: `No exact match found for "${word}". Did you mean "${alternativeWord}"?`,
          };
        }
      }

      return {
        word,
        entries,
        source: this.sourceName,
      };
    } catch (error) {
      return this.handleOxfordError(word, error);
    }
  }
}
