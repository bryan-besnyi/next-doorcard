// API Validation Types

// Re-export validation types from lib/validations/doorcard.ts
export type {
  BasicInfo,
  DoorcardData,
  CreateDoorcardData,
  UpdateDoorcardData,
  AppointmentData,
  CreateAppointmentData,
  UpdateAppointmentData,
  UserData,
  TimeBlockData,
} from "@/lib/validations/doorcard";

// Re-export schemas for runtime validation
export * from "@/lib/validations/doorcard";
