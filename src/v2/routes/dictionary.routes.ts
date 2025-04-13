import { Router } from "express";
import DictionaryController from "../controllers/dictionary.controller";
import { IDictionaryService } from "../interfaces/dictionary-service";
import { DictionaryResponse } from "../interfaces/dictionary-service";

/**
 * Sets up routes for the dictionary API
 * Follows Dependency Injection principle by receiving controller dependencies
 * @param dictionaryServices Dictionary services to use
 * @returns Express router with configured routes
 */
export const setupDictionaryRoutes = (
  dictionaryServices: Record<string, IDictionaryService<DictionaryResponse>>
) => {
  const router = Router();

  // Create controller instance with injected services
  const dictionaryController = new DictionaryController(dictionaryServices);

  // Welcome route
  router.get("/", dictionaryController.getWelcomeInfo);

  // Generic handler for all dictionary services
  router.get(
    "/dictionary/:word",
    dictionaryController.getDictionaryFromMultipleSources
  );

  // Individual endpoints for specific dictionary services
  Object.keys(dictionaryServices).forEach((name) => {
    router.get(
      `/${name.toLowerCase()}/:word`,
      dictionaryController.getDictionaryFromSingleSource(name)
    );
  });

  return router;
};
