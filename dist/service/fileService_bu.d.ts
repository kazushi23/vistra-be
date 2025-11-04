import type { FileDto, FileMetaDataDto } from "../types/dto/document/document.dto.js";
import { BaseService } from "./baseService.js";
import { Document } from "../entity/Document.js";
import type { CreateFileResponse } from "../types/dto/document/document.js";
declare class FileService extends BaseService<Document> {
    private readonly ALLOWED_TYPES;
    private readonly MAX_FILE_SIZE_MB;
    private readonly MAX_FILE_SIZE;
    private readonly MAX_RETRIES;
    private readonly RETRY_DELAY_MS;
    constructor();
    getFilesByNames(names: string[]): Promise<Document[]>;
    validateExtract(fileDto: FileDto): Promise<FileMetaDataDto[]>;
    /**
     * Get next available filename by checking existing names in database
     * Uses FOR UPDATE lock to prevent race conditions
     *
     * @param originalName - The original filename (e.g., "document.pdf")
     * @param queryRunner - Active query runner with transaction
     * @returns Final unique name (e.g., "document.pdf", "document(1).pdf", "document(2).pdf")
     */
    private getNextAvailableName;
    /**
     * Escape special regex characters in a string
     */
    private escapeRegex;
    /**
     * Create files with transaction and retry logic for concurrency handling
     *
     * Flow:
     * 1. Start SERIALIZABLE transaction (highest isolation level)
     * 2. For each file, lock all records with same baseName
     * 3. Calculate next available name atomically
     * 4. Save document with unique name
     * 5. Commit transaction (all succeed or all fail)
     * 6. On deadlock/serialization error, retry with exponential backoff
     */
    createFiles(files: FileDto): Promise<CreateFileResponse>;
    /**
     * Legacy method - kept for backward compatibility
     * WARNING: Not safe for concurrent operations - use createFiles() instead
     * This method has race conditions when multiple requests execute simultaneously
     */
    handleDuplicate(files: FileMetaDataDto[]): Promise<FileMetaDataDto[]>;
    processFiles(fileDto: FileDto): Promise<FileMetaDataDto[]>;
}
export declare const fileService: FileService;
export {};
//# sourceMappingURL=fileService_bu.d.ts.map