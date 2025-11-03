import express from "express";
import api from "./api/index.js";

const router = express.Router();

router.use('/api/v1', api);

export default router;