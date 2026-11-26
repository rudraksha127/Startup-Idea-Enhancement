import { Router } from "express";
import { LeadsController } from "./leads.controller.js";
import { validateBody } from "../../common/validate.middleware.js";
import { asyncHandler } from "../../common/async-handler.js";
import { requireAuth } from "../../middleware/auth.js";
import { createLeadSchema, updateLeadStatusSchema } from "../../validators/lead.validator.js";

export const leadsRouter = Router();

leadsRouter.use(requireAuth);

leadsRouter.get("/", asyncHandler(LeadsController.getLeads));
leadsRouter.post("/", validateBody(createLeadSchema), asyncHandler(LeadsController.createLead));
leadsRouter.get("/:leadId", asyncHandler(LeadsController.getLeadById));
leadsRouter.patch("/:leadId", validateBody(updateLeadStatusSchema), asyncHandler(LeadsController.updateLeadStatus));
leadsRouter.post("/:leadId/audit", asyncHandler(LeadsController.runLeadAudit));
leadsRouter.post("/:leadId/convert", asyncHandler(LeadsController.convertLeadToClient));

