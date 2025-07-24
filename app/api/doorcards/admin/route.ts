import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/doorcards/admin - Get all doorcards for admin oversight
export async function GET() {
  try {
    console.log("🔍 Doorcards Admin API: Starting request...");
    const session = await getServerSession(authOptions);

    console.log("🔍 Doorcards Admin API: Session check:", !!session);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🔍 Doorcards Admin API: Querying database...");
    const doorcards = await prisma.doorcard.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            username: true,
            college: true,
          },
        },
        _count: {
          select: {
            appointments: true,
          },
        },
      },
      orderBy: [{ createdAt: "desc" }],
    });

    console.log(
      "🔍 Doorcards Admin API: Got doorcards:",
      doorcards.length,
      "items"
    );
    return NextResponse.json(doorcards);
  } catch (error) {
    console.error("❌ Doorcards Admin API Error:", error);
    console.error(
      "❌ Error stack:",
      error instanceof Error ? error.stack : "No stack"
    );
    return NextResponse.json(
      { error: "Failed to fetch doorcards" },
      { status: 500 }
    );
  }
}
