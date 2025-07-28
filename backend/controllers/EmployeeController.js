import { Employee, Department } from "../models/index.js";
import { Op } from "sequelize";

export const getAllEmployees = async (req, res) => {
  try {
    const { departmentId, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};

    if (departmentId) {
      whereClause.departmentId = departmentId;
    }

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { employeeId: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const employees = await Employee.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Department,
          as: "department",
          attributes: ["id", "name"],
        },
      ],
      order: [["name", "ASC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: employees.rows,
      pagination: {
        total: employees.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(employees.count / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch employees",
      error: error.message,
    });
  }
};

export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByPk(id, {
      include: [
        {
          model: Department,
          as: "department",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error("Error fetching employee:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch employee",
      error: error.message,
    });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const { employeeId, name, email, phone, departmentId, position, joinDate } =
      req.body;

    // Validate required fields
    if (!employeeId || !name || !departmentId) {
      return res.status(400).json({
        success: false,
        message: "Employee ID, name, and department are required",
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

    // Check if employee ID already exists
    const existingEmployee = await Employee.findOne({
      where: { employeeId },
    });

    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: "Employee ID already exists",
      });
    }

    const employee = await Employee.create({
      employeeId,
      name,
      email,
      phone,
      departmentId,
      position,
      joinDate,
      createdBy: req.user.id,
    });

    const createdEmployee = await Employee.findByPk(employee.id, {
      include: [
        {
          model: Department,
          as: "department",
          attributes: ["id", "name"],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: createdEmployee,
    });
  } catch (error) {
    console.error("Error creating employee:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create employee",
      error: error.message,
    });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      employeeId,
      name,
      email,
      phone,
      departmentId,
      position,
      joinDate,
      isActive,
    } = req.body;

    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Check if department exists (if departmentId is being updated)
    if (departmentId && departmentId !== employee.departmentId) {
      const department = await Department.findByPk(departmentId);
      if (!department) {
        return res.status(404).json({
          success: false,
          message: "Department not found",
        });
      }
    }

    // Check if employee ID already exists (if being updated)
    if (employeeId && employeeId !== employee.employeeId) {
      const existingEmployee = await Employee.findOne({
        where: {
          employeeId,
          id: { [Op.ne]: id },
        },
      });

      if (existingEmployee) {
        return res.status(400).json({
          success: false,
          message: "Employee ID already exists",
        });
      }
    }

    await employee.update({
      ...(employeeId && { employeeId }),
      ...(name && { name }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(departmentId && { departmentId }),
      ...(position !== undefined && { position }),
      ...(joinDate !== undefined && { joinDate }),
      ...(isActive !== undefined && { isActive }),
    });

    const updatedEmployee = await Employee.findByPk(id, {
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
      message: "Employee updated successfully",
      data: updatedEmployee,
    });
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update employee",
      error: error.message,
    });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Soft delete by setting isActive to false
    await employee.update({ isActive: false });

    res.json({
      success: true,
      message: "Employee deactivated successfully",
    });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete employee",
      error: error.message,
    });
  }
};

export const getEmployeesByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;

    const employees = await Employee.findAll({
      where: {
        departmentId,
        isActive: true,
      },
      include: [
        {
          model: Department,
          as: "department",
          attributes: ["id", "name"],
        },
      ],
      order: [["name", "ASC"]],
    });

    res.json({
      success: true,
      data: employees,
    });
  } catch (error) {
    console.error("Error fetching employees by department:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch employees",
      error: error.message,
    });
  }
};
