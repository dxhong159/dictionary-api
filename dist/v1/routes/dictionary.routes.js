"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupDictionaryRoutes = void 0;
const express_1 = require("express");
const dictionary_controller_1 = require("../controllers/dictionary.controller");
const setupDictionaryRoutes = (dictionaryServices) => {
    const router = (0, express_1.Router)();
    // Welcome route
    router.get("/", dictionary_controller_1.getWelcomeInfo);
    // Generic handler for all dictionary services
    router.get("/dictionary/:word", dictionary_controller_1.getDictionaryFromMultipleSources);
    // Individual endpoints for specific dictionary services
    Object.keys(dictionaryServices).forEach((name) => {
        router.get(`/${name}/:word`, (0, dictionary_controller_1.getDictionaryFromSingleSource)(name));
    });
    return router;
};
exports.setupDictionaryRoutes = setupDictionaryRoutes;
//# sourceMappingURL=dictionary.routes.js.map