import helmet from "helmet";

/**
 * Security headers middleware using Helmet.
 *
 * Applied globally to add security headers:
 * - Content-Security-Policy (blocks XSS)
 * - X-Frame-Options (blocks clickjacking)
 * - X-Content-Type-Options (blocks MIME sniffing)
 * - Referrer-Policy
 * - HSTS (in production)
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for API docs
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'none'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow cross-origin resource loading
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: {
    policy: "strict-origin-when-cross-origin",
  },
  noSniff: true,
  frameguard: { action: "deny" },
  xssFilter: true,
});

