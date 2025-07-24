import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { doorcardSchema } from "@/lib/validations/doorcard";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();

    try {
      const validatedData = doorcardSchema.parse(json);

      // Find user by email since session might not have id
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Check for existing doorcard with same college/term/year combination
      const existingDoorcard = await prisma.doorcard.findFirst({
        where: {
          userId: user.id,
          college: validatedData.college,
          term: validatedData.term,
          year: validatedData.year,
          isActive: true, // Only check active doorcards
        },
      });

      if (existingDoorcard) {
        const campusName = validatedData.college
          ? validatedData.college === "SKYLINE"
            ? "Skyline College"
            : validatedData.college === "CSM"
            ? "College of San Mateo"
            : validatedData.college === "CANADA"
            ? "Cañada College"
            : validatedData.college
          : "this campus";

        return NextResponse.json(
          {
            error: `You already have a doorcard for ${campusName} - ${validatedData.term} ${validatedData.year}. Please edit your existing doorcard instead.`,
            existingDoorcardId: existingDoorcard.id,
          },
          { status: 409 }
        );
      }

      // Generate a URL-friendly slug
      const baseSlug = `${validatedData.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")}-${validatedData.term.toLowerCase()}-${
        validatedData.year
      }`;
      const cleanSlug = baseSlug.replace(/-+/g, "-").replace(/^-|-$/g, "");

      const doorcard = await prisma.doorcard.create({
        data: {
          name: validatedData.name,
          doorcardName: validatedData.doorcardName,
          officeNumber: validatedData.officeNumber,
          term: validatedData.term,
          year: validatedData.year,
          college: validatedData.college,
          slug: cleanSlug,
          userId: user.id,
          appointments: {
            create: validatedData.appointments.map((apt) => ({
              name: apt.name,
              startTime: apt.startTime,
              endTime: apt.endTime,
              dayOfWeek: apt.dayOfWeek,
              category: apt.category,
              location: apt.location,
            })),
          },
        },
        include: {
          appointments: true,
        },
      });

      return NextResponse.json(doorcard, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation error", details: error.errors },
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Error creating doorcard:", error);
    return NextResponse.json(
      { error: "Failed to create doorcard" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user by email since session might not have id
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const doorcards = await prisma.doorcard.findMany({
      where: {
        userId: user.id,
      },
      include: {
        user: {
          select: {
            name: true,
            username: true,
            email: true,
            college: true,
          },
        },
        appointments: {
          orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        },
      },
    });

    return NextResponse.json(doorcards);
  } catch (error) {
    console.error("Error fetching doorcards:", error);
    return NextResponse.json(
      { error: "Failed to fetch doorcards" },
      { status: 500 }
    );
  }
}
