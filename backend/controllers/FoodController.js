import { Food, User } from "../models/index.js";
import { Op } from "sequelize";

export const getAllFoods = async (req, res) => {
  try {
    const { category, isAvailable, search } = req.query;

    let whereCondition = {};

    if (category) {
      whereCondition.category = category;
    }

    if (isAvailable !== undefined) {
      whereCondition.isAvailable = isAvailable === "true";
    }

    if (search) {
      whereCondition[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const foods = await Food.findAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "name"],
        },
      ],
      order: [["name", "ASC"]],
    });

    res.json({
      success: true,
      data: foods,
    });
  } catch (error) {
    console.error("Get foods error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getFoodById = async (req, res) => {
  try {
    const { id } = req.params;

    const food = await Food.findByPk(id, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food not found",
      });
    }

    res.json({
      success: true,
      data: food,
    });
  } catch (error) {
    console.error("Get food error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const createFood = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "Name, price, and category are required",
      });
    }

    if (price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be greater than 0",
      });
    }

    const validCategories = ["main_course", "side_dish", "drink", "dessert"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category",
      });
    }

    const food = await Food.create({
      name,
      description,
      price,
      category,
      createdBy: req.user.id,
    });

    const createdFood = await Food.findByPk(food.id, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "name"],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Food created successfully",
      data: createdFood,
    });
  } catch (error) {
    console.error("Create food error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateFood = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, isAvailable } = req.body;

    const food = await Food.findByPk(id);
    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food not found",
      });
    }

    if (price && price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be greater than 0",
      });
    }

    if (category) {
      const validCategories = ["main_course", "side_dish", "drink", "dessert"];
      if (!validCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category",
        });
      }
    }

    await food.update({
      name: name || food.name,
      description: description !== undefined ? description : food.description,
      price: price || food.price,
      category: category || food.category,
      isAvailable: isAvailable !== undefined ? isAvailable : food.isAvailable,
    });

    const updatedFood = await Food.findByPk(id, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "name"],
        },
      ],
    });

    res.json({
      success: true,
      message: "Food updated successfully",
      data: updatedFood,
    });
  } catch (error) {
    console.error("Update food error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteFood = async (req, res) => {
  try {
    const { id } = req.params;

    const food = await Food.findByPk(id);
    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food not found",
      });
    }

    await food.destroy();

    res.json({
      success: true,
      message: "Food deleted successfully",
    });
  } catch (error) {
    console.error("Delete food error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getFoodCategories = async (req, res) => {
  try {
    const categories = [
      { value: "main_course", label: "Main Course" },
      { value: "side_dish", label: "Side Dish" },
      { value: "drink", label: "Drink" },
      { value: "dessert", label: "Dessert" },
    ];

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
