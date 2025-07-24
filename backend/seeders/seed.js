import bcrypt from "bcrypt";
import {
  User,
  Department,
  Food,
  WeeklySchedule,
  Voucher,
} from "../models/index.js";

const seedDatabase = async () => {
  try {
    console.log("Starting database seeding...");

    // Create default users
    const hashedPassword = await bcrypt.hash("password123", 10);

    const admin = await User.findOrCreate({
      where: { email: "admin@catering.com" },
      defaults: {
        name: "Administrator",
        email: "admin@catering.com",
        password: hashedPassword,
        role: "administrator",
      },
    });

    const picCatering = await User.findOrCreate({
      where: { email: "pic@catering.com" },
      defaults: {
        name: "PIC Catering",
        email: "pic@catering.com",
        password: hashedPassword,
        role: "pic_catering",
      },
    });

    console.log("✓ Default users created");

    // Create departments
    const departments = [
      { name: "IT Department", pin: "123456", orderSequence: 1 },
      { name: "Finance Department", pin: "234567", orderSequence: 2 },
      { name: "HR Department", pin: "345678", orderSequence: 3 },
      { name: "Marketing Department", pin: "456789", orderSequence: 4 },
      { name: "Operations Department", pin: "567890", orderSequence: 5 },
    ];

    for (const dept of departments) {
      await Department.findOrCreate({
        where: { name: dept.name },
        defaults: dept,
      });
    }

    console.log("✓ Departments created");

    // Create sample foods
    const userId = picCatering[0].id;

    const foods = [
      // Main Course
      {
        name: "Nasi Gudeg Yogya",
        description: "Nasi gudeg khas Yogyakarta dengan ayam dan telur",
        price: 25000,
        category: "main_course",
        createdBy: userId,
      },
      {
        name: "Nasi Padang",
        description: "Nasi dengan lauk pauk khas Padang",
        price: 30000,
        category: "main_course",
        createdBy: userId,
      },
      {
        name: "Nasi Ayam Bakar",
        description: "Nasi dengan ayam bakar bumbu kecap",
        price: 28000,
        category: "main_course",
        createdBy: userId,
      },
      {
        name: "Nasi Rendang",
        description: "Nasi dengan rendang daging sapi",
        price: 35000,
        category: "main_course",
        createdBy: userId,
      },
      {
        name: "Nasi Liwet Solo",
        description: "Nasi liwet khas Solo dengan lauk komplit",
        price: 27000,
        category: "main_course",
        createdBy: userId,
      },

      // Side Dish
      {
        name: "Gado-gado",
        description: "Salad sayuran dengan bumbu kacang",
        price: 15000,
        category: "side_dish",
        createdBy: userId,
      },
      {
        name: "Kerupuk Udang",
        description: "Kerupuk udang crispy",
        price: 5000,
        category: "side_dish",
        createdBy: userId,
      },
      {
        name: "Lalapan",
        description: "Sayuran segar dengan sambal",
        price: 8000,
        category: "side_dish",
        createdBy: userId,
      },
      {
        name: "Tempe Goreng",
        description: "Tempe goreng tepung crispy",
        price: 7000,
        category: "side_dish",
        createdBy: userId,
      },
      {
        name: "Tahu Isi",
        description: "Tahu isi sayuran goreng",
        price: 10000,
        category: "side_dish",
        createdBy: userId,
      },

      // Drinks
      {
        name: "Es Teh Manis",
        description: "Es teh manis segar",
        price: 5000,
        category: "drink",
        createdBy: userId,
      },
      {
        name: "Es Jeruk",
        description: "Es jeruk peras segar",
        price: 8000,
        category: "drink",
        createdBy: userId,
      },
      {
        name: "Es Kelapa Muda",
        description: "Es kelapa muda segar",
        price: 12000,
        category: "drink",
        createdBy: userId,
      },
      {
        name: "Jus Alpukat",
        description: "Jus alpukat dengan susu",
        price: 15000,
        category: "drink",
        createdBy: userId,
      },
      {
        name: "Kopi Tubruk",
        description: "Kopi tubruk tradisional",
        price: 7000,
        category: "drink",
        createdBy: userId,
      },

      // Desserts
      {
        name: "Es Cendol",
        description: "Es cendol dengan santan dan gula merah",
        price: 10000,
        category: "dessert",
        createdBy: userId,
      },
      {
        name: "Kolak Pisang",
        description: "Kolak pisang dengan santan",
        price: 8000,
        category: "dessert",
        createdBy: userId,
      },
      {
        name: "Bubur Kacang Hijau",
        description: "Bubur kacang hijau dengan santan",
        price: 9000,
        category: "dessert",
        createdBy: userId,
      },
      {
        name: "Es Doger",
        description: "Es doger dengan berbagai topping",
        price: 12000,
        category: "dessert",
        createdBy: userId,
      },
      {
        name: "Klepon",
        description: "Klepon dengan gula merah dan kelapa",
        price: 6000,
        category: "dessert",
        createdBy: userId,
      },
    ];

    for (const food of foods) {
      await Food.findOrCreate({
        where: { name: food.name },
        defaults: food,
      });
    }

    console.log("✓ Sample foods created");

    // Generate sample schedules for current week
    const today = new Date();
    const monday = new Date(today);
    const day = monday.getDay();
    const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
    monday.setDate(diff);

    const weekStartDate = monday.toISOString().split("T")[0];
    const weekNumber = Math.ceil(
      (monday - new Date(monday.getFullYear(), 0, 1)) / 604800000
    );
    const year = monday.getFullYear();

    // Create initial schedules with different voucher days
    const voucherDays = [
      "friday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
    ];

    const createdDepartments = await Department.findAll({
      order: [["orderSequence", "ASC"]],
    });

    for (let i = 0; i < createdDepartments.length; i++) {
      const dept = createdDepartments[i];
      const voucherDay = voucherDays[i % voucherDays.length];

      await WeeklySchedule.findOrCreate({
        where: {
          weekStartDate: weekStartDate,
          departmentId: dept.id,
        },
        defaults: {
          weekStartDate: weekStartDate,
          departmentId: dept.id,
          voucherDay: voucherDay,
          weekNumber: weekNumber,
          year: year,
        },
      });
    }

    console.log("✓ Sample weekly schedules created");

    // Generate sample vouchers based on schedules
    const schedules = await WeeklySchedule.findAll({
      where: { weekStartDate: weekStartDate },
    });

    for (const schedule of schedules) {
      const mondayDate = new Date(schedule.weekStartDate);
      const dayIndex = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ].indexOf(schedule.voucherDay);
      const voucherDate = new Date(mondayDate);
      voucherDate.setDate(mondayDate.getDate() + dayIndex);

      const expiryDate = new Date(voucherDate);
      expiryDate.setDate(expiryDate.getDate() + 7);

      const voucherCode = `VOUCHER${voucherDate
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, "")}${Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase()}`;

      await Voucher.findOrCreate({
        where: {
          departmentId: schedule.departmentId,
          date: voucherDate.toISOString().split("T")[0],
        },
        defaults: {
          voucherCode: voucherCode,
          departmentId: schedule.departmentId,
          date: voucherDate.toISOString().split("T")[0],
          amount: 50000,
          expiryDate: expiryDate.toISOString().split("T")[0],
          createdBy: picCatering[0].id,
          notes: `Sample voucher for week of ${weekStartDate}`,
        },
      });
    }

    console.log("✓ Sample vouchers created");
    console.log("Database seeding completed successfully!");

    console.log("\n=== LOGIN CREDENTIALS ===");
    console.log("Administrator:");
    console.log("Email: admin@catering.com");
    console.log("Password: password123");
    console.log("\nPIC Catering:");
    console.log("Email: pic@catering.com");
    console.log("Password: password123");

    console.log("\n=== DEPARTMENT PINS ===");
    departments.forEach((dept) => {
      console.log(`${dept.name}: ${dept.pin}`);
    });
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

export default seedDatabase;
