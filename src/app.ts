import "reflect-metadata";
import express from "express";
import cors from "cors";
import router from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import logger from "./utils/logger.js";
import { Request, Response, NextFunction } from "express";
import { ApolloServer } from "@apollo/server";
import typeDefs from "./schemas/graphql/index.js";
import resolvers from "./resolvers/index.js";
import { expressMiddleware } from "@as-integrations/express5";

export async function createApp() {
  const app = express();

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: false }));

  app.use(
    cors({
      origin: ["http://localhost:3000"],
      methods: ["OPTIONS", "POST", "PUT", "GET", "HEAD"],
      credentials: false,
      optionsSuccessStatus: 204,
    })
  );

  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  app.use("/graphql", expressMiddleware(server));

  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    });
    next();
  });

  app.use(router);
  app.use(errorHandler);

  return app;
}
