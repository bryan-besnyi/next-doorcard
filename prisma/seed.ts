const bcrypt = require("bcryptjs");
const {
  PrismaClient,
  College,
  DayOfWeek,
  AppointmentCategory,
} = require("@prisma/client");

const prismaForSeed = new PrismaClient();

// Fake faculty data
const fakeUserData = [
  // Skyline College Faculty
  {
    name: "Dr. Maria Rodriguez",
    email: "mrodriguez@smccd.edu",
    college: College.SKYLINE,
    dept: "Mathematics",
    office: "2101",
  },
  {
    name: "Prof. James Chen",
    email: "jchen@smccd.edu",
    college: College.SKYLINE,
    dept: "Computer Science",
    office: "2205",
  },
  {
    name: "Dr. Sarah Johnson",
    email: "sjohnson@smccd.edu",
    college: College.SKYLINE,
    dept: "Biology",
    office: "3150",
  },
  {
    name: "Prof. Michael Thompson",
    email: "mthompson@smccd.edu",
    college: College.SKYLINE,
    dept: "English",
    office: "1410",
  },
  {
    name: "Dr. Lisa Park",
    email: "lpark@smccd.edu",
    college: College.SKYLINE,
    dept: "Chemistry",
    office: "3200",
  },
  {
    name: "Prof. David Williams",
    email: "dwilliams@smccd.edu",
    college: College.SKYLINE,
    dept: "Physics",
    office: "3125",
  },
  {
    name: "Dr. Jennifer Kim",
    email: "jkim@smccd.edu",
    college: College.SKYLINE,
    dept: "Psychology",
    office: "1525",
  },
  {
    name: "Prof. Robert Martinez",
    email: "rmartinez@smccd.edu",
    college: College.SKYLINE,
    dept: "History",
    office: "1305",
  },
  {
    name: "Dr. Amanda White",
    email: "awhite@smccd.edu",
    college: College.SKYLINE,
    dept: "Art",
    office: "4110",
  },
  {
    name: "Prof. Kevin Lee",
    email: "klee@smccd.edu",
    college: College.SKYLINE,
    dept: "Business",
    office: "2310",
  },

  // College of San Mateo Faculty
  {
    name: "Dr. Carlos Gonzalez",
    email: "cgonzalez@smccd.edu",
    college: College.CSM,
    dept: "Spanish",
    office: "17-201",
  },
  {
    name: "Prof. Michelle Davis",
    email: "mdavis@smccd.edu",
    college: College.CSM,
    dept: "Nursing",
    office: "32-105",
  },
  {
    name: "Dr. Thomas Wilson",
    email: "twilson@smccd.edu",
    college: College.CSM,
    dept: "Engineering",
    office: "36-210",
  },
  {
    name: "Prof. Angela Brown",
    email: "abrown@smccd.edu",
    college: College.CSM,
    dept: "Sociology",
    office: "18-150",
  },
  {
    name: "Dr. Hassan Ahmed",
    email: "hahmed@smccd.edu",
    college: College.CSM,
    dept: "Economics",
    office: "17-305",
  },
  {
    name: "Prof. Rachel Green",
    email: "rgreen@smccd.edu",
    college: College.CSM,
    dept: "Environmental Science",
    office: "35-120",
  },
  {
    name: "Dr. Jonathan Taylor",
    email: "jtaylor@smccd.edu",
    college: College.CSM,
    dept: "Political Science",
    office: "18-220",
  },
  {
    name: "Prof. Nicole Anderson",
    email: "nanderson@smccd.edu",
    college: College.CSM,
    dept: "Anthropology",
    office: "18-180",
  },
  {
    name: "Dr. Christopher Miller",
    email: "cmiller@smccd.edu",
    college: College.CSM,
    dept: "Philosophy",
    office: "17-125",
  },
  {
    name: "Prof. Stephanie Clark",
    email: "sclark@smccd.edu",
    college: College.CSM,
    dept: "Music",
    office: "10-105",
  },

  // Cañada College Faculty
  {
    name: "Dr. Ricardo Morales",
    email: "rmorales@smccd.edu",
    college: College.CANADA,
    dept: "Communications",
    office: "7-201",
  },
  {
    name: "Prof. Patricia Lewis",
    email: "plewis@smccd.edu",
    college: College.CANADA,
    dept: "Early Childhood Education",
    office: "4-150",
  },
  {
    name: "Dr. Matthew Jackson",
    email: "mjackson@smccd.edu",
    college: College.CANADA,
    dept: "Kinesiology",
    office: "1-110",
  },
  {
    name: "Prof. Samantha Young",
    email: "syoung@smccd.edu",
    college: College.CANADA,
    dept: "Astronomy",
    office: "9-205",
  },
  {
    name: "Dr. Daniel Garcia",
    email: "dgarcia@smccd.edu",
    college: College.CANADA,
    dept: "Geology",
    office: "9-180",
  },
  {
    name: "Prof. Emily Robinson",
    email: "erobinson@smccd.edu",
    college: College.CANADA,
    dept: "Theater Arts",
    office: "2-120",
  },
  {
    name: "Dr. Brian Scott",
    email: "bscott@smccd.edu",
    college: College.CANADA,
    dept: "Criminal Justice",
    office: "7-105",
  },
  {
    name: "Prof. Laura Hernandez",
    email: "lhernandez@smccd.edu",
    college: College.CANADA,
    dept: "French",
    office: "5-210",
  },
  {
    name: "Dr. Steven Turner",
    email: "sturner@smccd.edu",
    college: College.CANADA,
    dept: "Geography",
    office: "8-150",
  },
  {
    name: "Prof. Diana Phillips",
    email: "dphillips@smccd.edu",
    college: College.CANADA,
    dept: "Journalism",
    office: "7-180",
  },
];

