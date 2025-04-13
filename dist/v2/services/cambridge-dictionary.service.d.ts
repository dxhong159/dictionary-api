import { CambridgeDictionaryResponse } from "../types/cambridge";
import { BaseDictionaryService } from "./base-dictionary.service";
/**
 * Cambridge Dictionary Service
 * Concrete implementation of IDictionaryService for Cambridge Dictionary
 * Follows Single Responsibility Principle (SRP) by focusing only on Cambridge-specific scraping
 * Follows Liskov Substitution Principle (LSP) by properly extending BaseDictionaryService
 */
export declare class CambridgeDictionaryService extends BaseDictionaryService<CambridgeDictionaryResponse> {
    /**
     * Base URL for Cambridge Dictionary
     * @private
     */
    private readonly baseUrl;
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
    private handleCambridgeError;
    /**
     * Extract pronunciation data from an element
     * @param $ Cheerio instance
     * @param element The element to extract pronunciation from
     * @returns Pronunciation data
     * @private
     */
    private extractPronunciation;
    /**
     * Extract level information from various level indicators on the page
     * @param $ Cheerio instance
     * @param element The element to extract level from
     * @returns Level data or undefined if not found
     * @private
     */
    private extractLevel;
    /**
     * Extract examples from a definition block
     * @param $ Cheerio instance
     * @param defBlock The definition block to extract examples from
     * @returns Array of examples
     * @private
     */
    private extractExamples;
    /**
     * Extract related phrases (idioms, phrasal verbs, etc.)
     * @param $ Cheerio instance
     * @param element The element to extract phrases from
     * @param selector The selector for the phrase container
     * @returns Array of related phrases
     * @private
     */
    private extractRelatedPhrases;
    /**
     * Extract definitions from a part of speech block
     * @param $ Cheerio instance
     * @param element The element containing definitions
     * @returns Array of definitions
     * @private
     */
    private extractDefinitions;
    /**
     * Looks up a word in the Cambridge Dictionary
     * @param word The word to look up
     * @returns A promise resolving to CambridgeDictionaryResponse
     */
    lookupWord(word: string): Promise<CambridgeDictionaryResponse>;
}
