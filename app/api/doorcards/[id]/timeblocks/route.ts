import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/doorcards/[id]/timeblocks - Get appointments (timeblocks) for a doorcard
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const appointments = await prisma.appointment.findMany({
      where: { doorcardId: id },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    // Convert appointments to timeblock format for compatibility
    const timeblocks = appointments.map((appointment) => ({
      dayOfWeek: appointment.dayOfWeek,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      isAvailable: true, // Appointments are always available
      name: appointment.name,
      category: appointment.category,
      location: appointment.location,
    }));

    return NextResponse.json(timeblocks);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}
