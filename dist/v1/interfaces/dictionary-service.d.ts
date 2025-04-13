import { DictionaryResponse } from '../types/dictionary';
/**
 * Interface for dictionary services
 * Following Interface Segregation Principle (ISP)
 */
export interface IDictionaryService {
    /**
     * Name/identifier of the dictionary source
     */
    readonly sourceName: string;
    /**
     * Look up a word in the dictionary
     * @param word The word to look up
     * @returns A promise resolving to DictionaryResponse
     */
    lookupWord(word: string): Promise<DictionaryResponse>;
}
