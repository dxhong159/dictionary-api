"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseDictionaryService = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
/**
 * Abstract base class for dictionary scrapers in v2
 * Follows Single Responsibility Principle (SRP) by handling HTTP requests and basic error handling
 * Follows Open/Closed Principle (OCP) by allowing extension through inheritance
 * Follows Dependency Inversion Principle (DIP) by depending on abstraction, not implementation
 */
class BaseDictionaryService {
    /**
     * @param sourceName The name of the dictionary source
     */
    constructor(sourceName) {
        this.sourceName = sourceName;
    }
    /**
     * Protected method to fetch HTML content from a dictionary website
     * @param url The URL to fetch
     * @param config Optional axios request configuration
     * @returns A cheerio instance loaded with the HTML content
     */
    async fetchHtml(url, config) {
        const defaultConfig = {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9",
            },
            ...config,
        };
        const response = await axios_1.default.get(url, defaultConfig);
        return cheerio.load(response.data);
    }
    /**
     * Protected method to handle common error scenarios
     * @param word The word that was looked up
     * @param error The error that occurred
     * @returns A Dictionary Response with error information
     */
    handleError(word, error) {
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
    makeAbsoluteUrl(baseUrl, relativeUrl) {
        if (!relativeUrl)
            return undefined;
        if (relativeUrl.startsWith("http"))
            return relativeUrl;
        return relativeUrl.startsWith("/")
            ? `${baseUrl}${relativeUrl}`
            : relativeUrl;
    }
}
exports.BaseDictionaryService = BaseDictionaryService;
//# sourceMappingURL=base-dictionary.service.js.map