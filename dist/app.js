// src/app.ts
import express from "express";
import cors from "cors";
import router from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
export function createApp() {
    const app = express();
    app.use(express.json({ limit: "50mb" }));
    app.use(express.urlencoded({ limit: "50mb", extended: false }));
    app.use(cors({
        origin: ["http://localhost:3000"],
        methods: ["OPTIONS", "POST", "PUT", "GET", "HEAD"],
        credentials: false,
        optionsSuccessStatus: 204,
    }));
    app.use(router);
    app.use(errorHandler);
    return app;
}
// Only listen when running Node directly
if (process.env.NODE_ENV !== "test") {
    const port = Number(process.env.PORT) || 5001;
    const app = createApp();
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}
//# sourceMappingURL=app.js.map