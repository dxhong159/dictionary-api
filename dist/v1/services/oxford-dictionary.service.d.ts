import { DictionaryResponse } from "../types/dictionary";
import { BaseDictionaryService } from "./base-dictionary.service";
/**
 * Oxford Dictionary Service
 * Concrete implementation of BaseDictionaryService for Oxford Dictionary
 * Follows Single Responsibility Principle (SRP) by focusing only on Oxford-specific scraping
 */
export declare class OxfordDictionaryService extends BaseDictionaryService {
    constructor();
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
    private fetchOxfordHtml;
    lookupWord(word: string): Promise<DictionaryResponse>;
}
