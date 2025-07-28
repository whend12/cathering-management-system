import jwt from "jsonwebtoken";
import { User, Department } from "../models/index.js";

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token akses diperlukan",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Handle department-based PIN login
    if (decoded.type === "pin_login" && decoded.role === "department_order") {
      const department = await Department.findByPk(decoded.departmentId);

      if (!department || !department.isActive || !department.canOrder) {
        return res.status(401).json({
          success: false,
          message:
            "Departemen tidak valid atau tidak dapat melakukan pemesanan",
        });
      }

      // Create a user-like object for department login
      req.user = {
        id: `dept_${department.id}`,
        name: department.picName,
        role: decoded.role,
        departmentId: department.id,
        department: department,
        isActive: true,
        type: "department_login",
      };

      next();
      return;
    }

    // Handle regular user login
    if (decoded.userId) {
      const user = await User.findByPk(decoded.userId, {
        include: [
          {
            model: Department,
            as: "department",
            attributes: ["id", "name", "canOrder"],
          },
        ],
        attributes: { exclude: ["password"] },
      });

      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: "User tidak valid atau tidak aktif",
        });
      }

      req.user = user;
      next();
      return;
    }

    // Invalid token structure
    return res.status(403).json({
      success: false,
      message: "Token tidak valid",
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Token tidak valid atau expired",
    });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Autentikasi diperlukan",
      });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Izin tidak mencukupi",
      });
    }

    next();
  };
};

// Alias for better naming
export const authorizeRoles = requireRole;

export const requirePic = requireRole(["pic_catering"]);
export const requireAdmin = requireRole(["administrator"]);
export const requireAdminOrPic = requireRole(["administrator", "pic_catering"]);
export const requireDepartmentOrder = requireRole(["department_order"]);
export const requireAnyAuth = requireRole([
  "administrator",
  "pic_catering",
  "department_order",
]);
