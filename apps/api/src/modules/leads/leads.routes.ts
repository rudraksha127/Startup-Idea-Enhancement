import { Router } from "express";
import { LeadsController } from "./leads.controller.js";
import { validateBody } from "../../common/validate.middleware.js";
import { asyncHandler } from "../../common/async-handler.js";
import { createLeadSchema, updateLeadStatusSchema } from "../../validators/lead.validator.js";

export const leadsRouter = Router();

leadsRouter.get("/", asyncHandler(LeadsController.getLeads));
leadsRouter.post("/", validateBody(createLeadSchema), asyncHandler(LeadsController.createLead));
leadsRouter.get("/:leadId", asyncHandler(LeadsController.getLeadById));
leadsRouter.patch("/:leadId", validateBody(updateLeadStatusSchema), asyncHandler(LeadsController.updateLeadStatus));
