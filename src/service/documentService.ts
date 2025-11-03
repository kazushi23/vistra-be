import { AppDataSource } from "../data-source.js";
import { Document } from "../entity/Document.js";
import { BaseService } from "./baseService.js";
import type { GetAllQueryOptions } from "../types/base.js";
import type { GetDocumentsResponse } from "../types/dto/document.js";
import { toDocumentDto } from "../types/dto/document.dto.js";

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
}

export const documentService = new DocumentService();