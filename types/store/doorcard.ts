// Store Types

import * as z from "zod";

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
  day: z.enum(
    [
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
      "SUNDAY",
    ],
    {
      required_error: "Day is required",
    }
  ),
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

export const doorcardSchema = z.object({
  ...basicInfoSchema.shape,
  timeBlocks: z
    .array(timeBlockSchema)
    .min(1, "At least one time block is required"),
});

export type BasicInfo = z.infer<typeof basicInfoSchema>;
export type TimeBlock = z.infer<typeof timeBlockSchema> & {
  location?: string | null;
};
export type Doorcard = z.infer<typeof doorcardSchema>;

export type DoorcardMode = "create" | "edit" | "view";

export interface DoorcardState {
  // Mode tracking
  mode: DoorcardMode;
  originalDoorcardId: string | null;
  draftId: string | null;

  // Form data
  name: string;
  doorcardName: string;
  officeNumber: string;
  term: string;
  year: string;
  college: string;
  timeBlocks: TimeBlock[];
  currentStep: number;
  errors: {
    basicInfo?: Record<string, string>;
    timeBlocks?: string[];
    general?: string[];
  };

  // UI state
  hasViewedPreview: boolean;
  hasViewedPrint: boolean;

  // Loading states
  isLoading: {
    loadingDraft: boolean;
    loadingDoorcard: boolean;
    savingDraft: boolean;
    submitting: boolean;
    deleting: boolean;
  };

  // Actions
  setMode: (mode: DoorcardMode, doorcardId?: string) => void;
  setBasicInfo: (
    info: Partial<BasicInfo>,
    options?: { skipAutoSave?: boolean }
  ) => void;
  setTimeBlocks: (
    timeBlocks: TimeBlock[],
    options?: { skipAutoSave?: boolean }
  ) => void;
  addTimeBlock: (timeBlock: TimeBlock) => void;
  removeTimeBlock: (id: string) => void;
  setCurrentStep: (step: number) => void;
  validateCurrentStep: () => Promise<boolean>;
  validateDuplicateDoorcards: () => Promise<{
    isDuplicate: boolean;
    message: string;
    existingDoorcardId?: string;
  }>;
  reset: () => void;
  loadDraft: (draftId: string) => Promise<void>;
  calculateProgress: () => number;
  saveDraft: () => Promise<void>;
  autoSaveDraft: () => void;
  saveAndReturnToDashboard: () => Promise<void>;
  setStepViewed: (step: "preview" | "print") => void;
  saveEntireState: () => Promise<void>;
  loadDoorcard: (doorcardId: string) => Promise<void>;
  shouldAutoSave: () => boolean;
  setLoading: (key: keyof DoorcardState["isLoading"], value: boolean) => void;
}

export interface StepProgress {
  totalPoints: number;
  completedPoints: number;
}
