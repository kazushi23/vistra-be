import { AppDataSource } from "../data-source.js";
import { User } from "../entity/User.js";

export default {
  Query: {
    users: async (
      _: any,
      args: {
        page?: number;
        limit?: number;
        filter?: { search?: string };
        sort?: { field: keyof User; order: "asc" | "desc" };
      }
    ) => {
      const userRepo = AppDataSource.getRepository(User);

      const page = args.page ?? 1;
      const limit = args.limit ?? 10;
      const skip = (page - 1) * limit;

      let qb = userRepo.createQueryBuilder("user");

      // Filtering
      if (args.filter?.search) {
        qb = qb.where("user.name LIKE :keyword OR user.email LIKE :keyword", {
          keyword: `%${args.filter.search}%`,
        });
      }

      // Sorting
      if (args.sort?.field && args.sort?.order) {
        qb = qb.orderBy(`user.${args.sort.field}`, args.sort.order.toUpperCase() as "ASC" | "DESC");
      }

      const [users, total] = await qb.skip(skip).take(limit).getManyAndCount();

      return {
        data: users ?? [], // never null
        total,
        page,
        limit,
      };
    },

    user: async (_: any, args: { id: number }) => {
      const userRepo = AppDataSource.getRepository(User);
      return await userRepo.findOneBy({ id: args.id });
    },
  },
};
