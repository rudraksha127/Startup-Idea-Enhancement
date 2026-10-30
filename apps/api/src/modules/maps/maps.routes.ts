import { Router } from "express";
import { MapsController } from "./maps.controller.js";
import { asyncHandler } from "../../common/async-handler.js";

export const mapsRouter = Router();

mapsRouter.get("/status", asyncHandler(MapsController.getStatus));
mapsRouter.post("/places/search", asyncHandler(MapsController.searchPlaces));
mapsRouter.get("/places/autocomplete", asyncHandler(MapsController.autocomplete));
mapsRouter.get("/places/:id", asyncHandler(MapsController.getPlaceDetails));

