import { Order, OrderItem, Department, Food, User } from "../models/index.js";
import { Op } from "sequelize";

export const getAllOrders = async (req, res) => {
  try {
    const { departmentId, date, status, page = 1, limit = 10 } = req.query;

    let whereCondition = {};

    if (departmentId) {
      whereCondition.departmentId = departmentId;
    }

    if (date) {
      whereCondition.date = date;
    }

    if (status) {
      whereCondition.status = status;
    }

    const offset = (page - 1) * limit;

    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereCondition,
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
        orders,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
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
              attributes: ["id", "name", "category", "description"],
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { departmentId, date, items, notes } = req.body;

    if (
      !departmentId ||
      !date ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Department ID, date, and items are required",
      });
    }

    // Check if department exists
    const department = await Department.findOne({
      where: { id: departmentId, isActive: true },
    });
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found or inactive",
      });
    }

    // Check if order already exists for this department and date
    const existingOrder = await Order.findOne({
      where: { departmentId, date },
    });
    if (existingOrder) {
      return res.status(409).json({
        success: false,
        message: "Order already exists for this department and date",
      });
    }

    // Validate food items
    const foodIds = items.map((item) => item.foodId);
    const foods = await Food.findAll({
      where: {
        id: { [Op.in]: foodIds },
        isAvailable: true,
      },
    });

    if (foods.length !== foodIds.length) {
      return res.status(400).json({
        success: false,
        message: "Some food items are not available",
      });
    }

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const food = foods.find((f) => f.id === item.foodId);
      const quantity = item.quantity || 1;
      const subtotal = food.price * quantity;

      totalAmount += subtotal;
      orderItems.push({
        foodId: item.foodId,
        quantity,
        price: food.price,
        subtotal,
      });
    }

    // Create order
    const order = await Order.create({
      departmentId,
      date,
      totalAmount,
      notes,
      status: "pending",
    });

    // Create order items
    const orderItemsData = orderItems.map((item) => ({
      ...item,
      orderId: order.id,
    }));

    await OrderItem.bulkCreate(orderItemsData);

    // Fetch complete order data
    const createdOrder = await Order.findByPk(order.id, {
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
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: createdOrder,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "confirmed", "cancelled", "completed"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Valid status is required",
      });
    }

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    await order.update({ status });

    const updatedOrder = await Order.findByPk(id, {
      include: [
        {
          model: Department,
          as: "department",
          attributes: ["id", "name"],
        },
      ],
    });

    res.json({
      success: true,
      message: "Order status updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const requestOrderEdit = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Reason is required for edit request",
      });
    }

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.status === "completed" || order.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot edit completed or cancelled orders",
      });
    }

    await order.update({
      editRequestReason: reason,
      editRequestStatus: "pending",
      isEditable: false,
    });

    res.json({
      success: true,
      message: "Edit request submitted successfully",
    });
  } catch (error) {
    console.error("Request order edit error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const approveOrderEdit = async (req, res) => {
  try {
    const { id } = req.params;
    const { approved } = req.body;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.editRequestStatus !== "pending") {
      return res.status(400).json({
        success: false,
        message: "No pending edit request for this order",
      });
    }

    const newStatus = approved ? "approved" : "rejected";
    const isEditable = approved ? true : false;

    await order.update({
      editRequestStatus: newStatus,
      isEditable,
    });

    res.json({
      success: true,
      message: `Edit request ${newStatus} successfully`,
    });
  } catch (error) {
    console.error("Approve order edit error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
