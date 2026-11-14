import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { ENV } from "../config/env.js";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  const reqId = req.id || "unknown";

  // Handle Zod Schema Validation Errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Validation failed",
      requestId: reqId,
      details: err.format(),
    });
  }

  // Handle Database Validation Errors
  if (err.name === "ValidationError" || err.name === "CatalystError") {
    return res.status(400).json({
      error: "Database validation failed",
      requestId: reqId,
      message: err.message,
    });
  }

  console.error(`[Error] [${reqId}] Unhandled server exception:`, err);

  const statusCode = err.status || err.statusCode || 500;
  const response: Record<string, any> = {
    error: err.message || "Internal Server Error",
    requestId: reqId,
  };

  if (ENV.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

