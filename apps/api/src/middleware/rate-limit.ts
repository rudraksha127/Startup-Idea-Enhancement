import rateLimit from "express-rate-limit";

/**
 * General API rate limiter — applied to all /api/v1/* routes.
 * 100 requests per minute per IP.
 */
export const generalRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: "Too many requests",
    message: "Rate limit exceeded. Please retry after 60 seconds.",
    retryAfter: 60,
  },
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === "/api/v1/health" || req.path === "/health";
  },
});

/**
 * Auth rate limiter — stricter limit on login/register to prevent brute force.
 * 10 requests per 15 minutes per IP.
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: "Too many authentication attempts",
    message: "Too many login attempts. Please retry after 15 minutes.",
    retryAfter: 900,
  },
});

/**
 * AI agent run limiter — prevent abuse of expensive AI operations.
 * 20 agent runs per minute per IP.
 */
export const agentRunRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: "Too many agent run requests",
    message: "Agent run rate limit exceeded. Please retry after 60 seconds.",
    retryAfter: 60,
  },
});
