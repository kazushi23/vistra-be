import { DataSource } from "typeorm";
import config from "./config/config.js";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    entities: [__dirname + "/entity/*.ts"],
    subscribers: [],
    migrations: [],
})