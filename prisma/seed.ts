const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  const hashedPassword = await bcrypt.hash("password123", 12);

  const existingUser = await prisma.user.findUnique({
    where: { email: "besnyib@smccd.edu" },
  });

  if (existingUser) {
    console.log("✅ User besnyib@smccd.edu already exists");
    return;
  }

  // Create the hardcoded user
  const user = await prisma.user.create({
    data: {
      name: "Benjamin Besnyik",
      email: "besnyib@smccd.edu",
      password: hashedPassword,
      role: "FACULTY",
      college: "SKYLINE",
    },
  });

  console.log("✅ Created user:", user.email);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
