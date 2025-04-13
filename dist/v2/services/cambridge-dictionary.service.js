"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CambridgeDictionaryService = void 0;
const base_dictionary_service_1 = require("./base-dictionary.service");
/**
 * Cambridge Dictionary Service
 * Concrete implementation of IDictionaryService for Cambridge Dictionary
 * Follows Single Responsibility Principle (SRP) by focusing only on Cambridge-specific scraping
 * Follows Liskov Substitution Principle (LSP) by properly extending BaseDictionaryService
 */
class CambridgeDictionaryService extends base_dictionary_service_1.BaseDictionaryService {
    constructor() {
        super("cambridge");
        /**
         * Base URL for Cambridge Dictionary
         * @private
         */
        this.baseUrl = "https://dictionary.cambridge.org";
    }
    /**
     * Makes an absolute URL from a relative URL
     * @param relativeUrl The relative URL
     * @returns The absolute URL
     * @protected
     */
    makeAbsoluteUrl(relativeUrl) {
        return super.makeAbsoluteUrl(this.baseUrl, relativeUrl);
    }
    /**
     * Handle errors from the API
     * @param word The word that was being looked up
     * @param error The error that occurred
     * @returns A DictionaryResponse with the error information
     * @private
     */
    handleCambridgeError(word, error) {
        return super.handleError(word, error);
    }
    /**
     * Extract pronunciation data from an element
     * @param $ Cheerio instance
     * @param element The element to extract pronunciation from
     * @returns Pronunciation data
     * @private
     */
    extractPronunciation($, element) {
        const pronunciation = {};
        // Extract IPA notation
        const ukIpa = $(element).find(".uk .pron.dpron").first().text().trim();
        const usIpa = $(element).find(".us .pron.dpron").first().text().trim();
        if (ukIpa)
            pronunciation.ukIpa = ukIpa;
        if (usIpa)
            pronunciation.usIpa = usIpa;
        // Extract audio URLs
        const ukAudioElement = $(element)
            .find('.uk source[src*="/uk_pron/"]')
            .first();
        const usAudioElement = $(element)
            .find('.us source[src*="/us_pron/"]')
            .first();
        if (ukAudioElement.length > 0) {
            pronunciation.ukAudioUrl = this.makeAbsoluteUrl(ukAudioElement.attr("src"));
        }
        if (usAudioElement.length > 0) {
            pronunciation.usAudioUrl = this.makeAbsoluteUrl(usAudioElement.attr("src"));
        }
        return pronunciation;
    }
    /**
     * Extract level information from various level indicators on the page
     * @param $ Cheerio instance
     * @param element The element to extract level from
     * @returns Level data or undefined if not found
     * @private
     */
    extractLevel($, element) {
        const levelElement = $(element).find(".dxref, .dgc");
        if (levelElement.length === 0)
            return undefined;
        const levelText = levelElement.text().trim();
        if (!levelText)
            return undefined;
        // Look for CEFR level indicators (A1, A2, B1, B2, C1, C2)
        const levelMatch = levelText.match(/[ABCEFR][12]/);
        if (levelMatch) {
            return {
                code: levelMatch[0],
                description: levelText,
            };
        }
        return undefined;
    }
    /**
     * Extract examples from a definition block
     * @param $ Cheerio instance
     * @param defBlock The definition block to extract examples from
     * @returns Array of examples
     * @private
     */
    extractExamples($, defBlock) {
        const examples = [];
        $(defBlock)
            .find(".examp.dexamp")
            .each((i, examp) => {
            const text = $(examp).text().trim();
            const translation = $(examp).next(".trans.dtrans").text().trim();
            if (text) {
                examples.push({
                    text,
                    ...(translation ? { translation } : {}),
                });
            }
        });
        return examples;
    }
    /**
     * Extract related phrases (idioms, phrasal verbs, etc.)
     * @param $ Cheerio instance
     * @param element The element to extract phrases from
     * @param selector The selector for the phrase container
     * @returns Array of related phrases
     * @private
     */
    extractRelatedPhrases($, element, selector) {
        const phrases = [];
        $(element)
            .find(selector)
            .each((i, phrase) => {
            const phraseText = $(phrase)
                .find(".phrase-title, .phr")
                .first()
                .text()
                .trim();
            const definition = $(phrase).find(".def.ddef_d").first().text().trim();
            const example = $(phrase).find(".examp.dexamp").first().text().trim();
            const link = $(phrase).find("a").attr("href");
            if (phraseText && definition) {
                phrases.push({
                    phrase: phraseText,
                    definition,
                    ...(example ? { example } : {}),
                    ...(link ? { link: this.makeAbsoluteUrl(link) } : {}),
                });
            }
        });
        return phrases;
    }
    /**
     * Extract definitions from a part of speech block
     * @param $ Cheerio instance
     * @param element The element containing definitions
     * @returns Array of definitions
     * @private
     */
    extractDefinitions($, element) {
        const definitions = [];
        $(element)
            .find(".def-block")
            .each((i, defBlock) => {
            // Extract core definition text
            const text = $(defBlock).find(".def.ddef_d.db").first().text().trim();
            if (!text)
                return;
            // Create base definition
            const definition = { text };
            // Extract examples
            const examples = this.extractExamples($, defBlock);
            if (examples.length > 0) {
                definition.examples = examples;
            }
            // Extract level information
            const level = this.extractLevel($, defBlock);
            if (level) {
                definition.level = level;
            }
            // Extract domain/subject area
            const domain = $(defBlock).find(".domain.ddomain").text().trim();
            if (domain) {
                definition.domain = domain;
            }
            // Extract register information (formal, informal, etc.)
            const register = $(defBlock).find(".register.dreg").text().trim();
            if (register) {
                definition.register = register;
            }
            // Extract grammar info
            const grammar = $(defBlock).find(".gram.dgram").text().trim();
            if (grammar) {
                definition.grammar = grammar;
            }
            // Extract usage labels
            const labels = [];
            $(defBlock)
                .find(".usage.dusage")
                .each((j, label) => {
                const labelText = $(label).text().trim();
                if (labelText)
                    labels.push(labelText);
            });
            if (labels.length > 0) {
                definition.labels = labels;
            }
            // Extract alternates
            const alternates = [];
            $(defBlock)
                .find(".var.dvar")
                .each((j, alt) => {
                const altText = $(alt).text().trim();
                if (altText)
                    alternates.push(altText);
            });
            if (alternates.length > 0) {
                definition.alternates = alternates;
            }
            // Extract UK/US variations
            const ukVar = $(defBlock).find(".uk .dvar").text().trim();
            const usVar = $(defBlock).find(".us .dvar").text().trim();
            if (ukVar || usVar) {
                definition.regionVariation = {};
                if (ukVar)
                    definition.regionVariation.uk = ukVar;
                if (usVar)
                    definition.regionVariation.us = usVar;
            }
            definitions.push(definition);
        });
        return definitions;
    }
    /**
     * Looks up a word in the Cambridge Dictionary
     * @param word The word to look up
     * @returns A promise resolving to CambridgeDictionaryResponse
     */
    async lookupWord(word) {
        try {
            const url = `${this.baseUrl}/dictionary/english/${encodeURIComponent(word)}`;
            const $ = await super.fetchHtml(url);
            const entries = [];
            // Process each entry-body__el (different parts of speech, or sometimes different word senses)
            $(".entry-body__el").each((i, element) => {
                // Get the word (might be slightly different from search term, e.g., different form)
                const entryWord = $(element).find(".hw.dhw").first().text().trim() || word;
                // Get part of speech
                const partOfSpeech = $(element).find(".pos.dpos").first().text().trim();
                if (!partOfSpeech)
                    return; // Skip if no part of speech found
                // Extract pronunciation
                const pronunciation = this.extractPronunciation($, element);
                // Extract definitions
                const definitions = this.extractDefinitions($, element);
                if (definitions.length === 0)
                    return; // Skip if no definitions found
                // Create definition group
                const defGroup = {
                    partOfSpeech,
                    definitions,
                };
                // Extract grammar info for the group
                const grammarInfo = $(element)
                    .find(".gram.dgram")
                    .first()
                    .text()
                    .trim();
                if (grammarInfo) {
                    defGroup.grammarInfo = grammarInfo;
                }
                // Extract region note
                const regionNote = $(element)
                    .find(".region.dregion")
                    .first()
                    .text()
                    .trim();
                if (regionNote) {
                    defGroup.regionNote = regionNote;
                }
                // Extract group level if available
                const groupLevel = this.extractLevel($, element);
                if (groupLevel) {
                    defGroup.groupLevel = groupLevel;
                }
                // Find or create entry
                let entry = entries.find((e) => e.word.toLowerCase() === entryWord.toLowerCase());
                if (!entry) {
                    entry = {
                        word: entryWord,
                        defGroups: [],
                        pronunciation: Object.keys(pronunciation).length > 0 ? pronunciation : undefined,
                    };
                    entries.push(entry);
                }
                // Add definition group to entry
                entry.defGroups.push(defGroup);
                // Extract idioms, phrasal verbs and related phrases
                const idioms = this.extractRelatedPhrases($, element, ".idiom-block");
                if (idioms.length > 0) {
                    if (!entry.idioms)
                        entry.idioms = [];
                    entry.idioms.push(...idioms);
                }
                const phrasalVerbs = this.extractRelatedPhrases($, element, ".pv-block, .phrasal_verb-block");
                if (phrasalVerbs.length > 0) {
                    if (!entry.phrasalVerbs)
                        entry.phrasalVerbs = [];
                    entry.phrasalVerbs.push(...phrasalVerbs);
                }
                const relatedPhrases = this.extractRelatedPhrases($, element, ".phrase-block");
                if (relatedPhrases.length > 0) {
                    if (!entry.relatedPhrases)
                        entry.relatedPhrases = [];
                    entry.relatedPhrases.push(...relatedPhrases);
                }
                // Look for alternative forms
                const alternativeForms = [];
                $(element)
                    .find(".var.dvar")
                    .each((j, altForm) => {
                    const altFormText = $(altForm).text().trim();
                    if (altFormText && !alternativeForms.includes(altFormText)) {
                        alternativeForms.push(altFormText);
                    }
                });
                if (alternativeForms.length > 0) {
                    entry.alternativeForms = alternativeForms;
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
            };
        }
        catch (error) {
            return this.handleCambridgeError(word, error);
        }
    }
}
exports.CambridgeDictionaryService = CambridgeDictionaryService;
//# sourceMappingURL=cambridge-dictionary.service.js.map