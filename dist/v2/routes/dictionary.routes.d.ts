import { IDictionaryService } from "../interfaces/dictionary-service";
import { DictionaryResponse } from "../interfaces/dictionary-service";
/**
 * Sets up routes for the dictionary API
 * Follows Dependency Injection principle by receiving controller dependencies
 * @param dictionaryServices Dictionary services to use
 * @returns Express router with configured routes
 */
export declare const setupDictionaryRoutes: (dictionaryServices: Record<string, IDictionaryService<DictionaryResponse>>) => import("express-serve-static-core").Router;
