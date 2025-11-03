import type { FileDto, FileMetaDataDto } from "../types/dto/document.dto.js";
import { BaseService } from "./baseService.js";
import { AppDataSource } from "../data-source.js";
import { Document } from "../entity/Document.js";
import type { CreateFileResponse } from "../types/dto/document.js";
import { toDocumentDto } from "../types/dto/document.dto.js";
import { ALLOWED_FILE_TYPES, ALLOWED_FILE_SIZE_MB } from "../types/fileValidParams.js";

// currently fileservice is stateless, not request specific/user-specific, not multi-tenant, so 1 instance is sufficient
class FileService extends BaseService<Document> {
    private readonly ALLOWED_TYPES: string[];
    private readonly MAX_FILE_SIZE_MB: number;
    private readonly MAX_FILE_SIZE: number;

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
            throw new Error("No files provided for validation.");
        }
        const fileMetaData: FileMetaDataDto[] = []

        for (const file of fileDto.files) {
            if (!file) throw new Error("File is missing or undefined.");

            // 1️⃣ File type validation
            if (!this.ALLOWED_TYPES.includes(file.mimetype)) {
                throw new Error(`Invalid file type: ${file.originalname} (${file.mimetype})`);
            }

            // 2️⃣ File size validation (convert bytes → MB)
            if (file.size  > this.MAX_FILE_SIZE) {
                throw new Error(
                `File "${file.originalname}" exceeds the maximum size of ${this.MAX_FILE_SIZE_MB}MB`
                );
            }

            // 3️⃣ Empty file check
            if (file.size === 0) {
                throw new Error(`File "${file.originalname}" is empty.`);
            }

            // 4️⃣ File name pattern check
            if (!/^[a-zA-Z0-9._\-\s]+$/.test(file.originalname)) {
                throw new Error(`File name "${file.originalname}" contains invalid characters.`);
            }

            fileMetaData.push({
                name: file.originalname,
                basename: file.originalname,
                size: file.size,
            })
        }

        return fileMetaData;
    }

    async handleDuplicate(files: FileMetaDataDto[]): Promise<FileMetaDataDto[]> {
        const fileNames = files.map(d => d.name);
        const allFiles = await this.getFilesByNames(fileNames);

        const nameCountMap = new Map<string, number>();
        for (const af of allFiles) {
            if (af.baseName) {
                const key: string = af.baseName;
                nameCountMap.set(key, (nameCountMap.get(key) || 0) + 1);
            }
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

                // Increment map to handle duplicates in the same batch
                nameCountMap.set(f.name, (nameCountMap.get(f.name) || 0) + 1);
            });
        return files;
    }

    async processFiles(fileDto: FileDto): Promise<FileMetaDataDto[]> {
        const metadatas = await this.validateExtract(fileDto);
        return await this.handleDuplicate(metadatas);
    }

    async createFiles(files: FileDto): Promise<CreateFileResponse> {
        // validate, duplicate check and extract metadata
        const metadata = await this.processFiles(files);
        const documents = metadata.map((file) => {
            const doc = new Document();
            doc.name = file.name;
            doc.baseName = file.basename;
            doc.size = file.size;
            doc.type = "file";
            doc.createdBy = "Kazushi Fujiwara";
            return doc;
        });

        const created: Document[] = await this.createBatch(documents);

        return {
            success: true,
            message: `${created.length} file(s) created successfully`,
            data: created.map(toDocumentDto),
        };
    }
}
export const fileService = new FileService();
