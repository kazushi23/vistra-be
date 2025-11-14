import RequestHandler from "../../utils/RequestHandler.js";
import type { NextFunction, Request, Response } from "express";
import type { FileDto } from "../../types/dto/document/document.dto.js";
import { fileService } from "../../service/file/fileService.js";
import { ALLOWED_FILE_LENGTH } from "../../types/fileValidParams.js";
import type { CreateFileResponse } from "../../types/dto/document/document.js";
import { FileSchema } from "../../schemas/document.schema.js";

// For file creation, currently simulation
// Receives multiple files and extract metadata {name, size} to be saved in db
export class FileController {
    static async createFile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const files: Express.Multer.File[] = req.files as Express.Multer.File[]; // receive files
            const parsedFiles = FileSchema.safeParse({files})
            if (!parsedFiles.success) {
                const message = parsedFiles.error.issues[0]?.message || "Something went wrong with uploading files";
                return RequestHandler.sendError(res, parsedFiles.error.issues[0]?.message, 400)
            }
            // convert to dto
            const fileDto: FileDto = parsedFiles.data;
            const result: CreateFileResponse = await fileService.createFiles(fileDto, req.user!); // pass to service layer

            // if something went wrong, respond 400
            if (!result.success) {
                return RequestHandler.sendError(res, result.message, 400);
            }
            // return success
            return RequestHandler.sendSuccess(res, result.message, 201)(result.data);
        } catch (error) {
            // pass to middleware errorhandler
            next(error);
        }
    }
}
