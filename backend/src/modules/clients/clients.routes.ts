import { Router } from "express";
import { ClientsController } from "./clients.controller.js";
import { asyncHandler } from "../../common/async-handler.js";
import { requireAuth } from "../../middleware/auth.js";

export const clientsRouter = Router();

clientsRouter.use(requireAuth);

clientsRouter.get("/", asyncHandler(ClientsController.getClients));
clientsRouter.post("/", asyncHandler(ClientsController.createClient));
clientsRouter.get("/:id", asyncHandler(ClientsController.getClientById));
clientsRouter.patch("/:id", asyncHandler(ClientsController.updateClient));

