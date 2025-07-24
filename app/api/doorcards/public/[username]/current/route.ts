import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/doorcards/public/[username]/current - Get current active doorcard for username
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    // Find the user by username or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: username },
          { name: { contains: username, mode: 'insensitive' } }
        ]
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the current active doorcard for this user
    const doorcard = await prisma.doorcard.findFirst({
      where: {
        userId: user.id,
        isActive: true,
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
          orderBy: [
            { dayOfWeek: 'asc' },
            { startTime: 'asc' }
          ]
        },
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!doorcard) {
      return NextResponse.json({ error: "No active doorcard found" }, { status: 404 });
    }

    return NextResponse.json(doorcard);
  } catch (error) {
    console.error("Error fetching current doorcard:", error);
    return NextResponse.json(
      { error: "Failed to fetch doorcard" },
      { status: 500 }
    );
  }
} 