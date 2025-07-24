import express from "express";
import {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  verifyPin,
} from "../controllers/DepartmentController.js";
import { authenticateToken, requirePicCatering } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Public for authenticated users
router.get("/", getAllDepartments);
router.post("/verify-pin", verifyPin);

// PIC Catering only
router.post("/", requirePicCatering, createDepartment);
router.put("/:id", requirePicCatering, updateDepartment);
router.delete("/:id", requirePicCatering, deleteDepartment);

export default router;
