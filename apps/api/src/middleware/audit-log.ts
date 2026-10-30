import type { Request, Response, NextFunction } from "express";

export interface AuditEntry {
  timestamp: string;
  requestId: string;
  userId: string | null;
  organizationId: string | null;
  method: string;
  path: string;
  statusCode?: number;
  durationMs?: number;
  ipAddress: string;
  userAgent: string;
}

/**
 * Audit logging middleware for privileged write operations.
 *
 * Logs structured audit records for:
 *   - POST, PATCH, PUT, DELETE on /api/v1/* routes
 *   - Agent run triggers
 *   - Auth events (login/register)
 *
 * In production this should ship logs to a dedicated audit store
 * (e.g. MongoDB audit_log collection or external SIEM).
 */
export function auditLog(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  // Capture status code when response finishes
  res.on("finish", () => {
    const entry: AuditEntry = {
      timestamp: new Date().toISOString(),
      requestId: (req as Request & { id?: string }).id ?? "unknown",
      userId: (req as Request & { user?: { userId?: string } }).user?.userId ?? null,
      organizationId: (req as Request & { user?: { organizationId?: string } }).user?.organizationId ?? null,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - start,
      ipAddress: req.ip ?? req.socket?.remoteAddress ?? "unknown",
      userAgent: req.headers["user-agent"] ?? "unknown",
    };

    // Only audit write operations and authentication
    const isWrite = ["POST", "PATCH", "PUT", "DELETE"].includes(req.method);
    const isAuthRoute = req.path.startsWith("/auth");

    if (isWrite || isAuthRoute) {
      // TODO: Ship to MongoDB audit_log collection in production
      // AuditLog.create(entry).catch(console.error);

      // For now, structured console output (picked up by log aggregator)
      console.log(
        `[AUDIT] ${entry.timestamp} ${entry.method} ${entry.path} → ${entry.statusCode} (${entry.durationMs}ms) user=${entry.userId ?? "anon"} ip=${entry.ipAddress}`
      );
    }
  });

  next();
}
