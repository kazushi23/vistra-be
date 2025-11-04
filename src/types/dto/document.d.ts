import type { CreateSingleDataResponse, CreateBatchDataResponse, GetPaginatedDataResponse } from "../base.js";
import type { DocumentDto } from "./document.dto.ts";

export type GetDocumentsResponse = GetPaginatedDataResponse<DocumentDto[]>; // response type for paginated data
export type CreateFolderResponse = CreateSingleDataResponse<DocumentDto> // response type after creation of folder
export type CreateFileResponse = CreateBatchDataResponse<DocumentDto> // response type after creation of file