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
  prevState: any,
  formData: FormData
): Promise<{ success: boolean; message?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { success: false, message: "Unauthorized" };
  }

  // Find user by email since session might not have id
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return { success: false, message: "User not found" };
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
    college: z
      .string()
      .min(1, "Campus is required")
      .refine((val) => ["SKYLINE", "CSM", "CANADA"].includes(val), {
        message: "Campus is required",
      }),
  });

  try {
    const validatedData = campusTermSchema.parse(rawData);

    // Check for duplicate doorcards
    const existingDoorcard = await prisma.doorcard.findFirst({
      where: {
        userId: user.id,
        college: validatedData.college as any,
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

      return {
        success: false,
        message: `You already have a doorcard for ${campusName} - ${validatedData.term} ${validatedData.year}. Please edit your existing doorcard "${existingDoorcard.doorcardName}" instead.`,
      };
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
        college: validatedData.college as any,
      },
    });

    // Revalidate the current page
    revalidatePath(`/doorcard/${doorcardId}/edit`);

    // Redirect to basic info step - don't catch this error
    redirect(`/doorcard/${doorcardId}/edit?step=1`);
  } catch (error) {
    // Only catch validation errors, not redirect errors
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: `Validation failed: ${error.errors
          .map((e) => e.message)
          .join(", ")}`,
      };
    }

    // Re-throw redirect errors and other system errors
    throw error;
  }
}

// Server Action to update basic info
export async function updateBasicInfo(
  doorcardId: string,
  prevState: any,
  formData: FormData
): Promise<{ success: boolean; message?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { success: false, message: "Unauthorized" };
  }

  // Find user by email since session might not have id
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return { success: false, message: "User not found" };
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

  try {
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

    // Redirect to next step - don't catch this error
    redirect(`/doorcard/${doorcardId}/edit?step=2`);
  } catch (error) {
    // Only catch validation errors, not redirect errors
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: `Validation failed: ${error.errors
          .map((e) => e.message)
          .join(", ")}`,
      };
    }

    // Re-throw redirect errors and other system errors
    throw error;
  }
}

// Server Action to update time blocks
export async function updateTimeBlocks(
  doorcardId: string,
  prevState: any,
  formData: FormData
): Promise<{ success: boolean; message?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { success: false, message: "Unauthorized" };
  }

  // Find user by email since session might not have id
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return { success: false, message: "User not found" };
  }

  // Parse time blocks from form data
  const timeBlocksJson = formData.get("timeBlocks")?.toString();
  if (!timeBlocksJson) {
    return { success: false, message: "No time blocks provided" };
  }

  try {
    const timeBlocks = JSON.parse(timeBlocksJson);

    // Validate each time block
    const validatedTimeBlocks = z.array(timeBlockSchema).parse(timeBlocks);

    if (validatedTimeBlocks.length === 0) {
      return { success: false, message: "At least one time block is required" };
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

    // Redirect to preview step - don't catch this error
    redirect(`/doorcard/${doorcardId}/edit?step=3`);
  } catch (error) {
    // Only catch validation errors, not redirect errors
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: `Validation failed: ${error.errors
          .map((e) => e.message)
          .join(", ")}`,
      };
    }

    // Re-throw redirect errors and other system errors
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
        term: "", // Empty - user must select
        year: "", // Empty - user must select
        college: null, // Null - user must select
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

// Server Action to create a doorcard after validating campus/term (no draft until valid)
export async function createDoorcardWithCampusTerm(
  prevState: any,
  formData: FormData
): Promise<{ success: boolean; message?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, message: "Unauthorized" };
    }

    // Find user by email since session might not have id
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return { success: false, message: "User not found" };
    }

    const rawData = {
      term: formData.get("term")?.toString() || "",
      year: formData.get("year")?.toString() || "",
      college: formData.get("college")?.toString() || "",
    };

    const campusTermSchema = z.object({
      term: z.string().min(1, "Term is required"),
      year: z.string().min(1, "Year is required"),
      college: z
        .string()
        .min(1, "Campus is required")
        .refine((val) => ["SKYLINE", "CSM", "CANADA"].includes(val), {
          message: "Campus is required",
        }),
    });

    const validatedData = campusTermSchema.parse(rawData);

    // Check for duplicate
    const existingDoorcard = await prisma.doorcard.findFirst({
      where: {
        userId: user.id,
        college: validatedData.college as any,
        term: validatedData.term,
        year: validatedData.year,
        isActive: true,
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

      return {
        success: false,
        message: `You already have a doorcard for ${campusName} - ${validatedData.term} ${validatedData.year}. Please edit your existing doorcard "${existingDoorcard.doorcardName}" instead.`,
      };
    }

    // Create the draft
    const newDraft = await prisma.doorcard.create({
      data: {
        name: "",
        doorcardName: "",
        officeNumber: "",
        term: validatedData.term,
        year: validatedData.year,
        college: validatedData.college as any,
        isActive: false,
        isPublic: false,
        userId: user.id,
      },
    });

    // Redirect to edit page for next step
    redirect(`/doorcard/${newDraft.id}/edit?step=1`);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: `Validation failed: ${error.errors
          .map((e) => e.message)
          .join(", ")}`,
      };
    }
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
