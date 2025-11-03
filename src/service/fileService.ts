import type { FileDto, FileMetaDataDto } from "../types/dto/document.dto.js";

export class FileService {
    private readonly ALLOWED_TYPES: string[];
    private readonly MAX_FILE_SIZE_MB: number;
    private readonly MAX_FILE_SIZE: number;

    constructor() {
        this.ALLOWED_TYPES = [
            // Documents
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "text/plain",
            "text/csv",
            "application/rtf",

            // Images
            "image/png",
            "image/jpeg",
            "image/gif",
            "image/webp",
            "image/svg+xml",

            // Archives
            "application/zip",
            "application/x-7z-compressed",
        ];

        this.MAX_FILE_SIZE_MB = 5;
        this.MAX_FILE_SIZE = this.MAX_FILE_SIZE_MB * 1024 * 1024;
    }

    async validate(fileDto: FileDto): Promise<boolean> {
        if (!fileDto?.files || fileDto.files.length === 0) {
            throw new Error("No files provided for validation.");
        }

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
        }

        return true;
    }

    async extract(fileDto: FileDto): Promise<FileMetaDataDto[]> {
        if (!fileDto?.files || fileDto.files.length === 0) return [];

        return fileDto.files.map((file) => ({
            name: file.originalname,
            size: file.size,
        }));
    }

    async processFiles(fileDto: FileDto): Promise<FileMetaDataDto[]> {
        await this.validate(fileDto);
        return this.extract(fileDto);
    }

}
