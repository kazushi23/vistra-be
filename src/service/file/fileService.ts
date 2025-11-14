import type { FileDto, FileMetaDataDto } from "../../types/dto/document/document.dto.js";
import { BaseService } from "../baseService.js";
import { AppDataSource } from "../../data-source.js";
import { Document } from "../../entity/Document.js";
import type { CreateFileResponse } from "../../types/dto/document/document.js";
import { toDocumentDto } from "../../types/dto/document/document.dto.js";
import { ALLOWED_FILE_TYPES, ALLOWED_FILE_SIZE_MB } from "../../types/fileValidParams.js";
import { HttpError } from "../../types/httpError.js";
import type { Repository } from "typeorm";
import { User } from "../../entity/User.js";

// currently fileservice is stateless, not request specific/user-specific, not multi-tenant, so 1 instance is sufficient
class FileService extends BaseService<Document> {
    private readonly ALLOWED_TYPES: string[]; // all the file extensions permissible
    private readonly MAX_FILE_SIZE_MB: number; // max allowable filesize in MB
    private readonly MAX_FILE_SIZE: number; // max allowable filesize in bytes

    constructor() {
        const documentRepository: Repository<Document> = AppDataSource.getRepository(Document); // extends super class
        super(documentRepository); // init

        // declare static variable
        this.ALLOWED_TYPES = ALLOWED_FILE_TYPES;
        this.MAX_FILE_SIZE_MB = ALLOWED_FILE_SIZE_MB;
        this.MAX_FILE_SIZE = this.MAX_FILE_SIZE_MB * 1024 * 1024;
    }

    // to validate all files and extract metadata {name, size}
    async validateExtract(fileDto: FileDto): Promise<FileMetaDataDto[]> {
        // if no files, throw error bad request
        // if (!fileDto?.files || fileDto.files.length === 0) {
        //     throw new HttpError("No files provided for validation.", 400);
        // }
        // init file metadata array
        const fileMetaData: FileMetaDataDto[] = []

        for (const file of fileDto.files) { // loop through files
            // // if file missing or have issues, throw error bad request
            // if (!file) throw new HttpError("File is missing or undefined.", 400);

            // // check if file is within allowable types, else throw error bad request
            // if (!this.ALLOWED_TYPES.includes(file.mimetype)) {
            //     throw new HttpError(`Invalid file type: ${file.originalname} (${file.mimetype})`, 400);
            // }

            // // check if file is within allowable file size (bytes), else throw error bad request
            // if (file.size  > this.MAX_FILE_SIZE) {
            //     throw new HttpError(
            //     `File "${file.originalname}" exceeds the maximum size of ${this.MAX_FILE_SIZE_MB}MB`,
            //     400
            //     );
            // }
            // // if files is an empty file, throw error bad request
            // if (file.size === 0) {
            //     throw new HttpError(`File "${file.originalname}" is empty.`, 400);
            // }
            // // check if file name is valida, else throw error bad request
            // if (!/^[a-zA-Z0-9._\-\s()]+$/.test(file.originalname)) {
            //     throw new HttpError(`File name "${file.originalname}" contains invalid characters.`, 400);
            // }
            // append metadata and return
            fileMetaData.push({
                name: file.originalname,
                basename: file.originalname,
                size: file.size,
            })
        }

        return fileMetaData;
    }

    async createFiles(files: FileDto, user: User): Promise<CreateFileResponse> {
        // validate and extract metadata
        const metadata: FileMetaDataDto[] = await this.validateExtract(files);
        // map and create base Document type data
        const documents: Document[] = metadata.map((file) => {
            const doc = new Document();
            doc.name = file.name;
            doc.size = file.size;
            doc.type = "file";
            doc.createdBy = user.name;
            doc.user = user;
            return doc;
        });
        // batch create
        const created: Document[] = await this.createBatch(documents);
        // respond success
        return {
            success: true,
            message: `${created.length} file(s) created successfully`,
            data: created.map(toDocumentDto),
        };
    }
}

export const fileService = new FileService();