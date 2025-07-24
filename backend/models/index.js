import User from "./UserModel.js";
import Department from "./DepartmentModel.js";
import Food from "./FoodModel.js";
import DailyMenu from "./DailyMenuModel.js";
import Order from "./OrderModel.js";
import OrderItem from "./OrderItemModel.js";
import Feedback from "./FeedbackModel.js";
import WeeklySchedule from "./WeeklyScheduleModel.js";
import Voucher from "./VoucherModel.js";

// User associations
User.hasMany(Food, { foreignKey: "createdBy", as: "createdFoods" });
User.hasMany(DailyMenu, { foreignKey: "createdBy", as: "createdMenus" });
User.hasMany(Voucher, { foreignKey: "createdBy", as: "createdVouchers" });

// Department associations
Department.hasMany(Order, { foreignKey: "departmentId", as: "orders" });
Department.hasMany(Feedback, { foreignKey: "departmentId", as: "feedbacks" });
Department.hasMany(WeeklySchedule, {
  foreignKey: "departmentId",
  as: "schedules",
});
Department.hasMany(Voucher, { foreignKey: "departmentId", as: "vouchers" });

// Food associations
Food.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
Food.hasMany(DailyMenu, { foreignKey: "foodId", as: "dailyMenus" });
Food.hasMany(OrderItem, { foreignKey: "foodId", as: "orderItems" });

// DailyMenu associations
DailyMenu.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
DailyMenu.belongsTo(Food, { foreignKey: "foodId", as: "food" });

// Order associations
Order.belongsTo(Department, { foreignKey: "departmentId", as: "department" });
Order.hasMany(OrderItem, { foreignKey: "orderId", as: "items" });
Order.hasMany(Feedback, { foreignKey: "orderId", as: "feedbacks" });

// OrderItem associations
OrderItem.belongsTo(Order, { foreignKey: "orderId", as: "order" });
OrderItem.belongsTo(Food, { foreignKey: "foodId", as: "food" });

// Feedback associations
Feedback.belongsTo(Order, { foreignKey: "orderId", as: "order" });
Feedback.belongsTo(Department, {
  foreignKey: "departmentId",
  as: "department",
});

// WeeklySchedule associations
WeeklySchedule.belongsTo(Department, {
  foreignKey: "departmentId",
  as: "department",
});

// Voucher associations
Voucher.belongsTo(Department, { foreignKey: "departmentId", as: "department" });
Voucher.belongsTo(User, { foreignKey: "createdBy", as: "creator" });

export {
  User,
  Department,
  Food,
  DailyMenu,
  Order,
  OrderItem,
  Feedback,
  WeeklySchedule,
  Voucher,
};
