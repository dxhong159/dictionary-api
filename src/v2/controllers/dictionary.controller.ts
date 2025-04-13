import { Request, Response } from "express";
import {
  DictionaryResponse,
  IDictionaryService,
} from "../interfaces/dictionary-service";
import { CambridgeDictionaryResponse } from "../types/cambridge";
import { MerriamWebsterDictionaryResponse } from "../types/merriam-webster";
import { OxfordDictionaryResponse } from "../types/oxford";

/**
 * DictionaryController class following SOLID principles
 * - Single Responsibility: Each method has a single purpose
 * - Open/Closed: Extendable for new dictionary services without modifying existing code
 * - Liskov Substitution: Works with any service implementing IDictionaryService
 * - Interface Segregation: Only depends on what it needs from services
 * - Dependency Injection: Services are injected, not created internally
 */
export default class DictionaryController {
  private dictionaryServices: Record<
    string,
    IDictionaryService<DictionaryResponse>
  >;

  /**
   * Constructor that follows Dependency Injection principle
   * @param services Dictionary services to be used by the controller
   */
  constructor(
    services: Record<string, IDictionaryService<DictionaryResponse>>
  ) {
    this.dictionaryServices = services;
  }

  /**
   * Returns welcome information and available endpoints
   * @param req Express request
   * @param res Express response
   */
  public getWelcomeInfo = (req: Request, res: Response): void => {
    res.json({
      message: "Welcome to Dictionary API v2",
      endpoints: {
        // Dynamic list of available dictionaries
        ...Object.fromEntries(
          Object.keys(this.dictionaryServices).map((name) => [
            name,
            `/api/v2/${name.toLowerCase()}/:word`,
          ])
        ),
        // Generic endpoint that can query multiple dictionaries
        all: "/api/v2/dictionary/:word?sources=cambridge,oxford",
      },
      availableSources: Object.keys(this.dictionaryServices),
    });
  };

  /**
   * Fetches dictionary data from multiple sources based on request parameters
   * @param req Express request
   * @param res Express response
   */
  public getDictionaryFromMultipleSources = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { word } = req.params;
      const sourcesParam = req.query.sources as string;

      // Determine which sources to use
      const sources = this.getRequestedSources(sourcesParam);

      // Fetch data from all requested sources in parallel
      const results = await Promise.all(
        sources.map(async (source) => {
          try {
            return await this.dictionaryServices[source].lookupWord(word);
          } catch (error) {
            console.error(`Error fetching from ${source}:`, error);
            return this.createErrorResponse(word, source, error);
          }
        })
      );

      res.json({
        word,
        results,
        sources,
      });
    } catch (error) {
      this.handleControllerError(res, error, "Failed to fetch dictionary data");
    }
  };

  /**
   * Returns a handler function for a specific dictionary source
   * @param name The name of the dictionary source
   * @returns An Express handler function
   */
  public getDictionaryFromSingleSource = (name: string) => {
    return async (req: Request, res: Response): Promise<void> => {
      try {
        const { word } = req.params;
        const service = this.dictionaryServices[name];

        if (!service) {
          res.status(404).json({
            error: `Dictionary source '${name}' not found`,
            availableSources: Object.keys(this.dictionaryServices),
          });
          return;
        }

        // Type narrowing based on the dictionary source
        let data: DictionaryResponse;

        switch (name.toLowerCase()) {
          case "cambridge":
            data = (await service.lookupWord(
              word
            )) as CambridgeDictionaryResponse;
            break;
          case "merriam-webster":
          case "merriamwebster":
            data = (await service.lookupWord(
              word
            )) as MerriamWebsterDictionaryResponse;
            break;
          case "oxford":
            data = (await service.lookupWord(word)) as OxfordDictionaryResponse;
            break;
          default:
            data = await service.lookupWord(word);
        }

        res.json(data);
      } catch (error) {
        this.handleControllerError(
          res,
          error,
          `Failed to fetch data from ${name} Dictionary`
        );
      }
    };
  };

  /**
   * Helper method to determine which dictionary sources to use based on request
   * @param sourcesParam Source parameter from the request query
   * @returns Array of source names to use
   */
  private getRequestedSources(sourcesParam?: string): string[] {
    if (!sourcesParam) {
      return Object.keys(this.dictionaryServices);
    }

    const requestedSources = sourcesParam
      .split(",")
      .map((s) => s.trim())
      .filter((s) =>
        Object.keys(this.dictionaryServices)
          .map((name) => name.toLowerCase())
          .includes(s.toLowerCase())
      );

    return requestedSources.length > 0
      ? requestedSources
      : Object.keys(this.dictionaryServices);
  }

  /**
   * Creates a standardized error response for dictionary lookups
   * @param word The word that was being looked up
   * @param source The dictionary source that failed
   * @param error The error that occurred
   * @returns A standardized DictionaryResponse with error information
   */
  private createErrorResponse(
    word: string,
    source: string,
    error: unknown
  ): DictionaryResponse {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    // Create an appropriate error response based on source
    switch (source.toLowerCase()) {
      case "cambridge":
        return {
          word,
          entries: [],
          source,
          error: errorMessage,
        } as CambridgeDictionaryResponse;

      case "merriam-webster":
      case "merriamwebster":
        return {
          word,
          entries: [],
          source,
          error: errorMessage,
          suggestions: [],
        } as MerriamWebsterDictionaryResponse;

      case "oxford":
        return {
          word,
          entries: [],
          source,
          error: errorMessage,
        } as OxfordDictionaryResponse;

      default:
        return {
          word,
          entries: [],
          source,
          error: errorMessage,
        } as DictionaryResponse;
    }
  }

  /**
   * Standardized error handling for controller methods
   * @param res Express response object
   * @param error The error that occurred
   * @param defaultMessage Default error message
   */
  private handleControllerError(
    res: Response,
    error: unknown,
    defaultMessage: string
  ): void {
    console.error(`Error in dictionary controller:`, error);

    res.status(500).json({
      error: defaultMessage,
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
  }
}
