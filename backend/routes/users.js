import express from "express";
import UserController from "../controllers/UserController.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all users (PIC only)
router.get("/", requireRole(["pic"]), UserController.getAllUsers);

// Get user by ID
router.get("/:id", UserController.getUserById);

// Create new user (PIC only)
router.post("/", requireRole(["pic"]), UserController.createUser);

// Update user
router.put("/:id", UserController.updateUser);

// Delete user (PIC only)
router.delete("/:id", requireRole(["pic"]), UserController.deleteUser);

// Get users by department
router.get("/department/:departmentId", UserController.getUsersByDepartment);

// Generate random PIN (PIC only)
router.get("/generate/pin", requireRole(["pic"]), UserController.generatePin);

// Reset user password (PIC only)
router.put(
  "/:id/reset-password",
  requireRole(["pic"]),
  UserController.resetPassword
);

export default router;
