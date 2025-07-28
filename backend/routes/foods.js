import express from "express";
import {
  getAllFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
  getFoodCategories,
} from "../controllers/FoodController.js";
import { authenticateToken, requirePic } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Public for authenticated users
router.get("/", getAllFoods);
router.get("/categories", getFoodCategories);
router.get("/:id", getFoodById);

// PIC Catering only
router.post("/", requirePic, createFood);
router.put("/:id", requirePic, updateFood);
router.delete("/:id", requirePic, deleteFood);

export default router;
