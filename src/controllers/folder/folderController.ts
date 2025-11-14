import RequestHandler from "../../utils/RequestHandler.js";
import type { NextFunction, Request, Response } from "express";
import type { FolderDto } from "../../types/dto/document/document.dto.js";
import { folderService } from "../../service/folder/folderService.js";
import { FolderSchema } from "../../schemas/document.schema.js";

// For folder creation, receives name and create a folder in db
export class FolderController {
    // creation of folder in db
    static async createFolder(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const parsedFolder = FolderSchema.safeParse(req.body)
            if (!parsedFolder.success) {
                const message = parsedFolder.error.issues[0]?.message || "Folder name is required";
                return RequestHandler.sendError(res, message, 400)
            }
            const folderDto: FolderDto = parsedFolder.data;

            // pass to service layer
            const result = await folderService.createFolder(folderDto, req.user!);
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
