import express from "express";
import document from "./documentApi.js";
import file from "./fileApi.js";
import folder from "./folderApi.js"
import auth from "./authApi.js"
import { authenticate } from "../../middleware/auth.middleware.js";

const router = express.Router();

// base api route for different types
router.use("/document", authenticate, document);
router.use("/file", authenticate, file);
router.use("/folder", authenticate, folder);
router.use("/auth", auth);

export default router;