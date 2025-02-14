import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(req: Request, context: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const doorcard = await prisma.doorcard.findFirst({
      where: {
        id: (await context.params).id,
        userId: session.user.id,
      },
    })

    if (!doorcard) {
      return NextResponse.json({ error: "Doorcard not found" }, { status: 404 })
    }

    return NextResponse.json(doorcard)
  } catch (error) {
    console.error("Error fetching doorcard:", error)
    return NextResponse.json({ error: "Failed to fetch doorcard" }, { status: 500 })
  }
}

export async function PUT(req: Request, context: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()

    const doorcard = await prisma.doorcard.update({
      where: {
        id: (await context.params).id,
        userId: session.user.id,
      },
      data,
    })

    return NextResponse.json(doorcard)
  } catch (error) {
    console.error("Error updating doorcard:", error)
    return NextResponse.json({ error: "Failed to update doorcard" }, { status: 500 })
  }
}

export async function DELETE(req: Request, context: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.doorcard.delete({
      where: {
        id: (await context.params).id,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ message: "Doorcard deleted successfully" })
  } catch (error) {
    console.error("Error deleting doorcard:", error)
    return NextResponse.json({ error: "Failed to delete doorcard" }, { status: 500 })
  }
}

