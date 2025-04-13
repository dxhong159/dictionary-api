"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerriamWebsterDictionaryService = void 0;
const base_dictionary_service_1 = require("./base-dictionary.service");
/**
 * Service to scrape definitions from Merriam-Webster Dictionary
 * Implements the dictionary scraper interface
 */
class MerriamWebsterDictionaryService extends base_dictionary_service_1.BaseDictionaryService {
    constructor() {
        super("Merriam-Webster");
        this.baseUrl = "https://www.merriam-webster.com/dictionary";
    }
    /**
     * Look up a word in Merriam-Webster Dictionary
     * @param word The word to look up
     * @returns A promise resolving to DictionaryResponse
     */
    async lookupWord(word) {
        try {
            const url = `${this.baseUrl}/${encodeURIComponent(word)}`;
            const $ = await this.fetchHtml(url);
            const entries = [];
            // Process dictionary entries (homonyms)
            $(".entry-word-section-container").each((_, element) => {
                // Extract part of speech
                const partOfSpeech = $(element)
                    .find(".important-blue-link")
                    .first()
                    .text()
                    .trim();
                if (!partOfSpeech)
                    return; // Skip if no part of speech found
                const definitions = [];
                // Extract definitions for this part of speech
                $(element)
                    .find(".vg-sseq-entry-item")
                    .each((_, defItem) => {
                    const definitionNumber = $(defItem)
                        .find(".vg-sseq-entry-item-label")
                        .text()
                        .trim();
                    const definitionText = $(defItem).find(".sb-entry").text().trim();
                    if (definitionText) {
                        // Try to find examples for this definition
                        const examples = [];
                        $(defItem)
                            .find(".in-sentences")
                            .each((_, exampleEl) => {
                            const exampleText = $(exampleEl).text().trim();
                            if (exampleText) {
                                examples.push(exampleText);
                            }
                        });
                        definitions.push({
                            definition: `${definitionNumber}. ${definitionText}`,
                            examples: examples.length > 0 ? examples : [],
                        });
                    }
                });
                if (definitions.length > 0) {
                    // Create a dictionary entry for this part of speech
                    const entry = {
                        word: word,
                        partOfSpeech: partOfSpeech,
                        definitions: definitions,
                    };
                    // Try to find synonyms
                    const synonyms = [];
                    $(element)
                        .find(".synonyms-antonyms-grid-list li")
                        .each((_, synEl) => {
                        const synText = $(synEl).text().trim();
                        if (synText) {
                            synonyms.push(synText);
                        }
                    });
                    if (synonyms.length > 0) {
                        entry.synonyms = synonyms;
                    }
                    entries.push(entry);
                }
            });
            // Process related phrases
            const relatedPhrases = [];
            $("#related-phrases .related-phrases-list-item").each((_, phraseEl) => {
                const phraseLink = $(phraseEl).find("a");
                const phraseText = phraseLink.text().trim();
                if (phraseText && phraseText.includes(word)) {
                    relatedPhrases.push({
                        word: phraseText,
                        definitions: [
                            { definition: `Related phrase containing "${word}"` },
                        ],
                    });
                }
            });
            // Add related phrases as additional entries if found
            if (relatedPhrases.length > 0) {
                entries.push(...relatedPhrases.slice(0, 10)); // Limit to 10 phrases to avoid too much data
            }
            // If no entries were found, we might need to check for redirects or suggestions
            if (entries.length === 0) {
                const suggestions = $(".spelling-suggestions a")
                    .map((_, el) => $(el).text().trim())
                    .get();
                return {
                    word,
                    entries: [],
                    source: this.sourceName,
                    error: suggestions.length > 0
                        ? `Word not found. Did you mean: ${suggestions.join(", ")}?`
                        : "No definitions found",
                };
            }
            return {
                word,
                entries,
                source: this.sourceName,
            };
        }
        catch (error) {
            return this.handleError(word, error);
        }
    }
}
exports.MerriamWebsterDictionaryService = MerriamWebsterDictionaryService;
//# sourceMappingURL=merriam-webster-dictionary.service.js.map