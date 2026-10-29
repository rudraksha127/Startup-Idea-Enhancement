import { app } from "./app.js";
import { connectDB } from "./config/db.js";
import { ENV } from "./config/env.js";

async function startServer() {
  try {
    console.log("[Server] Initializing AgencyOS Express API Server...");
    await connectDB();

    const server = app.listen(ENV.PORT, () => {
      console.log(`[Server] AgencyOS REST API running on port ${ENV.PORT} [${ENV.NODE_ENV}]`);
      console.log(`[Server] Health check available at: http://localhost:${ENV.PORT}/api/v1/health`);
    });

    const gracefulShutdown = async (signal: string) => {
      console.log(`[Server] Received ${signal}. Closing HTTP server and database connections...`);
      server.close(() => {
        console.log("[Server] HTTP server closed.");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    console.error("[Server] Fatal startup error:", error);
    process.exit(1);
  }
}

startServer();

