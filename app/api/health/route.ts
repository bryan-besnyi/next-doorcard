import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;

    // Basic system health metrics
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || "unknown",
      database: "connected",
      checks: {
        database: "✅ Connected",
        auth: process.env.NEXTAUTH_SECRET ? "✅ Configured" : "❌ Missing",
        onelogin: process.env.ONELOGIN_CLIENT_ID
          ? "✅ Configured"
          : "⚠️ Not configured",
      },
    };

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    const healthError = {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      error: error instanceof Error ? error.message : "Unknown error",
      database: "disconnected",
    };

    return NextResponse.json(healthError, { status: 500 });
  }
}
