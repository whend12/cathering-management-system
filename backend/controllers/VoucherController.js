import { Voucher, Department, WeeklySchedule, User } from "../models/index.js";
import { Op } from "sequelize";

// Generate unique voucher code
const generateVoucherCode = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `VOUCHER${date}${random}`;
};

// Helper function to get Monday of the week
const getMondayOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

export const generateVouchersForWeek = async (req, res) => {
  try {
    const { weekStartDate, voucherAmount = 50000 } = req.body;

    if (!weekStartDate) {
      return res.status(400).json({
        success: false,
        message: "Week start date is required",
      });
    }

    const monday = getMondayOfWeek(new Date(weekStartDate))
      .toISOString()
      .split("T")[0];

    // Get schedules for this week
    const schedules = await WeeklySchedule.findAll({
      where: { weekStartDate: monday },
      include: [
        {
          model: Department,
          as: "department",
          where: { isActive: true },
        },
      ],
    });

    if (schedules.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "No schedules found for this week. Please generate weekly schedule first.",
      });
    }

    const vouchers = [];

    for (const schedule of schedules) {
      // Calculate voucher date
      const mondayDate = new Date(schedule.weekStartDate);
      const dayIndex = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ].indexOf(schedule.voucherDay);
      const voucherDate = new Date(mondayDate);
      voucherDate.setDate(mondayDate.getDate() + dayIndex);

      // Check if voucher already exists
      const existingVoucher = await Voucher.findOne({
        where: {
          departmentId: schedule.departmentId,
          date: voucherDate.toISOString().split("T")[0],
        },
      });

      if (!existingVoucher) {
        // Generate expiry date (7 days from voucher date)
        const expiryDate = new Date(voucherDate);
        expiryDate.setDate(expiryDate.getDate() + 7);

        const voucher = await Voucher.create({
          voucherCode: generateVoucherCode(),
          departmentId: schedule.departmentId,
          date: voucherDate.toISOString().split("T")[0],
          amount: voucherAmount,
          expiryDate: expiryDate.toISOString().split("T")[0],
          createdBy: req.user.id,
          notes: `Weekly voucher for ${schedule.department.name} - Week of ${monday}`,
        });

        vouchers.push({
          ...voucher.toJSON(),
          department: {
            id: schedule.department.id,
            name: schedule.department.name,
          },
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Generated ${vouchers.length} vouchers for week of ${monday}`,
      data: vouchers,
    });
  } catch (error) {
    console.error("Generate vouchers error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAllVouchers = async (req, res) => {
  try {
    const {
      departmentId,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = req.query;

    let whereCondition = {};

    if (departmentId) {
      whereCondition.departmentId = departmentId;
    }

    if (status) {
      whereCondition.status = status;
    }

    if (startDate && endDate) {
      whereCondition.date = {
        [Op.between]: [startDate, endDate],
      };
    }

    const offset = (page - 1) * limit;

    const { count, rows: vouchers } = await Voucher.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Department,
          as: "department",
          attributes: ["id", "name"],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "name"],
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
        vouchers,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get vouchers error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getVoucherById = async (req, res) => {
  try {
    const { id } = req.params;

    const voucher = await Voucher.findByPk(id, {
      include: [
        {
          model: Department,
          as: "department",
          attributes: ["id", "name"],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Voucher not found",
      });
    }

    res.json({
      success: true,
      data: voucher,
    });
  } catch (error) {
    console.error("Get voucher error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getVoucherByCode = async (req, res) => {
  try {
    const { code } = req.params;

    const voucher = await Voucher.findOne({
      where: { voucherCode: code },
      include: [
        {
          model: Department,
          as: "department",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Voucher not found",
      });
    }

    // Check if voucher is expired
    const today = new Date().toISOString().split("T")[0];
    if (voucher.expiryDate && voucher.expiryDate < today) {
      // Auto-update status to expired
      await voucher.update({ status: "expired" });
      voucher.status = "expired";
    }

    res.json({
      success: true,
      data: voucher,
    });
  } catch (error) {
    console.error("Get voucher by code error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const useVoucher = async (req, res) => {
  try {
    const { code } = req.params;
    const { notes } = req.body;

    const voucher = await Voucher.findOne({
      where: { voucherCode: code },
      include: [
        {
          model: Department,
          as: "department",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Voucher not found",
      });
    }

    if (voucher.status !== "active") {
      return res.status(400).json({
        success: false,
        message: `Voucher is already ${voucher.status}`,
      });
    }

    // Check if voucher is expired
    const today = new Date().toISOString().split("T")[0];
    if (voucher.expiryDate && voucher.expiryDate < today) {
      await voucher.update({ status: "expired" });
      return res.status(400).json({
        success: false,
        message: "Voucher has expired",
      });
    }

    // Mark voucher as used
    await voucher.update({
      status: "used",
      usedAt: new Date(),
      notes: notes ? `${voucher.notes || ""}\nUsed: ${notes}` : voucher.notes,
    });

    const updatedVoucher = await Voucher.findByPk(voucher.id, {
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
      message: "Voucher used successfully",
      data: updatedVoucher,
    });
  } catch (error) {
    console.error("Use voucher error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateVoucherStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ["active", "used", "expired"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Valid status is required (active, used, expired)",
      });
    }

    const voucher = await Voucher.findByPk(id);
    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Voucher not found",
      });
    }

    const updateData = { status };

    if (status === "used" && !voucher.usedAt) {
      updateData.usedAt = new Date();
    }

    if (notes) {
      updateData.notes = notes;
    }

    await voucher.update(updateData);

    const updatedVoucher = await Voucher.findByPk(id, {
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
      message: "Voucher status updated successfully",
      data: updatedVoucher,
    });
  } catch (error) {
    console.error("Update voucher status error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getDepartmentVouchers = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { status, startDate, endDate } = req.query;

    let whereCondition = { departmentId };

    if (status) {
      whereCondition.status = status;
    }

    if (startDate && endDate) {
      whereCondition.date = {
        [Op.between]: [startDate, endDate],
      };
    }

    const vouchers = await Voucher.findAll({
      where: whereCondition,
      include: [
        {
          model: Department,
          as: "department",
          attributes: ["id", "name"],
        },
      ],
      order: [["date", "DESC"]],
    });

    // Calculate statistics
    const stats = {
      total: vouchers.length,
      active: vouchers.filter((v) => v.status === "active").length,
      used: vouchers.filter((v) => v.status === "used").length,
      expired: vouchers.filter((v) => v.status === "expired").length,
      totalValue: vouchers.reduce((sum, v) => sum + parseFloat(v.amount), 0),
      usedValue: vouchers
        .filter((v) => v.status === "used")
        .reduce((sum, v) => sum + parseFloat(v.amount), 0),
    };

    res.json({
      success: true,
      data: {
        vouchers,
        statistics: stats,
      },
    });
  } catch (error) {
    console.error("Get department vouchers error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const expireOldVouchers = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const expiredCount = await Voucher.update(
      { status: "expired" },
      {
        where: {
          expiryDate: { [Op.lt]: today },
          status: "active",
        },
      }
    );

    res.json({
      success: true,
      message: `${expiredCount[0]} vouchers have been expired`,
      data: {
        expiredCount: expiredCount[0],
      },
    });
  } catch (error) {
    console.error("Expire vouchers error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
