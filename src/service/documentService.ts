import { AppDataSource } from "../data-source.js";
import { Document } from "../entity/Document.js";
import { BaseService } from "./baseService.js";
import type { GetAllQueryOptions } from "../types/base.js";
import type { CreateFolderResponse, GetDocumentsResponse, CreateFileResponse } from "../types/dto/document.js";
import { toDocumentDto, type FolderDto, type FileDto, type DocumentDto } from "../types/dto/document.dto.js";
import { FileService } from "./fileService.js";

export class DocumentService extends BaseService<Document> {
    // currently fileservice is stateless, not request specific/user-specific, not multi-tenant, so 1 instance is sufficient
    private readonly fileService: FileService =  new FileService();

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
    
    async createFiles(files: FileDto): Promise<CreateFileResponse> {
        const metadata = await this.fileService.processFiles(files);
        const documents = metadata.map((file) => {
            const doc = new Document();
            doc.name = file.name;
            doc.size = file.size;
            doc.type = "file";
            doc.createdBy = "Kazushi Fujiwara";
            return doc;
        });

        const created: Document[] = await this.createBatch(documents);
        const createdDtos: DocumentDto[] = created.map(toDocumentDto);

        return {
            success: true,
            message: `${created.length} file(s) created successfully`,
            data: createdDtos,
        };
    }
}

export const documentService = new DocumentService();