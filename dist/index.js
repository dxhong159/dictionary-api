"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const services_1 = require("./v1/services");
const services_2 = require("./v2/services");
const dictionary_routes_1 = require("./v1/routes/dictionary.routes");
const dictionary_controller_1 = require("./v1/controllers/dictionary.controller");
const dictionary_routes_2 = require("./v2/routes/dictionary.routes");
// Load environment variables
dotenv_1.default.config({ path: "./config/.env" });
// Initialize dictionary services
const dictionaryServicesV1 = {
    cambridge: new services_1.CambridgeDictionaryService(),
    oxford: new services_1.OxfordDictionaryService(),
    "merriam-webster": new services_1.MerriamWebsterDictionaryService(),
};
const dictionaryServicesV2 = {
    cambridge: new services_2.CambridgeDictionaryService(),
    oxford: new services_2.OxfordDictionaryService(),
    "merriam-webster": new services_2.MerriamWebsterDictionaryService(),
};
// Pass dictionary services to v1 controller (using singleton pattern)
(0, dictionary_controller_1.setDictionaryServices)(dictionaryServicesV1);
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Setup API routes
app.use("/api/v1", (0, dictionary_routes_1.setupDictionaryRoutes)(dictionaryServicesV1));
app.use("/api/v2", (0, dictionary_routes_2.setupDictionaryRoutes)(dictionaryServicesV2));
// Serve static files from the public directory for UI
app.use(express_1.default.static("public"));
app.get("/", (req, res) => {
    res.sendFile("index.html", { root: "./public/v2" });
});
// Start server with port fallback logic
const startServer = (port) => {
    try {
        const server = app.listen(port, () => {
            console.log(`Dictionary API server running on port http://localhost:${port}`);
        });
        server.on("error", (error) => {
            if (error.code === "EADDRINUSE") {
                console.warn(`Port ${port} is already in use, trying port ${port + 1}`);
                startServer(port + 1);
            }
            else {
                console.error("Server error:", error);
            }
        });
    }
    catch (err) {
        console.error("Failed to start server:", err);
        process.exit(1);
    }
};
startServer(Number(PORT));
//# sourceMappingURL=index.js.map