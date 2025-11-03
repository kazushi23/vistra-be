import RequestHandler from "../utils/RequestHandler.js";
import type { NextFunction, Request, Response } from "express";
import type { FolderDto } from "../types/dto/document.dto.js";
import { folderService } from "../service/folderService.js";

export class FolderController {
    static async createFolder(req: Request, res: Response, next: NextFunction) {
        try {
            const name = req.body as FolderDto;
            if (!name) {
                return RequestHandler.sendError(res, "Folder name is required", 400);
            }
            const result = await folderService.createFolder(name);

            if (!result.success) {
                return RequestHandler.sendError(res, result.message);
            }

            return RequestHandler.sendSuccess(res, result.message)({ data: result.data });
        } catch (error) {
            next(error)
        }
    }
}
