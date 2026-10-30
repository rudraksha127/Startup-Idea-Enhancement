import { Request, Response } from "express";
import { TeamsService } from "./teams.service.js";
import { resolveOrgId, extractId } from "../../common/resolve-org.js";

const VALID_ROLES = ["Founder", "Admin", "Operator", "Developer"];

export class TeamsController {
  static listMembers = async (req: Request, res: Response) => {
    const orgId = await resolveOrgId(req);
    const members = await TeamsService.listMembers(orgId);
    return res.status(200).json({ success: true, data: members, members });
  };

  static inviteMember = async (req: Request, res: Response) => {
    const orgId = await resolveOrgId(req);
    const { email, name = "New Team Member", role = "Operator" } = req.body || {};

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "A valid email is required" });
    }
    if (role && !VALID_ROLES.includes(role)) {
      return res.status(400).json({ error: `Invalid role. Allowed roles: ${VALID_ROLES.join(", ")}` });
    }

    try {
      const member = await TeamsService.inviteMember(orgId, { name, email, role });
      return res.status(201).json({ success: true, data: member, member });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  };

  static updateRole = async (req: Request, res: Response) => {
    const orgId = await resolveOrgId(req);
    const id = extractId(req.params.id);
    const { role } = req.body || {};

    if (!role || !VALID_ROLES.includes(role)) {
      return res.status(400).json({ error: `Invalid role. Allowed roles: ${VALID_ROLES.join(", ")}` });
    }

    const member = await TeamsService.updateMemberRole(id, orgId, role);
    return res.status(200).json({ success: true, data: member, member });
  };

  static removeMember = async (req: Request, res: Response) => {
    const orgId = await resolveOrgId(req);
    const id = extractId(req.params.id);
    const result = await TeamsService.removeMember(id, orgId);
    return res.status(200).json({ ...result, data: result });
  };
}
