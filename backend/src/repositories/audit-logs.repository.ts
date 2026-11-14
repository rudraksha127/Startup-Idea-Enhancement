import { catalystClient } from "../infrastructure/persistence/zoho-catalyst/catalyst.client.js";
import { AuditLogRecord } from "../infrastructure/persistence/zoho-catalyst/catalyst.types.js";

export class AuditLogsRepository {
  static async log(data: Omit<AuditLogRecord, "ROWID" | "createdAt">): Promise<AuditLogRecord> {
    const auditId = data.auditId || `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    return catalystClient.insertRow<AuditLogRecord>("AuditLogs", { ...data, auditId });
  }

  static async findByOrg(orgId: string, limit: number = 50): Promise<AuditLogRecord[]> {
    const logs = await catalystClient.find<AuditLogRecord>("AuditLogs", { organizationId: orgId });
    logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return logs.slice(0, limit);
  }
}
