import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate username from name or email
    let username = name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 
                   email.split('@')[0];
    
    // Ensure username is unique
    let counter = 1;
    let finalUsername = username;
    while (await prisma.user.findUnique({ where: { username: finalUsername } })) {
      finalUsername = `${username}-${counter}`;
      counter++;
    }

    await prisma.user.create({
      data: {
        name,
        email,
        username: finalUsername,
        password: hashedPassword,
      },
    })

    return NextResponse.json({ message: "User created successfully" }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

