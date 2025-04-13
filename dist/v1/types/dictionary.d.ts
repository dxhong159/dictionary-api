export interface Definition {
    definition: string;
    examples?: string[];
    context?: string;
}
export interface AudioData {
    uk?: string;
    us?: string;
}
export interface DictionaryEntry {
    word: string;
    phonetic?: string;
    partOfSpeech?: string;
    definitions: Definition[];
    synonyms?: string[];
    antonyms?: string[];
    audio?: AudioData;
}
export interface DictionaryResponse {
    word: string;
    entries: DictionaryEntry[];
    source: string;
    audio?: AudioData;
    error?: string;
}
export interface ScraperInterface {
    lookupWord(word: string): Promise<DictionaryResponse>;
}