// Course templates for different departments
const courseTemplates = {
  Mathematics: [
    "Math 110 - College Algebra",
    "Math 200 - Calculus I",
    "Math 251 - Calculus II",
    "Statistics 200",
  ],
  "Computer Science": [
    "CS 110 - Programming",
    "CS 210 - Data Structures",
    "CS 260 - Web Development",
    "CIS 278 - Database",
  ],
  Biology: [
    "Biology 100 - General Biology",
    "Biology 250 - Human Anatomy",
    "Biology 260 - Microbiology",
    "Botany 100",
  ],
  English: [
    "English 100 - Composition",
    "English 105 - Critical Thinking",
    "English 165 - Literature",
    "English 848 - ESL",
  ],
  Chemistry: [
    "Chemistry 210 - General Chemistry",
    "Chemistry 231 - Organic Chemistry",
    "Chemistry 220 - Quantitative Analysis",
  ],
  Physics: [
    "Physics 210 - General Physics",
    "Physics 250 - Engineering Physics",
    "Physics 270 - Modern Physics",
  ],
  Psychology: [
    "Psychology 100 - General Psychology",
    "Psychology 200 - Research Methods",
    "Psychology 300 - Abnormal Psychology",
  ],
  History: [
    "History 100 - World History",
    "History 201 - US History",
    "History 202 - California History",
  ],
  Art: [
    "Art 101 - Drawing",
    "Art 200 - Painting",
    "Art 250 - Sculpture",
    "Art 280 - Digital Art",
  ],
  Business: [
    "Business 100 - Introduction",
    "Business 200 - Accounting",
    "Business 240 - Marketing",
    "Business 260 - Management",
  ],
  Spanish: [
    "Spanish 110 - Elementary Spanish",
    "Spanish 120 - Elementary Spanish II",
    "Spanish 210 - Intermediate Spanish",
  ],
  Nursing: [
    "Nursing 100 - Fundamentals",
    "Nursing 200 - Medical-Surgical",
    "Nursing 220 - Pharmacology",
  ],
  Engineering: [
    "Engineering 100 - Introduction",
    "Engineering 210 - Statics",
    "Engineering 220 - Dynamics",
  ],
  Sociology: [
    "Sociology 100 - Introduction",
    "Sociology 200 - Social Problems",
    "Sociology 300 - Research Methods",
  ],
  Economics: [
    "Economics 100 - Macroeconomics",
    "Economics 102 - Microeconomics",
    "Economics 200 - Statistics",
  ],
  "Environmental Science": [
    "Environmental Science 100",
    "Environmental Science 200 - Ecology",
    "Environmental Science 210 - Conservation",
  ],
  "Political Science": [
    "Political Science 100 - American Government",
    "Political Science 200 - Comparative Politics",
  ],
  Anthropology: [
    "Anthropology 100 - Cultural Anthropology",
    "Anthropology 200 - Physical Anthropology",
  ],
  Philosophy: [
    "Philosophy 100 - Critical Thinking",
    "Philosophy 200 - Ethics",
    "Philosophy 300 - Logic",
  ],
  Music: [
    "Music 100 - Music Theory",
    "Music 200 - Music History",
    "Music 250 - Applied Music",
  ],
  Communications: [
    "Communications 100 - Public Speaking",
    "Communications 200 - Interpersonal Communication",
  ],
  "Early Childhood Education": [
    "ECE 100 - Child Development",
    "ECE 200 - Curriculum Planning",
    "ECE 220 - Family Relations",
  ],
  Kinesiology: [
    "Kinesiology 100 - Fitness",
    "Kinesiology 200 - Exercise Physiology",
    "PE 100 - Physical Education",
  ],
  Astronomy: [
    "Astronomy 100 - Introduction",
    "Astronomy 200 - Stellar Astronomy",
    "Physics 100 - Conceptual Physics",
  ],
  Geology: [
    "Geology 100 - Physical Geology",
    "Geology 200 - Historical Geology",
    "Geology 300 - Mineralogy",
  ],
  "Theater Arts": [
    "Theater 100 - Introduction",
    "Theater 200 - Acting",
    "Theater 300 - Stage Design",
  ],
  "Criminal Justice": [
    "Criminal Justice 100",
    "Criminal Justice 200 - Criminology",
    "Criminal Justice 300 - Law Enforcement",
  ],
  French: [
    "French 110 - Elementary French",
    "French 120 - Elementary French II",
    "French 210 - Intermediate French",
  ],
  Geography: [
    "Geography 100 - Physical Geography",
    "Geography 200 - Human Geography",
    "Geography 300 - GIS",
  ],
  Journalism: [
    "Journalism 100 - News Writing",
    "Journalism 200 - Feature Writing",
    "Journalism 300 - Media Ethics",
  ],
};

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateTimeSlot(): { start: string; end: string } {
  const hours = [
    { start: "08:00", end: "09:30" },
    { start: "10:00", end: "11:30" },
    { start: "12:00", end: "13:30" },
    { start: "14:00", end: "15:30" },
    { start: "16:00", end: "17:30" },
    { start: "18:00", end: "19:30" },
  ];
  return getRandomElement(hours);
}

