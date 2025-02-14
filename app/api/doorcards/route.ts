import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { doorcardSchema } from "@/lib/validations/doorcard"
import { z } from "zod"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const json = await req.json()

    try {
      const validatedData = doorcardSchema.parse(json)

      const doorcard = await prisma.doorcard.create({
        data: {
          name: validatedData.name,
          doorcardName: validatedData.doorcardName,
          officeNumber: validatedData.officeNumber,
          term: validatedData.term,
          year: validatedData.year,
          timeBlocks: validatedData.timeBlocks,
          userId: session.user.id,
        },
      })

      return NextResponse.json(doorcard, { status: 201 })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
      }
      throw error
    }
  } catch (error) {
    console.error("Error creating doorcard:", error)
    return NextResponse.json({ error: "Failed to create doorcard" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const doorcards = await prisma.doorcard.findMany({
      where: {
        userId: session.user.id,
      },
    })

    return NextResponse.json(doorcards)
  } catch (error) {
    console.error("Error fetching doorcards:", error)
    return NextResponse.json({ error: "Failed to fetch doorcards" }, { status: 500 })
  }
}

