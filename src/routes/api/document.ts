import express from "express";
import { DocumentController } from "../../controllers/documentController.js";
import multer from "multer";
const upload = multer();

const router = express.Router();

router.get("/", DocumentController.getAllDocuments);// view a list of documents and folders

router.post("/create/folder", DocumentController.createFolder); // create folder

router.post("/create/file", upload.array("files"), DocumentController.createFile); // create file


export default router