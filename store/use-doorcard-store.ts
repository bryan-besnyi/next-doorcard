import { create } from "zustand";
import * as z from "zod";

export const basicInfoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  doorcardName: z.string().min(1, "Doorcard name is required"),
  officeNumber: z.string().min(1, "Office number is required"),
  term: z.string().min(1, "Term is required"),
  year: z.string().min(1, "Year is required"),
});

export const timeBlockSchema = z.object({
  id: z.string(),
  day: z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], {
    required_error: "Day is required",
  }),
  startTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  endTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  activity: z.enum(["Class", "Office Hours", "Lab Hours", "Lab Time", "TBA"], {
    required_error: "Activity is required",
  }),
});

export const doorcardSchema = z.object({
  ...basicInfoSchema.shape,
  timeBlocks: z
    .array(timeBlockSchema)
    .min(1, "At least one time block is required"),
});

export type BasicInfo = z.infer<typeof basicInfoSchema>;
export type TimeBlock = z.infer<typeof timeBlockSchema>;
export type Doorcard = z.infer<typeof doorcardSchema>;

type DoorcardMode = "create" | "edit" | "view";

interface DoorcardState {
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
  validateCurrentStep: () => boolean;
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

const initialState = {
  mode: "create" as DoorcardMode,
  originalDoorcardId: null,
  draftId: null,
  name: "",
  doorcardName: "",
  officeNumber: "",
  term: "",
  year: "",
  timeBlocks: [],
  currentStep: 0,
  errors: {},
  hasViewedPreview: false,
  hasViewedPrint: false,
  isLoading: {
    loadingDraft: false,
    loadingDoorcard: false,
    savingDraft: false,
    submitting: false,
    deleting: false,
  },
};

interface StepProgress {
  totalPoints: number;
  completedPoints: number;
}

// Helper function to safely parse JSON responses
async function safeJsonParse(
  response: Response
): Promise<Record<string, unknown>> {
  try {
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  } catch (error) {
    console.warn("Failed to parse response as JSON:", error);
    return {};
  }
}

// Fixed debounce function with proper typing
function debounce<T extends unknown[]>(
  func: (...args: T) => void,
  wait: number
): (...args: T) => void {
  let timeout: NodeJS.Timeout | null = null;
  let lastCall = 0;

  return (...args: T) => {
    const now = Date.now();
    if (timeout) clearTimeout(timeout);

    if (now - lastCall >= wait) {
      lastCall = now;
      func(...args);
    } else {
      timeout = setTimeout(() => {
        lastCall = now;
        func(...args);
      }, wait);
    }
  };
}

const useDoorcardStore = create<DoorcardState>((set, get) => ({
  ...initialState,

  setMode: (mode, doorcardId) => {
    set({
      mode,
      originalDoorcardId: doorcardId || null,
      // Reset draft ID when switching to edit mode
      ...(mode === "edit" && { draftId: null }),
    });
  },

  shouldAutoSave: () => {
    const state = get();
    // Only auto-save in create mode or when explicitly working with a draft
    return (
      state.mode === "create" ||
      (state.mode === "edit" && state.draftId !== null)
    );
  },

  setBasicInfo: (info, options = {}) => {
    set((state) => {
      const newState = {
        ...state,
        ...info,
        errors: {},
      };

      // Only auto-save if appropriate and not explicitly skipped
      if (
        !options.skipAutoSave &&
        state.shouldAutoSave() &&
        Object.values(info).some((value) => value)
      ) {
        // Use setTimeout to avoid calling method during state update
        setTimeout(() => {
          const currentState = get();
          currentState.autoSaveDraft();
        }, 0);
      }

      return newState;
    });
  },

  setTimeBlocks: (timeBlocks, options = {}) => {
    set((state) => {
      const newState = { ...state, timeBlocks, errors: {} };

      // Only auto-save if appropriate and not explicitly skipped
      if (
        !options.skipAutoSave &&
        state.shouldAutoSave() &&
        timeBlocks.length > 0
      ) {
        setTimeout(() => {
          const currentState = get();
          currentState.autoSaveDraft();
        }, 0);
      }

      return newState;
    });
  },

  addTimeBlock: (timeBlock) => {
    set((state) => {
      const newState = {
        ...state,
        timeBlocks: [...state.timeBlocks, timeBlock],
        errors: {},
      };

      if (state.shouldAutoSave()) {
        setTimeout(() => {
          const currentState = get();
          currentState.autoSaveDraft();
        }, 0);
      }

      return newState;
    });
  },

  removeTimeBlock: (id) =>
    set((state) => ({
      timeBlocks: state.timeBlocks.filter((block) => block.id !== id),
    })),

  setCurrentStep: (step) => set({ currentStep: step }),

  validateCurrentStep: () => {
    const state = get();
    try {
      switch (state.currentStep) {
        case 0:
          basicInfoSchema.parse({
            name: state.name,
            doorcardName: state.doorcardName,
            officeNumber: state.officeNumber,
            term: state.term,
            year: state.year,
          });
          return true;
        case 1:
          if (state.timeBlocks.length === 0) {
            throw new Error("At least one time block is required");
          }
          return true;
        case 2:
          doorcardSchema.parse({
            name: state.name,
            doorcardName: state.doorcardName,
            officeNumber: state.officeNumber,
            term: state.term,
            year: state.year,
            timeBlocks: state.timeBlocks,
          });
          return true;
        default:
          return true;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
        set((state) => ({
          ...state,
          errors: {
            ...state.errors,
            basicInfo: fieldErrors,
          },
        }));
      } else if (error instanceof Error) {
        set((state) => ({
          ...state,
          errors: {
            ...state.errors,
            general: [error.message],
          },
        }));
      }
      return false;
    }
  },

  reset: () => {
    set({
      ...initialState,
      isLoading: {
        loadingDraft: false,
        loadingDoorcard: false,
        savingDraft: false,
        submitting: false,
        deleting: false,
      },
    });
  },

  loadDraft: async (draftId: string) => {
    const state = get();
    state.setLoading("loadingDraft", true);
    try {
      const response = await fetch(`/api/doorcards/draft/${draftId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch draft");
      }
      const draft = await safeJsonParse(response);
      const draftData =
        draft.data && typeof draft.data === "object" ? draft.data : {};
      const loadedDraftId = typeof draft.id === "string" ? draft.id : null;

      set({
        ...draftData,
        draftId: loadedDraftId,
        mode: "create",
      });
    } catch (error) {
      console.error("Error loading draft:", error);
      throw error;
    } finally {
      state.setLoading("loadingDraft", false);
    }
  },

  calculateProgress: () => {
    const state = get();

    const steps: StepProgress[] = [
      {
        totalPoints: 5,
        completedPoints: [
          state.name,
          state.doorcardName,
          state.officeNumber,
          state.term,
          state.year,
        ].filter(Boolean).length,
      },
      {
        totalPoints: 5,
        completedPoints: Math.min(5, state.timeBlocks.length * 1.25),
      },
      {
        totalPoints: 5,
        completedPoints: state.currentStep >= 2 ? 5 : 0,
      },
      {
        totalPoints: 5,
        completedPoints: state.currentStep >= 3 ? 5 : 0,
      },
    ];

    const totalPoints = steps.reduce((sum, step) => sum + step.totalPoints, 0);
    const completedPoints = steps.reduce(
      (sum, step) => sum + step.completedPoints,
      0
    );

    return Math.round((completedPoints / totalPoints) * 100);
  },

  saveDraft: async () => {
    const state = get();

    // Don't save if there's no meaningful data or we're in view mode
    if (
      state.mode === "view" ||
      (!state.name &&
        !state.doorcardName &&
        !state.officeNumber &&
        state.timeBlocks.length === 0)
    ) {
      return;
    }

    state.setLoading("savingDraft", true);
    try {
      const response = await fetch("/api/doorcards/draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          draftId: state.draftId,
          originalDoorcardId: state.originalDoorcardId,
          name: state.name,
          doorcardName: state.doorcardName,
          officeNumber: state.officeNumber,
          term: state.term,
          year: state.year,
          timeBlocks: state.timeBlocks,
          currentStep: state.currentStep,
        }),
      });

      if (!response.ok) {
        const errorData = await safeJsonParse(response);
        const errorMessage =
          typeof errorData.error === "string"
            ? errorData.error
            : "Failed to save draft";
        throw new Error(errorMessage);
      }

      const data = await safeJsonParse(response);
      const draftId = typeof data.id === "string" ? data.id : null;
      if (draftId) {
        set({ draftId });
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      throw error;
    } finally {
      state.setLoading("savingDraft", false);
    }
  },

  autoSaveDraft: (() => {
    const debouncedSave = debounce(() => {
      const state = get();
      if (state.shouldAutoSave()) {
        state.saveDraft();
      }
    }, 5000);
    return () => {
      debouncedSave();
    };
  })(),

  saveAndReturnToDashboard: async () => {
    const state = get();

    if (
      !state.name &&
      !state.doorcardName &&
      !state.officeNumber &&
      state.timeBlocks.length === 0
    ) {
      return;
    }

    try {
      await state.saveDraft();
    } catch (error) {
      console.error("Error saving draft:", error);
      throw error;
    }
  },

  setStepViewed: (step) =>
    set(() => ({
      ...(step === "preview" && { hasViewedPreview: true }),
      ...(step === "print" && { hasViewedPrint: true }),
    })),

  saveEntireState: async () => {
    const state = get();

    // Don't save in edit mode unless we have a draftId (user has made changes)
    if (state.mode === "edit" && !state.draftId) {
      return;
    }

    // Don't save if there's no meaningful data or we're in view mode
    if (state.mode === "view") {
      return;
    }

    state.setLoading("savingDraft", true);
    try {
      const response = await fetch("/api/doorcards/draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          draftId: state.draftId,
          originalDoorcardId: state.originalDoorcardId,
          name: state.name,
          doorcardName: state.doorcardName,
          officeNumber: state.officeNumber,
          term: state.term,
          year: state.year,
          timeBlocks: state.timeBlocks,
          currentStep: state.currentStep,
          hasViewedPreview: state.hasViewedPreview,
          hasViewedPrint: state.hasViewedPrint,
        }),
      });

      if (!response.ok) {
        const errorData = await safeJsonParse(response);
        const errorMessage =
          typeof errorData.error === "string"
            ? errorData.error
            : "Failed to save draft";
        throw new Error(errorMessage);
      }

      const data = await safeJsonParse(response);
      const draftId = typeof data.id === "string" ? data.id : null;
      if (draftId) {
        set({ draftId });
      }
    } catch (error) {
      console.error("Error saving entire state:", error);
      throw error;
    } finally {
      state.setLoading("savingDraft", false);
    }
  },

  loadDoorcard: async (doorcardId: string) => {
    const state = get();
    state.setLoading("loadingDoorcard", true);
    try {
      const response = await fetch(`/api/doorcards/${doorcardId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch doorcard");
      }
      const doorcard = await safeJsonParse(response);

      set({
        ...initialState,
        mode: "edit",
        originalDoorcardId: doorcardId,
        name: typeof doorcard.name === "string" ? doorcard.name : "",
        doorcardName:
          typeof doorcard.doorcardName === "string"
            ? doorcard.doorcardName
            : "",
        officeNumber:
          typeof doorcard.officeNumber === "string"
            ? doorcard.officeNumber
            : "",
        term: typeof doorcard.term === "string" ? doorcard.term : "",
        year: typeof doorcard.year === "string" ? doorcard.year : "",
        timeBlocks: Array.isArray(doorcard.timeBlocks)
          ? doorcard.timeBlocks
          : [],
        currentStep: 0,
      });
    } catch (error) {
      console.error("Error loading doorcard:", error);
      throw error;
    } finally {
      state.setLoading("loadingDoorcard", false);
    }
  },

  setLoading: (key: keyof DoorcardState["isLoading"], value: boolean) => {
    set((state) => ({
      isLoading: {
        ...state.isLoading,
        [key]: value,
      },
    }));
  },
}));

export { useDoorcardStore };
