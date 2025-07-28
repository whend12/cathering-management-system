import express from "express";
import {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  verifyPin,
  getDepartmentUsers,
  getDepartmentEmployees,
  generateDepartmentPin,
} from "../controllers/DepartmentController.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

// Public routes (no auth required)
router.post("/verify-pin", verifyPin);

// Routes requiring authentication
router.get(
  "/",
  authenticateToken,
  authorizeRoles(["administrator", "pic_catering"]),
  getAllDepartments
);

// Admin and PIC Catering only
router.post(
  "/",
  authenticateToken,
  authorizeRoles(["administrator", "pic_catering"]),
  createDepartment
);
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles(["administrator", "pic_catering"]),
  updateDepartment
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles(["administrator", "pic_catering"]),
  deleteDepartment
);
router.get(
  "/:id/users",
  authenticateToken,
  authorizeRoles(["administrator", "pic_catering"]),
  getDepartmentUsers
);
router.get(
  "/:id/employees",
  authenticateToken,
  authorizeRoles(["administrator", "pic_catering"]),
  getDepartmentEmployees
);
router.post(
  "/:id/generate-pin",
  authenticateToken,
  authorizeRoles(["administrator", "pic_catering"]),
  generateDepartmentPin
);

export default router;
