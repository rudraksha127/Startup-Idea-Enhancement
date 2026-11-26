import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  PORT: parseInt(
    process.env.X_ZOHO_CATALYST_LISTEN_PORT ||
      (process.env.NODE_ENV === "production"
        ? "9000"
        : process.env.PORT || process.env.API_PORT || "4000"),
    10
  ),
  NODE_ENV: process.env.NODE_ENV || "development",
  CATALYST_PROJECT_ID:
    process.env.ZOHO_PROJECT_ID ||
    process.env.PROJECT_ID ||
    process.env.CATALYST_PROJECT_ID ||
    "86053000000025003",
  CATALYST_CLIENT_ID: process.env.ZOHO_CLIENT_ID || process.env.CATALYST_CLIENT_ID || "",
  CATALYST_CLIENT_SECRET: process.env.ZOHO_CLIENT_SECRET || process.env.CATALYST_CLIENT_SECRET || "",
  CATALYST_ENVIRONMENT:
    process.env.ZOHO_ENVIRONMENT ||
    process.env.ENVIRONMENT ||
    process.env.CATALYST_ENVIRONMENT ||
    "development",
  JWT_SECRET:
    process.env.JWT_SECRET ||
    (process.env.NODE_ENV === "production"
      ? (() => {
          throw new Error("FATAL: JWT_SECRET environment variable must be set in production");
        })()
      : "agencyos-dev-jwt-super-secret-key-min-32-chars-long"),
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://startup-idea-enhancement.luckyudiya.workers.dev",
        "https://agencyos.pages.dev",
        /\.workers\.dev$/,
        /\.pages\.dev$/,
      ],
  AI_RESEARCH_PROVIDER: process.env.AI_RESEARCH_PROVIDER || "mock",
  EMAIL_PROVIDER: process.env.EMAIL_PROVIDER || "mock",
  MAPS_PROVIDER: process.env.MAPS_PROVIDER || "mock",
};

