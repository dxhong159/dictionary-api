"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupDictionaryRoutes = void 0;
const express_1 = require("express");
const dictionary_controller_1 = __importDefault(require("../controllers/dictionary.controller"));
/**
 * Sets up routes for the dictionary API
 * Follows Dependency Injection principle by receiving controller dependencies
 * @param dictionaryServices Dictionary services to use
 * @returns Express router with configured routes
 */
const setupDictionaryRoutes = (dictionaryServices) => {
    const router = (0, express_1.Router)();
    // Create controller instance with injected services
    const dictionaryController = new dictionary_controller_1.default(dictionaryServices);
    // Welcome route
    router.get("/", dictionaryController.getWelcomeInfo);
    // Generic handler for all dictionary services
    router.get("/dictionary/:word", dictionaryController.getDictionaryFromMultipleSources);
    // Individual endpoints for specific dictionary services
    Object.keys(dictionaryServices).forEach((name) => {
        router.get(`/${name.toLowerCase()}/:word`, dictionaryController.getDictionaryFromSingleSource(name));
    });
    return router;
};
exports.setupDictionaryRoutes = setupDictionaryRoutes;
//# sourceMappingURL=dictionary.routes.js.map