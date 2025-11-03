import type { CreateSingleDataResponse, CreateBatchDataResponse, GetPaginatedDataResponse } from "../base.js";
import type { DocumentDto } from "./document.dto.ts";

export type GetDocumentsResponse = GetPaginatedDataResponse<DocumentDto[]>;
export type CreateFolderResponse = CreateSingleDataResponse<DocumentDto>
export type CreateFileResponse = CreateBatchDataResponse<DocumentDto>