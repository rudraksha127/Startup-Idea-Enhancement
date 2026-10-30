import { Client } from "../../models/Client.js";

export interface GetClientsQuery {
  orgId?: string;
  status?: string;
  search?: string;
}

export class ClientsService {
  static async getClients(params: GetClientsQuery) {
    const query: Record<string, unknown> = {};
    if (params.orgId) query.organizationId = params.orgId;
    if (params.status && params.status !== "All") query.status = params.status;
    if (params.search && typeof params.search === "string") {
      query.$or = [
        { businessName: { $regex: params.search, $options: "i" } },
        { contactPerson: { $regex: params.search, $options: "i" } },
      ];
    }

    const clients = await Client.find(query).sort({ updatedAt: -1 });
    return { clients, total: clients.length };
  }

  static async getClientById(id: string, orgId?: string) {
    const query: Record<string, unknown> = { _id: id };
    if (orgId) query.organizationId = orgId;
    return Client.findOne(query);
  }

  static async createClient(data: Record<string, any>, orgId: string) {
    return Client.create({
      ...data,
      organizationId: orgId,
      onboardedAt: data.onboardedAt || new Date(),
    });
  }

  static async updateClient(id: string, data: Record<string, any>, orgId?: string) {
    const query: Record<string, unknown> = { _id: id };
    if (orgId) query.organizationId = orgId;
    return Client.findOneAndUpdate(query, data, { new: true });
  }
}
