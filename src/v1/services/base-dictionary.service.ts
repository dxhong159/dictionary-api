import { DictionaryResponse } from "../types/dictionary";
import { IDictionaryService } from "../interfaces/dictionary-service";
import axios, { AxiosRequestConfig } from "axios";
import * as cheerio from "cheerio";
import { RequestManager } from "../../utils/request-manager";

/**
 * Abstract base class for dictionary scrapers
 * Follows Single Responsibility Principle (SRP) by handling HTTP requests and basic error handling
 * Follows Open/Closed Principle (OCP) by allowing extension through inheritance
 */
export abstract class BaseDictionaryService implements IDictionaryService {
  /**
   * @param sourceName The name of the dictionary source
   */
  protected requestManager: RequestManager;

  constructor(readonly sourceName: string) {
    this.requestManager = new RequestManager(1500, 4000); // Delay between 1.5 and 4 seconds
  }

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
  protected async fetchHtml(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<cheerio.CheerioAPI> {
    // Wait for a random delay before making the request
    await this.requestManager.waitForNextRequest();

    // Get request config with rotating user agent and other browser-like headers
    const requestConfig = this.requestManager.getRequestConfig(config);

    const response = await axios.get(url, requestConfig);
    return cheerio.load(response.data) as cheerio.CheerioAPI;
  }

  /**
   * Protected method to handle common error scenarios
   * @param word The word that was looked up
   * @param error The error that occurred
   * @returns A DictionaryResponse with error information
   */
  protected handleError(word: string, error: unknown): DictionaryResponse {
    console.error(`Error scraping ${this.sourceName} Dictionary:`, error);
    return {
      word,
      entries: [],
      source: this.sourceName,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
