import { AppDataSource } from "../data-source.js";
import { Document } from "../entity/Document.js";
import { BaseService } from "./baseService.js";
import type { GetAllQueryOptions } from "../types/base.js";
import type { CreateFolderResponse, GetDocumentsResponse } from "../types/dto/document.js";
import { toDocumentDto, type FolderDto } from "../types/dto/document.dto.js";

export class DocumentService extends BaseService<Document> {
    constructor() {
        const documentRepository = AppDataSource.getRepository(Document);
        super(documentRepository);
    }

    async getAllDocuments(options?: GetAllQueryOptions): Promise<GetDocumentsResponse>{
        const results = await this.getAll({...options, searchColumns: ["name"]});
        const dataDtos = results.data.map(toDocumentDto);

        return {
            success: true,
            message: "Data has been retrieved",
            data: dataDtos,
            total: results.total | 0
        };
    }

    async createFolder(folder: FolderDto): Promise<CreateFolderResponse> {
        try {
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
        } catch (error) {
            console.error("Error in createFolder:", error);
            return {
                success: false,
                message: error instanceof Error ? error.message : "Unknown error occurred",
            };
        }
    }
}

export const documentService = new DocumentService();