import express from "express";
import multer from "multer";
import { FileController } from "../../controllers/fileController.js";
const upload = multer();

const router = express.Router();

router.post("/create", upload.array("files"), FileController.createFile); // create file


export default router