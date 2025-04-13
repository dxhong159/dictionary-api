"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDictionaryFromSingleSource = exports.getDictionaryFromMultipleSources = exports.getWelcomeInfo = exports.setDictionaryServices = void 0;
// Dictionary services instance will be passed from index.ts
let dictionaryServices;
// Set dictionary services
const setDictionaryServices = (services) => {
    dictionaryServices = services;
};
exports.setDictionaryServices = setDictionaryServices;
// Get all available dictionary services
const getWelcomeInfo = (req, res) => {
    res.json({
        message: "Welcome to Dictionary API",
        endpoints: {
            // Dynamic list of available dictionaries
            ...Object.fromEntries(Object.keys(dictionaryServices).map((name) => [
                name,
                `/api/${name}/:word`,
            ])),
            // Generic endpoint that can query multiple dictionaries
            all: "/api/dictionary/:word?sources=cambridge,oxford",
        },
    });
};
exports.getWelcomeInfo = getWelcomeInfo;
// Generic handler for all dictionary services
const getDictionaryFromMultipleSources = async (req, res) => {
    try {
        const { word } = req.params;
        const sourcesParam = req.query.sources;
        // Determine which sources to use
        let sources;
        if (sourcesParam) {
            sources = sourcesParam
                .split(",")
                .filter((s) => Object.keys(dictionaryServices).includes(s));
            if (sources.length === 0)
                sources = Object.keys(dictionaryServices);
        }
        else {
            sources = Object.keys(dictionaryServices);
        }
        // Fetch data from all requested sources in parallel
        const results = await Promise.all(sources.map(async (source) => {
            try {
                return await dictionaryServices[source].lookupWord(word);
            }
            catch (error) {
                console.error(`Error fetching from ${source}:`, error);
                return {
                    word,
                    entries: [],
                    source,
                    error: error instanceof Error ? error.message : "Unknown error occurred",
                };
            }
        }));
        res.json({
            word,
            results,
        });
    }
    catch (error) {
        console.error(`Error in dictionary lookup:`, error);
        res.status(500).json({
            error: "Failed to fetch dictionary data",
            message: error instanceof Error ? error.message : String(error),
        });
    }
};
exports.getDictionaryFromMultipleSources = getDictionaryFromMultipleSources;
// Handler for specific dictionary service
const getDictionaryFromSingleSource = (name) => {
    return async (req, res) => {
        try {
            const { word } = req.params;
            const data = await dictionaryServices[name].lookupWord(word);
            res.json(data);
        }
        catch (error) {
            console.error(`Error fetching from ${name}:`, error);
            res.status(500).json({
                error: `Failed to fetch data from ${name} Dictionary`,
                message: error instanceof Error ? error.message : String(error),
            });
        }
    };
};
exports.getDictionaryFromSingleSource = getDictionaryFromSingleSource;
//# sourceMappingURL=dictionary.controller.js.map