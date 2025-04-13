import { Request, Response } from "express";
import { DictionaryResponse, IDictionaryService } from "../interfaces/dictionary-service";
/**
 * DictionaryController class following SOLID principles
 * - Single Responsibility: Each method has a single purpose
 * - Open/Closed: Extendable for new dictionary services without modifying existing code
 * - Liskov Substitution: Works with any service implementing IDictionaryService
 * - Interface Segregation: Only depends on what it needs from services
 * - Dependency Injection: Services are injected, not created internally
 */
export default class DictionaryController {
    private dictionaryServices;
    /**
     * Constructor that follows Dependency Injection principle
     * @param services Dictionary services to be used by the controller
     */
    constructor(services: Record<string, IDictionaryService<DictionaryResponse>>);
    /**
     * Returns welcome information and available endpoints
     * @param req Express request
     * @param res Express response
     */
    getWelcomeInfo: (req: Request, res: Response) => void;
    /**
     * Fetches dictionary data from multiple sources based on request parameters
     * @param req Express request
     * @param res Express response
     */
    getDictionaryFromMultipleSources: (req: Request, res: Response) => Promise<void>;
    /**
     * Returns a handler function for a specific dictionary source
     * @param name The name of the dictionary source
     * @returns An Express handler function
     */
    getDictionaryFromSingleSource: (name: string) => (req: Request, res: Response) => Promise<void>;
    /**
     * Helper method to determine which dictionary sources to use based on request
     * @param sourcesParam Source parameter from the request query
     * @returns Array of source names to use
     */
    private getRequestedSources;
    /**
     * Creates a standardized error response for dictionary lookups
     * @param word The word that was being looked up
     * @param source The dictionary source that failed
     * @param error The error that occurred
     * @returns A standardized DictionaryResponse with error information
     */
    private createErrorResponse;
    /**
     * Standardized error handling for controller methods
     * @param res Express response object
     * @param error The error that occurred
     * @param defaultMessage Default error message
     */
    private handleControllerError;
}
