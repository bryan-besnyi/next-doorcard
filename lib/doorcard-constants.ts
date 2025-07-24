// Shared constants for doorcard display components
import { convertToPST } from "./utils";

// Re-export utility functions
export { convertToPST } from "./utils";

// Days configuration
export const DAYS_FULL = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const DAYS_WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

export const DAY_ABBREVIATIONS = [
  "Mon",
  "Tues",
  "Wed",
  "Thurs",
  "Fri",
  "Sat",
  "Sun",
];

// Time slots - standardized to 7AM-10PM (30 slots)
export const TIME_SLOTS = Array.from({ length: 30 }, (_, i) => {
  const hour = Math.floor(i / 2) + 7;
  const minute = i % 2 === 0 ? "00" : "30";
  const value = `${hour.toString().padStart(2, "0")}:${minute}`;
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  const period = hour >= 12 ? "PM" : "AM";
  const label = `${displayHour}:${minute} ${period}`;
  return { value, label, hour, minute: minute === "00" ? 0 : 30 };
});

// Category colors and labels
export const CATEGORY_COLORS = {
  OFFICE_HOURS: "#E1E2CA",
  IN_CLASS: "#99B5D5",
  LECTURE: "#D599C5",
  LAB: "#EDAC80",
  HOURS_BY_ARRANGEMENT: "#99D5A1",
  REFERENCE: "#AD99D5",
};

export const CATEGORY_LABELS = {
  OFFICE_HOURS: "Office Hours",
  IN_CLASS: "In Class",
  LECTURE: "Lecture",
  LAB: "Lab",
  HOURS_BY_ARRANGEMENT: "Hours by Arrangement",
  REFERENCE: "Reference",
};

export const extractCourseCode = (activity: string) => {
  // If activity contains " - ", take only the part before it
  if (activity.includes(" - ")) {
    return activity.split(" - ")[0];
  }
  // If activity contains "CS", "MATH", etc., try to extract just the course code
  const courseCodeMatch = activity.match(/^([A-Z]{2,4}\s*\d{1,4}[A-Z]?)/);
  if (courseCodeMatch) {
    return courseCodeMatch[1];
  }
  // For activities like "Office Hours", "Lab", keep as is but make shorter
  if (activity.toLowerCase().includes("office hours")) return "Office Hours";
  if (activity.toLowerCase().includes("lab")) return "Lab";
  // Return first 12 characters to ensure it fits
  return activity.substring(0, 12);
};

export const getTimeInMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export const formatTimeRange = (start: string, end: string) => {
  return `${convertToPST(start)} - ${convertToPST(end)}`;
};

// Activity styling for preview mode
export const getActivityStyle = (activity: string) => {
  switch (activity) {
    case "Office Hours":
      return "bg-green-50";
    case "Class":
      return "bg-blue-50";
    case "Lab Time":
      return "bg-yellow-50";
    case "TBA":
      return "bg-gray-50";
    default:
      return "bg-gray-50";
  }
};
