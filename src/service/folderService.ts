import { BaseService } from "./baseService.js";
import { AppDataSource } from "../data-source.js";
import { Document } from "../entity/Document.js";
import { type FolderDto, toDocumentDto } from "../types/dto/document.dto.js";
import type { CreateFolderResponse } from "../types/dto/document.js";
import { HttpError } from "../types/httpError.js";

class FolderService extends BaseService<Document> {
    constructor() {
        const documentRepository = AppDataSource.getRepository(Document);
        super(documentRepository);
    }

    async createFolder(folder: FolderDto): Promise<CreateFolderResponse> {
        try {
            const document = new Document();
            document.name = folder.name;
            document.type = "folder";
            document.createdBy = "Kazushi Fujiwara";

            const created = await this.repository.save(document); // single atomic operation

            return {
                success: true,
                message: "Folder created successfully",
                data: toDocumentDto(created),
            };
        } catch (error: any) {
            // unique constraint violation
            if (error.code === "ER_DUP_ENTRY" || error.errno === 1062) {
                throw new HttpError("Duplicate folder name detected", 400);
            }
            throw error;
        }
    }
}

export const folderService = new FolderService();
