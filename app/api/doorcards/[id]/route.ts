import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const doorcard = await prisma.doorcard.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        appointments: {
          orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        },
      },
    });

    if (!doorcard) {
      return NextResponse.json(
        { error: "Doorcard not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(doorcard);
  } catch (error) {
    console.error("Error fetching doorcard:", error);
    return NextResponse.json(
      { error: "Failed to fetch doorcard" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const json = await req.json();
    const { id } = await params;

    // Validate the doorcard exists and belongs to the user
    const existingDoorcard = await prisma.doorcard.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingDoorcard) {
      return NextResponse.json(
        { error: "Doorcard not found" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData = {
      name: json.name,
      doorcardName: json.doorcardName,
      officeNumber: json.officeNumber,
      term: json.term,
      year: json.year,
      college: json.college,
    };

    // Handle timeBlocks -> appointments conversion if provided
    if (json.timeBlocks && Array.isArray(json.timeBlocks)) {
      // First delete existing appointments
      await prisma.appointment.deleteMany({
        where: { doorcardId: id },
      });

      // Convert timeBlocks to appointments format
      const appointments = json.timeBlocks.map(
        (block: {
          activity?: string;
          startTime: string;
          endTime: string;
          day: string;
          category?: string;
          location?: string;
        }) => ({
          name: block.activity || "Office Hours",
          startTime: block.startTime,
          endTime: block.endTime,
          dayOfWeek: block.day,
          category: block.category || "OFFICE_HOURS",
          location: block.location || null,
          doorcardId: id,
        })
      );

      // Create new appointments
      if (appointments.length > 0) {
        await prisma.appointment.createMany({
          data: appointments,
        });
      }
    }

    // Update doorcard
    const doorcard = await prisma.doorcard.update({
      where: {
        id,
        userId: user.id,
      },
      data: updateData,
    });

    return NextResponse.json(doorcard);
  } catch (error) {
    console.error("Error updating doorcard:", error);
    return NextResponse.json(
      { error: "Failed to update doorcard" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    await prisma.doorcard.delete({
      where: {
        id,
        userId: user.id,
      },
    });

    return NextResponse.json({ message: "Doorcard deleted successfully" });
  } catch (error) {
    console.error("Error deleting doorcard:", error);
    return NextResponse.json(
      { error: "Failed to delete doorcard" },
      { status: 500 }
    );
  }
}

// PATCH /api/doorcards/[id] - Update doorcard status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      isActive,
      isPublic,
      doorcardName,
      officeNumber,
      startDate,
      endDate,
      term,
      year,
      college,
      timeblocks,
    } = body;

    // Validate required boolean fields
    if (typeof isPublic !== "boolean") {
      return NextResponse.json(
        { error: "isPublic must be a boolean value" },
        { status: 400 }
      );
    }

    const updateData: any = {
      isPublic,
    };

    // Only update isActive if provided
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    // Add optional fields if provided
    if (doorcardName !== undefined) updateData.doorcardName = doorcardName;
    if (officeNumber !== undefined) updateData.officeNumber = officeNumber;
    if (startDate !== undefined && startDate !== "")
      updateData.startDate = new Date(startDate);
    if (endDate !== undefined && endDate !== "")
      updateData.endDate = new Date(endDate);
    if (term !== undefined) updateData.term = term;
    if (year !== undefined) updateData.year = year;
    if (college !== undefined) updateData.college = college;

    // Handle timeblocks update if provided
    if (timeblocks !== undefined && Array.isArray(timeblocks)) {
      // First, delete existing appointments
      await prisma.appointment.deleteMany({
        where: { doorcardId: id },
      });

      // Then create new appointments
      if (timeblocks.length > 0) {
        await prisma.appointment.createMany({
          data: timeblocks.map((tb: any) => ({
            doorcardId: id,
            name: tb.name || "Office Hours",
            dayOfWeek: tb.dayOfWeek,
            startTime: tb.startTime,
            endTime: tb.endTime,
            category: tb.category || "OFFICE_HOURS",
            location: tb.location || null,
          })),
        });
      }
    }

    const doorcard = await prisma.doorcard.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            college: true,
          },
        },
        appointments: {
          orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        },
        _count: {
          select: {
            appointments: true,
          },
        },
      },
    });

    return NextResponse.json(doorcard);
  } catch (error) {
    console.error("Error updating doorcard:", error);
    
    // Handle specific error types
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    return NextResponse.json(
      { error: "Failed to update doorcard" },
      { status: 500 }
    );
  }
}
