import RequestHandler from "../utils/RequestHandler.js";
import type { NextFunction, Request, Response } from "express";
import { documentService } from "../service/documentService.js";
import type { FolderDto } from "../types/dto/document.dto.js";

const requestHandler = new RequestHandler()

export class DocumentController {
    static async getAllDocuments(req: Request, res: Response, next: NextFunction) {
        try {
            // Parse and validate query parameters
            const page = parseInt(req.query.page as string, 10);
            if (isNaN(page) || page < 1) {
                return requestHandler.sendError(res, "Invalid page number", 400);
            }

            const pageSize = parseInt(req.query.pagesize as string, 10);
            if (isNaN(pageSize) || pageSize < 1) {
                return requestHandler.sendError(res, "Invalid page size", 400);
            }

            const descending = req.query.descending !== undefined ? req.query.descending === "true" : true;
            const sortBy = (req.query.sortColumn as string) || "updatedAt";
            const search = (req.query.search as string) || "";
            const offset = (page - 1) * pageSize;

            // Call the service
            const result = await documentService.getAllDocuments({page, pageSize, offset, descending, sortBy, search});

            // Send clean response with single-level data
            return requestHandler.sendSuccess(res, "Data has been retrieved", result.total)(result.data);

        } catch (error) {
            next(error)
        }
    }

    static async createFolder(req: Request, res: Response, next: NextFunction) {
        try {
            const name = req.body as FolderDto;
            if (!name) {
                return requestHandler.sendError(res, "Folder name is required", 400);
            }
            const result = await documentService.createFolder(name);

            if (!result.success) {
                return requestHandler.sendError(res, result.message);
            }

            return requestHandler.sendSuccess(res, result.message)({ data: result.data });
        } catch (error) {
            next(error)
        }
    }
}
