import { ClientsRepository } from "../../repositories/clients.repository.js";
import { ClientRecord } from "../../infrastructure/persistence/zoho-catalyst/catalyst.types.js";

export interface GetClientsQuery {
  orgId?: string;
  status?: string;
  search?: string;
}

export class ClientsService {
  static async getClients(params: GetClientsQuery) {
    if (!params.orgId) {
      return { clients: [], total: 0 };
    }

    const all = await ClientsRepository.findByOrg(params.orgId);
    let clients = all;

    if (params.status && params.status !== "All") {
      clients = clients.filter((c) => c.status.toLowerCase() === params.status?.toLowerCase());
    }

    if (params.search && typeof params.search === "string") {
      const q = params.search.toLowerCase();
      clients = clients.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.contactPerson && c.contactPerson.toLowerCase().includes(q)) ||
          (c.email && c.email.toLowerCase().includes(q))
      );
    }

    return { clients, total: clients.length };
  }

  static async getClientById(id: string, orgId?: string): Promise<ClientRecord | null> {
    return ClientsRepository.findById(id, orgId);
  }

  static async createClient(data: Record<string, any>, orgId: string): Promise<ClientRecord> {
    const clientId = `cli_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    return ClientsRepository.create({
      clientId,
      organizationId: orgId,
      name: data.name || data.businessName || "New Client",
      domain: data.domain || data.website || "",
      type: data.type || data.category || "Professional Services",
      location: data.location || "Indore, MP",
      phone: data.phone || "+91 98110 00000",
      email: data.email || `contact@${clientId}.com`,
      contactPerson: data.contactPerson || "Primary Contact",
      status: data.status || "Active",
      totalValue: data.totalValue || 0,
      projectsCount: data.projectsCount || 0,
    });
  }

  static async updateClient(id: string, data: Record<string, any>, orgId?: string): Promise<ClientRecord | null> {
    const client = await ClientsRepository.findById(id, orgId);
    if (!client) return null;
    return ClientsRepository.update(client.clientId, client.organizationId, data);
  }
}
