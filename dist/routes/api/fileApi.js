import express from "express";
import multer from "multer";
import { FileController } from "../../controllers/file/fileController.js";
const upload = multer();
const router = express.Router();
// parse form data files[]
router.post("/create", upload.array("files"), FileController.createFile); // create file
export default router;
//# sourceMappingURL=fileApi.js.map