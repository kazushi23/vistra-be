import type { FileDto, FileMetaDataDto } from "../../types/dto/document/document.dto.js";
import { BaseService } from "../baseService.js";
import { Document } from "../../entity/Document.js";
import type { CreateFileResponse } from "../../types/dto/document/document.js";
declare class FileService extends BaseService<Document> {
    private readonly ALLOWED_TYPES;
    private readonly MAX_FILE_SIZE_MB;
    private readonly MAX_FILE_SIZE;
    constructor();
    validateExtract(fileDto: FileDto): Promise<FileMetaDataDto[]>;
    createFiles(files: FileDto): Promise<CreateFileResponse>;
}
export declare const fileService: FileService;
export {};
//# sourceMappingURL=fileService.d.ts.map