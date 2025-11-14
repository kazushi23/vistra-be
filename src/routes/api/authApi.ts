import express from "express";
import { AuthController } from "../../controllers/auth/authController.js";

const router = express.Router();

router.post("/login", AuthController.login);
router.get("/signup", AuthController.signup);

export default router