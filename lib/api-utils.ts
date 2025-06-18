import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import type { Session } from "next-auth";
import type { DoorcardDraft, TimeBlock } from "@/types/doorcard";

type AuthenticatedHandler<T> = (session: Session) => Promise<T>;

export async function withAuth<T>(
  handler: AuthenticatedHandler<T>
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await handler(session);
    return NextResponse.json(result);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

interface DraftData {
  originalDoorcardId?: string | null;
  name?: string;
  doorcardName?: string;
  officeNumber?: string;
  term?: string;
  year?: string;
  timeBlocks?: TimeBlock[];
  currentStep?: number;
  hasViewedPreview?: boolean;
  hasViewedPrint?: boolean;
  basicInfo?: Record<string, string>;
  general?: string[];
}

export const draftService = {
  async getAll(userId: string): Promise<DoorcardDraft[]> {
    return prisma.doorcardDraft.findMany({
      where: { userId },
      orderBy: { lastUpdated: "desc" },
    });
  },

  async getOne(userId: string, draftId: string): Promise<DoorcardDraft> {
    const draft = await prisma.doorcardDraft.findUnique({
      where: {
        userId_id: {
          userId,
          id: draftId,
        },
      },
    });

    if (!draft) {
      throw new Error("Draft not found");
    }

    return draft;
  },

  async upsert(
    userId: string,
    data: DraftData,
    draftId?: string
  ): Promise<DoorcardDraft> {
    const { originalDoorcardId, ...draftData } = data;

    return prisma.doorcardDraft.upsert({
      where: {
        userId_id: {
          userId,
          id: draftId || "new-draft",
        },
      },
      update: {
        data: draftData,
        originalDoorcardId,
      },
      create: {
        userId,
        data: draftData,
        originalDoorcardId,
      },
    });
  },

  async delete(userId: string, draftId: string): Promise<DoorcardDraft> {
    return prisma.doorcardDraft.delete({
      where: {
        userId_id: {
          userId,
          id: draftId,
        },
      },
    });
  },

  async deleteAll(userId: string) {
    return prisma.doorcardDraft.deleteMany({
      where: { userId },
    });
  },

  // New method to get drafts related to a specific doorcard
  async getByOriginalDoorcard(
    userId: string,
    originalDoorcardId: string
  ): Promise<DoorcardDraft[]> {
    return prisma.doorcardDraft.findMany({
      where: {
        userId,
        originalDoorcardId,
      },
      orderBy: { lastUpdated: "desc" },
    });
  },

  // New method to delete drafts when a doorcard is deleted
  async deleteByOriginalDoorcard(userId: string, originalDoorcardId: string) {
    return prisma.doorcardDraft.deleteMany({
      where: {
        userId,
        originalDoorcardId,
      },
    });
  },
};
