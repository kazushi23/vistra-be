import { AppDataSource } from "../data-source.js";
import { Document } from "../entity/Document.js";
import { BaseService } from "./baseService.js";
import type { GetAllQueryOptions } from "../types/base.js";
import type { GetDocumentsResponse } from "../types/dto/document.js";
import { toDocumentDto } from "../types/dto/document.dto.js";

// For document query - Get list of documents for the table. Base Class methods included
export class DocumentService extends BaseService<Document> {

    constructor() {
        const documentRepository = AppDataSource.getRepository(Document); // init Super class
        super(documentRepository);
    }

    // get all documents with pagination, sorting and search
    async getAllDocuments(options?: GetAllQueryOptions): Promise<GetDocumentsResponse>{
        const results = await this.getAllPagination({...options, searchColumns: ["name"]});
        const dataDtos = results.data.map(toDocumentDto); // convert to dto to remove unwanted columns

        // GetDocumentResponse struct
        return {
            success: true,
            message: "Data has been retrieved",
            data: dataDtos,
            total: results.total | 0
        };
    }
    

}

export const documentService = new DocumentService();