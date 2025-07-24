import database from "./config/database.js";
import seedDatabase from "./seeders/seed.js";
import "./models/index.js"; // Load models and associations

const runSeeder = async () => {
  try {
    console.log("Connecting to database...");
    await database.authenticate();
    console.log("✓ Database connected");

    console.log("Synchronizing database...");
    await database.sync({ force: false });
    console.log("✓ Database synchronized");

    await seedDatabase();

    console.log("\n✓ Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

runSeeder();
