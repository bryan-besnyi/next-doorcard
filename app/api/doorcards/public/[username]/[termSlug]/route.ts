import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/doorcards/public/[username]/[termSlug] - Get specific term doorcard for username
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string; termSlug: string }> }
) {
  try {
    const { username, termSlug } = await params;

    // Find the user by username or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: username },
          { name: { contains: username, mode: "insensitive" } },
        ],
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse term slug (e.g., "fall-2024" -> term: "Fall", year: "2024")
    const termMatch = termSlug.match(/^(\w+)-(\d{4})$/);
    if (!termMatch) {
      return NextResponse.json(
        { error: "Invalid term format" },
        { status: 400 }
      );
    }

    const [, termSeason, year] = termMatch;
    const term =
      termSeason.charAt(0).toUpperCase() + termSeason.slice(1).toLowerCase();

    // Get the doorcard for this user and specific term
    const doorcard = await prisma.doorcard.findFirst({
      where: {
        userId: user.id,
        term: term,
        year: year,
        isPublic: true,
      },
      include: {
        user: {
          select: {
            name: true,
            college: true,
          },
        },
        appointments: {
          orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        },
      },
    });

    if (!doorcard) {
      return NextResponse.json(
        { error: "Doorcard not found for this term" },
        { status: 404 }
      );
    }

    return NextResponse.json(doorcard);
  } catch (error) {
    console.error("Error fetching term doorcard:", error);
    return NextResponse.json(
      { error: "Failed to fetch doorcard" },
      { status: 500 }
    );
  }
}
