import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { createDoorcardDraft } from "@/app/doorcard/actions";

import type { DraftData } from "@/types/api/utils";

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

    const drafts = await prisma.doorcardDraft.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        lastUpdated: "desc",
      },
    });

    return NextResponse.json(drafts);
  } catch (error) {
    console.error("Error fetching drafts:", error);
    return NextResponse.json(
      { error: "Failed to fetch drafts" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
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

    // Check if this is a request to create a new doorcard (no body)
    const contentLength = req.headers.get("content-length");
    if (!contentLength || contentLength === "0") {
      // Create new doorcard draft
      const redirectUrl = await createDoorcardDraft();
      return NextResponse.json({ redirectUrl });
    }

    // Otherwise, handle the existing draft saving logic
    const data = (await req.json()) as DraftData;
    const draftId = data.draftId;

    if (draftId) {
      // Update existing draft
      const draft = await prisma.doorcardDraft.update({
        where: {
          id: draftId,
          userId: user.id,
        },
        data: {
          data: JSON.parse(JSON.stringify(data)),
          lastUpdated: new Date(),
        },
      });
      return NextResponse.json(draft);
    } else {
      // Create new draft - but check for existing draft with same term/year first
      const { term, year } = data;

      if (term && year) {
        // Check if a draft already exists for this term/year
        const existingDraft = await prisma.doorcardDraft.findFirst({
          where: {
            userId: user.id,
            data: {
              path: ["term"],
              equals: term,
            },
          },
        });

        // If draft exists, check if it's for the same year
        if (existingDraft) {
          const existingDraftData = existingDraft.data as DraftData;
          if (existingDraftData.year === year) {
            // Return error - only one draft per term allowed
            return NextResponse.json(
              {
                error:
                  "You already have a draft for this term. Please complete or delete your existing draft first.",
                existingDraftId: existingDraft.id,
              },
              { status: 409 }
            );
          }
        }
      }

      // Create new draft
      const draft = await prisma.doorcardDraft.create({
        data: {
          userId: user.id,
          originalDoorcardId: data.originalDoorcardId || null,
          data: JSON.parse(JSON.stringify(data)),
        },
      });
      return NextResponse.json(draft);
    }
  } catch (error) {
    console.error("Error saving draft:", error);
    return NextResponse.json(
      { error: "Failed to save draft" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
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

    const { searchParams } = new URL(req.url);
    const deleteAll = searchParams.get("all") === "true";

    if (deleteAll) {
      await prisma.doorcardDraft.deleteMany({
        where: {
          userId: user.id,
        },
      });
      return NextResponse.json({ message: "All drafts deleted successfully" });
    }

    const draftId = searchParams.get("id");
    if (!draftId) {
      return NextResponse.json(
        { error: "Draft ID is required" },
        { status: 400 }
      );
    }

    await prisma.doorcardDraft.delete({
      where: {
        id: draftId,
        userId: user.id,
      },
    });

    return NextResponse.json({ message: "Draft deleted successfully" });
  } catch (error) {
    console.error("Error deleting draft:", error);
    return NextResponse.json(
      { error: "Failed to delete draft" },
      { status: 500 }
    );
  }
}
