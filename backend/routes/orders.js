import express from "express";
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  requestOrderEdit,
  approveOrderEdit,
} from "../controllers/OrderController.js";
import { authenticateToken, requirePicCatering } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Public for authenticated users
router.get("/", getAllOrders);
router.get("/:id", getOrderById);
router.post("/", createOrder);
router.post("/:id/edit-request", requestOrderEdit);

// PIC Catering only
router.put("/:id/status", requirePicCatering, updateOrderStatus);
router.put("/:id/approve-edit", requirePicCatering, approveOrderEdit);

export default router;
