import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || process.env.API_PORT || "4000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/agencyos",
  JWT_SECRET: process.env.JWT_SECRET || "agencyos-dev-jwt-super-secret-key-min-32-chars-long",
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://agencyos.pages.dev",
        /\.pages\.dev$/,
      ],
  AI_RESEARCH_PROVIDER: process.env.AI_RESEARCH_PROVIDER || "mock",
  EMAIL_PROVIDER: process.env.EMAIL_PROVIDER || "mock",
  MAPS_PROVIDER: process.env.MAPS_PROVIDER || "mock",
};

