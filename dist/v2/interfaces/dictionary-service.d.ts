import { CambridgeDictionaryResponse } from "../types/cambridge";
import { MerriamWebsterDictionaryResponse } from "../types/merriam-webster";
import { OxfordDictionaryResponse } from "../types/oxford";
/**
 * Interface for dictionary services in V2
 * Following Interface Segregation Principle (ISP)
 */
export interface IDictionaryService<T = any> {
    /**
     * Name/identifier of the dictionary source
     */
    readonly sourceName: string;
    /**
     * Look up a word in the dictionary
     * @param word The word to look up
     * @returns A promise resolving to appropriate Dictionary Response type
     */
    lookupWord(word: string): Promise<T>;
}
/**
 * Type for all possible dictionary response types in v2
 */
export type DictionaryResponse = CambridgeDictionaryResponse | MerriamWebsterDictionaryResponse | OxfordDictionaryResponse;
