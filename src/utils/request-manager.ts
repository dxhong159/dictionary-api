import { AxiosRequestConfig } from "axios";

/**
 * Request manager to help avoid being blocked when making frequent requests
 * - Rotates user agents
 * - Adds random delays between requests
 * - Manages request rate limiting
 */
export class RequestManager {
  private userAgents: string[] = [
    // Desktop browsers
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36 Edg/110.0.1587.63",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/110.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Safari/605.1.15",
    // Mobile browsers
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 13; SM-S901B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (iPad; CPU OS 16_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Mobile/15E148 Safari/604.1",
  ];

  private acceptLanguages: string[] = [
    "en-US,en;q=0.9",
    "en-GB,en;q=0.9",
    "en-CA,en;q=0.9",
    "en-AU,en;q=0.9",
    "en;q=0.9",
    "en-US,en;q=0.8,fr;q=0.5",
    "en-GB,en;q=0.8,de;q=0.5",
  ];

  private lastRequestTime: number = 0;
  private minDelayMs: number;
  private maxDelayMs: number;

  /**
   * @param minDelayMs Minimum delay between requests in milliseconds
   * @param maxDelayMs Maximum delay between requests in milliseconds
   */
  constructor(minDelayMs = 1000, maxDelayMs = 3000) {
    this.minDelayMs = minDelayMs;
    this.maxDelayMs = maxDelayMs;
  }

  /**
   * Get request configuration with a randomly selected user agent and accept-language
   * @param config Optional existing axios request configuration
   * @returns Enhanced axios request configuration
   */
  public getRequestConfig(config?: AxiosRequestConfig): AxiosRequestConfig {
    const userAgent = this.getRandomUserAgent();
    const acceptLanguage = this.getRandomAcceptLanguage();

    return {
      headers: {
        "User-Agent": userAgent,
        "Accept-Language": acceptLanguage,
        // Add other common headers that make the request look more like a real browser
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        DNT: "1", // Do Not Track
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "Cache-Control": "max-age=0",
      },
      ...config,
    };
  }

  /**
   * Wait for a random delay before the next request
   * @returns Promise that resolves after the delay
   */
  public async waitForNextRequest(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    // Calculate a random delay between min and max
    const randomDelay = Math.floor(
      Math.random() * (this.maxDelayMs - this.minDelayMs + 1) + this.minDelayMs
    );

    // If we haven't waited long enough since the last request, add more delay
    const delayNeeded = Math.max(0, randomDelay - timeSinceLastRequest);

    if (delayNeeded > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayNeeded));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Get a random user agent from the available list
   * @returns A random user agent string
   */
  private getRandomUserAgent(): string {
    const index = Math.floor(Math.random() * this.userAgents.length);
    return this.userAgents[index];
  }

  /**
   * Get a random accept-language from the available list
   * @returns A random accept-language string
   */
  private getRandomAcceptLanguage(): string {
    const index = Math.floor(Math.random() * this.acceptLanguages.length);
    return this.acceptLanguages[index];
  }
}
