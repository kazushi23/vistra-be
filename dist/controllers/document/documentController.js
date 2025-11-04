import RequestHandler from "../../utils/RequestHandler.js";
import { documentService } from "../../service/document/documentService.js";
// For document query - Get list of documents for the table
export class DocumentController {
    // get all documents with pagination, sorting and search
    static async getAllDocuments(req, res, next) {
        try {
            // Parse and validate page
            const page = parseInt(req.query.page, 10);
            if (isNaN(page) || page < 1) {
                return RequestHandler.sendError(res, "Invalid page number", 400);
            }
            // Parse and validate page size
            const pageSize = parseInt(req.query.pagesize, 10);
            if (isNaN(pageSize) || pageSize < 1) {
                return RequestHandler.sendError(res, "Invalid page size", 400);
            }
            const descending = req.query.descending !== undefined ? req.query.descending === "true" : true; // defaults to true
            const sortBy = req.query.sortColumn || "updatedAt"; // defaults to updatedAt
            const search = req.query.search || ""; // defaults to ""
            const offset = (page - 1) * pageSize; // start from
            // Call the service
            const result = await documentService.getAllDocuments({ page, pageSize, offset, descending, sortBy, search });
            // Return response
            return RequestHandler.sendSuccess(res, "Data has been retrieved", result.total)(result.data);
        }
        catch (error) {
            // pass to middleware errorhandler
            next(error);
        }
    }
}
//# sourceMappingURL=documentController.js.map