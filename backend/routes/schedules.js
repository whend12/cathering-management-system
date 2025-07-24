import express from "express";
import {
  generateWeeklySchedule,
  getWeeklySchedule,
  updateWeeklySchedule,
  deleteWeeklySchedule,
  getDepartmentSchedule,
} from "../controllers/ScheduleController.js";
import { authenticateToken, requirePicCatering } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication and PIC Catering role
router.use(authenticateToken);
router.use(requirePicCatering);

router.post("/generate", generateWeeklySchedule);
router.get("/", getWeeklySchedule);
router.put("/:id", updateWeeklySchedule);
router.delete("/week/:weekStartDate", deleteWeeklySchedule);
router.get("/department/:departmentId", getDepartmentSchedule);

export default router;
