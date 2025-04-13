import { DictionaryResponse } from "../types/dictionary";
import { BaseDictionaryService } from "./base-dictionary.service";
/**
 * Cambridge Dictionary Service
 * Concrete implementation of BaseDictionaryService for Cambridge Dictionary
 * Follows Single Responsibility Principle (SRP) by focusing only on Cambridge-specific scraping
 */
export declare class CambridgeDictionaryService extends BaseDictionaryService {
    constructor();
    /**
     * Looks up a word in the Cambridge Dictionary
     * @param word The word to look up
     * @returns A promise resolving to DictionaryResponse
     */
    lookupWord(word: string): Promise<DictionaryResponse>;
}
