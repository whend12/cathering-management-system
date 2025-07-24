import { WeeklySchedule, Department, Voucher } from "../models/index.js";
import { Op } from "sequelize";

// Helper function to get week number
const getWeekNumber = (date) => {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
};

// Helper function to get Monday of the week
const getMondayOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

// Helper function to get day name from number
const getDayName = (dayNumber) => {
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  return days[dayNumber];
};

// Helper function to get next voucher day (advance by 1 day each week)
const getNextVoucherDay = (currentDay, weeksToAdvance = 1) => {
  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  const currentIndex = days.indexOf(currentDay);
  const nextIndex = (currentIndex + weeksToAdvance) % 7;
  return days[nextIndex];
};

export const generateWeeklySchedule = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get all active departments
    const departments = await Department.findAll({
      where: { isActive: true },
      order: [["orderSequence", "ASC"]],
    });

    if (departments.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No active departments found",
      });
    }

    const schedules = [];
    let currentDate = new Date(start);

    // Get last schedule to determine starting voucher days
    const lastSchedule = await WeeklySchedule.findAll({
      include: [{ model: Department, as: "department" }],
      order: [
        ["weekStartDate", "DESC"],
        ["department", "orderSequence", "ASC"],
      ],
      limit: departments.length,
    });

    // Initialize voucher days for each department
    let voucherDays = {};

    if (lastSchedule.length > 0) {
      // Continue from last schedule (advance by 1 day)
      lastSchedule.forEach((schedule) => {
        const nextDay = getNextVoucherDay(schedule.voucherDay);
        voucherDays[schedule.departmentId] = nextDay;
      });
    } else {
      // First time setup - assign initial voucher days
      const workDays = ["monday", "tuesday", "wednesday", "thursday", "friday"];
      departments.forEach((dept, index) => {
        voucherDays[dept.id] = workDays[index % workDays.length];
      });
    }

    while (currentDate <= end) {
      const monday = getMondayOfWeek(currentDate);
      const weekNumber = getWeekNumber(monday);
      const year = monday.getFullYear();

      // Check if schedule already exists for this week
      const existingSchedules = await WeeklySchedule.findAll({
        where: {
          weekStartDate: monday.toISOString().split("T")[0],
          year: year,
        },
      });

      if (existingSchedules.length === 0) {
        // Create schedule for each department
        for (const department of departments) {
          const schedule = await WeeklySchedule.create({
            weekStartDate: monday.toISOString().split("T")[0],
            departmentId: department.id,
            voucherDay: voucherDays[department.id],
            weekNumber: weekNumber,
            year: year,
          });

          schedules.push({
            ...schedule.toJSON(),
            department: {
              id: department.id,
              name: department.name,
            },
          });
        }

        // Advance voucher days for next week
        departments.forEach((dept) => {
          voucherDays[dept.id] = getNextVoucherDay(voucherDays[dept.id]);
        });
      }

      // Move to next week
      currentDate.setDate(currentDate.getDate() + 7);
    }

    res.status(201).json({
      success: true,
      message: "Weekly schedules generated successfully",
      data: {
        generated: schedules.length,
        schedules: schedules,
      },
    });
  } catch (error) {
    console.error("Generate schedule error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getWeeklySchedule = async (req, res) => {
  try {
    const { weekStartDate, year, month } = req.query;

    let whereCondition = {};

    if (weekStartDate) {
      whereCondition.weekStartDate = weekStartDate;
    } else if (year && month) {
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0);

      whereCondition.weekStartDate = {
        [Op.between]: [
          startOfMonth.toISOString().split("T")[0],
          endOfMonth.toISOString().split("T")[0],
        ],
      };
    } else if (year) {
      whereCondition.year = year;
    }

    const schedules = await WeeklySchedule.findAll({
      where: whereCondition,
      include: [
        {
          model: Department,
          as: "department",
          attributes: ["id", "name", "orderSequence"],
        },
      ],
      order: [
        ["weekStartDate", "ASC"],
        ["department", "orderSequence", "ASC"],
      ],
    });

    // Group by week
    const groupedSchedules = {};
    schedules.forEach((schedule) => {
      const weekKey = schedule.weekStartDate;
      if (!groupedSchedules[weekKey]) {
        groupedSchedules[weekKey] = {
          weekStartDate: weekKey,
          weekNumber: schedule.weekNumber,
          year: schedule.year,
          departments: [],
        };
      }
      groupedSchedules[weekKey].departments.push({
        id: schedule.department.id,
        name: schedule.department.name,
        voucherDay: schedule.voucherDay,
        orderSequence: schedule.department.orderSequence,
      });
    });

    const result = Object.values(groupedSchedules);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get schedule error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateWeeklySchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { voucherDay } = req.body;

    const validDays = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    if (!voucherDay || !validDays.includes(voucherDay)) {
      return res.status(400).json({
        success: false,
        message: "Valid voucher day is required",
      });
    }

    const schedule = await WeeklySchedule.findByPk(id);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    await schedule.update({ voucherDay });

    const updatedSchedule = await WeeklySchedule.findByPk(id, {
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
      message: "Schedule updated successfully",
      data: updatedSchedule,
    });
  } catch (error) {
    console.error("Update schedule error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteWeeklySchedule = async (req, res) => {
  try {
    const { weekStartDate } = req.params;

    const schedules = await WeeklySchedule.findAll({
      where: { weekStartDate },
    });

    if (schedules.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No schedules found for this week",
      });
    }

    await WeeklySchedule.destroy({
      where: { weekStartDate },
    });

    res.json({
      success: true,
      message: "Weekly schedules deleted successfully",
    });
  } catch (error) {
    console.error("Delete schedule error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getDepartmentSchedule = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { startDate, endDate } = req.query;

    let whereCondition = { departmentId };

    if (startDate && endDate) {
      whereCondition.weekStartDate = {
        [Op.between]: [startDate, endDate],
      };
    }

    const schedules = await WeeklySchedule.findAll({
      where: whereCondition,
      include: [
        {
          model: Department,
          as: "department",
          attributes: ["id", "name"],
        },
      ],
      order: [["weekStartDate", "ASC"]],
    });

    // Calculate actual voucher dates
    const scheduleWithDates = schedules.map((schedule) => {
      const monday = new Date(schedule.weekStartDate);
      const dayIndex = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ].indexOf(schedule.voucherDay);
      const voucherDate = new Date(monday);
      voucherDate.setDate(monday.getDate() + dayIndex);

      return {
        ...schedule.toJSON(),
        voucherDate: voucherDate.toISOString().split("T")[0],
      };
    });

    res.json({
      success: true,
      data: scheduleWithDates,
    });
  } catch (error) {
    console.error("Get department schedule error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
