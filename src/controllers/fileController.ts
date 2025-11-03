import RequestHandler from "../utils/RequestHandler.js";
import type { NextFunction, Request, Response } from "express";
import type { FileDto } from "../types/dto/document.dto.js";
import { fileService } from "../service/fileService.js";

export class FileController {
    static async createFile(req: Request, res: Response, next: NextFunction) {
        try {
            const files = req.files as Express.Multer.File[];

            if (!Array.isArray(files) || files.length === 0) {
                return RequestHandler.sendError(res, "Files array is required.", 400);
            }
            const fileDto: FileDto = { files };
            const result = await fileService.createFiles(fileDto);

            if (!result.success) {
                return RequestHandler.sendError(res, result.message, 400);
            }

            return RequestHandler.sendSuccess(res, result.message, 201)(result.data);
        } catch (error) {
            next(error);
        }
    }
}
