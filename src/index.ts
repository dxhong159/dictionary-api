import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
  CambridgeDictionaryService as CambridgeDictionaryServiceV1,
  OxfordDictionaryService as OxfordDictionaryServiceV1,
  MerriamWebsterDictionaryService as MerriamWebsterDictionaryServiceV1,
} from "./v1/services";

import {
  CambridgeDictionaryService as CambridgeDictionaryServiceV2,
  OxfordDictionaryService as OxfordDictionaryServiceV2,
  MerriamWebsterDictionaryService as MerriamWebsterDictionaryServiceV2,
} from "./v2/services";

import { setupDictionaryRoutes as setupDictionaryRoutesV1 } from "./v1/routes/dictionary.routes";
import { setDictionaryServices as setDictionaryServicesV1 } from "./v1/controllers/dictionary.controller";
import { setupDictionaryRoutes as setupDictionaryRoutesV2 } from "./v2/routes/dictionary.routes";

// Load environment variables
dotenv.config({ path: "./config/.env" });

// Initialize dictionary services
const dictionaryServicesV1 = {
  cambridge: new CambridgeDictionaryServiceV1(),
  oxford: new OxfordDictionaryServiceV1(),
  "merriam-webster": new MerriamWebsterDictionaryServiceV1(),
};

const dictionaryServicesV2 = {
  cambridge: new CambridgeDictionaryServiceV2(),
  oxford: new OxfordDictionaryServiceV2(),
  "merriam-webster": new MerriamWebsterDictionaryServiceV2(),
};

// Pass dictionary services to v1 controller (using singleton pattern)
setDictionaryServicesV1(dictionaryServicesV1);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Setup API routes
app.use("/api/v1", setupDictionaryRoutesV1(dictionaryServicesV1));
app.use("/api/v2", setupDictionaryRoutesV2(dictionaryServicesV2));

// Serve static files from the public directory for UI
app.use(express.static("public"));
app.get("/v1", (req, res) => {
  res.sendFile("index.html", { root: "./public/v1" });
});
app.get("/v2", (req, res) => {
  res.sendFile("index.html", { root: "./public/v2" });
});

// Start server with port fallback logic
const startServer = (port: number) => {
  try {
    const server = app.listen(port, () => {
      console.log(
        `Dictionary API server running on port http://localhost:${port}`
      );
    });

    server.on("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        console.warn(`Port ${port} is already in use, trying port ${port + 1}`);
        startServer(port + 1);
      } else {
        console.error("Server error:", error);
      }
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer(Number(PORT));
