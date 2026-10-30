import { Router } from "express";
import { BillingController } from "./billing.controller.js";
import { asyncHandler } from "../../common/async-handler.js";
import { requireAuth } from "../../middleware/auth.js";

export const billingRouter = Router();

billingRouter.get("/invoices", asyncHandler(BillingController.listInvoices));
billingRouter.post("/invoices", requireAuth, asyncHandler(BillingController.createInvoice));
billingRouter.patch("/invoices/:id", requireAuth, asyncHandler(BillingController.updateInvoiceStatus));
billingRouter.get("/metrics", asyncHandler(BillingController.getMetrics));
billingRouter.post("/invoices/:id/checkout", requireAuth, asyncHandler(BillingController.createCheckout));
billingRouter.post("/webhook", asyncHandler(BillingController.handleWebhook));
