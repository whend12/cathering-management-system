import { Department, Order, Employee } from "../models/index.js";
import { Op } from "sequelize";

// Helper function to generate random 6-digit PIN
const generatePin = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.findAll({
      where: { isActive: true },
      order: [["orderSequence", "ASC"]],
    });

    res.json({
      success: true,
      data: departments,
    });
  } catch (error) {
    console.error("Get departments error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const createDepartment = async (req, res) => {
  try {
    const { name, pin, orderSequence } = req.body;

    if (!name || !pin) {
      return res.status(400).json({
        success: false,
        message: "Name and PIN are required",
      });
    }

    if (pin.length !== 6) {
      return res.status(400).json({
        success: false,
        message: "PIN must be 6 characters long",
      });
    }

    const existingDepartment = await Department.findOne({
      where: {
        [Op.or]: [{ name }, { pin }],
      },
    });

    if (existingDepartment) {
      return res.status(409).json({
        success: false,
        message: "Department name or PIN already exists",
      });
    }

    let sequence = orderSequence;
    if (!sequence) {
      const lastDepartment = await Department.findOne({
        order: [["orderSequence", "DESC"]],
      });
      sequence = lastDepartment ? lastDepartment.orderSequence + 1 : 1;
    }

    const department = await Department.create({
      name,
      pin,
      orderSequence: sequence,
    });

    res.status(201).json({
      success: true,
      message: "Department created successfully",
      data: department,
    });
  } catch (error) {
    console.error("Create department error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, pin, orderSequence, isActive } = req.body;

    const department = await Department.findByPk(id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    if (name && name !== department.name) {
      const existingName = await Department.findOne({
        where: { name, id: { [Op.ne]: id } },
      });
      if (existingName) {
        return res.status(409).json({
          success: false,
          message: "Department name already exists",
        });
      }
    }

    if (pin && pin !== department.pin) {
      if (pin.length !== 6) {
        return res.status(400).json({
          success: false,
          message: "PIN must be 6 characters long",
        });
      }

      const existingPin = await Department.findOne({
        where: { pin, id: { [Op.ne]: id } },
      });
      if (existingPin) {
        return res.status(409).json({
          success: false,
          message: "PIN already exists",
        });
      }
    }

    await department.update({
      name: name || department.name,
      pin: pin || department.pin,
      orderSequence: orderSequence || department.orderSequence,
      isActive: isActive !== undefined ? isActive : department.isActive,
    });

    res.json({
      success: true,
      message: "Department updated successfully",
      data: department,
    });
  } catch (error) {
    console.error("Update department error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findByPk(id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // Check if department has orders
    const hasOrders = await Order.findOne({
      where: { departmentId: id },
    });

    if (hasOrders) {
      // Soft delete - just deactivate
      await department.update({ isActive: false });
    } else {
      // Hard delete if no orders
      await department.destroy();
    }

    res.json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (error) {
    console.error("Delete department error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const verifyPin = async (req, res) => {
  try {
    const { departmentId, pin } = req.body;

    if (!departmentId || !pin) {
      return res.status(400).json({
        success: false,
        message: "Department ID and PIN are required",
      });
    }

    const department = await Department.findOne({
      where: {
        id: departmentId,
        pin: pin,
        isActive: true,
      },
    });

    if (!department) {
      return res.status(401).json({
        success: false,
        message: "Invalid PIN or inactive department",
      });
    }

    res.json({
      success: true,
      message: "PIN verified successfully",
      data: {
        department: {
          id: department.id,
          name: department.name,
        },
      },
    });
  } catch (error) {
    console.error("Verify PIN error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getDepartmentUsers = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findByPk(id, {
      include: [
        {
          model: User,
          as: "users",
          attributes: { exclude: ["password"] },
          order: [["name", "ASC"]],
        },
      ],
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Departemen tidak ditemukan",
      });
    }

    res.json({
      success: true,
      data: department.users,
    });
  } catch (error) {
    console.error("Get department users error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data user departemen",
    });
  }
};

export const getDepartmentEmployees = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findByPk(id, {
      include: [
        {
          model: Employee,
          as: "employees",
          where: { isActive: true },
          required: false,
          order: [["name", "ASC"]],
        },
      ],
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    res.json({
      success: true,
      data: department.employees || [],
    });
  } catch (error) {
    console.error("Get department employees error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const generateDepartmentPin = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findByPk(id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    let newPin;
    let isUnique = false;

    // Generate unique PIN
    while (!isUnique) {
      newPin = generatePin();
      const existingPin = await Department.findOne({
        where: { pin: newPin, id: { [Op.ne]: id } },
      });

      if (!existingPin) {
        isUnique = true;
      }
    }

    await department.update({ pin: newPin });

    res.json({
      success: true,
      message: "Department PIN generated successfully",
      data: {
        id: department.id,
        name: department.name,
        pin: newPin,
      },
    });
  } catch (error) {
    console.error("Generate PIN error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
