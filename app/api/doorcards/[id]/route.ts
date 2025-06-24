import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, context: { params: { id: string } }) {
  try {
    const session = await getServerSession();

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

    const doorcard = await prisma.doorcard.findFirst({
      where: {
        id: (await context.params).id,
        userId: user.id,
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

export async function PUT(req: Request, context: { params: { id: string } }) {
  try {
    const session = await getServerSession();

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

    // Validate the doorcard exists and belongs to the user
    const existingDoorcard = await prisma.doorcard.findFirst({
      where: {
        id: (await context.params).id,
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
    const updateData: any = {
      name: json.name,
      doorcardName: json.doorcardName,
      officeNumber: json.officeNumber,
      term: json.term,
      year: json.year,
      college: json.college,
    };

    // Handle timeBlocks -> appointments conversion if provided
    if (json.timeBlocks && Array.isArray(json.timeBlocks)) {
      const doorcardId = (await context.params).id;

      // First delete existing appointments
      await prisma.appointment.deleteMany({
        where: { doorcardId },
      });

      // Convert timeBlocks to appointments format
      const appointments = json.timeBlocks.map((block: any) => ({
        name: block.activity || "Office Hours",
        startTime: block.startTime,
        endTime: block.endTime,
        dayOfWeek: block.day,
        category: block.category || "OFFICE_HOURS",
        location: block.location || null,
        doorcardId,
      }));

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
        id: (await context.params).id,
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
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

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

    await prisma.doorcard.delete({
      where: {
        id: (await context.params).id,
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
