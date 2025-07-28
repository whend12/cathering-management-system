import dotenv from "dotenv";

dotenv.config();

import app from "./index.js";
import database from "./config/database.js";
// Import models to ensure associations are loaded
import "./models/index.js";

const PORT = process.env.API_PORT || 3000;

const startServer = async () => {
  try {
    await database.authenticate();
    console.log("Database connection established successfully.");

    // Sync database (create tables)
    // await database.sync({ alter: true });
    console.log("Database synchronized successfully.");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

startServer();
