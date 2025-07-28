import { Sequelize } from "sequelize";
import database from "../config/database.js";

const { DataTypes } = Sequelize;

const User = database.define(
  "users",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pin: {
      type: DataTypes.STRING(6),
      allowNull: true,
      unique: true,
      validate: {
        isNumeric: true,
        len: [6, 6],
      },
      comment: "6-digit PIN for quick login",
    },
    role: {
      type: DataTypes.ENUM("administrator", "pic_catering"),
      allowNull: false,
      defaultValue: "pic_catering",
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "departments",
        key: "id",
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    timestamps: true,
    tableName: "users",
  }
);

export default User;
