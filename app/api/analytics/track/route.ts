import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const trackingSchema = z.object({
  doorcardId: z.string().cuid(),
  eventType: z.enum([
    "VIEW",
    "PRINT_PREVIEW",
    "PRINT_DOWNLOAD",
    "EDIT_STARTED",
    "SHARE",
    "SEARCH_RESULT",
  ]),
  metadata: z.record(z.unknown()).optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { doorcardId, eventType, metadata } = trackingSchema.parse(json);

    // Get client IP and user agent
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded
      ? forwarded.split(",")[0]
      : req.headers.get("x-real-ip");
    const userAgent = req.headers.get("user-agent");
    const referrer = req.headers.get("referer");

    // Generate session ID (you might want to use a more sophisticated approach)
    const sessionId =
      req.headers.get("x-session-id") ||
      `${ip}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Verify doorcard exists and is public (for non-owner events)
    const doorcard = await prisma.doorcard.findUnique({
      where: { id: doorcardId },
      select: { id: true, isPublic: true, userId: true },
    });

    if (!doorcard) {
      return NextResponse.json(
        { error: "Doorcard not found" },
        { status: 404 }
      );
    }

    // For non-edit events, check if doorcard is public
    if (eventType !== "EDIT_STARTED" && !doorcard.isPublic) {
      return NextResponse.json(
        { error: "Doorcard is not public" },
        { status: 403 }
      );
    }

    // Record the analytics event
    await prisma.doorcardAnalytics.create({
      data: {
        doorcardId,
        eventType,
        ipAddress: ip,
        userAgent,
        referrer,
        sessionId,
        metadata,
      },
    });

    // Update aggregated metrics
    await updateDoorcardMetrics(doorcardId, eventType, sessionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics tracking error:", error);
    return NextResponse.json(
      { error: "Failed to track event" },
      { status: 500 }
    );
  }
}

async function updateDoorcardMetrics(
  doorcardId: string,
  eventType: string,
  sessionId: string
) {
  const now = new Date();

  // Check if this is a unique view (same session within last hour)
  const recentView = await prisma.doorcardAnalytics.findFirst({
    where: {
      doorcardId,
      sessionId,
      eventType: "VIEW",
      createdAt: {
        gte: new Date(now.getTime() - 60 * 60 * 1000), // Last hour
      },
    },
  });

  const isUniqueView = !recentView && eventType === "VIEW";

  // Update or create metrics
  await prisma.doorcardMetrics.upsert({
    where: { doorcardId },
    create: {
      doorcardId,
      totalViews: eventType === "VIEW" ? 1 : 0,
      uniqueViews: isUniqueView ? 1 : 0,
      totalPrints: eventType === "PRINT_DOWNLOAD" ? 1 : 0,
      totalShares: eventType === "SHARE" ? 1 : 0,
      lastViewedAt: eventType === "VIEW" ? now : null,
      lastPrintedAt: eventType === "PRINT_DOWNLOAD" ? now : null,
    },
    update: {
      totalViews: eventType === "VIEW" ? { increment: 1 } : undefined,
      uniqueViews: isUniqueView ? { increment: 1 } : undefined,
      totalPrints:
        eventType === "PRINT_DOWNLOAD" ? { increment: 1 } : undefined,
      totalShares: eventType === "SHARE" ? { increment: 1 } : undefined,
      lastViewedAt: eventType === "VIEW" ? now : undefined,
      lastPrintedAt: eventType === "PRINT_DOWNLOAD" ? now : undefined,
    },
  });
}
