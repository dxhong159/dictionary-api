"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CambridgeDictionaryService = void 0;
const base_dictionary_service_1 = require("./base-dictionary.service");
/**
 * Cambridge Dictionary Service
 * Concrete implementation of BaseDictionaryService for Cambridge Dictionary
 * Follows Single Responsibility Principle (SRP) by focusing only on Cambridge-specific scraping
 */
class CambridgeDictionaryService extends base_dictionary_service_1.BaseDictionaryService {
    constructor() {
        super("cambridge");
    }
    /**
     * Looks up a word in the Cambridge Dictionary
     * @param word The word to look up
     * @returns A promise resolving to DictionaryResponse
     */
    async lookupWord(word) {
        try {
            const url = `https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(word)}`;
            const $ = await this.fetchHtml(url);
            const entries = [];
            // Extract global audio data
            const audioData = {};
            // Look for UK audio source - find first audio element with UK pronunciation
            const ukAudioElement = $('source[src*="/uk_pron/"]').first();
            if (ukAudioElement.length > 0) {
                const ukAudioUrl = ukAudioElement.attr("src");
                if (ukAudioUrl) {
                    // Convert relative URLs to absolute URLs if needed
                    audioData.uk = ukAudioUrl.startsWith("/")
                        ? `https://dictionary.cambridge.org${ukAudioUrl}`
                        : ukAudioUrl;
                }
            }
            // Look for US audio source - find first audio element with US pronunciation
            const usAudioElement = $('source[src*="/us_pron/"]').first();
            if (usAudioElement.length > 0) {
                const usAudioUrl = usAudioElement.attr("src");
                if (usAudioUrl) {
                    // Convert relative URLs to absolute URLs if needed
                    audioData.us = usAudioUrl.startsWith("/")
                        ? `https://dictionary.cambridge.org${usAudioUrl}`
                        : usAudioUrl;
                }
            }
            // Process each entry block (different parts of speech)
            $(".entry-body__el").each((i, element) => {
                // Get part of speech
                const partOfSpeech = $(element).find(".pos.dpos").first().text().trim();
                // Get phonetic
                const phonetic = $(element)
                    .find(".dpron-i .pron.dpron")
                    .first()
                    .text()
                    .trim();
                // Get entry-specific audio if available
                const entryAudioData = {};
                const entryUkAudio = $(element)
                    .find('source[src*="/uk_pron/"]')
                    .first()
                    .attr("src");
                const entryUsAudio = $(element)
                    .find('source[src*="/us_pron/"]')
                    .first()
                    .attr("src");
                if (entryUkAudio) {
                    entryAudioData.uk = entryUkAudio.startsWith("/")
                        ? `https://dictionary.cambridge.org${entryUkAudio}`
                        : entryUkAudio;
                }
                if (entryUsAudio) {
                    entryAudioData.us = entryUsAudio.startsWith("/")
                        ? `https://dictionary.cambridge.org${entryUsAudio}`
                        : entryUsAudio;
                }
                // Process definitions
                const definitions = $(element)
                    .find(".def-block")
                    .map((j, defBlock) => {
                    const definition = $(defBlock)
                        .find(".def.ddef_d.db")
                        .first()
                        .text()
                        .trim();
                    // Get examples if any
                    const examples = $(defBlock)
                        .find(".examp.dexamp")
                        .map((k, examp) => {
                        return $(examp).text().trim();
                    })
                        .get();
                    return {
                        definition,
                        examples: examples.length > 0 ? examples : undefined,
                    };
                })
                    .get();
                if (definitions.length > 0) {
                    entries.push({
                        word,
                        phonetic,
                        partOfSpeech,
                        definitions,
                        // Use entry-specific audio if available, otherwise use global audio
                        audio: Object.keys(entryAudioData).length > 0
                            ? entryAudioData
                            : audioData,
                    });
                }
            });
            // If no entries were found but the page loaded, it might have redirected to another word
            if (entries.length === 0) {
                const redirectedWord = $(".hw.dhw").first().text().trim();
                if (redirectedWord &&
                    redirectedWord.toLowerCase() !== word.toLowerCase()) {
                    return {
                        word,
                        entries: [],
                        source: this.sourceName,
                        error: `No exact match found for "${word}". Cambridge may have redirected to "${redirectedWord}".`,
                    };
                }
            }
            return {
                word,
                entries,
                source: this.sourceName,
                // Include global audio data in the top-level response
                audio: Object.keys(audioData).length > 0 ? audioData : undefined,
            };
        }
        catch (error) {
            return this.handleError(word, error);
        }
    }
}
exports.CambridgeDictionaryService = CambridgeDictionaryService;
//# sourceMappingURL=cambridge-dictionary.service.js.map