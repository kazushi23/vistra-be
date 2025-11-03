import dotenv from "dotenv";

const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";
dotenv.config({ path: envFile });

interface Config {
    port: number;
    db_host: string;
    db_port: number;
    db_username: string;
    db_password: string;
    db_database: string;
}

const config: Config = {
    port: Number(process.env.PORT) || 5000,
    db_host: process.env.DB_HOST || "localhost",
    db_port: Number(process.env.DB_PORT) || 3306,
    db_username: process.env.DB_USERNAME || "root",
    db_password: process.env.DB_PASSWORD || "",
    db_database: process.env.DB_DATABASE || ""
}

export default config;
