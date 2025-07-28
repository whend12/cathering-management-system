import express from "express";
import {
  login,
  loginWithPin,
  register,
  getProfile,
} from "../controllers/AuthController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/login", login);
router.post("/login-pin", loginWithPin);
router.post("/register", register);

// Protected routes
router.get("/profile", authenticateToken, getProfile);

export default router;
