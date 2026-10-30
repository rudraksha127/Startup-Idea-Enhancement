import { Router } from "express";
import { ClientsController } from "./clients.controller.js";
import { asyncHandler } from "../../common/async-handler.js";
import { requireAuth } from "../../middleware/auth.js";

export const clientsRouter = Router();

clientsRouter.get("/", asyncHandler(ClientsController.getClients));
clientsRouter.post("/", requireAuth, asyncHandler(ClientsController.createClient));
clientsRouter.get("/:id", asyncHandler(ClientsController.getClientById));
clientsRouter.patch("/:id", requireAuth, asyncHandler(ClientsController.updateClient));
