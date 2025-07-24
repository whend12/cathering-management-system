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
import { authenticateToken, requirePicCatering } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Public routes for voucher verification
router.get("/code/:code", getVoucherByCode);
router.post("/use/:code", useVoucher);

// PIC Catering routes
router.post("/generate", requirePicCatering, generateVouchersForWeek);
router.get("/", requirePicCatering, getAllVouchers);
router.get("/:id", requirePicCatering, getVoucherById);
router.put("/:id/status", requirePicCatering, updateVoucherStatus);
router.get("/department/:departmentId", getDepartmentVouchers);
router.post("/expire-old", requirePicCatering, expireOldVouchers);

export default router;
