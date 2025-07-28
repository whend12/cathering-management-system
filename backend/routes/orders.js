import express from "express";
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  requestOrderEdit,
  approveOrderEdit,
} from "../controllers/OrderController.js";
import { authenticateToken, requirePic } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Public for authenticated users
router.get("/", getAllOrders);
router.get("/:id", getOrderById);
router.post("/", createOrder);
router.post("/:id/edit-request", requestOrderEdit);

// PIC Catering only
router.put("/:id/status", requirePic, updateOrderStatus);
router.put("/:id/approve-edit", requirePic, approveOrderEdit);

export default router;
