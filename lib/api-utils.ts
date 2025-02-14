import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import type { Session } from "next-auth"
import type { DoorcardDraft } from "@/types/doorcard"

type AuthenticatedHandler<T> = (session: Session) => Promise<T>

export async function withAuth<T>(handler: AuthenticatedHandler<T>): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await handler(session)
    return NextResponse.json(result)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}

export const draftService = {
  async getAll(userId: string): Promise<DoorcardDraft[]> {
    return prisma.doorcardDraft.findMany({
      where: { userId },
      orderBy: { lastUpdated: "desc" },
    })
  },

  async getOne(userId: string, draftId: string): Promise<DoorcardDraft> {
    const draft = await prisma.doorcardDraft.findUnique({
      where: {
        userId_id: {
          userId,
          id: draftId,
        },
      },
    })

    if (!draft) {
      throw new Error("Draft not found")
    }

    return draft
  },

  async upsert(userId: string, data: DoorcardDraft["data"], draftId?: string): Promise<DoorcardDraft> {
    return prisma.doorcardDraft.upsert({
      where: {
        userId_id: {
          userId,
          id: draftId || "new-draft",
        },
      },
      update: {
        data,
      },
      create: {
        userId,
        data,
      },
    })
  },

  async delete(userId: string, draftId: string): Promise<DoorcardDraft> {
    return prisma.doorcardDraft.delete({
      where: {
        userId_id: {
          userId,
          id: draftId,
        },
      },
    })
  },

  async deleteAll(userId: string) {
    return prisma.doorcardDraft.deleteMany({
      where: { userId },
    })
  },
}

