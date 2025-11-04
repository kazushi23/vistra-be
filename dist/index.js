import { createApp } from "./app.js";
import config from "./config/config.js";
import { AppDataSource } from "./data-source.js";
const port = Number(config) || 5001;
async function start() {
    try {
        await AppDataSource.initialize();
        const app = createApp();
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    }
    catch (error) {
        console.error(error);
    }
}
start();
//# sourceMappingURL=index.js.map