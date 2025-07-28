import bcrypt from "bcrypt";
import {
  User,
  Department,
  Employee,
  Food,
  WeeklySchedule,
  Voucher,
} from "../models/index.js";

// Helper function to generate random 6-digit PIN
const generatePin = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const seedDatabase = async () => {
  try {
    console.log("Starting database seeding...");

    const hashedPassword = await bcrypt.hash("password123", 10);

    // Create departments first
    const departments = [
      {
        name: "IT Department",
        description: "Information Technology Department",
        picName: "John Doe",
        canOrder: true,
        orderSequence: 1,
      },
      {
        name: "Finance Department",
        description: "Finance and Accounting Department",
        picName: "Jane Smith",
        canOrder: true,
        orderSequence: 2,
      },
      {
        name: "HR Department",
        description: "Human Resources Department",
        picName: "Mike Johnson",
        canOrder: true,
        orderSequence: 3,
      },
      {
        name: "Marketing Department",
        description: "Marketing and Sales Department",
        picName: "Sarah Wilson",
        canOrder: true,
        orderSequence: 4,
      },
      {
        name: "Operations Department",
        description: "Operations and Production Department",
        picName: "David Brown",
        canOrder: true,
        orderSequence: 5,
      },
    ];

    const createdDepartments = [];
    for (const dept of departments) {
      // Generate unique PIN for each department
      let pin;
      let isUnique = false;

      while (!isUnique) {
        pin = generatePin();
        const existingPin = await Department.findOne({ where: { pin } });
        if (!existingPin) {
          isUnique = true;
        }
      }

      const [department, created] = await Department.findOrCreate({
        where: { name: dept.name },
        defaults: { ...dept, pin },
      });

      // Update PIN if department already exists but doesn't have one
      if (!created && !department.pin) {
        await department.update({ pin });
      }

      createdDepartments.push(department);
    }

    console.log("✓ Departments created");

    // Create default users - only Administrator and PIC Catering
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

    // Create sample employees for each department
    const sampleEmployees = [
      // IT Department employees
      {
        employeeId: "EMP001",
        name: "John Doe",
        email: "john.doe@company.com",
        phone: "08123456001",
        departmentId: createdDepartments[0].id,
        position: "Software Developer",
        joinDate: new Date("2023-01-15"),
        createdBy: picCatering[0].id,
      },
      {
        employeeId: "EMP002",
        name: "Alice Cooper",
        email: "alice.cooper@company.com",
        phone: "08123456002",
        departmentId: createdDepartments[0].id,
        position: "System Administrator",
        joinDate: new Date("2023-02-01"),
        createdBy: picCatering[0].id,
      },
      {
        employeeId: "EMP003",
        name: "Bob Wilson",
        email: "bob.wilson@company.com",
        phone: "08123456003",
        departmentId: createdDepartments[0].id,
        position: "Database Administrator",
        joinDate: new Date("2023-03-10"),
        createdBy: picCatering[0].id,
      },

      // Finance Department employees
      {
        employeeId: "EMP004",
        name: "Jane Smith",
        email: "jane.smith@company.com",
        phone: "08123456004",
        departmentId: createdDepartments[1].id,
        position: "Financial Analyst",
        joinDate: new Date("2023-01-20"),
        createdBy: picCatering[0].id,
      },
      {
        employeeId: "EMP005",
        name: "Charlie Brown",
        email: "charlie.brown@company.com",
        phone: "08123456005",
        departmentId: createdDepartments[1].id,
        position: "Accountant",
        joinDate: new Date("2023-02-15"),
        createdBy: picCatering[0].id,
      },

      // HR Department employees
      {
        employeeId: "EMP006",
        name: "Mike Johnson",
        email: "mike.johnson@company.com",
        phone: "08123456006",
        departmentId: createdDepartments[2].id,
        position: "HR Manager",
        joinDate: new Date("2023-01-10"),
        createdBy: picCatering[0].id,
      },
      {
        employeeId: "EMP007",
        name: "Diana Prince",
        email: "diana.prince@company.com",
        phone: "08123456007",
        departmentId: createdDepartments[2].id,
        position: "Recruitment Specialist",
        joinDate: new Date("2023-03-01"),
        createdBy: picCatering[0].id,
      },

      // Marketing Department employees
      {
        employeeId: "EMP008",
        name: "Sarah Wilson",
        email: "sarah.wilson@company.com",
        phone: "08123456008",
        departmentId: createdDepartments[3].id,
        position: "Marketing Manager",
        joinDate: new Date("2023-01-25"),
        createdBy: picCatering[0].id,
      },
      {
        employeeId: "EMP009",
        name: "Elvis Presley",
        email: "elvis.presley@company.com",
        phone: "08123456009",
        departmentId: createdDepartments[3].id,
        position: "Digital Marketing Specialist",
        joinDate: new Date("2023-02-20"),
        createdBy: picCatering[0].id,
      },

      // Operations Department employees
      {
        employeeId: "EMP010",
        name: "David Brown",
        email: "david.brown@company.com",
        phone: "08123456010",
        departmentId: createdDepartments[4].id,
        position: "Operations Manager",
        joinDate: new Date("2023-01-05"),
        createdBy: picCatering[0].id,
      },
      {
        employeeId: "EMP011",
        name: "Frank Sinatra",
        email: "frank.sinatra@company.com",
        phone: "08123456011",
        departmentId: createdDepartments[4].id,
        position: "Production Supervisor",
        joinDate: new Date("2023-03-15"),
        createdBy: picCatering[0].id,
      },
    ];

    for (const empData of sampleEmployees) {
      await Employee.findOrCreate({
        where: { employeeId: empData.employeeId },
        defaults: empData,
      });
    }

    console.log("✓ Sample employees created");

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

    const allDepartments = await Department.findAll({
      order: [["orderSequence", "ASC"]],
    });

    for (let i = 0; i < allDepartments.length; i++) {
      const dept = allDepartments[i];
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
    for (const dept of createdDepartments) {
      console.log(`${dept.name}: ${dept.pin}`);
    }

    console.log("\n=== FLOW INFORMATION ===");
    console.log("1. Only Administrator & PIC Catering need to login");
    console.log("2. Department food ordering is done using PIN");
    console.log("3. Each department has employees managed by PIC Catering");
    console.log("4. Orders include employee count for each department");
    console.log("5. PIN-based ordering for department representatives");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

export default seedDatabase;
