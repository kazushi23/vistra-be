import type { FileDto, FileMetaDataDto } from "../src/types/dto/document/document.dto.js";
import { BaseService } from "../src/service/baseService.js";
import { AppDataSource } from "../src/data-source.js";
import { Document } from "../src/entity/Document.js";
import type { CreateFileResponse } from "../src/types/dto/document/document.js";
import { toDocumentDto } from "../src/types/dto/document/document.dto.js";
import { ALLOWED_FILE_TYPES, ALLOWED_FILE_SIZE_MB } from "../src/types/fileValidParams.js";
import { HttpError } from "../src/types/httpError.js";
import type { QueryRunner } from "typeorm";

class FileService extends BaseService<Document> {
    private readonly ALLOWED_TYPES: string[];
    private readonly MAX_FILE_SIZE_MB: number;
    private readonly MAX_FILE_SIZE: number;
    private readonly MAX_RETRIES = 3;
    private readonly RETRY_DELAY_MS = 100;

    constructor() {
        const documentRepository = AppDataSource.getRepository(Document);
        super(documentRepository);

        this.ALLOWED_TYPES = ALLOWED_FILE_TYPES;
        this.MAX_FILE_SIZE_MB = ALLOWED_FILE_SIZE_MB;
        this.MAX_FILE_SIZE = this.MAX_FILE_SIZE_MB * 1024 * 1024;
    }

    async getFilesByNames(names: string[]): Promise<Document[]> {
        return await this.getAllFiltered({filters: {"baseName": names, "type": "file"}});
    }

    async validateExtract(fileDto: FileDto): Promise<FileMetaDataDto[]> {
        if (!fileDto?.files || fileDto.files.length === 0) {
            throw new HttpError("No files provided for validation.", 400);
        }
        const fileMetaData: FileMetaDataDto[] = []

        for (const file of fileDto.files) {
            if (!file) throw new HttpError("File is missing or undefined.", 400);

            if (!this.ALLOWED_TYPES.includes(file.mimetype)) {
                throw new HttpError(`Invalid file type: ${file.originalname} (${file.mimetype})`, 400);
            }

            if (file.size  > this.MAX_FILE_SIZE) {
                throw new HttpError(
                `File "${file.originalname}" exceeds the maximum size of ${this.MAX_FILE_SIZE_MB}MB`,
                400
                );
            }

            if (file.size === 0) {
                throw new HttpError(`File "${file.originalname}" is empty.`, 400);
            }

            if (!/^[a-zA-Z0-9._\-\s()]+$/.test(file.originalname)) {
                throw new HttpError(`File name "${file.originalname}" contains invalid characters.`, 400);
            }

            fileMetaData.push({
                name: file.originalname,
                basename: file.originalname,
                size: file.size,
            })
        }

        return fileMetaData;
    }

    /**
     * Get next available filename by checking existing names in database
     * Uses FOR UPDATE lock to prevent race conditions
     * 
     * @param originalName - The original filename (e.g., "document.pdf")
     * @param queryRunner - Active query runner with transaction
     * @returns Final unique name (e.g., "document.pdf", "document(1).pdf", "document(2).pdf")
     */
    private async getNextAvailableName(
        originalName: string, 
        queryRunner: QueryRunner
    ): Promise<string> {
        // Get all files with same basename (original name) with row-level lock
        // This locks the rows to prevent concurrent inserts from reading stale data
        const existingFiles = await queryRunner.manager
            .createQueryBuilder(Document, "doc")
            .where("doc.baseName = :baseName", { baseName: originalName })
            .andWhere("doc.type = :type", { type: "file" })
            .setLock("pessimistic_write") // FOR UPDATE lock - critical for concurrency
            .getMany();

        // If no files exist with this basename, use the original name as-is
        if (existingFiles.length === 0) {
            return originalName;
        }

        // Parse the original filename into name and extension
        const extensionIndex = originalName.lastIndexOf(".");
        const nameWithoutExt = extensionIndex === -1 
            ? originalName 
            : originalName.substring(0, extensionIndex);
        const ext = extensionIndex === -1 
            ? "" 
            : originalName.substring(extensionIndex);

        // Build a regex to match files like: "document.pdf", "document(1).pdf", "document(2).pdf"
        // Pattern matches: baseName + optional(number) + extension
        const basePattern = new RegExp(
            `^${this.escapeRegex(nameWithoutExt)}(?:\\((\\d+)\\))?${this.escapeRegex(ext)}$`
        );

        // Extract all counter numbers from existing file names
        const usedNumbers = new Set<number>();
        usedNumbers.add(0); // Original file (no counter) counts as 0

        for (const file of existingFiles) {
            const match = file.name.match(basePattern);
            if (match) {
                // If match[1] exists, it's a counter like (1), (2), etc.
                // If not, it's the base file without counter
                const num = match[1] ? parseInt(match[1], 10) : 0;
                usedNumbers.add(num);
            }
        }

        // Find the next available number (smallest unused number starting from 1)
        let nextNumber = 1;
        while (usedNumbers.has(nextNumber)) {
            nextNumber++;
        }

        // Construct the final filename with counter
        return extensionIndex === -1
            ? `${originalName}(${nextNumber})`
            : `${nameWithoutExt}(${nextNumber})${ext}`;
    }

