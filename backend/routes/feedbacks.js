import express from "express";
import {
  getAllFeedbacks,
  getFeedbackById,
  createFeedback,
  updateFeedback,
  deleteFeedback,
  getFeedbackStats,
} from "../controllers/FeedbackController.js";
import { authenticateToken, requirePic } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Public for authenticated users
router.get("/", getAllFeedbacks);
router.get("/stats", getFeedbackStats);
router.get("/:id", getFeedbackById);
router.post("/", createFeedback);

// PIC Catering can manage all feedbacks
router.put("/:id", requirePic, updateFeedback);
router.delete("/:id", requirePic, deleteFeedback);

export default router;
