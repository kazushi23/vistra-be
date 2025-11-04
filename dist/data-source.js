import { DataSource } from "typeorm";
import config from "./config/config.js";
import { Document } from "./entity/Document.js";
export const AppDataSource = new DataSource({
    type: "mysql",
    host: `${config.db_host}`,
    port: Number(config.db_port),
    username: `${config.db_username}`,
    password: `${config.db_password}`,
    database: `${config.db_database}`,
    timezone: "Z",
    synchronize: true,
    logging: true,
    entities: [Document],
    subscribers: [],
    migrations: [],
});
//# sourceMappingURL=data-source.js.map