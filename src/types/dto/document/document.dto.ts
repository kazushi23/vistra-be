import type { Document } from "typeorm";
import 'express';
import * as z from "zod";
import { FileSchema } from "../../../schemas/document.schema.js";

// request type for file creation
export type FileDto = z.infer<typeof FileSchema>
// type for file mapping after extracting file metadata
export interface FileMetaDataDto {
  basename: string;
  name: string;
  size: number;
}

// request type for folder creation
export interface FolderDto {
  name: string;
}

// response type for document data
export interface DocumentDto {
  id: number;
  name: string;
  createdBy: string;
  updatedAt: number; 
  size?: number;
  type: "file" | "folder";
}

// map entity to dto for removal of unneeded data
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