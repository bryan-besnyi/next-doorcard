export type College = "SKYLINE" | "CSM" | "CANADA";
export type UserRole = "FACULTY" | "ADMIN" | "STAFF";
export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";
export type AppointmentCategory =
  | "OFFICE_HOURS"
  | "IN_CLASS"
  | "LECTURE"
  | "LAB"
  | "HOURS_BY_ARRANGEMENT"
  | "REFERENCE";

export interface User {
  id: string;
  name?: string;
  email: string;
  username?: string;
  role: UserRole;
  college?: College;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  name: string;
  startTime: string; // "08:00"
  endTime: string; // "09:30"
  dayOfWeek: DayOfWeek;
  category: AppointmentCategory;
  location?: string;
  doorcardId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Doorcard {
  id: string;
  name: string;
  doorcardName: string;
  officeNumber: string;
  startDate?: Date;
  endDate?: Date;
  term: string;
  year: string;
  college?: College;
  isActive: boolean;
  userId: string;
  appointments: Appointment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DoorcardWithUser extends Doorcard {
  user: User;
}

export interface DoorcardDraft {
  id: string;
  userId: string;
  originalDoorcardId?: string;
  data: Record<string, unknown>; // JSON data for draft state
  lastUpdated: Date;
}

// Legacy TimeBlock interface for backward compatibility during transition
export interface TimeBlock {
  id: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  activity: string;
  location?: string;
  category?: AppointmentCategory;
}

// Form types for creating/editing
export interface CreateDoorcardData {
  name: string;
  doorcardName: string;
  officeNumber: string;
  startDate?: Date;
  endDate?: Date;
  term: string;
  year: string;
  college?: College;
  appointments: CreateAppointmentData[];
}

export interface CreateAppointmentData {
  name: string;
  startTime: string;
  endTime: string;
  dayOfWeek: DayOfWeek;
  category: AppointmentCategory;
  location?: string;
}

// API Response types
export interface DoorcardResponse {
  doorcard: DoorcardWithUser;
  success: boolean;
  error?: string;
}

export interface DoorcardListResponse {
  doorcards: DoorcardWithUser[];
  success: boolean;
  error?: string;
}

// Helper types for day/time utilities
export interface WeeklySchedule {
  [key in DayOfWeek]?: Appointment[];
}

export const DAYS_OF_WEEK: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export const APPOINTMENT_CATEGORIES: {
  value: AppointmentCategory;
  label: string;
  color: string;
}[] = [
  { value: "OFFICE_HOURS", label: "Office Hours", color: "#E1E2CA" },
  { value: "IN_CLASS", label: "In Class", color: "#99B5D5" },
  { value: "LECTURE", label: "Lecture", color: "#D599C5" },
  { value: "LAB", label: "Lab", color: "#EDAC80" },
  {
    value: "HOURS_BY_ARRANGEMENT",
    label: "Hours by Arrangement",
    color: "#99D5A1",
  },
  { value: "REFERENCE", label: "Reference", color: "#AD99D5" },
];

export const COLLEGES: { value: College; label: string }[] = [
  { value: "SKYLINE", label: "Skyline College" },
  { value: "CSM", label: "College of San Mateo" },
  { value: "CANADA", label: "Cañada College" },
];
