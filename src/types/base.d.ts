import type { DocumentDto } from "./dto/document.dto.ts";

export interface GetPaginatedDataResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  total: number;
}

export interface CreateSingleDataResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface CreateBatchDataResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T[];
}

export interface GetAllQueryOptions {
    page?: number;
    pageSize?: number;
    offset?: number;
    descending?: boolean;
    sortBy?: string;
    search?: string; // search string
    searchColumns?: string[]; // which columns to search in
    filters?: Record<string, any>;
}