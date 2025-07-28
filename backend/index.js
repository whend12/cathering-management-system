import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// Import routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import departmentRoutes from "./routes/departments.js";
import employeeRoutes from "./routes/employees.js";
import foodRoutes from "./routes/foods.js";
import orderRoutes from "./routes/orders.js";
import feedbackRoutes from "./routes/feedbacks.js";
import reportRoutes from "./routes/reports.js";
import scheduleRoutes from "./routes/schedules.js";
import voucherRoutes from "./routes/vouchers.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/feedbacks", feedbackRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/vouchers", voucherRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Catering API is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
// app.use("/*", (req, res) => {
//   res.status(404).json({
//     success: false,
//     message: "Endpoint not found",
//   });
// });

// Error handler
app.use((error, req, res, next) => {
  console.error("Error:", error);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

export default app;
