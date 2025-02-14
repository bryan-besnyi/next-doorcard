import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertToPST(time: string) {
  const [hours, minutes] = time.split(":").map(Number)
  const period = hours >= 12 ? "PM" : "AM"
  const adjustedHours = hours % 12 || 12
  return `${adjustedHours}:${minutes.toString().padStart(2, "0")} ${period}`
}
