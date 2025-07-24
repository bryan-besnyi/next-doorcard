"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  basicInfoSchema,
  timeBlockSchema,
} from "@/lib/validations/doorcard-edit";

// Server Action to validate and save campus/term selection
export async function validateCampusTerm(
  doorcardId: string,
  formData: FormData
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      throw new Error("Unauthorized");
    }

    // Find user by email since session might not have id
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Extract and validate campus/term data
    const rawData = {
      term: formData.get("term")?.toString() || "",
      year: formData.get("year")?.toString() || "",
      college: formData.get("college")?.toString() || "",
    };

    // Validate with Zod (subset of basicInfoSchema)
    const campusTermSchema = z.object({
      term: z.string().min(1, "Term is required"),
      year: z.string().min(1, "Year is required"),
      college: z.enum(["SKYLINE", "CSM", "CANADA"], {
        required_error: "Campus is required",
      }),
    });

    const validatedData = campusTermSchema.parse(rawData);

    // Check for duplicate doorcards
    const existingDoorcard = await prisma.doorcard.findFirst({
      where: {
        userId: user.id,
        college: validatedData.college,
        term: validatedData.term,
        year: validatedData.year,
        isActive: true,
        // Exclude the current doorcard we're editing
        NOT: { id: doorcardId },
      },
    });

    if (existingDoorcard) {
      const campusName =
        validatedData.college === "SKYLINE"
          ? "Skyline College"
          : validatedData.college === "CSM"
          ? "College of San Mateo"
          : validatedData.college === "CANADA"
          ? "Cañada College"
          : validatedData.college;

      throw new Error(
        `You already have a doorcard for ${campusName} - ${validatedData.term} ${validatedData.year}. Please edit your existing doorcard "${existingDoorcard.doorcardName}" instead.`
      );
    }

    // Update the doorcard with campus/term info
    await prisma.doorcard.update({
      where: {
        id: doorcardId,
        userId: user.id,
      },
      data: {
        term: validatedData.term,
        year: validatedData.year,
        college: validatedData.college,
      },
    });

    // Revalidate the current page
    revalidatePath(`/doorcard/${doorcardId}/edit`);

    // Redirect to basic info step
    redirect(`/doorcard/${doorcardId}/edit?step=1`);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Validation failed: ${error.errors.map((e) => e.message).join(", ")}`
      );
    }

    throw error;
  }
}

// Server Action to update basic info
export async function updateBasicInfo(doorcardId: string, formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      throw new Error("Unauthorized");
    }

    // Find user by email since session might not have id
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Extract and validate form data (no campus/term/year - those are handled in step 0)
    const rawData = {
      name: formData.get("name")?.toString() || "",
      doorcardName: formData.get("doorcardName")?.toString() || "",
      officeNumber: formData.get("officeNumber")?.toString() || "",
    };

    // Validate with simplified schema (no campus/term/year)
    const personalInfoSchema = z.object({
      name: z.string().min(1, "Name is required"),
      doorcardName: z.string().min(1, "Doorcard name is required"),
      officeNumber: z.string().min(1, "Office number is required"),
    });

    const validatedData = personalInfoSchema.parse(rawData);

    // Update the doorcard in the database
    await prisma.doorcard.update({
      where: {
        id: doorcardId,
        userId: user.id, // Security: ensure user owns this doorcard
      },
      data: {
        name: validatedData.name,
        doorcardName: validatedData.doorcardName,
        officeNumber: validatedData.officeNumber,
      },
    });

    // Revalidate the current page
    revalidatePath(`/doorcard/${doorcardId}/edit`);

    // Redirect to next step
    redirect(`/doorcard/${doorcardId}/edit?step=2`);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // For now, we'll just re-throw validation errors
      // In a real app, you might want to use a toast or error handling system
      throw new Error(
        `Validation failed: ${error.errors.map((e) => e.message).join(", ")}`
      );
    }

    throw error;
  }
}

// Server Action to update time blocks
export async function updateTimeBlocks(doorcardId: string, formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      throw new Error("Unauthorized");
    }

    // Find user by email since session might not have id
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Parse time blocks from form data
    const timeBlocksJson = formData.get("timeBlocks")?.toString();
    if (!timeBlocksJson) {
      throw new Error("No time blocks provided");
    }

    const timeBlocks = JSON.parse(timeBlocksJson);

    // Validate each time block
    const validatedTimeBlocks = z.array(timeBlockSchema).parse(timeBlocks);

    if (validatedTimeBlocks.length === 0) {
      throw new Error("At least one time block is required");
    }

    // First, delete existing appointments for this doorcard
    await prisma.appointment.deleteMany({
      where: { doorcardId },
    });

    // Create new appointments from time blocks
    await prisma.appointment.createMany({
      data: validatedTimeBlocks.map((block) => ({
        doorcardId,
        name: block.activity,
        startTime: block.startTime,
        endTime: block.endTime,
        dayOfWeek: block.day,
        category: block.category || "OFFICE_HOURS",
        location: block.location,
      })),
    });

    // Revalidate the current page
    revalidatePath(`/doorcard/${doorcardId}/edit`);

    // Redirect to preview step
    redirect(`/doorcard/${doorcardId}/edit?step=3`);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Validation failed: ${error.errors.map((e) => e.message).join(", ")}`
      );
    }

    throw error;
  }
}

// Server Action to create a new doorcard draft
export async function createDoorcardDraft() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      throw new Error("Unauthorized");
    }

    // Find user by email since session might not have id
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Create a new doorcard with minimal default data and DRAFT status
    const newDraft = await prisma.doorcard.create({
      data: {
        name: "",
        doorcardName: "",
        officeNumber: "",
        term: "",
        year: "",
        college: "SKYLINE", // Default value
        isActive: false, // Draft doorcards are not active
        isPublic: false, // Draft doorcards are not public
        userId: user.id,
      },
    });

    // Return the URL instead of redirecting
    return `/doorcard/${newDraft.id}/edit?step=0`;
  } catch (error) {
    console.error("Error creating doorcard draft:", error);
    throw error;
  }
}

// Server Action to publish a doorcard (convert from draft to published)
export async function publishDoorcard(doorcardId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      throw new Error("Unauthorized");
    }

    // Find user by email since session might not have id
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Update the doorcard to be active and public
    await prisma.doorcard.update({
      where: {
        id: doorcardId,
        userId: user.id,
      },
      data: {
        isActive: true,
        isPublic: true,
      },
    });

    // Revalidate relevant pages
    revalidatePath(`/doorcard/${doorcardId}/edit`);
    revalidatePath("/dashboard");

    // Redirect to dashboard
    redirect("/dashboard");
  } catch (error) {
    console.error("Error publishing doorcard:", error);
    throw error;
  }
}
