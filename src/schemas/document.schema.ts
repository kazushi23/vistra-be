import * as z from "zod";
import { ALLOWED_FILE_LENGTH, ALLOWED_FILE_TYPES } from "../types/fileValidParams.js";
import { Readable } from "stream";

export const DocumentSchema = z.object({
    id: z.uuid(),
    name: z.string(),
    type: z.enum(["file", "folder"]),
    size: z.number().positive().max(5242880).min(1).optional(),
    updatedAt: z.number(),
})

export const FolderSchema = z.object({
    name: z.string().nonempty({message: "Folder name is required"})
})

export const MulterFileSchema = z.object({
    fieldname: z.string(),
    originalname: z.string().regex(/^[a-zA-Z0-9._\-\s()]+$/, {error: "File name contains invalid characters"}),
    encoding: z.string(),
    mimetype: z.enum(ALLOWED_FILE_TYPES, {error: "Invalid file type"}),
    size: z.number().positive().max(5242880).min(1),
    destination: z.string().optional(),
    filename: z.string().optional(),
    path: z.string().optional(),
    buffer: z.instanceof(Buffer).optional(),
    stream: z.instanceof(Readable).optional()
});

export const FileSchema = z.object({
    files: z.array(MulterFileSchema)
    .min(1, {message: "At least one file is required"})
    .max(ALLOWED_FILE_LENGTH, {message: `Maximum of ${ALLOWED_FILE_LENGTH} files allowed`})
})