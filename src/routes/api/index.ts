import express from "express";
import document from "./document.js";
import file from "./file.js";
import folder from "./folder.js"

const router = express.Router();

router.use("/document", document);
router.use("/file", file);
router.use("/folder", folder);

export default router;