import { OxfordDictionaryResponse } from "../types/oxford";
import { BaseDictionaryService } from "./base-dictionary.service";
/**
 * Service to scrape definitions from Oxford Dictionaries
 * Implements the dictionary service interface for v2
 * Follows Single Responsibility Principle (SRP) by focusing only on Oxford-specific scraping
 * Follows Liskov Substitution Principle (LSP) by properly extending BaseDictionaryService
 */
export declare class OxfordDictionaryService extends BaseDictionaryService<OxfordDictionaryResponse> {
    private baseUrl;
    constructor();
    /**
     * Makes an absolute URL from a relative URL
     * @param relativeUrl The relative URL
     * @returns The absolute URL
     * @protected
     */
    protected makeAbsoluteUrl(relativeUrl?: string): string | undefined;
    /**
     * Handle errors from the API
     * @param word The word that was being looked up
     * @param error The error that occurred
     * @returns A DictionaryResponse with the error information
     * @private
     */
    private handleOxfordError;
    /**
     * Fetches Oxford dictionary HTML using their direct search URL which handles redirects
     * @param word The word to look up
     * @returns A cheerio object with the parsed HTML
     * @private
     */
    private fetchOxfordHtml;
    /**
     * Extract pronunciation data from an element
     * @param $ Cheerio instance
     * @param element The element containing pronunciation
     * @returns Pronunciation data
     * @private
     */ private extractPronunciation;
    /**
     * Extract examples from a sense block
     * @param $ Cheerio instance
     * @param senseElem The sense element
     * @returns Array of examples
     * @private
     */
    private extractExamples;
    /**
     * Extract register information (formal, informal, etc.)
     * @param $ Cheerio instance
     * @param element The element to extract from
     * @returns Array of register information
     * @private
     */
    private extractRegisters;
    /**
     * Extract domain information (subject field)
     * @param $ Cheerio instance
     * @param element The element to extract from
     * @returns Array of domain information
     * @private
     */
    private extractDomains;
    /**
     * Extract region information
     * @param $ Cheerio instance
     * @param element The element to extract from
     * @returns Array of region information
     * @private
     */
    private extractRegions;
    /**
     * Extract a lexical category (part of speech)
     * @param $ Cheerio instance
     * @param element The element to extract from
     * @returns Lexical category information
     * @private
     */
    private extractLexicalCategory;
    /**
     * Extract grammatical features
     * @param $ Cheerio instance
     * @param element The element to extract from
     * @returns Array of grammatical features
     * @private
     */
    private extractGrammaticalFeatures;
    /**
     * Extract etymology information
     * @param $ Cheerio instance
     * @param element The element to extract from
     * @returns Etymology information or undefined
     * @private
     */
    private extractEtymology;
    /**
     * Extract synonyms from a sense
     * @param $ Cheerio instance
     * @param element The element to extract from
     * @returns Array of synonyms or undefined
     * @private
     */
    private extractSynonyms;
    /**
     * Extract subsenses from a sense block
     * @param $ Cheerio instance
     * @param element The sense element
     * @returns Array of subsenses
     * @private
     */
    private extractSubsenses;
    /**
     * Extract senses from an entry
     * @param $ Cheerio instance
     * @param element The entry element
     * @returns Array of senses
     * @private
     */
    private extractSenses;
    /**
     * Extract idioms from an entry
     * @param $ Cheerio instance
     * @param entry The entry element
     * @returns Array of phrases (idioms)
     * @private
     */
    private extractIdioms;
    /**
     * Extract variant forms
     * @param $ Cheerio instance
     * @param element The element to extract from
     * @returns Array of variant forms
     * @private
     */
    private extractVariantForms;
    /**
     * Looks up a word in the Oxford Learner's Dictionary
     * @param word The word to look up
     * @returns A promise resolving to OxfordDictionaryResponse
     */
    lookupWord(word: string): Promise<OxfordDictionaryResponse>;
}
