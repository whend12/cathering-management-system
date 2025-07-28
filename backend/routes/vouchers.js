import express from "express";
import {
  generateVouchersForWeek,
  getAllVouchers,
  getVoucherById,
  getVoucherByCode,
  useVoucher,
  updateVoucherStatus,
  getDepartmentVouchers,
  expireOldVouchers,
} from "../controllers/VoucherController.js";
import { authenticateToken, requirePic } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Public routes for voucher verification
router.get("/code/:code", getVoucherByCode);
router.post("/use/:code", useVoucher);

// PIC Catering routes
router.post("/generate", requirePic, generateVouchersForWeek);
router.get("/", requirePic, getAllVouchers);
router.get("/:id", requirePic, getVoucherById);
router.put("/:id/status", requirePic, updateVoucherStatus);
router.get("/department/:departmentId", getDepartmentVouchers);
router.post("/expire-old", requirePic, expireOldVouchers);

export default router;
