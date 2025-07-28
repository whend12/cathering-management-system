import { Sequelize } from "sequelize";
import database from "../config/database.js";

const { DataTypes } = Sequelize;

const Department = database.define(
  "departments",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    picName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    canOrder: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    orderSequence: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },
    pin: {
      type: DataTypes.STRING(6),
      allowNull: true,
      unique: true,
      comment: "6-digit PIN for department to order food",
    },
  },
  {
    timestamps: true,
    tableName: "departments",
  }
);

export default Department;
