import { PrismaClient } from "@prisma/client";
import { DayOfWeek, AppointmentCategory, College } from "@prisma/client";

const prismaForSeed = new PrismaClient();

// Sample faculty data
const facultyData = [
  // Skyline College
  {
    name: "Benjamin Besnyik",
    email: "besnyik@smccd.edu",
    college: College.SKYLINE,
    dept: "Computer Science",
  },
  {
    name: "Dr. Sarah Johnson",
    email: "sjohnson@smccd.edu",
    college: College.SKYLINE,
    dept: "Mathematics",
  },
  {
    name: "Prof. Michael Chen",
    email: "mchen@smccd.edu",
    college: College.SKYLINE,
    dept: "Engineering",
  },
  {
    name: "Dr. Lisa Rodriguez",
    email: "lrodriguez@smccd.edu",
    college: College.SKYLINE,
    dept: "Biology",
  },
  {
    name: "Prof. James Wilson",
    email: "jwilson@smccd.edu",
    college: College.SKYLINE,
    dept: "History",
  },
  {
    name: "Dr. Maria Garcia",
    email: "mgarcia@smccd.edu",
    college: College.SKYLINE,
    dept: "English",
  },
  {
    name: "Prof. David Kim",
    email: "dkim@smccd.edu",
    college: College.SKYLINE,
    dept: "Physics",
  },
  {
    name: "Dr. Amanda Thompson",
    email: "athompson@smccd.edu",
    college: College.SKYLINE,
    dept: "Psychology",
  },
  {
    name: "Prof. Robert Martinez",
    email: "rmartinez@smccd.edu",
    college: College.SKYLINE,
    dept: "Art",
  },
  {
    name: "Dr. Jennifer Lee",
    email: "jlee@smccd.edu",
    college: College.SKYLINE,
    dept: "Chemistry",
  },

  // College of San Mateo
  {
    name: "Dr. Carlos Gonzalez",
    email: "cgonzalez@smccd.edu",
    college: College.CSM,
    dept: "Spanish",
  },
  {
    name: "Prof. Michelle Davis",
    email: "mdavis@smccd.edu",
    college: College.CSM,
    dept: "Nursing",
  },
  {
    name: "Dr. Thomas Wilson",
    email: "twilson@smccd.edu",
    college: College.CSM,
    dept: "Engineering",
  },
  {
    name: "Prof. Angela Brown",
    email: "abrown@smccd.edu",
    college: College.CSM,
    dept: "Sociology",
  },
  {
    name: "Dr. Hassan Ahmed",
    email: "hahmed@smccd.edu",
    college: College.CSM,
    dept: "Economics",
  },
  {
    name: "Prof. Rachel Green",
    email: "rgreen@smccd.edu",
    college: College.CSM,
    dept: "Environmental Science",
  },
  {
    name: "Dr. Jonathan Taylor",
    email: "jtaylor@smccd.edu",
    college: College.CSM,
    dept: "Political Science",
  },
  {
    name: "Prof. Nicole Anderson",
    email: "nanderson@smccd.edu",
    college: College.CSM,
    dept: "Anthropology",
  },
  {
    name: "Dr. Christopher Miller",
    email: "cmiller@smccd.edu",
    college: College.CSM,
    dept: "Philosophy",
  },
  {
    name: "Prof. Stephanie Clark",
    email: "sclark@smccd.edu",
    college: College.CSM,
    dept: "Music",
  },

  // Cañada College
  {
    name: "Dr. Ricardo Morales",
    email: "rmorales@smccd.edu",
    college: College.CANADA,
    dept: "Communications",
  },
  {
    name: "Prof. Patricia Lewis",
    email: "plewis@smccd.edu",
    college: College.CANADA,
    dept: "Early Childhood Education",
  },
  {
    name: "Dr. Matthew Jackson",
    email: "mjackson@smccd.edu",
    college: College.CANADA,
    dept: "Kinesiology",
  },
  {
    name: "Prof. Samantha Young",
    email: "syoung@smccd.edu",
    college: College.CANADA,
    dept: "Astronomy",
  },
  {
    name: "Dr. Daniel Garcia",
    email: "dgarcia@smccd.edu",
    college: College.CANADA,
    dept: "Geology",
  },
  {
    name: "Prof. Emily Roberts",
    email: "eroberts@smccd.edu",
    college: College.CANADA,
    dept: "Theater Arts",
  },
  {
    name: "Dr. Kevin Park",
    email: "kpark@smccd.edu",
    college: College.CANADA,
    dept: "Business",
  },
  {
    name: "Prof. Laura Martinez",
    email: "lmartinez@smccd.edu",
    college: College.CANADA,
    dept: "Graphic Design",
  },
  {
    name: "Dr. Andrew Smith",
    email: "asmith@smccd.edu",
    college: College.CANADA,
    dept: "Philosophy",
  },
  {
    name: "Prof. Jessica Wong",
    email: "jwong@smccd.edu",
    college: College.CANADA,
    dept: "Library Science",
  },
];

// Sample locations by college
const locations = {
  [College.SKYLINE]: [
    "Room 2312",
    "Room 2315",
    "Room 2318",
    "Lab 2320",
    "Building 2-201",
    "Building 2-305",
    "Library Study Room A",
    "Computer Lab",
    "Science Lab 1",
    "Conference Room B",
  ],
  [College.CSM]: [
    "Room 17-201",
    "Room 17-305",
    "Room 18-150",
    "Room 18-220",
    "Building 32-105",
    "Building 36-210",
    "Music Room 10-105",
    "Nursing Lab",
    "Study Hall",
    "Faculty Lounge",
  ],
  [College.CANADA]: [
    "Room 7-201",
    "Room 4-150",
    "Room 1-110",
    "Room 9-205",
    "Building 3-101",
    "Theater",
    "Gym",
    "Art Studio",
    "Library Conference Room",
    "Outdoor Classroom",
  ],
};

