import { DictionaryResponse } from "../types/dictionary";
import { IDictionaryService } from "../interfaces/dictionary-service";
import { AxiosRequestConfig } from "axios";
import * as cheerio from "cheerio";
/**
 * Abstract base class for dictionary scrapers
 * Follows Single Responsibility Principle (SRP) by handling HTTP requests and basic error handling
 * Follows Open/Closed Principle (OCP) by allowing extension through inheritance
 */
export declare abstract class BaseDictionaryService implements IDictionaryService {
    readonly sourceName: string;
    /**
     * @param sourceName The name of the dictionary source
     */
    constructor(sourceName: string);
    /**
     * Abstract method to be implemented by concrete dictionary services
     * @param word The word to look up
     * @returns A promise resolving to DictionaryResponse
     */
    abstract lookupWord(word: string): Promise<DictionaryResponse>;
    /**
     * Protected method to fetch HTML content from a dictionary website
     * @param url The URL to fetch
     * @param config Optional axios request configuration
     * @returns A cheerio instance loaded with the HTML content
     */
    protected fetchHtml(url: string, config?: AxiosRequestConfig): Promise<cheerio.CheerioAPI>;
    /**
     * Protected method to handle common error scenarios
     * @param word The word that was looked up
     * @param error The error that occurred
     * @returns A DictionaryResponse with error information
     */
    protected handleError(word: string, error: unknown): DictionaryResponse;
}
