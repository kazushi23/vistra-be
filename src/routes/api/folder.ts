import express from "express";
import { DocumentController } from "../../controllers/documentController.js";
import { FolderController } from "../../controllers/folderController.js";

const router = express.Router();

router.post("/create", FolderController.createFolder); // create folder

export default router