// Terms and years for variety
const terms = ["Fall", "Spring", "Summer"];
const years = ["2023", "2024", "2025"];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomOfficeNumber(college: College): string {
  const prefixes = {
    [College.SKYLINE]: ["23", "24", "13", "14"],
    [College.CSM]: ["17-", "18-", "32-", "36-"],
    [College.CANADA]: ["7-", "4-", "1-", "9-"],
  };

  const prefix = getRandomElement(prefixes[college]);
  const suffix = Math.floor(Math.random() * 300) + 100;
  return `${prefix}${suffix}`;
}

async function main() {
  console.log("🌱 Starting clear and seed...");

  // Find or create the main user
  let user = await prismaForSeed.user.findUnique({
    where: { email: "besnyik@smccd.edu" },
  });

  if (!user) {
    user = await prismaForSeed.user.create({
      data: {
        name: "Benjamin Besnyik",
        email: "besnyik@smccd.edu",
        password: "$2b$10$hash", // In real app, properly hash
        role: "FACULTY",
        college: College.SKYLINE,
      },
    });
    console.log("✅ Created user besnyik@smccd.edu");
  } else {
    console.log("✅ User besnyik@smccd.edu already exists");
  }

  // Clear existing data
  console.log("🧹 Clearing existing doorcards and appointments...");
  const deletedCount = await prismaForSeed.doorcard.deleteMany({
    where: { userId: user.id },
  });
  console.log(`✅ Cleared ${deletedCount.count} existing doorcard(s)`);

  console.log("🚀 Creating 30+ example doorcards...");

  let createdCount = 0;

  // Create multiple doorcards for each faculty member
  for (const faculty of facultyData) {
    const numDoorcards = Math.floor(Math.random() * 3) + 1; // 1-3 doorcards per faculty

    for (let i = 0; i < numDoorcards; i++) {
      const term = getRandomElement(terms);
      const year = getRandomElement(years);
      const isActive = Math.random() > 0.3; // 70% chance of being active
      const isPublic = Math.random() > 0.1; // 90% chance of being public

      const baseSlug = `${faculty.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")}-${term.toLowerCase()}-${year}`;
      const slug = `${baseSlug}-${Math.random().toString(36).substr(2, 5)}`;

      const doorcard = await prismaForSeed.doorcard.create({
        data: {
          name: faculty.name,
          doorcardName: `${
            faculty.name.split(" ")[0] === "Dr." ? "Dr." : "Prof."
          } ${faculty.name.split(" ").slice(-1)[0]}`,
          officeNumber: getRandomOfficeNumber(faculty.college),
          term,
          year,
          college: faculty.college,
          slug,
          isPublic,
          isActive,
          userId: user.id,
        },
      });

      // Create 3-6 appointments per doorcard with locations
      const numAppointments = Math.floor(Math.random() * 4) + 3;
      const appointments = [];

      for (let j = 0; j < numAppointments; j++) {
        const dayOfWeek = getRandomElement([
          DayOfWeek.MONDAY,
          DayOfWeek.TUESDAY,
          DayOfWeek.WEDNESDAY,
          DayOfWeek.THURSDAY,
          DayOfWeek.FRIDAY,
        ]);

        const startHour = Math.floor(Math.random() * 8) + 8; // 8 AM to 3 PM
        const duration = getRandomElement([1, 1.5, 2, 2.5]); // 1-2.5 hour duration
        const endHour = startHour + Math.floor(duration);
        const endMinute = duration % 1 === 0.5 ? 30 : 0;

        const categories = [
          AppointmentCategory.OFFICE_HOURS,
          AppointmentCategory.LECTURE,
          AppointmentCategory.LAB,
          AppointmentCategory.IN_CLASS,
          AppointmentCategory.HOURS_BY_ARRANGEMENT,
        ];

        const category = getRandomElement(categories);
        const hasLocation = Math.random() > 0.3; // 70% chance of having a location

        let appointmentName = "";
        switch (category) {
          case AppointmentCategory.OFFICE_HOURS:
            appointmentName = "Office Hours";
            break;
          case AppointmentCategory.LECTURE:
            appointmentName = `${faculty.dept} Lecture`;
            break;
          case AppointmentCategory.LAB:
            appointmentName = `${faculty.dept} Lab`;
            break;
          case AppointmentCategory.IN_CLASS:
            appointmentName = `${faculty.dept} Class`;
            break;
          case AppointmentCategory.HOURS_BY_ARRANGEMENT:
            appointmentName = "Student Consultations";
            break;
        }

        appointments.push({
          name: appointmentName,
          startTime: `${startHour.toString().padStart(2, "0")}:00`,
          endTime: `${endHour.toString().padStart(2, "0")}:${endMinute
            .toString()
            .padStart(2, "0")}`,
          dayOfWeek,
          category,
          location: hasLocation
            ? getRandomElement(locations[faculty.college])
            : null,
          doorcardId: doorcard.id,
        });
      }

      if (appointments.length > 0) {
        await prismaForSeed.appointment.createMany({
          data: appointments,
        });
      }

      createdCount++;
      console.log(
        `✅ Created doorcard ${createdCount}: ${faculty.name} - ${term} ${year} (${faculty.college})`
      );
    }
  }

  console.log(`🎉 All ${createdCount} doorcards created successfully!`);
}

main()
  .catch((e) => {
    console.error("❌ Clear and seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaForSeed.$disconnect();
  });
