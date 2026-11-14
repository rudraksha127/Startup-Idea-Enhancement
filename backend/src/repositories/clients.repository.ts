import { catalystClient } from "../infrastructure/persistence/zoho-catalyst/catalyst.client.js";
import { ClientRecord } from "../infrastructure/persistence/zoho-catalyst/catalyst.types.js";

export class ClientsRepository {
  static async findByOrg(orgId: string): Promise<ClientRecord[]> {
    return catalystClient.find<ClientRecord>("Clients", { organizationId: orgId });
  }

  static async findById(clientId: string, orgId?: string): Promise<ClientRecord | null> {
    const query: Record<string, any> = { clientId };
    if (orgId) query.organizationId = orgId;
    const clients = await catalystClient.find<ClientRecord>("Clients", query);
    if (clients.length > 0) return clients[0];

    const byRow = await catalystClient.find<ClientRecord>("Clients", orgId ? { ROWID: clientId, organizationId: orgId } : { ROWID: clientId });
    return byRow.length > 0 ? byRow[0] : null;
  }

  static async create(data: Omit<ClientRecord, "ROWID" | "createdAt" | "updatedAt">): Promise<ClientRecord> {
    const clientId = data.clientId || `cli_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    return catalystClient.insertRow<ClientRecord>("Clients", { ...data, clientId });
  }

  static async update(clientId: string, orgId: string, data: Partial<ClientRecord>): Promise<ClientRecord> {
    return catalystClient.updateRow<ClientRecord>("Clients", clientId, data);
  }

  static async delete(clientId: string, orgId: string): Promise<boolean> {
    return catalystClient.deleteRow("Clients", clientId);
  }
}
