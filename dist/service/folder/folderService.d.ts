import { BaseService } from "../baseService.js";
import { Document } from "../../entity/Document.js";
import { type FolderDto } from "../../types/dto/document/document.dto.js";
import type { CreateFolderResponse } from "../../types/dto/document/document.js";
declare class FolderService extends BaseService<Document> {
    constructor();
    createFolder(folder: FolderDto): Promise<CreateFolderResponse>;
}
export declare const folderService: FolderService;
export {};
//# sourceMappingURL=folderService.d.ts.map