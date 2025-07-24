import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { College } from "@/types/doorcard";

import type { WhereClause } from "@/types/api/utils";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const campus = searchParams.get("campus") as College | null;
    const search = searchParams.get("search");
    const term = searchParams.get("term");
    const year = searchParams.get("year");

    // Build where clause for filtering
    const whereClause: WhereClause = {
      isPublic: true,
      isActive: true,
    };

    if (campus) {
      whereClause.college = campus;
    }

    if (term) {
      whereClause.term = term;
    }

    if (year) {
      whereClause.year = year;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { doorcardName: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const doorcards = await prisma.doorcard.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            username: true,
            college: true,
          },
        },
        appointments: {
          orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        },
      },
      orderBy: [{ college: "asc" }, { name: "asc" }],
    });

    // Format the response
    const formattedDoorcards = doorcards.map(
      (doorcard: (typeof doorcards)[0]) => ({
        id: doorcard.id,
        name: doorcard.name,
        doorcardName: doorcard.doorcardName,
        officeNumber: doorcard.officeNumber,
        term: doorcard.term,
        year: doorcard.year,
        college: doorcard.college,
        slug: doorcard.slug,
        user: {
          name: doorcard.user.name,
          college: doorcard.user.college,
        },
        appointmentCount: doorcard.appointments.length,
        createdAt: doorcard.createdAt.toISOString(),
        updatedAt: doorcard.updatedAt.toISOString(),
      })
    );

    return NextResponse.json({
      doorcards: formattedDoorcards,
      count: formattedDoorcards.length,
    });
  } catch (error) {
    console.error("Error fetching public doorcards:", error);
    return NextResponse.json(
      { error: "Failed to fetch doorcards" },
      { status: 500 }
    );
  }
}
