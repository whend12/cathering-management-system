import { Sequelize } from "sequelize";
import database from "../config/database.js";

const { DataTypes } = Sequelize;

const WeeklySchedule = database.define(
  "weekly_schedules",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    weekStartDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "Monday of the week",
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "departments",
        key: "id",
      },
    },
    voucherDay: {
      type: DataTypes.ENUM(
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday"
      ),
      allowNull: false,
      comment: "Day when department gets voucher instead of catering",
    },
    weekNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Week number in the year",
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "weekly_schedules",
    indexes: [
      {
        unique: true,
        fields: ["weekStartDate", "departmentId"],
      },
      {
        fields: ["year", "weekNumber"],
      },
    ],
  }
);

export default WeeklySchedule;
