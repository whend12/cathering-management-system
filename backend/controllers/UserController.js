import { User, Department } from "../models/index.js";
import bcrypt from "bcrypt";

const UserController = {
  // Get all users
  getAllUsers: async (req, res) => {
    try {
      const users = await User.findAll({
        include: [
          {
            model: Department,
            as: "department",
            attributes: ["id", "name"],
          },
        ],
        attributes: { exclude: ["password"] },
        order: [["createdAt", "DESC"]],
      });

      res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({
        success: false,
        message: "Gagal mengambil data user",
      });
    }
  },

  // Get user by ID
  getUserById: async (req, res) => {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id, {
        include: [
          {
            model: Department,
            as: "department",
            attributes: ["id", "name"],
          },
        ],
        attributes: { exclude: ["password"] },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User tidak ditemukan",
        });
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({
        success: false,
        message: "Gagal mengambil data user",
      });
    }
  },

  // Create new user
  createUser: async (req, res) => {
    try {
      const {
        name,
        email,
        password,
        pin,
        departmentId,
        role = "user",
      } = req.body;

      // Validate required fields
      if (!name || !email || !password || !pin) {
        return res.status(400).json({
          success: false,
          message: "Nama, email, password, dan PIN wajib diisi",
        });
      }

      // Validate PIN format (6 digits)
      if (!/^\d{6}$/.test(pin)) {
        return res.status(400).json({
          success: false,
          message: "PIN harus berupa 6 digit angka",
        });
      }

      // Check if email already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email sudah digunakan",
        });
      }

      // Check if PIN already exists
      const existingPin = await User.findOne({ where: { pin } });
      if (existingPin) {
        return res.status(400).json({
          success: false,
          message: "PIN sudah digunakan",
        });
      }

      // Check if department exists (if provided)
      if (departmentId) {
        const department = await Department.findByPk(departmentId);
        if (!department) {
          return res.status(400).json({
            success: false,
            message: "Departemen tidak ditemukan",
          });
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        pin,
        departmentId,
        role,
      });

      // Return user without password
      const createdUser = await User.findByPk(user.id, {
        include: [
          {
            model: Department,
            as: "department",
            attributes: ["id", "name"],
          },
        ],
        attributes: { exclude: ["password"] },
      });

      res.status(201).json({
        success: true,
        message: "User berhasil dibuat",
        data: createdUser,
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({
        success: false,
        message: "Gagal membuat user",
      });
    }
  },

  // Update user
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, pin, departmentId, role, isActive } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User tidak ditemukan",
        });
      }

      // Check if email is being changed and already exists
      if (email && email !== user.email) {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: "Email sudah digunakan",
          });
        }
      }

      // Check if PIN is being changed and already exists
      if (pin && pin !== user.pin) {
        if (!/^\d{6}$/.test(pin)) {
          return res.status(400).json({
            success: false,
            message: "PIN harus berupa 6 digit angka",
          });
        }

        const existingPin = await User.findOne({ where: { pin } });
        if (existingPin) {
          return res.status(400).json({
            success: false,
            message: "PIN sudah digunakan",
          });
        }
      }

      // Check if department exists (if provided)
      if (departmentId) {
        const department = await Department.findByPk(departmentId);
        if (!department) {
          return res.status(400).json({
            success: false,
            message: "Departemen tidak ditemukan",
          });
        }
      }

      // Update user
      await user.update({
        name: name || user.name,
        email: email || user.email,
        pin: pin || user.pin,
        departmentId:
          departmentId !== undefined ? departmentId : user.departmentId,
        role: role || user.role,
        isActive: isActive !== undefined ? isActive : user.isActive,
      });

      // Return updated user
      const updatedUser = await User.findByPk(id, {
        include: [
          {
            model: Department,
            as: "department",
            attributes: ["id", "name"],
          },
        ],
        attributes: { exclude: ["password"] },
      });

      res.json({
        success: true,
        message: "User berhasil diupdate",
        data: updatedUser,
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({
        success: false,
        message: "Gagal mengupdate user",
      });
    }
  },

  // Delete user
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User tidak ditemukan",
        });
      }

      await user.destroy();

      res.json({
        success: true,
        message: "User berhasil dihapus",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({
        success: false,
        message: "Gagal menghapus user",
      });
    }
  },

  // Get users by department
  getUsersByDepartment: async (req, res) => {
    try {
      const { departmentId } = req.params;

      const users = await User.findAll({
        where: { departmentId },
        include: [
          {
            model: Department,
            as: "department",
            attributes: ["id", "name"],
          },
        ],
        attributes: { exclude: ["password"] },
        order: [["name", "ASC"]],
      });

      res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      console.error("Error fetching department users:", error);
      res.status(500).json({
        success: false,
        message: "Gagal mengambil data user departemen",
      });
    }
  },

  // Generate random PIN
  generatePin: async (req, res) => {
    try {
      let pin;
      let attempts = 0;
      const maxAttempts = 100;

      // Generate unique PIN
      do {
        pin = Math.floor(100000 + Math.random() * 900000).toString();
        attempts++;

        const existing = await User.findOne({ where: { pin } });
        if (!existing) break;

        if (attempts >= maxAttempts) {
          return res.status(500).json({
            success: false,
            message: "Gagal generate PIN unik",
          });
        }
      } while (attempts < maxAttempts);

      res.json({
        success: true,
        data: { pin },
      });
    } catch (error) {
      console.error("Error generating PIN:", error);
      res.status(500).json({
        success: false,
        message: "Gagal generate PIN",
      });
    }
  },

  // Reset user password
  resetPassword: async (req, res) => {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password baru harus minimal 6 karakter",
        });
      }

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User tidak ditemukan",
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await user.update({ password: hashedPassword });

      res.json({
        success: true,
        message: "Password berhasil direset",
      });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({
        success: false,
        message: "Gagal reset password",
      });
    }
  },
};

export default UserController;
