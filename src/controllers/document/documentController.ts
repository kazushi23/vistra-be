import RequestHandler from "../../utils/RequestHandler.js";
import type { NextFunction, Request, Response } from "express";
import { documentService } from "../../service/document/documentService.js";
import type { GetDocumentsResponse } from "../../types/dto/document/document.js";

// For document query - Get list of documents for the table
export class DocumentController {
    // get all documents with pagination, sorting and search
    static async getAllDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Parse and validate page
            const page: number = parseInt(req.query.page as string, 10);
            if (isNaN(page) || page < 1) {
                return RequestHandler.sendError(res, "Invalid page number", 400);
            }
            // Parse and validate page size
            const pageSize: number = parseInt(req.query.pagesize as string, 10);
            if (isNaN(pageSize) || pageSize < 1) {
                return RequestHandler.sendError(res, "Invalid page size", 400);
            }

            const descending: boolean = req.query.descending !== undefined ? req.query.descending === "true" : true; // defaults to true
            const sortBy: string = (req.query.sortColumn as string) || "updatedAt"; // defaults to updatedAt
            const search: string = (req.query.search as string) || ""; // defaults to ""
            const offset: number = (page - 1) * pageSize; // start from

            // Call the service
            const result: GetDocumentsResponse = await documentService.getAllDocuments({page, pageSize, offset, descending, sortBy, search});

            // Return response
            return RequestHandler.sendSuccess(res, "Data has been retrieved", result.total)(result.data);

        } catch (error) {
            // pass to middleware errorhandler
            next(error)
        }
    }
}
