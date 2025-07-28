import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User, Department } from "../models/index.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email dan password wajib diisi",
      });
    }

    const user = await User.findOne({
      where: {
        email: email,
        isActive: true,
      },
      include: [
        {
          model: Department,
          as: "department",
          attributes: ["id", "name", "canOrder"],
        },
      ],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        departmentId: user.departmentId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      message: "Login berhasil",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          pin: user.pin,
          role: user.role,
          departmentId: user.departmentId,
          department: user.department,
          isActive: user.isActive,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

export const loginWithPin = async (req, res) => {
  try {
    const { pin } = req.body;

    if (!pin) {
      return res.status(400).json({
        success: false,
        message: "PIN wajib diisi",
      });
    }

    // Validate PIN format
    if (!/^\d{6}$/.test(pin)) {
      return res.status(400).json({
        success: false,
        message: "PIN harus berupa 6 digit angka",
      });
    }

    // Find department with the provided PIN
    const department = await Department.findOne({
      where: {
        pin: pin,
        isActive: true,
        canOrder: true,
      },
    });

    if (!department) {
      return res.status(401).json({
        success: false,
        message:
          "PIN tidak valid atau departemen tidak dapat melakukan pemesanan",
      });
    }

    // Create a temporary token for department-based ordering
    const token = jwt.sign(
      {
        departmentId: department.id,
        role: "department_order",
        type: "pin_login",
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      message: "Login departemen berhasil",
      data: {
        token,
        department: {
          id: department.id,
          name: department.name,
          description: department.description,
          picName: department.picName,
          canOrder: department.canOrder,
        },
        type: "department_login",
      },
    });
  } catch (error) {
    console.error("PIN login error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password, pin, departmentId, role } = req.body;

    if (!name || !email || !password || !pin) {
      return res.status(400).json({
        success: false,
        message: "Nama, email, password, dan PIN wajib diisi",
      });
    }

    // Validate PIN format
    if (!/^\d{6}$/.test(pin)) {
      return res.status(400).json({
        success: false,
        message: "PIN harus berupa 6 digit angka",
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email sudah digunakan",
      });
    }

    const existingPin = await User.findOne({ where: { pin } });
    if (existingPin) {
      return res.status(409).json({
        success: false,
        message: "PIN sudah digunakan",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      pin,
      departmentId,
      role: role || "pic_catering",
    });

    // Get user with department info
    const createdUser = await User.findByPk(user.id, {
      include: [
        {
          model: Department,
          as: "department",
          attributes: ["id", "name", "canOrder"],
        },
      ],
      attributes: { exclude: ["password"] },
    });

    res.status(201).json({
      success: true,
      message: "User berhasil didaftarkan",
      data: {
        user: createdUser,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    // Handle department login
    if (req.user.type === "department_login") {
      return res.json({
        success: true,
        data: {
          id: req.user.id,
          name: req.user.name,
          email: null,
          role: req.user.role,
          departmentId: req.user.departmentId,
          department: req.user.department,
          isActive: req.user.isActive,
          type: "department_login",
        },
      });
    }

    // Handle regular user login
    const user = await User.findByPk(req.user.id, {
      include: [
        {
          model: Department,
          as: "department",
          attributes: ["id", "name", "canOrder"],
        },
      ],
      attributes: { exclude: ["password"] },
    });

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};
