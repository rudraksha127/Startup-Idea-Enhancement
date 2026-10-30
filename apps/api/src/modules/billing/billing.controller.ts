import { Request, Response } from "express";
import { BillingService } from "./billing.service.js";
import { resolveOrgId, extractId } from "../../common/resolve-org.js";

export class BillingController {
  static listInvoices = async (req: Request, res: Response) => {
    const orgId = await resolveOrgId(req);
    const status = req.query.status as string | undefined;
    const invoices = await BillingService.listInvoices(orgId, status);
    return res.status(200).json({ success: true, invoices });
  };

  static createInvoice = async (req: Request, res: Response) => {
    const orgId = await resolveOrgId(req);
    const invoice = await BillingService.createInvoice(orgId, req.body);
    return res.status(201).json({ success: true, invoice });
  };

  static updateInvoiceStatus = async (req: Request, res: Response) => {
    const orgId = await resolveOrgId(req);
    const id = extractId(req.params.id);
    const { status } = req.body;
    const invoice = await BillingService.updateInvoiceStatus(id, orgId, status);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    return res.status(200).json({ success: true, invoice });
  };

  static getMetrics = async (req: Request, res: Response) => {
    const orgId = await resolveOrgId(req);
    const metrics = await BillingService.getBillingMetrics(orgId);
    return res.status(200).json({ success: true, metrics });
  };

  static createCheckout = async (req: Request, res: Response) => {
    const orgId = await resolveOrgId(req);
    const id = extractId(req.params.id);
    const result = await BillingService.createCheckoutSession(orgId, id);
    return res.status(200).json(result);
  };
}

