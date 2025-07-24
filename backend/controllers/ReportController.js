import {
  Order,
  OrderItem,
  Department,
  Food,
  Feedback,
} from "../models/index.js";
import { Op, fn, col, literal } from "sequelize";

export const getDailyReport = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    // Get orders for the specific date
    const orders = await Order.findAll({
      where: { date },
      include: [
        {
          model: Department,
          as: "department",
          attributes: ["id", "name"],
        },
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Food,
              as: "food",
              attributes: ["id", "name", "category"],
            },
          ],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    // Get feedbacks for the specific date
    const feedbacks = await Feedback.findAll({
      where: { date },
      include: [
        {
          model: Department,
          as: "department",
          attributes: ["id", "name"],
        },
      ],
    });

    // Calculate summary
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + parseFloat(order.totalAmount),
      0
    );
    const totalFeedbacks = feedbacks.length;
    const averageRating =
      feedbacks.length > 0
        ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
        : 0;

    // Food items summary
    const foodSummary = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const foodName = item.food.name;
        if (!foodSummary[foodName]) {
          foodSummary[foodName] = {
            name: foodName,
            category: item.food.category,
            quantity: 0,
            revenue: 0,
          };
        }
        foodSummary[foodName].quantity += item.quantity;
        foodSummary[foodName].revenue += parseFloat(item.subtotal);
      });
    });

    const foodItems = Object.values(foodSummary).sort(
      (a, b) => b.quantity - a.quantity
    );

    res.json({
      success: true,
      data: {
        date,
        summary: {
          totalOrders,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalFeedbacks,
          averageRating: Math.round(averageRating * 100) / 100,
        },
        orders,
        foodItems,
        feedbacks,
      },
    });
  } catch (error) {
    console.error("Get daily report error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getMonthlyReport = async (req, res) => {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: "Year and month are required",
      });
    }

    const startDate = `${year}-${month.padStart(2, "0")}-01`;
    const endDate = new Date(year, month, 0).toISOString().slice(0, 10);

    // Get orders for the month
    const orders = await Order.findAll({
      where: {
        date: {
          [Op.between]: [startDate, endDate],
        },
      },
      include: [
        {
          model: Department,
          as: "department",
          attributes: ["id", "name"],
        },
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Food,
              as: "food",
              attributes: ["id", "name", "category"],
            },
          ],
        },
      ],
      order: [["date", "ASC"]],
    });

    // Get feedbacks for the month
    const feedbacks = await Feedback.findAll({
      where: {
        date: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    // Group data by date
    const dailyData = {};
    orders.forEach((order) => {
      const date = order.date;
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          orders: 0,
          revenue: 0,
          feedbacks: 0,
          averageRating: 0,
        };
      }
      dailyData[date].orders++;
      dailyData[date].revenue += parseFloat(order.totalAmount);
    });

    feedbacks.forEach((feedback) => {
      const date = feedback.date;
      if (dailyData[date]) {
        dailyData[date].feedbacks++;
      }
    });

    // Calculate average ratings per day
    const feedbacksByDate = feedbacks.reduce((acc, feedback) => {
      const date = feedback.date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(feedback.rating);
      return acc;
    }, {});

    Object.keys(feedbacksByDate).forEach((date) => {
      if (dailyData[date]) {
        const ratings = feedbacksByDate[date];
        dailyData[date].averageRating =
          ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
      }
    });

    const dailyReports = Object.values(dailyData).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    // Summary
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + parseFloat(order.totalAmount),
      0
    );
    const totalFeedbacks = feedbacks.length;
    const averageRating =
      feedbacks.length > 0
        ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
        : 0;

    // Top foods
    const foodSummary = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const foodName = item.food.name;
        if (!foodSummary[foodName]) {
          foodSummary[foodName] = {
            name: foodName,
            category: item.food.category,
            quantity: 0,
            revenue: 0,
          };
        }
        foodSummary[foodName].quantity += item.quantity;
        foodSummary[foodName].revenue += parseFloat(item.subtotal);
      });
    });

    const topFoods = Object.values(foodSummary)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    res.json({
      success: true,
      data: {
        period: { year, month, startDate, endDate },
        summary: {
          totalOrders,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalFeedbacks,
          averageRating: Math.round(averageRating * 100) / 100,
        },
        dailyReports,
        topFoods,
      },
    });
  } catch (error) {
    console.error("Get monthly report error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getYearlyReport = async (req, res) => {
  try {
    const { year } = req.query;

    if (!year) {
      return res.status(400).json({
        success: false,
        message: "Year is required",
      });
    }

    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    // Get monthly aggregated data
    const monthlyData = await Order.findAll({
      where: {
        date: {
          [Op.between]: [startDate, endDate],
        },
      },
      attributes: [
        [fn("MONTH", col("date")), "month"],
        [fn("COUNT", col("id")), "totalOrders"],
        [fn("SUM", col("totalAmount")), "totalRevenue"],
      ],
      group: [fn("MONTH", col("date"))],
      order: [[fn("MONTH", col("date")), "ASC"]],
      raw: true,
    });

    // Get feedback data by month
    const feedbackData = await Feedback.findAll({
      where: {
        date: {
          [Op.between]: [startDate, endDate],
        },
      },
      attributes: [
        [fn("MONTH", col("date")), "month"],
        [fn("COUNT", col("id")), "totalFeedbacks"],
        [fn("AVG", col("rating")), "averageRating"],
      ],
      group: [fn("MONTH", col("date"))],
      raw: true,
    });

    // Combine monthly data
    const monthlyReports = [];
    for (let month = 1; month <= 12; month++) {
      const orderData = monthlyData.find((d) => d.month === month) || {
        totalOrders: 0,
        totalRevenue: 0,
      };
      const fbData = feedbackData.find((d) => d.month === month) || {
        totalFeedbacks: 0,
        averageRating: 0,
      };

      monthlyReports.push({
        month,
        monthName: new Date(year, month - 1).toLocaleString("default", {
          month: "long",
        }),
        totalOrders: parseInt(orderData.totalOrders) || 0,
        totalRevenue: parseFloat(orderData.totalRevenue) || 0,
        totalFeedbacks: parseInt(fbData.totalFeedbacks) || 0,
        averageRating: parseFloat(fbData.averageRating) || 0,
      });
    }

    // Overall summary
    const totalOrders = monthlyReports.reduce(
      (sum, m) => sum + m.totalOrders,
      0
    );
    const totalRevenue = monthlyReports.reduce(
      (sum, m) => sum + m.totalRevenue,
      0
    );
    const totalFeedbacks = monthlyReports.reduce(
      (sum, m) => sum + m.totalFeedbacks,
      0
    );

    const monthsWithFeedback = monthlyReports.filter(
      (m) => m.totalFeedbacks > 0
    );
    const averageRating =
      monthsWithFeedback.length > 0
        ? monthsWithFeedback.reduce(
            (sum, m) => sum + m.averageRating * m.totalFeedbacks,
            0
          ) / totalFeedbacks
        : 0;

    res.json({
      success: true,
      data: {
        year: parseInt(year),
        summary: {
          totalOrders,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalFeedbacks,
          averageRating: Math.round(averageRating * 100) / 100,
        },
        monthlyReports,
      },
    });
  } catch (error) {
    console.error("Get yearly report error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getDepartmentReport = async (req, res) => {
  try {
    const { departmentId, startDate, endDate } = req.query;

    if (!departmentId) {
      return res.status(400).json({
        success: false,
        message: "Department ID is required",
      });
    }

    let whereCondition = { departmentId };

    if (startDate && endDate) {
      whereCondition.date = {
        [Op.between]: [startDate, endDate],
      };
    }

    // Get department info
    const department = await Department.findByPk(departmentId);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // Get orders
    const orders = await Order.findAll({
      where: whereCondition,
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Food,
              as: "food",
              attributes: ["id", "name", "category"],
            },
          ],
        },
      ],
      order: [["date", "DESC"]],
    });

    // Get feedbacks
    const feedbacks = await Feedback.findAll({
      where: whereCondition,
    });

    // Calculate summary
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + parseFloat(order.totalAmount),
      0
    );
    const totalFeedbacks = feedbacks.length;
    const averageRating =
      feedbacks.length > 0
        ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
        : 0;

    // Most ordered foods
    const foodSummary = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const foodName = item.food.name;
        if (!foodSummary[foodName]) {
          foodSummary[foodName] = {
            name: foodName,
            category: item.food.category,
            quantity: 0,
            revenue: 0,
            orderCount: 0,
          };
        }
        foodSummary[foodName].quantity += item.quantity;
        foodSummary[foodName].revenue += parseFloat(item.subtotal);
        foodSummary[foodName].orderCount++;
      });
    });

    const topFoods = Object.values(foodSummary)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    res.json({
      success: true,
      data: {
        department: {
          id: department.id,
          name: department.name,
        },
        period: { startDate, endDate },
        summary: {
          totalOrders,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalFeedbacks,
          averageRating: Math.round(averageRating * 100) / 100,
        },
        orders,
        topFoods,
        feedbacks,
      },
    });
  } catch (error) {
    console.error("Get department report error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
