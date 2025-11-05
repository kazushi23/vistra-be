import { BaseService } from "../src/service/baseService.js";
import { AppDataSource } from "../src/data-source.js";
import { Document } from "../src/entity/Document.js";
import { type FolderDto, toDocumentDto } from "../src/types/dto/document/document.dto.js";
import type { CreateFolderResponse } from "../src/types/dto/document/document.js";
import { HttpError } from "../src/types/httpError.js";

// currently folderservice is stateless, not request specific/user-specific, not multi-tenant, so 1 instance is sufficient
class FolderService extends BaseService<Document> {
    constructor() {
        const documentRepository = AppDataSource.getRepository(Document); // extends super class
        super(documentRepository); // init
    }
    // for creation of folder
    async createFolder(folder: FolderDto): Promise<CreateFolderResponse> {
        try {
        // create base Document type data
        const document = new Document();
        document.name = folder.name;
        document.type = "folder";
        document.createdBy = "Kazushi Fujiwara";

        const created = await this.repository.save(document); // single create operation

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
