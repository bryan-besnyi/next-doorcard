import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Find doorcard by slug or ID (fallback for existing doorcards without slugs)
    const doorcard = await prisma.doorcard.findFirst({
      where: {
        OR: [
          { slug: slug },
          { id: slug }, // Fallback for doorcards without slugs
        ],
        isPublic: true, // Only public doorcards
        isActive: true, // Only active doorcards
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
        { error: "Doorcard not found or not publicly accessible" },
        { status: 404 }
      );
    }

    // Return the doorcard with formatted data
    const response = {
      id: doorcard.id,
      name: doorcard.name,
      doorcardName: doorcard.doorcardName,
      officeNumber: doorcard.officeNumber,
      term: doorcard.term,
      year: doorcard.year,
      college: doorcard.college,
      isActive: doorcard.isActive,
      user: {
        name: doorcard.user.name,
        college: doorcard.user.college,
      },
      appointments: doorcard.appointments.map(
        (apt: (typeof doorcard.appointments)[0]) => ({
          id: apt.id,
          name: apt.name,
          startTime: apt.startTime,
          endTime: apt.endTime,
          dayOfWeek: apt.dayOfWeek,
          category: apt.category,
          location: apt.location,
        })
      ),
      createdAt: doorcard.createdAt.toISOString(),
      updatedAt: doorcard.updatedAt.toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching public doorcard:", error);
    return NextResponse.json(
      { error: "Failed to fetch doorcard" },
      { status: 500 }
    );
  }
}
