// resuable logic for service layer, get data with pagination, get data with where clause, create single, create batch
export class BaseService {
    repository; // from subclass, utilise the Repository
    defaultLimit = 10; // default pagesize if null
    constructor(repository) {
        this.repository = repository;
    }
    // create one record
    async createOne(value) {
        try {
            const result = await this.repository.save(value);
            return result;
        }
        catch (error) {
            throw new Error("Database error: unable to create record"); // 500 response
        }
    }
    // create batch
    async createBatch(values) {
        if (!values || values.length === 0)
            return [];
        try {
            const result = await this.repository.save(values);
            return result;
        }
        catch (error) {
            throw new Error("Database error: unable to create batch records"); // 500 response
        }
    }
    // get all data with pagination, sorting, filtering and searching
    async getAllPagination(options = {}) {
        const page = options.page && options.page > 0 ? options.page : 1; // default to page 1
        const pageSize = options.pageSize && options.pageSize > 0 ? options.pageSize : this.defaultLimit; // default to defaultLimit
        const offset = (page - 1) * pageSize; // start from which record
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
            }, {});
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
    // get all data with where clause
    async getAllFiltered(options = {}) {
        // t alias for the table
        const qb = this.repository.createQueryBuilder("t");
        // Apply filters {name: "kazushi"}
        if (options.filters) {
            Object.entries(options.filters).forEach(([key, value]) => {
                if (Array.isArray(value)) { // if val array {name: ["x", "y"...]}
                    qb.andWhere(`t.${key} IN (:...${key})`, { [key]: value });
                }
                else if (value === null) { // if val null {name: null}
                    qb.andWhere(`t.${key} IS NULL`);
                }
                else { // if val single {name: "kazushi"}
                    qb.andWhere(`t.${key} = :${key}`, { [key]: value });
                }
            });
        }
        // Execute query
        return await qb.getMany();
    }
}
//# sourceMappingURL=baseService.js.map