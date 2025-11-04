import express from "express";
import document from "./documentApi.js";
import file from "./fileApi.js";
import folder from "./folderApi.js";
const router = express.Router();
// base api route for different types
router.use("/document", document);
router.use("/file", file);
router.use("/folder", folder);
export default router;
//# sourceMappingURL=index.js.map