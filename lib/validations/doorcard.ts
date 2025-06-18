import { z } from "zod";

// Enum validation schemas
export const collegeSchema = z.enum(["SKYLINE", "CSM", "CANADA"]);
export const userRoleSchema = z.enum(["FACULTY", "ADMIN", "STAFF"]);
export const dayOfWeekSchema = z.enum([
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]);
export const appointmentCategorySchema = z.enum([
  "OFFICE_HOURS",
  "IN_CLASS",
  "LECTURE",
  "LAB",
  "HOURS_BY_ARRANGEMENT",
  "REFERENCE",
]);

// Time validation (24-hour format)
export const timeSchema = z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
  message: "Time must be in HH:MM format (24-hour)",
});

// Base appointment schema (without refinement)
export const baseAppointmentSchema = z.object({
  name: z.string().min(1, "Appointment name is required").max(100),
  startTime: timeSchema,
  endTime: timeSchema,
  dayOfWeek: dayOfWeekSchema,
  category: appointmentCategorySchema.default("OFFICE_HOURS"),
  location: z.string().max(50).optional(),
});

// Appointment validation with refinement
export const appointmentSchema = baseAppointmentSchema.refine(
  (data) => {
    // Validate that end time is after start time
    const [startHours, startMinutes] = data.startTime.split(":").map(Number);
    const [endHours, endMinutes] = data.endTime.split(":").map(Number);
    const startTotal = startHours * 60 + startMinutes;
    const endTotal = endHours * 60 + endMinutes;
    return endTotal > startTotal;
  },
  {
    message: "End time must be after start time",
    path: ["endTime"],
  }
);

// Create appointment schema (for API)
export const createAppointmentSchema = appointmentSchema;

// Update appointment schema (for API)
export const updateAppointmentSchema = baseAppointmentSchema.partial().extend({
  id: z.string().cuid().optional(),
});

// Basic info validation
export const basicInfoSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(100),
    doorcardName: z.string().min(1, "Doorcard name is required").max(100),
    officeNumber: z.string().min(1, "Office number is required").max(20),
    term: z.string().min(1, "Term is required").max(50),
    year: z.string().min(4, "Year must be at least 4 characters").max(4),
    college: collegeSchema.optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
  })
  .refine(
    (data) => {
      // Validate that end date is after start date
      if (data.startDate && data.endDate) {
        return data.endDate >= data.startDate;
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );

// Full doorcard validation - simplified without refinement extend
export const doorcardSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  doorcardName: z.string().min(1, "Doorcard name is required").max(100),
  officeNumber: z.string().min(1, "Office number is required").max(20),
  term: z.string().min(1, "Term is required").max(50),
  year: z.string().min(4, "Year must be at least 4 characters").max(4),
  college: collegeSchema.optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  appointments: z.array(baseAppointmentSchema).default([]),
  isActive: z.boolean().default(true),
});

// Create doorcard schema (for API)
export const createDoorcardSchema = doorcardSchema;

// Update doorcard schema (for API) - simplified
export const updateDoorcardSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(1, "Name is required").max(100).optional(),
  doorcardName: z
    .string()
    .min(1, "Doorcard name is required")
    .max(100)
    .optional(),
  officeNumber: z
    .string()
    .min(1, "Office number is required")
    .max(20)
    .optional(),
  term: z.string().min(1, "Term is required").max(50).optional(),
  year: z
    .string()
    .min(4, "Year must be at least 4 characters")
    .max(4)
    .optional(),
  college: collegeSchema.optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  appointments: z.array(baseAppointmentSchema).optional(),
  isActive: z.boolean().optional(),
});

// Draft doorcard schema (more flexible)
export const doorcardDraftSchema = z.object({
  originalDoorcardId: z.string().cuid().optional(),
  data: z.record(z.unknown()), // Flexible JSON data
});

