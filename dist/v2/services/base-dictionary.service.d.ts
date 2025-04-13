import { AxiosRequestConfig } from "axios";
import * as cheerio from "cheerio";
import { IDictionaryService, DictionaryResponse } from "../interfaces/dictionary-service";
/**
 * Abstract base class for dictionary scrapers in v2
 * Follows Single Responsibility Principle (SRP) by handling HTTP requests and basic error handling
 * Follows Open/Closed Principle (OCP) by allowing extension through inheritance
 * Follows Dependency Inversion Principle (DIP) by depending on abstraction, not implementation
 */
export declare abstract class BaseDictionaryService<T extends DictionaryResponse> implements IDictionaryService<T> {
    readonly sourceName: string;
    /**
     * @param sourceName The name of the dictionary source
     */
    constructor(sourceName: string);
    /**
     * Abstract method to be implemented by concrete dictionary services
     * @param word The word to look up
     * @returns A promise resolving to appropriate Dictionary Response
     */
    abstract lookupWord(word: string): Promise<T>;
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
     * @returns A Dictionary Response with error information
     */
    protected handleError(word: string, error: unknown): any;
    /**
     * Makes an absolute URL from a relative URL
     * @param baseUrl The base URL
     * @param relativeUrl The relative URL
     * @returns The absolute URL
     * @protected
     */
    protected makeAbsoluteUrl(baseUrl: string, relativeUrl?: string): string | undefined;
}
