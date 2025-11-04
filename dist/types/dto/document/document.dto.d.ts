import type { Document } from "typeorm";
import 'express';
export interface FileDto {
    files: Express.Multer.File[];
}
export interface FileMetaDataDto {
    basename: string;
    name: string;
    size: number;
}
export interface FolderDto {
    name: string;
}
export interface DocumentDto {
    id: number;
    name: string;
    createdBy: string;
    updatedAt: number;
    size?: number;
    type: "file" | "folder";
}
export declare function toDocumentDto(document: Document): DocumentDto;
//# sourceMappingURL=document.dto.d.ts.map