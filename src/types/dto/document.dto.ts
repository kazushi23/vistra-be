import type { Document } from "typeorm";
import 'express';

export interface FileDto {
  files: Express.Multer.File[]
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

export function toDocumentDto(document: Document): DocumentDto {
  return {
    id: Number(document.id),
    name: document.name,
    createdBy: document.createdBy,
    updatedAt: Number(document.updatedAt),
    size: Number(document.size),
    type: document.type as "file" | "folder", // ensures type safety
  };
}