async function main() {
  console.log("🌱 Starting seed with 30 fake faculty members...");

  const hashedPassword = await bcrypt.hash("password123", 12);

  // Create terms first
  console.log("📅 Creating academic terms...");
  const terms = [
    {
      name: "Fall 2024",
      year: "2024",
      season: "Fall",
      startDate: new Date("2024-08-26"),
      endDate: new Date("2024-12-20"),
      isActive: false,
      isArchived: true,
      isUpcoming: false,
    },
    {
      name: "Spring 2025",
      year: "2025",
      season: "Spring",
      startDate: new Date("2025-01-22"),
      endDate: new Date("2025-05-24"),
      isActive: false,
      isArchived: false,
      isUpcoming: false,
    },
    {
      name: "Summer 2025",
      year: "2025",
      season: "Summer",
      startDate: new Date("2025-06-10"),
      endDate: new Date("2025-08-15"),
      isActive: true,
      isArchived: false,
      isUpcoming: false,
    },
    {
      name: "Fall 2025",
      year: "2025",
      season: "Fall",
      startDate: new Date("2025-08-26"),
      endDate: new Date("2025-12-20"),
      isActive: false,
      isArchived: false,
      isUpcoming: true,
    },
  ];

  const createdTerms = [];
  for (const termData of terms) {
    let term = await prismaForSeed.term.findUnique({
      where: { name: termData.name },
    });

    if (!term) {
      term = await prismaForSeed.term.create({
        data: termData,
      });
      console.log(`✅ Created term: ${term.name}`);
    } else {
      console.log(`✅ Term ${termData.name} already exists`);
    }
    createdTerms.push(term);
  }

  // Create all fake users
  for (const userData of fakeUserData) {
    let user = await prismaForSeed.user.findUnique({
      where: { email: userData.email },
    });

    if (!user) {
      // Generate username from name or email
      let username =
        userData.name
          ?.toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "") || userData.email.split("@")[0];

      // Ensure username is unique
      let counter = 1;
      let finalUsername = username;
      while (
        await prismaForSeed.user.findUnique({
          where: { username: finalUsername },
        })
      ) {
        finalUsername = `${username}-${counter}`;
        counter++;
      }

      user = await prismaForSeed.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          username: finalUsername,
          password: hashedPassword,
          role: "FACULTY",
          college: userData.college,
        },
      });
      console.log(`✅ Created user: ${user.email}`);
    } else {
      console.log(`✅ User ${userData.email} already exists`);
      continue;
    }

    // Create 1-2 doorcards per user
    const numDoorcards = Math.random() > 0.6 ? 2 : 1;

    for (let i = 0; i < numDoorcards; i++) {
      const term = getRandomElement(createdTerms);
      const isActive = term.isActive;

      // Generate a slug
      const slug = `${userData.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")}-${term.season.toLowerCase()}-${term.year}`;

      // Check if doorcard already exists
      const existingDoorcard = await prismaForSeed.doorcard.findUnique({
        where: { slug },
      });

      if (existingDoorcard) {
        console.log(`⚠️ Doorcard ${slug} already exists, skipping...`);
        continue;
      }

      const doorcard = await prismaForSeed.doorcard.create({
        data: {
          name: userData.name,
          doorcardName: userData.name.includes("Dr.")
            ? userData.name
            : `Prof. ${userData.name.split(" ").pop()}`,
          officeNumber: userData.office,
          term: term.name,
          year: term.year,
          college: userData.college,
          slug,
          isPublic: true,
          isActive,
          userId: user.id,
          termId: term.id, // Link to the Term model
        },
      });

      // Generate courses for this faculty member
      const courses = courseTemplates[
        userData.dept as keyof typeof courseTemplates
      ] || ["General Course"];
      const numCourses = Math.floor(Math.random() * 3) + 1; // 1-3 courses
      const selectedCourses = courses.slice(0, numCourses);

      const appointments = [];

      // Add office hours (always on Tuesday and Thursday)
      appointments.push(
        {
          name: "Office Hours",
          startTime: "10:00",
          endTime: "12:00",
          dayOfWeek: DayOfWeek.TUESDAY,
          category: AppointmentCategory.OFFICE_HOURS,
          doorcardId: doorcard.id,
        },
        {
          name: "Office Hours",
          startTime: "10:00",
          endTime: "12:00",
          dayOfWeek: DayOfWeek.THURSDAY,
          category: AppointmentCategory.OFFICE_HOURS,
          doorcardId: doorcard.id,
        }
      );

      // Add courses
      selectedCourses.forEach((course, index) => {
        const days = [
          [DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY],
          [DayOfWeek.TUESDAY, DayOfWeek.THURSDAY],
          [DayOfWeek.FRIDAY],
        ];

        const courseDays = getRandomElement(days);
        const timeSlot = generateTimeSlot();

        courseDays.forEach((day) => {
          appointments.push({
            name: course,
            startTime: timeSlot.start,
            endTime: timeSlot.end,
            dayOfWeek: day,
            category: AppointmentCategory.LECTURE,
            location: `Room ${Math.floor(Math.random() * 900) + 100}`,
            doorcardId: doorcard.id,
          });
        });

        // Sometimes add a lab
        if (
          Math.random() > 0.7 &&
          (course.includes("Science") ||
            course.includes("CS") ||
            course.includes("Engineering"))
        ) {
          const labTime = generateTimeSlot();
          appointments.push({
            name: `${course} Lab`,
            startTime: labTime.start,
            endTime: labTime.end,
            dayOfWeek: getRandomElement([
              DayOfWeek.WEDNESDAY,
              DayOfWeek.FRIDAY,
            ]),
            category: AppointmentCategory.LAB,
            location: `Lab ${Math.floor(Math.random() * 900) + 100}`,
            doorcardId: doorcard.id,
          });
        }
      });

      await prismaForSeed.appointment.createMany({
        data: appointments,
      });

      console.log(
        `✅ Created doorcard: ${doorcard.slug} with ${appointments.length} appointments`
      );
    }
  }

  console.log("🎉 Seed completed successfully!");
}

main()
  .then(async () => {
    await prismaForSeed.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prismaForSeed.$disconnect();
    process.exit(1);
  });
