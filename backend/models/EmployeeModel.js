import { Sequelize } from "sequelize";
import database from "../config/database.js";

const { DataTypes } = Sequelize;

const Employee = database.define(
  "employees",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    employeeId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: "Employee ID from company system",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "departments",
        key: "id",
      },
    },
    position: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    joinDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      comment: "PIC Catering who added this employee",
    },
  },
  {
    timestamps: true,
    tableName: "employees",
    indexes: [
      {
        fields: ["departmentId"],
      },
      {
        fields: ["employeeId"],
      },
      {
        fields: ["isActive"],
      },
    ],
  }
);

export default Employee;
