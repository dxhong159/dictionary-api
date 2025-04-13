import { BaseDictionaryService } from "./base-dictionary.service";
import { DictionaryResponse } from "../types/dictionary";
/**
 * Service to scrape definitions from Merriam-Webster Dictionary
 * Implements the dictionary scraper interface
 */
export declare class MerriamWebsterDictionaryService extends BaseDictionaryService {
    private baseUrl;
    constructor();
    /**
     * Look up a word in Merriam-Webster Dictionary
     * @param word The word to look up
     * @returns A promise resolving to DictionaryResponse
     */
    lookupWord(word: string): Promise<DictionaryResponse>;
}