    /**
     * Escape special regex characters in a string
     */
    private escapeRegex(str: string): string {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

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
    async createFiles(files: FileDto): Promise<CreateFileResponse> {
        const metadatas = await this.validateExtract(files);
        
        let attempt = 0;
        let lastError: Error | null = null;

        while (attempt < this.MAX_RETRIES) {
            const queryRunner = AppDataSource.createQueryRunner();
            await queryRunner.connect();
            
            // SERIALIZABLE isolation prevents:
            // - Phantom reads (new rows appearing during transaction)
            // - Non-repeatable reads (rows changing during transaction)
            // - Dirty reads (reading uncommitted data)
            await queryRunner.startTransaction("SERIALIZABLE");

            try {
                const documents: Document[] = [];

                // Process each file sequentially within transaction
                // This ensures each file gets the correct next available number
                for (const metadata of metadatas) {
                    // Get unique name with pessimistic locking
                    const uniqueName = await this.getNextAvailableName(
                        metadata.basename, // Original name (e.g., "document.pdf")
                        queryRunner
                    );

                    const doc = new Document();
                    doc.name = uniqueName;          // Final name (e.g., "document(1).pdf")
                    // doc.baseName = metadata.basename; // Original name (e.g., "document.pdf")
                    doc.size = metadata.size;
                    doc.type = "file";
                    doc.createdBy = "Kazushi Fujiwara";

                    // Save within transaction - createdAt/updatedAt set by @BeforeInsert
                    const saved = await queryRunner.manager.save(doc);
                    documents.push(saved);
                }

                // All files saved successfully - commit transaction
                await queryRunner.commitTransaction();

                return {
                    success: true,
                    message: `${documents.length} file(s) created successfully`,
                    data: documents.map(toDocumentDto),
                };

            } catch (error: any) {
                // Error occurred - rollback all changes
                await queryRunner.rollbackTransaction();
                lastError = error;

                // Check if it's a transient error that we can retry
                const isRetryable = 
                    error.code === '40001' ||              // Serialization failure (PostgreSQL)
                    error.code === '40P01' ||              // Deadlock detected (PostgreSQL)
                    error.code === 'ER_LOCK_DEADLOCK' ||   // MySQL deadlock
                    error.errno === 1213 ||                // MySQL deadlock errno
                    error.code === '23505' ||              // Unique violation (race condition)
                    error.message?.includes('deadlock') ||
                    error.message?.includes('serialization') ||
                    error.message?.includes('duplicate key');

                // If not retryable or max retries reached, throw error
                if (!isRetryable || attempt === this.MAX_RETRIES - 1) {
                    throw error;
                }

                // Wait with exponential backoff before retry
                // Attempt 0: 100ms, Attempt 1: 200ms, Attempt 2: 400ms
                const delay = this.RETRY_DELAY_MS * Math.pow(2, attempt);
                await new Promise(resolve => setTimeout(resolve, delay));
                attempt++;

            } finally {
                // Always release the query runner connection
                await queryRunner.release();
            }
        }

        throw lastError || new Error("Failed to create files after maximum retries");
    }

    /**
     * Legacy method - kept for backward compatibility
     * WARNING: Not safe for concurrent operations - use createFiles() instead
     * This method has race conditions when multiple requests execute simultaneously
     */
    async handleDuplicate(files: FileMetaDataDto[]): Promise<FileMetaDataDto[]> {
        if (!files || files.length === 0) {
            throw new HttpError("No files provided for duplicate check.", 400);
        }
        
        const fileNames = files.map(d => d.name);
        const allFiles = await this.getFilesByNames(fileNames);

        const nameCountMap = new Map<string, number>();
        for (const af of allFiles) {
            // if (af.baseName) {
            //     const key: string = af.baseName;
            //     nameCountMap.set(key, (nameCountMap.get(key) || 0) + 1);
            // }
        }

        files.forEach(f => {
                const existingCount = nameCountMap.get(f.name) || 0;
                if (existingCount > 0) {
                    const extensionIndex = f.name.lastIndexOf(".");
                    if (extensionIndex === -1) {
                        f.name = `${f.name}(${existingCount})`;
                    } else {
                        const baseName = f.name.substring(0, extensionIndex);
                        const ext = f.name.substring(extensionIndex);
                        f.name = `${baseName}(${existingCount})${ext}`;
                    }
                }

                nameCountMap.set(f.name, (nameCountMap.get(f.name) || 0) + 1);
            });
        return files;
    }

    async processFiles(fileDto: FileDto): Promise<FileMetaDataDto[]> {
        const metadatas = await this.validateExtract(fileDto);
        return await this.handleDuplicate(metadatas);
    }
}

export const fileService = new FileService();