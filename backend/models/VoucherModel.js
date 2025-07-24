import { Sequelize } from "sequelize";
import database from "../config/database.js";

const { DataTypes } = Sequelize;

const Voucher = database.define(
  "vouchers",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    voucherCode: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "departments",
        key: "id",
      },
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "Date when voucher is valid",
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: "Voucher amount/value",
    },
    status: {
      type: DataTypes.ENUM("active", "used", "expired"),
      allowNull: false,
      defaultValue: "active",
    },
    usedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    expiryDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "Voucher expiry date",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    timestamps: true,
    tableName: "vouchers",
    indexes: [
      {
        unique: true,
        fields: ["departmentId", "date"],
      },
      {
        fields: ["voucherCode"],
      },
      {
        fields: ["status"],
      },
    ],
  }
);

export default Voucher;
