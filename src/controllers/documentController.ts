import RequestHandler from "../utils/RequestHandler.js";
import type { NextFunction, Request, Response } from "express";
import { documentService } from "../service/documentService.js";
import type { FolderDto, FileDto } from "../types/dto/document.dto.js";

export class DocumentController {
    static async getAllDocuments(req: Request, res: Response, next: NextFunction) {
        try {
            // Parse and validate query parameters
            const page = parseInt(req.query.page as string, 10);
            if (isNaN(page) || page < 1) {
                return RequestHandler.sendError(res, "Invalid page number", 400);
            }

            const pageSize = parseInt(req.query.pagesize as string, 10);
            if (isNaN(pageSize) || pageSize < 1) {
                return RequestHandler.sendError(res, "Invalid page size", 400);
            }

            const descending = req.query.descending !== undefined ? req.query.descending === "true" : true;
            const sortBy = (req.query.sortColumn as string) || "updatedAt";
            const search = (req.query.search as string) || "";
            const offset = (page - 1) * pageSize;

            // Call the service
            const result = await documentService.getAllDocuments({page, pageSize, offset, descending, sortBy, search});

            // Send clean response with single-level data
            return RequestHandler.sendSuccess(res, "Data has been retrieved", result.total)(result.data);

        } catch (error) {
            next(error)
        }
    }

    static async createFolder(req: Request, res: Response, next: NextFunction) {
        try {
            const name = req.body as FolderDto;
            if (!name) {
                return RequestHandler.sendError(res, "Folder name is required", 400);
            }
            const result = await documentService.createFolder(name);

            if (!result.success) {
                return RequestHandler.sendError(res, result.message);
            }

            return RequestHandler.sendSuccess(res, result.message)({ data: result.data });
        } catch (error) {
            next(error)
        }
    }

    static async createFile(req: Request, res: Response, next: NextFunction) {
        try {
            const files = req.files as Express.Multer.File[];

            if (!Array.isArray(files) || files.length === 0) {
                return RequestHandler.sendError(res, "Files array is required.", 400);
            }
            const fileDto: FileDto = { files };
            const result = await documentService.createFiles(fileDto);

            if (!result.success) {
                return RequestHandler.sendError(res, result.message, 400);
            }

            return RequestHandler.sendSuccess(res, result.message, 201)(result.data);
        } catch (error) {
            next(error);
        }
    }
}
