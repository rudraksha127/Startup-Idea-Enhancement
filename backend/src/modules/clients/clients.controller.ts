import { Request, Response } from "express";
import { ClientsService } from "./clients.service.js";
import { resolveOrgId, extractId } from "../../common/resolve-org.js";

export class ClientsController {
  static getClients = async (req: Request, res: Response) => {
    const orgId = await resolveOrgId(req);
    const { clients, total } = await ClientsService.getClients({
      orgId,
      status: req.query.status as string,
      search: req.query.search as string,
    });

    return res.status(200).json({ success: true, data: clients, total });
  };

  static getClientById = async (req: Request, res: Response) => {
    const orgId = await resolveOrgId(req);
    const id = extractId(req.params.id);
    const client = await ClientsService.getClientById(id, orgId);
    if (!client) {
      return res.status(404).json({ success: false, error: "Client not found" });
    }
    return res.status(200).json({ success: true, data: client });
  };

  static createClient = async (req: Request, res: Response) => {
    const orgId = await resolveOrgId(req);
    const client = await ClientsService.createClient(req.body, orgId);
    return res.status(201).json({ success: true, data: client });
  };

  static updateClient = async (req: Request, res: Response) => {
    const orgId = await resolveOrgId(req);
    const id = extractId(req.params.id);
    const client = await ClientsService.updateClient(id, req.body, orgId);
    if (!client) {
      return res.status(404).json({ success: false, error: "Client not found" });
    }
    return res.status(200).json({ success: true, data: client });
  };
}
