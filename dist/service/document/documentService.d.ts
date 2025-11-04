import { Document } from "../../entity/Document.js";
import { BaseService } from "../baseService.js";
import type { GetAllQueryOptions } from "../../types/base.js";
import type { GetDocumentsResponse } from "../../types/dto/document/document.js";
export declare class DocumentService extends BaseService<Document> {
    constructor();
    getAllDocuments(options?: GetAllQueryOptions): Promise<GetDocumentsResponse>;
}
export declare const documentService: DocumentService;
//# sourceMappingURL=documentService.d.ts.map