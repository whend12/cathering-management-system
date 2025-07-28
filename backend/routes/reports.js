import express from "express";
import {
  getDailyReport,
  getMonthlyReport,
  getYearlyReport,
  getDepartmentReport,
} from "../controllers/ReportController.js";
import { authenticateToken, requirePic } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication and PIC Catering role
router.use(authenticateToken);
router.use(requirePic);

router.get("/daily", getDailyReport);
router.get("/monthly", getMonthlyReport);
router.get("/yearly", getYearlyReport);
router.get("/department", getDepartmentReport);

export default router;
