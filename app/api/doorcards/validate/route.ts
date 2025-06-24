import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const validateSchema = z.object({
  college: z.enum(["SKYLINE", "CSM", "CANADA"]),
  term: z.string().min(1),
  year: z.string().min(4),
  excludeDoorcardId: z.string().optional(), // For edit mode
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();

    try {
      const { college, term, year, excludeDoorcardId } =
        validateSchema.parse(json);

      // Find user by email
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
          college: college,
          term: term,
          year: year,
          isActive: true,
          // Exclude the current doorcard if we're in edit mode
          ...(excludeDoorcardId && {
            NOT: { id: excludeDoorcardId },
          }),
        },
      });

      if (existingDoorcard) {
        const campusName =
          college === "SKYLINE"
            ? "Skyline College"
            : college === "CSM"
            ? "College of San Mateo"
            : college === "CANADA"
            ? "Cañada College"
            : college;

        return NextResponse.json({
          isDuplicate: true,
          message: `You already have a doorcard for ${campusName} - ${term} ${year}`,
          existingDoorcardId: existingDoorcard.id,
          existingDoorcardName: existingDoorcard.doorcardName,
        });
      }

      return NextResponse.json({
        isDuplicate: false,
        message: "This campus and term combination is available!",
      });
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
    console.error("Error validating doorcard:", error);
    return NextResponse.json(
      { error: "Failed to validate doorcard" },
      { status: 500 }
    );
  }
}
