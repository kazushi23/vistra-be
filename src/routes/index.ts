import express from "express";
import api from "./api/index.js";

const router = express.Router();
// root api
router.use('/api/v1', api);

export default router;