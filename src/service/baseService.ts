import type { Repository, ObjectLiteral } from "typeorm";
import type { GetAllQueryOptions } from "../types/base.js";

export abstract class BaseService<T extends ObjectLiteral> {
    protected repository: Repository<T>; // from subclass, utilise the Repository
    private defaultLimit = 10;

    constructor(repository: Repository<T>) {
        this.repository = repository;
    }
    // create one record
    async createOne(value: T): Promise<T> {
        try {
            const result = await this.repository.save(value);
            return result;
        } catch (error) {
            console.error("Error creating record:", error);
            throw new Error("Database error: unable to create record");
        }
    }
    // create batch
    async createBatch(values: T[]): Promise<T[]> {
        if (!values || values.length === 0) return [];
        try {
            const result = await this.repository.save(values);
            return result;
        } catch (error) {
            console.error("Error creating record:", error);
            throw new Error("Database error: unable to create batch records");
        }
    }
    // get all data with pagination, sorting, filtering and searching
    async getAllPagination(options: GetAllQueryOptions = {}): Promise<{data: T[]; total: number;}> {
        const page = options.page && options.page > 0 ? options.page : 1;
        const pageSize = options.pageSize && options.pageSize > 0 ? options.pageSize : this.defaultLimit;
        const offset = (page - 1) * pageSize;

        // t alias for the table
        const qb = this.repository.createQueryBuilder("t");

        // Apply filters
        if (options.filters) {
            Object.entries(options.filters).forEach(([key, value]) => {
                qb.andWhere(`t.${key} = :${key}`, { [key]: value });
            });
        }

        // Apply search across multiple columns
        if (options.search && options.searchColumns?.length) {
            const searchConditions = options.searchColumns
                .map((col, idx) => `t.${col} LIKE :search${idx}`)
                .join(" OR ");

            const searchParams = options.searchColumns.reduce((acc, col, idx) => {
                acc[`search${idx}`] = `%${options.search}%`;
                return acc;
            }, {} as Record<string, any>);

            qb.andWhere(`(${searchConditions})`, searchParams);
        }

        // Apply sorting
        if (options.sortBy) {
            qb.orderBy(`t.${options.sortBy}`, options.descending ? "DESC" : "ASC");
        }

        // Apply pagination
        qb.skip(offset).take(pageSize);

        // Execute query
        const [data, total] = await qb.getManyAndCount();

        return {
            data,
            total
        };
    }

    async getAllFiltered(options: GetAllQueryOptions = {}): Promise<T[]> {
        // t alias for the table
        const qb = this.repository.createQueryBuilder("t");

        // Apply filters
        if (options.filters) {
            Object.entries(options.filters).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                qb.andWhere(`t.${key} IN (:...${key})`, { [key]: value });
            } else if (value === null) {
                qb.andWhere(`t.${key} IS NULL`);
            } else {
                qb.andWhere(`t.${key} = :${key}`, { [key]: value });
            }
            });
        }

        // Execute query
        return await qb.getMany();
    }
}