// User validation
export const userSchema = z.object({
  name: z.string().max(100).optional(),
  email: z.string().email("Invalid email address"),
  username: z.string().max(50).optional(),
  role: userRoleSchema.default("FACULTY"),
  college: collegeSchema.optional(),
});

// Legacy TimeBlock schema (for backward compatibility)
export const timeBlockSchema = z.object({
  id: z.string(),
  day: dayOfWeekSchema,
  startTime: timeSchema,
  endTime: timeSchema,
  activity: z.string().min(1, "Activity is required"),
  location: z.string().optional(),
  category: appointmentCategorySchema.optional(),
});

// Validation helpers
export function validateTimeSlot(startTime: string, endTime: string): boolean {
  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);
  const startTotal = startHours * 60 + startMinutes;
  const endTotal = endHours * 60 + endMinutes;
  return endTotal > startTotal;
}

export function validateAppointmentOverlap(
  appointments: Array<{ dayOfWeek: string; startTime: string; endTime: string }>
): boolean {
  // Group by day
  const appointmentsByDay = appointments.reduce((acc, appointment) => {
    if (!acc[appointment.dayOfWeek]) {
      acc[appointment.dayOfWeek] = [];
    }
    acc[appointment.dayOfWeek].push(appointment);
    return acc;
  }, {} as Record<string, typeof appointments>);

  // Check for overlaps within each day
  for (const dayAppointments of Object.values(appointmentsByDay)) {
    for (let i = 0; i < dayAppointments.length; i++) {
      for (let j = i + 1; j < dayAppointments.length; j++) {
        const a = dayAppointments[i];
        const b = dayAppointments[j];

        const aStart = timeToMinutes(a.startTime);
        const aEnd = timeToMinutes(a.endTime);
        const bStart = timeToMinutes(b.startTime);
        const bEnd = timeToMinutes(b.endTime);

        // Check if appointments overlap
        if (aStart < bEnd && bStart < aEnd) {
          return false; // Overlap found
        }
      }
    }
  }

  return true; // No overlaps
}

export function validateTimeBlockOverlap(
  newBlock: { day: string; startTime: string; endTime: string },
  existingBlocks: Array<{
    id: string;
    day: string;
    startTime: string;
    endTime: string;
    activity: string;
  }>,
  editingId?: string | null
): string | null {
  // Validate that end time is after start time
  if (!validateTimeSlot(newBlock.startTime, newBlock.endTime)) {
    return "End time must be after start time";
  }

  // Filter out the block being edited
  const blocksToCheck = editingId
    ? existingBlocks.filter((block) => block.id !== editingId)
    : existingBlocks;

  // Check for overlaps with existing blocks on the same day
  const sameDay = blocksToCheck.filter((block) => block.day === newBlock.day);

  const newStart = timeToMinutes(newBlock.startTime);
  const newEnd = timeToMinutes(newBlock.endTime);

  for (const existingBlock of sameDay) {
    const existingStart = timeToMinutes(existingBlock.startTime);
    const existingEnd = timeToMinutes(existingBlock.endTime);

    // Check if time blocks overlap
    if (newStart < existingEnd && existingStart < newEnd) {
      return `Time block overlaps with existing ${existingBlock.day} block (${existingBlock.startTime} - ${existingBlock.endTime})`;
    }
  }

  return null; // No overlaps
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

// Export types for type inference
export type BasicInfo = z.infer<typeof basicInfoSchema>;
export type DoorcardData = z.infer<typeof doorcardSchema>;
export type CreateDoorcardData = z.infer<typeof createDoorcardSchema>;
export type UpdateDoorcardData = z.infer<typeof updateDoorcardSchema>;
export type AppointmentData = z.infer<typeof appointmentSchema>;
export type CreateAppointmentData = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentData = z.infer<typeof updateAppointmentSchema>;
export type UserData = z.infer<typeof userSchema>;
export type TimeBlockData = z.infer<typeof timeBlockSchema>;
