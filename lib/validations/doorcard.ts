import * as z from "zod"

export const basicInfoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  doorcardName: z.string().min(1, "Doorcard name is required"),
  officeNumber: z.string().min(1, "Office number is required"),
  term: z.string().min(1, "Term is required"),
  year: z.string().min(1, "Year is required"),
})

export const timeBlockSchema = z.object({
  id: z.string(),
  day: z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], {
    required_error: "Day is required",
  }),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  activity: z.enum(["Class", "Office Hours", "Lab Time", "TBA"], {
    required_error: "Activity is required",
  }),
})

export const doorcardSchema = z.object({
  ...basicInfoSchema.shape,
  timeBlocks: z.array(timeBlockSchema).min(1, "At least one time block is required"),
})

export type BasicInfo = z.infer<typeof basicInfoSchema>
export type TimeBlock = z.infer<typeof timeBlockSchema>
export type Doorcard = z.infer<typeof doorcardSchema>

export function validateTimeBlockOverlap(
  newBlock: Omit<TimeBlock, "id">,
  existingBlocks: TimeBlock[],
  editingId?: string,
): string | null {
  const getMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number)
    return hours * 60 + minutes
  }

  const newStart = getMinutes(newBlock.startTime)
  const newEnd = getMinutes(newBlock.endTime)

  if (newStart >= newEnd) {
    return "End time must be after start time"
  }

  const overlappingBlock = existingBlocks.find((block) => {
    if (editingId && block.id === editingId) return false
    if (block.day !== newBlock.day) return false

    const blockStart = getMinutes(block.startTime)
    const blockEnd = getMinutes(block.endTime)

    return (
      (newStart >= blockStart && newStart < blockEnd) || // New block starts during existing block
      (newEnd > blockStart && newEnd <= blockEnd) || // New block ends during existing block
      (newStart <= blockStart && newEnd >= blockEnd) // New block completely encompasses existing block
    )
  })

  if (overlappingBlock) {
    return `Time block overlaps with existing block: ${overlappingBlock.day} ${overlappingBlock.startTime}-${overlappingBlock.endTime}`
  }

  return null
}

