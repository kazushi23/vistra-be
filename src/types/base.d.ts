import { User } from "../entity/User.ts";
import type { DocumentDto } from "./dto/document/document.dto.ts";
import { UserDto } from "./dto/user/user.dto.ts";
import { Request } from "express";
// base type for all paginated data response
export interface GetPaginatedDataResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  total: number;
}
// base type for all creation data response
export interface CreateSingleDataResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}
// base type for all batch creation data response
export interface CreateBatchDataResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T[];
}

// base type for request params for paginated data
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

declare global {
  namespace Express {
    interface Request {
      user?: User
    }
  }
}