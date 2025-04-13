import { Router } from "express";
import {
  getWelcomeInfo,
  getDictionaryFromMultipleSources,
  getDictionaryFromSingleSource,
} from "../controllers/dictionary.controller";
import { IDictionaryService } from "../interfaces/dictionary-service";

export const setupDictionaryRoutes = (
  dictionaryServices: Record<string, IDictionaryService>
) => {
  const router = Router();

  // Welcome route
  router.get("/", getWelcomeInfo);

  // Generic handler for all dictionary services
  router.get("/dictionary/:word", getDictionaryFromMultipleSources);

  // Individual endpoints for specific dictionary services
  Object.keys(dictionaryServices).forEach((name) => {
    router.get(`/${name}/:word`, getDictionaryFromSingleSource(name));
  });

  return router;
};
