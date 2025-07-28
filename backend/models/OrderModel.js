import { Sequelize } from "sequelize";
import database from "../config/database.js";

const { DataTypes } = Sequelize;

const Order = database.define(
  "orders",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "departments",
        key: "id",
      },
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM("pending", "confirmed", "cancelled", "completed"),
      allowNull: false,
      defaultValue: "pending",
    },
    employeeCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "Number of employees eating from this department",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isEditable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    editRequestReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    editRequestStatus: {
      type: DataTypes.ENUM("none", "pending", "approved", "rejected"),
      defaultValue: "none",
    },
  },
  {
    timestamps: true,
    tableName: "orders",
    indexes: [
      {
        unique: true,
        fields: ["departmentId", "date"],
      },
    ],
  }
);

export default Order;
