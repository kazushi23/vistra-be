import dotenv from "dotenv";
// load env based on runtime environment
const envFile = process.env.NODE_ENV === "production" ? ".env.production" : process.env.NODE_ENV === "test" ? ".env.test" : ".env.development";
dotenv.config({ path: envFile });

interface Config {
    port: number; // server port number
    db_host: string; // db host string
    db_port: number; // db port number
    db_username: string; // db username string
    db_password: string; // db password string
    db_database: string; // db schema name
}

const config: Config = { // export for use in code base
    port: Number(process.env.PORT) || 5000, // defaults to 5000
    db_host: String(process.env.DB_HOST) || "localhost",
    db_port: Number(process.env.DB_PORT) || 3306, // default mysql port
    db_username: String(process.env.DB_USERNAME) || "root",
    db_password: String(process.env.DB_PASSWORD) || "",
    db_database: String(process.env.DB_DATABASE) || ""
}

export default config;
