import express from "express";
import {
  getAllFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
  getFoodCategories,
} from "../controllers/FoodController.js";
import { authenticateToken, requirePicCatering } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Public for authenticated users
router.get("/", getAllFoods);
router.get("/categories", getFoodCategories);
router.get("/:id", getFoodById);

// PIC Catering only
router.post("/", requirePicCatering, createFood);
router.put("/:id", requirePicCatering, updateFood);
router.delete("/:id", requirePicCatering, deleteFood);

export default router;
