import crypto from "crypto";
import { Request, Response } from "express";
import { N8nService } from "./n8n.service.js";
import { resolveOrgId } from "../../common/resolve-org.js";

function verifyN8nWebhook(req: Request, res: Response): boolean {
  const configuredSecret = process.env.N8N_WEBHOOK_SECRET;
  const incomingSecret = req.headers["x-n8n-secret"] || req.headers["x-webhook-secret"];
  const incomingSig = req.headers["x-n8n-signature"];

  if (process.env.NODE_ENV === "production" && !configuredSecret) {
    res.status(503).json({ error: "N8N_WEBHOOK_SECRET is not configured in production" });
    return false;
  }

  if (configuredSecret) {
    const secretStr = Array.isArray(incomingSecret) ? incomingSecret[0] : incomingSecret;
    const secretValid = Boolean(
      secretStr &&
        secretStr.length === configuredSecret.length &&
        crypto.timingSafeEqual(Buffer.from(secretStr), Buffer.from(configuredSecret))
    );

    let sigValid = false;
    const sigStr = Array.isArray(incomingSig) ? incomingSig[0] : incomingSig;
    if (sigStr) {
      const cleanSig = sigStr.replace(/^sha256=/i, "");
      const expected = crypto
        .createHmac("sha256", configuredSecret)
        .update(JSON.stringify(req.body ?? {}), "utf8")
        .digest("hex");
      if (cleanSig.length === expected.length) {
        sigValid = crypto.timingSafeEqual(Buffer.from(cleanSig), Buffer.from(expected));
      }
    }

    if (!secretValid && !sigValid) {
      res.status(401).json({ error: "Invalid webhook secret or HMAC signature" });
      return false;
    }
  }
  return true;
}

export class N8nController {
  static handleLeadAuditWebhook = async (req: Request, res: Response) => {
    if (!verifyN8nWebhook(req, res)) return;
    const result = await N8nService.handleLeadAuditWebhook(req.body);
    return res.status(200).json(result);
  };

  static handleProspectSyncWebhook = async (req: Request, res: Response) => {
    if (!verifyN8nWebhook(req, res)) return;
    const orgId = await resolveOrgId(req);
    const prospects = req.body.prospects || req.body;
    const result = await N8nService.handleProspectSyncWebhook(orgId, prospects);
    return res.status(200).json(result);
  };

  static triggerWorkflow = async (req: Request, res: Response) => {
    const workflow = Array.isArray(req.params.workflow)
      ? req.params.workflow[0]
      : (req.params.workflow as string);
    const result = await N8nService.triggerWorkflow(workflow, req.body);
    return res.status(200).json(result);
  };

  static getSyncStatus = async (req: Request, res: Response) => {
    const status = await N8nService.getSyncStatus();
    return res.status(200).json(status);
  };
}
