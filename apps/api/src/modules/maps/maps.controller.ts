import { Request, Response } from "express";
import { MapsService } from "./maps.service.js";
import { extractId } from "../../common/resolve-org.js";

export class MapsController {
  static getStatus = async (_req: Request, res: Response) => {
    const status = MapsService.getStatus();
    return res.status(200).json({ success: true, ...status });
  };

  static searchPlaces = async (req: Request, res: Response) => {
    const { query, category, city, radiusMeters } = req.body || {};
    const result = await MapsService.searchPlaces({ query, category, city, radiusMeters });
    return res.status(200).json({ success: true, ...result });
  };

  static autocomplete = async (req: Request, res: Response) => {
    const input = (req.query.input as string) || "";
    const suggestions = await MapsService.autocomplete(input);
    return res.status(200).json({ success: true, suggestions });
  };

  static getPlaceDetails = async (req: Request, res: Response) => {
    const id = extractId(req.params.id);
    const place = await MapsService.getPlaceDetails(id);
    return res.status(200).json({ success: true, place });
  };
}

