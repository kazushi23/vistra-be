import RequestHandler from "../utils/RequestHandler.js";
import type { NextFunction, Request, Response } from "express";
import type { FileDto } from "../types/dto/document.dto.js";
import { fileService } from "../service/fileService.js";
import { ALLOWED_FILE_LENGTH } from "../types/fileValidParams.js";

// For file creation, currently simulation
// Receives multiple files and extract metadata {name, size} to be saved in db
export class FileController {
    static async createFile(req: Request, res: Response, next: NextFunction) {
        try {
            const files = req.files as Express.Multer.File[]; // receive files

            // if files dont exist
            if (!Array.isArray(files) || files.length === 0) {
                return RequestHandler.sendError(res, "Files array is required.", 400);
            }
            // if more files than permissible
            if (files.length > ALLOWED_FILE_LENGTH) {
                return RequestHandler.sendError(res, "Maximum of 10 files allowed.", 400);
            }
            // convert to dto
            const fileDto: FileDto = { files };
            const result = await fileService.createFiles(fileDto); // pass to service layer

            // if something went wrong, respond 400
            if (!result.success) {
                return RequestHandler.sendError(res, result.message, 400);
            }
            // return success
            return RequestHandler.sendSuccess(res, result.message, 201)(result.data);
        } catch (error) {
            next(error);
        }
    }
}
