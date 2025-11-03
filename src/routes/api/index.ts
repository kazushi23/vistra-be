import express from "express";
import document from "./document.js";

const router = express.Router();

router.use("/document", document);

export default router;