import { Request, Response } from "express";
import { DictionaryResponse } from "../types/dictionary";
import { IDictionaryService } from "../interfaces/dictionary-service";

// Dictionary services instance will be passed from index.ts
let dictionaryServices: Record<string, IDictionaryService>;

// Set dictionary services
export const setDictionaryServices = (
  services: Record<string, IDictionaryService>
) => {
  dictionaryServices = services;
};

// Get all available dictionary services
export const getWelcomeInfo = (req: Request, res: Response) => {
  res.json({
    message: "Welcome to Dictionary API",
    endpoints: {
      // Dynamic list of available dictionaries
      ...Object.fromEntries(
        Object.keys(dictionaryServices).map((name) => [
          name,
          `/api/${name}/:word`,
        ])
      ),
      // Generic endpoint that can query multiple dictionaries
      all: "/api/dictionary/:word?sources=cambridge,oxford",
    },
  });
};

// Generic handler for all dictionary services
export const getDictionaryFromMultipleSources = async (
  req: Request,
  res: Response
) => {
  try {
    const { word } = req.params;
    const sourcesParam = req.query.sources as string;

    // Determine which sources to use
    let sources: string[];
    if (sourcesParam) {
      sources = sourcesParam
        .split(",")
        .filter((s) => Object.keys(dictionaryServices).includes(s));
      if (sources.length === 0) sources = Object.keys(dictionaryServices);
    } else {
      sources = Object.keys(dictionaryServices);
    }

    // Fetch data from all requested sources in parallel
    const results = await Promise.all(
      sources.map(async (source) => {
        try {
          return await dictionaryServices[source].lookupWord(word);
        } catch (error) {
          console.error(`Error fetching from ${source}:`, error);
          return {
            word,
            entries: [],
            source,
            error:
              error instanceof Error ? error.message : "Unknown error occurred",
          } as DictionaryResponse;
        }
      })
    );

    res.json({
      word,
      results,
    });
  } catch (error) {
    console.error(`Error in dictionary lookup:`, error);
    res.status(500).json({
      error: "Failed to fetch dictionary data",
      message: error instanceof Error ? error.message : String(error),
    });
  }
};

// Handler for specific dictionary service
export const getDictionaryFromSingleSource = (name: string) => {
  return async (req: Request, res: Response) => {
    try {
      const { word } = req.params;
      const data: DictionaryResponse = await dictionaryServices[
        name
      ].lookupWord(word);
      res.json(data);
    } catch (error) {
      console.error(`Error fetching from ${name}:`, error);
      res.status(500).json({
        error: `Failed to fetch data from ${name} Dictionary`,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  };
};
