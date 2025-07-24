import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/terms/upcoming - Get upcoming terms for doorcard creation
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get upcoming terms (not archived, not active, but marked as upcoming)
    const upcomingTerms = await prisma.term.findMany({
      where: {
        isUpcoming: true,
        isArchived: false,
      },
      orderBy: [{ year: "asc" }, { season: "asc" }],
    });

    // If no upcoming terms are found, create some fallback options
    if (upcomingTerms.length === 0) {
      const currentYear = new Date().getFullYear();
      const fallbackTerms = [
        {
          id: "fall-current",
          name: "Fall",
          year: currentYear.toString(),
          season: "Fall",
          startDate: new Date(currentYear, 8, 1), // September 1st
          endDate: new Date(currentYear, 11, 31), // December 31st
          isActive: false,
          isArchived: false,
          isUpcoming: true,
        },
        {
          id: "spring-next",
          name: "Spring",
          year: (currentYear + 1).toString(),
          season: "Spring",
          startDate: new Date(currentYear + 1, 0, 1), // January 1st
          endDate: new Date(currentYear + 1, 4, 31), // May 31st
          isActive: false,
          isArchived: false,
          isUpcoming: true,
        },
        {
          id: "summer-next",
          name: "Summer",
          year: (currentYear + 1).toString(),
          season: "Summer",
          startDate: new Date(currentYear + 1, 5, 1), // June 1st
          endDate: new Date(currentYear + 1, 7, 31), // August 31st
          isActive: false,
          isArchived: false,
          isUpcoming: true,
        },
        {
          id: "fall-next",
          name: "Fall",
          year: (currentYear + 1).toString(),
          season: "Fall",
          startDate: new Date(currentYear + 1, 8, 1), // September 1st
          endDate: new Date(currentYear + 1, 11, 31), // December 31st
          isActive: false,
          isArchived: false,
          isUpcoming: true,
        },
      ];

      return NextResponse.json(fallbackTerms);
    }

    return NextResponse.json(upcomingTerms);
  } catch (error) {
    console.error("Error fetching upcoming terms:", error);
    return NextResponse.json(
      { error: "Failed to fetch upcoming terms" },
      { status: 500 }
    );
  }
}
