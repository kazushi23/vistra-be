import { AppDataSource } from "../data-source.js";
import { User} from "../entity/User.js";

export default {
  Query: {
    users: async () => {
      const userRepo = AppDataSource.getRepository(User);
      return await userRepo.find(); // fetch all users from MySQL
    },
    user: async (_: any, args: { id: number }) => {
      const userRepo = AppDataSource.getRepository(User);
      return await userRepo.findOneBy({ id: args.id });
    },
  },
};
