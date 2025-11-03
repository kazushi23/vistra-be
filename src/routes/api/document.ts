import express from "express";
import { DocumentController } from "../../controllers/documentController.js";

const router = express.Router();

router.get("/", DocumentController.getAllDocuments) // view a list of documents and folders

router.post("/create/folder", DocumentController.createFolder)


export default router