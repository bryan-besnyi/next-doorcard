#!/usr/bin/env node

/**
 * Data Migration Script: CSV/Access DB → PostgreSQL
 * Run: node scripts/data-migration.js
 */

import { PrismaClient } from "@prisma/client";
import fs from "fs";
import csv from "csv-parser";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function migrateCsvData() {
  console.log("🚀 Starting data migration...");

  try {
    // 1. Migrate Users (if you have them in CSV)
    if (fs.existsSync("./migration-data/users.csv")) {
      console.log("📊 Migrating users...");
      await migrateUsers();
    }

    // 2. Migrate Doorcards
    if (fs.existsSync("./migration-data/doorcards.csv")) {
      console.log("🚪 Migrating doorcards...");
      await migrateDoorcards();
    }

    console.log("✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function migrateUsers() {
  const users = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream("./migration-data/users.csv")
      .pipe(csv())
      .on("data", (row) => {
        // Map CSV columns to your schema
        users.push({
          name: row.name || row.full_name,
          email: row.email,
          // Generate temporary password - users will login via OneLogin
          password: "TEMP_PASSWORD_ONELOGIN",
        });
      })
      .on("end", async () => {
        try {
          for (const user of users) {
            await prisma.user.upsert({
              where: { email: user.email },
              update: user,
              create: {
                ...user,
                password: await bcrypt.hash(user.password, 10),
              },
            });
          }
          console.log(`✅ Migrated ${users.length} users`);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
  });
}

async function migrateDoorcards() {
  const doorcards = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream("./migration-data/doorcards.csv")
      .pipe(csv())
      .on("data", (row) => {
        // Parse timeblocks from CSV (adjust based on your CSV structure)
        const timeBlocks = parseTimeBlocks(row);

        doorcards.push({
          name: row.faculty_name || row.name,
          doorcardName:
            row.doorcard_name || `${row.name} - ${row.term} ${row.year}`,
          officeNumber: row.office_number || row.office,
          term: row.term || "Fall",
          year: row.year || new Date().getFullYear().toString(),
          timeBlocks: timeBlocks,
          userEmail: row.email, // We'll link by email
        });
      })
      .on("end", async () => {
        try {
          for (const doorcard of doorcards) {
            // Find user by email
            const user = await prisma.user.findUnique({
              where: { email: doorcard.userEmail },
            });

            if (user) {
              await prisma.doorcard.create({
                data: {
                  name: doorcard.name,
                  doorcardName: doorcard.doorcardName,
                  officeNumber: doorcard.officeNumber,
                  term: doorcard.term,
                  year: doorcard.year,
                  timeBlocks: doorcard.timeBlocks,
                  userId: user.id,
                },
              });
            } else {
              console.warn(
                `⚠️  User not found for email: ${doorcard.userEmail}`
              );
            }
          }
          console.log(`✅ Migrated ${doorcards.length} doorcards`);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
  });
}

function parseTimeBlocks(row) {
  // Example parsing - adjust based on your CSV structure
  const timeBlocks = [];

  // Assuming columns like: monday_start, monday_end, monday_activity, etc.
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday"];

  days.forEach((day) => {
    const startTime = row[`${day}_start`];
    const endTime = row[`${day}_end`];
    const activity = row[`${day}_activity`];

    if (startTime && endTime) {
      timeBlocks.push({
        id: `${day}_${Date.now()}`,
        day: day.charAt(0).toUpperCase() + day.slice(1),
        startTime,
        endTime,
        activity: activity || "Office Hours",
      });
    }
  });

  return timeBlocks;
}

// Helper function to validate CSV structure
function validateCsvStructure() {
  console.log("🔍 Validating CSV structure...");

  const requiredFiles = [
    "./migration-data/doorcards.csv",
    // './migration-data/users.csv' // Optional if using OneLogin JIT
  ];

  const missingFiles = requiredFiles.filter((file) => !fs.existsSync(file));

  if (missingFiles.length > 0) {
    console.error("❌ Missing required CSV files:", missingFiles);
    console.log("📁 Expected structure:");
    console.log("   migration-data/");
    console.log("   ├── doorcards.csv");
    console.log("   └── users.csv (optional)");
    process.exit(1);
  }
}

// Run migration
if (require.main === module) {
  validateCsvStructure();
  migrateCsvData();
}

export { migrateCsvData, parseTimeBlocks };
