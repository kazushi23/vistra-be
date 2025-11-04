import express from "express";
import { FolderController } from "../../controllers/folder/folderController.js";

const router = express.Router();

router.post("/create", FolderController.createFolder); // create folder

export default router