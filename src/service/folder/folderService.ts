import { BaseService } from "../baseService.js";
import { AppDataSource } from "../../data-source.js";
import { Document } from "../../entity/Document.js";
import { type FolderDto, toDocumentDto } from "../../types/dto/document/document.dto.js";
import type { CreateFolderResponse } from "../../types/dto/document/document.js";
import { HttpError } from "../../types/httpError.js";
import { User } from "../../entity/User.js";

// currently folderservice is stateless, not request specific/user-specific, not multi-tenant, so 1 instance is sufficient
class FolderService extends BaseService<Document> {
    constructor() {
        const documentRepository = AppDataSource.getRepository(Document); // extends super class
        super(documentRepository); // init
    }
    // for creation of folder
    async createFolder(folder: FolderDto, user: User): Promise<CreateFolderResponse> {
        // create base Document type data
        const document = new Document();
        document.name = folder.name;
        document.type = "folder";
        document.createdBy = user.name;
        document.user = user;

        const created = await this.repository.save(document); // single create operation

        return {
            success: true,
            message: "Folder created successfully",
            data: toDocumentDto(created),
        };
    }
}

export const folderService = new FolderService();
