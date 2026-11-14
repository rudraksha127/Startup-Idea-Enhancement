import express from "express";
import { corsMiddleware } from "./middleware/cors.js";
import { requestIdMiddleware } from "./middleware/request-id.js";
import { authMiddleware } from "./middleware/auth.js";
import { errorHandler } from "./middleware/error-handler.js";
import { apiRouter } from "./routes/index.js";
import { securityHeaders } from "./middleware/security-headers.js";
import { generalRateLimit } from "./middleware/rate-limit.js";
import { auditLog } from "./middleware/audit-log.js";

export const app = express();

// Security Headers (Helmet) — applied first
app.use(securityHeaders);

// Global Middlewares
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(corsMiddleware);
app.use(requestIdMiddleware);
app.use(authMiddleware);
app.use(auditLog);

// Rate limiting — 100 req/min per IP on all API routes
app.use("/api", generalRateLimit);

// Mount Versioned Routes (/api/v1/...) and Legacy Routes (/api/...)
app.use("/api/v1", apiRouter);
app.use("/api", apiRouter);

// Catalyst Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "AgencyOS Express API" });
});

// Root Welcome Route
app.get("/", (req, res) => {
  res.status(200).json({
    service: "AgencyOS Express API",
    status: "online",
    version: "1.0.0",
    docs: "/api/v1/health",
  });
});

// Central Error Handler
app.use(errorHandler);

