import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wraps an async route handler so uncaught rejections are passed to Express error-handling middleware.
 * Eliminates the need for boilerplate try/catch blocks in every controller method.
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

