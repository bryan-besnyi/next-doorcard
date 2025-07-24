import { z } from "zod";

// Schemas for the edit flow (migrated from actions.ts)
export const basicInfoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  doorcardName: z.string().min(1, "Doorcard name is required"),
  officeNumber: z.string().min(1, "Office number is required"),
  term: z.string().min(1, "Term is required"),
  year: z.string().min(1, "Year is required"),
  college: z.enum(["SKYLINE", "CSM", "CANADA"], {
    required_error: "Campus is required",
  }),
});

export const timeBlockSchema = z.object({
  id: z.string(),
  day: z.enum([
    "MONDAY",
    "TUESDAY", 
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ], {
    required_error: "Day is required",
  }),
  startTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  endTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  activity: z.string().min(1, "Activity is required"),
  location: z.string().nullable().optional(),
  category: z
    .enum([
      "OFFICE_HOURS",
      "IN_CLASS",
      "LECTURE",
      "LAB",
      "HOURS_BY_ARRANGEMENT",
      "REFERENCE",
    ])
    .optional(),
}); 