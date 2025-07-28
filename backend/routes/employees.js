import express from "express";
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeesByDepartment,
} from "../controllers/EmployeeController.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

// Get all employees (with pagination and search)
router.get(
  "/",
  authenticateToken,
  authorizeRoles(["administrator", "pic_catering"]),
  getAllEmployees
);

// Get employee by ID
router.get(
  "/:id",
  authenticateToken,
  authorizeRoles(["administrator", "pic_catering"]),
  getEmployeeById
);

// Create new employee
router.post(
  "/",
  authenticateToken,
  authorizeRoles(["administrator", "pic_catering"]),
  createEmployee
);

// Update employee
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles(["administrator", "pic_catering"]),
  updateEmployee
);

// Delete (deactivate) employee
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles(["administrator", "pic_catering"]),
  deleteEmployee
);

// Get employees by department
router.get(
  "/department/:departmentId",
  authenticateToken,
  authorizeRoles(["administrator", "pic_catering"]),
  getEmployeesByDepartment
);

export default router;
