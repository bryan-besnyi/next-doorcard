import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

export async function POST(req: Request) {
  const session = await getServerSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { day, startTime, endTime, activity } = await req.json()

  // Mock response for development
  const mockTimeBlock = {
    id: Math.random().toString(36).substr(2, 9),
    day,
    startTime,
    endTime,
    activity,
    userId: session.user.id,
  }

  return NextResponse.json(mockTimeBlock, { status: 201 })
}

