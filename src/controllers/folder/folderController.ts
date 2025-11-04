import RequestHandler from "../../utils/RequestHandler.js";
import type { NextFunction, Request, Response } from "express";
import type { FolderDto } from "../../types/dto/document/document.dto.js";
import { folderService } from "../../service/folder/folderService.js";

// For folder creation, receives name and create a folder in db
export class FolderController {
    // creation of folder in db
    static async createFolder(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const folderDto = req.body as FolderDto; // destructure name

            // Validate folder name
            if (!folderDto.name || folderDto.name.trim() === "") {
                return RequestHandler.sendError(res, "Folder name is required", 400);
            }
            // pass to service layer
            const result = await folderService.createFolder(folderDto);
            // if something went wrong, respond 400
            if (!result.success) {
                return RequestHandler.sendError(res, result.message);
            }

            return RequestHandler.sendSuccess(res, result.message)({ data: result.data });
        } catch (error) {
            // pass to middleware errorhandler
            next(error)
        }
    }
}
