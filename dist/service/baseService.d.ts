import type { Repository, ObjectLiteral } from "typeorm";
import type { GetAllQueryOptions } from "../types/base.js";
export declare abstract class BaseService<T extends ObjectLiteral> {
    protected repository: Repository<T>;
    private defaultLimit;
    constructor(repository: Repository<T>);
    createOne(value: T): Promise<T>;
    createBatch(values: T[]): Promise<T[]>;
    getAllPagination(options?: GetAllQueryOptions): Promise<{
        data: T[];
        total: number;
    }>;
    getAllFiltered(options?: GetAllQueryOptions): Promise<T[]>;
}
//# sourceMappingURL=baseService.d.ts.map