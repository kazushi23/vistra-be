import express from "express";
import type { Express, Request, Response } from "express";
import cors from "cors";
import config from "./config/config.js";
import router from "./routes/index.js";

const app: Express = express();
const port: number = Number(config) || 5001;

app.use((req, res, next) => {
    console.log(req.method, req.url);
    next();
});

app.use(express.json({limit:'50mb'}));
app.use(express.urlencoded({limit:'50mb',extended: false}));

app.use(
    cors({
        origin: [
            'http://localhost:3000',
        ],
        methods: ['OPTIONS','POST', 'PUT', 'GET', 'HEAD'],
        credentials: false,
        optionsSuccessStatus: 204,
    })
)
app.use(router);

app.get("/test", (req: Request, res: Response) => {
  res.send("This is a test route");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
