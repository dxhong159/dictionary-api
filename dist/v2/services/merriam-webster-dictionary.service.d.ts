import { MerriamWebsterDictionaryResponse } from "../types/merriam-webster";
import { BaseDictionaryService } from "./base-dictionary.service";
/**
 * Service to scrape definitions from Merriam-Webster Dictionary
 * Implements the dictionary service interface for v2
 * Follows Single Responsibility Principle (SRP) by focusing only on Merriam-Webster specific scraping
 * Follows Liskov Substitution Principle (LSP) by properly extending BaseDictionaryService
 */
export declare class MerriamWebsterDictionaryService extends BaseDictionaryService<MerriamWebsterDictionaryResponse> {
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
    private handleMerriamError;
    /**
     * Extract sense number from its container
     * @param $
     * @param element
     * @returns Parsed sense number information
     * @private
     */
    private extractSenseNumber;
    /**
     * Extract examples from a definition element
     * @param $
     * @param element
     * @returns Array of examples
     * @private
     */
    private extractExamples;
    /**
     * Extract labels for a definition
     * @param $
     * @param element
     * @returns Array of labels
     * @private
     */
    private extractLabels;
    /**
     * Extract the detailed pronunciation information
     * @param $
     * @param element
     * @returns Pronunciation data
     * @private
     */
    private extractPronunciation;
    /**
     * Extract definitions from sense blocks
     * @param $
     * @param element
     * @returns Array of definitions
     * @private
     */
    private extractDefinitions;
    /**
     * Extract etymology information
     * @param $
     * @param element
     * @returns Etymology data
     * @private
     */
    private extractEtymology;
    /**
     * Extract related phrases
     * @param $
     * @param word
     * @returns Array of related phrases
     * @private
     */
    private extractRelatedPhrases;
    /**
     * Look up a word in Merriam-Webster Dictionary
     * @param word The word to look up
     * @returns A promise resolving to MerriamWebsterDictionaryResponse
     */
    lookupWord(word: string): Promise<MerriamWebsterDictionaryResponse>;
}
