import { Feedback, Order, Department } from "../models/index.js";
import { Op } from "sequelize";

export const getAllFeedbacks = async (req, res) => {
  try {
    const { departmentId, date, rating, page = 1, limit = 10 } = req.query;

    let whereCondition = {};

    if (departmentId) {
      whereCondition.departmentId = departmentId;
    }

    if (date) {
      whereCondition.date = date;
    }

    if (rating) {
      whereCondition.rating = rating;
    }

    const offset = (page - 1) * limit;

    const { count, rows: feedbacks } = await Feedback.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Department,
          as: "department",
          attributes: ["id", "name"],
        },
        {
          model: Order,
          as: "order",
          attributes: ["id", "voucherCode", "totalAmount"],
        },
      ],
      order: [
        ["date", "DESC"],
        ["createdAt", "DESC"],
      ],
      limit: parseInt(limit),
      offset: offset,
    });

    res.json({
      success: true,
      data: {
        feedbacks,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get feedbacks error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getFeedbackById = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findByPk(id, {
      include: [
        {
          model: Department,
          as: "department",
          attributes: ["id", "name"],
        },
        {
          model: Order,
          as: "order",
          attributes: ["id", "voucherCode", "totalAmount", "date"],
        },
      ],
    });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    res.json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    console.error("Get feedback error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const createFeedback = async (req, res) => {
  try {
    const {
      orderId,
      departmentId,
      date,
      rating,
      comment,
      foodQuality,
      serviceQuality,
      suggestions,
    } = req.body;

    if (!orderId || !departmentId || !date || !rating) {
      return res.status(400).json({
        success: false,
        message: "Order ID, department ID, date, and rating are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (foodQuality && (foodQuality < 1 || foodQuality > 5)) {
      return res.status(400).json({
        success: false,
        message: "Food quality rating must be between 1 and 5",
      });
    }

    if (serviceQuality && (serviceQuality < 1 || serviceQuality > 5)) {
      return res.status(400).json({
        success: false,
        message: "Service quality rating must be between 1 and 5",
      });
    }

    // Check if order exists
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if department exists
    const department = await Department.findByPk(departmentId);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // Check if feedback already exists for this order, department, and date
    const existingFeedback = await Feedback.findOne({
      where: { orderId, departmentId, date },
    });

    if (existingFeedback) {
      return res.status(409).json({
        success: false,
        message: "Feedback already exists for this order and date",
      });
    }

    const feedback = await Feedback.create({
      orderId,
      departmentId,
      date,
      rating,
      comment,
      foodQuality,
      serviceQuality,
      suggestions,
    });

    const createdFeedback = await Feedback.findByPk(feedback.id, {
      include: [
        {
          model: Department,
          as: "department",
          attributes: ["id", "name"],
        },
        {
          model: Order,
          as: "order",
          attributes: ["id", "voucherCode", "totalAmount"],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Feedback created successfully",
      data: createdFeedback,
    });
  } catch (error) {
    console.error("Create feedback error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, foodQuality, serviceQuality, suggestions } =
      req.body;

    const feedback = await Feedback.findByPk(id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (foodQuality && (foodQuality < 1 || foodQuality > 5)) {
      return res.status(400).json({
        success: false,
        message: "Food quality rating must be between 1 and 5",
      });
    }

    if (serviceQuality && (serviceQuality < 1 || serviceQuality > 5)) {
      return res.status(400).json({
        success: false,
        message: "Service quality rating must be between 1 and 5",
      });
    }

    await feedback.update({
      rating: rating || feedback.rating,
      comment: comment !== undefined ? comment : feedback.comment,
      foodQuality: foodQuality || feedback.foodQuality,
      serviceQuality: serviceQuality || feedback.serviceQuality,
      suggestions:
        suggestions !== undefined ? suggestions : feedback.suggestions,
    });

    const updatedFeedback = await Feedback.findByPk(id, {
      include: [
        {
          model: Department,
          as: "department",
          attributes: ["id", "name"],
        },
        {
          model: Order,
          as: "order",
          attributes: ["id", "voucherCode", "totalAmount"],
        },
      ],
    });

    res.json({
      success: true,
      message: "Feedback updated successfully",
      data: updatedFeedback,
    });
  } catch (error) {
    console.error("Update feedback error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findByPk(id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    await feedback.destroy();

    res.json({
      success: true,
      message: "Feedback deleted successfully",
    });
  } catch (error) {
    console.error("Delete feedback error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getFeedbackStats = async (req, res) => {
  try {
    const { startDate, endDate, departmentId } = req.query;

    let whereCondition = {};

    if (startDate && endDate) {
      whereCondition.date = {
        [Op.between]: [startDate, endDate],
      };
    }

    if (departmentId) {
      whereCondition.departmentId = departmentId;
    }

    const feedbacks = await Feedback.findAll({
      where: whereCondition,
      attributes: ["rating", "foodQuality", "serviceQuality", "date"],
      include: [
        {
          model: Department,
          as: "department",
          attributes: ["id", "name"],
        },
      ],
    });

    // Calculate statistics
    const totalFeedbacks = feedbacks.length;

    if (totalFeedbacks === 0) {
      return res.json({
        success: true,
        data: {
          totalFeedbacks: 0,
          averageRating: 0,
          averageFoodQuality: 0,
          averageServiceQuality: 0,
          ratingDistribution: {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
          },
        },
      });
    }

    const averageRating =
      feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks;

    const foodQualityFeedbacks = feedbacks.filter((f) => f.foodQuality);
    const averageFoodQuality =
      foodQualityFeedbacks.length > 0
        ? foodQualityFeedbacks.reduce((sum, f) => sum + f.foodQuality, 0) /
          foodQualityFeedbacks.length
        : 0;

    const serviceQualityFeedbacks = feedbacks.filter((f) => f.serviceQuality);
    const averageServiceQuality =
      serviceQualityFeedbacks.length > 0
        ? serviceQualityFeedbacks.reduce(
            (sum, f) => sum + f.serviceQuality,
            0
          ) / serviceQualityFeedbacks.length
        : 0;

    // Rating distribution
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    feedbacks.forEach((f) => {
      ratingDistribution[f.rating]++;
    });

    res.json({
      success: true,
      data: {
        totalFeedbacks,
        averageRating: Math.round(averageRating * 100) / 100,
        averageFoodQuality: Math.round(averageFoodQuality * 100) / 100,
        averageServiceQuality: Math.round(averageServiceQuality * 100) / 100,
        ratingDistribution,
      },
    });
  } catch (error) {
    console.error("Get feedback stats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
