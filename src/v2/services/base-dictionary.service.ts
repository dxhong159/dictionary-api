import axios, { AxiosRequestConfig } from "axios";
import * as cheerio from "cheerio";
import {
  IDictionaryService,
  DictionaryResponse,
} from "../interfaces/dictionary-service";
import { RequestManager } from "../../utils/request-manager";

/**
 * Abstract base class for dictionary scrapers in v2
 * Follows Single Responsibility Principle (SRP) by handling HTTP requests and basic error handling
 * Follows Open/Closed Principle (OCP) by allowing extension through inheritance
 * Follows Dependency Inversion Principle (DIP) by depending on abstraction, not implementation
 */
export abstract class BaseDictionaryService<T extends DictionaryResponse>
  implements IDictionaryService<T>
{
  /**
   * @param sourceName The name of the dictionary source
   */
  protected requestManager: RequestManager;

  constructor(readonly sourceName: string) {
    this.requestManager = new RequestManager(2000, 5000); // Delay between 2 and 5 seconds for v2
  }

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
  protected async fetchHtml(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<cheerio.CheerioAPI> {
    // Wait for a random delay before making the request
    await this.requestManager.waitForNextRequest();

    // Get request config with rotating user agent and other browser-like headers
    const requestConfig = this.requestManager.getRequestConfig(config);

    const response = await axios.get(url, requestConfig);
    return cheerio.load(response.data);
  }

  /**
   * Protected method to handle common error scenarios
   * @param word The word that was looked up
   * @param error The error that occurred
   * @returns A Dictionary Response with error information
   */
  protected handleError(word: string, error: unknown): any {
    console.error(`Error scraping ${this.sourceName} Dictionary:`, error);
    return {
      word,
      entries: [],
      source: this.sourceName,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }

  /**
   * Makes an absolute URL from a relative URL
   * @param baseUrl The base URL
   * @param relativeUrl The relative URL
   * @returns The absolute URL
   * @protected
   */
  protected makeAbsoluteUrl(
    baseUrl: string,
    relativeUrl?: string
  ): string | undefined {
    if (!relativeUrl) return undefined;
    if (relativeUrl.startsWith("http")) return relativeUrl;
    return relativeUrl.startsWith("/")
      ? `${baseUrl}${relativeUrl}`
      : relativeUrl;
  }
}
