import { BaseService } from "./baseService.js";
import { AppDataSource } from "../data-source.js";
import { Document } from "../entity/Document.js";
import { type FolderDto, toDocumentDto } from "../types/dto/document.dto.js";
import type { CreateFolderResponse } from "../types/dto/document.js";

class FolderService extends BaseService<Document> {

    constructor() {
        const documentRepository = AppDataSource.getRepository(Document);
        super(documentRepository);
    }

    async getFoldersByName(name: string): Promise<Document[]> {
        return await this.getAllFiltered({filters: {"name": name, "type": "folder"}});
    }

    async createFolder(folder: FolderDto): Promise<CreateFolderResponse> {
        const existingFolder: Document[] = await this.getFoldersByName(folder.name)
        if (existingFolder.length > 0) {
            throw new Error("Duplicate folder name detected");
        }
        
        const document = new Document();
        document.name = folder.name;
        document.type = "folder";
        document.createdBy = "Kazushi Fujiwara";

        const created: Document = await this.createOne(document);

        return {
            success: true,
            message: "Folder created successfully",
            data: toDocumentDto(created),
        };
    }
}

export const folderService = new FolderService();

