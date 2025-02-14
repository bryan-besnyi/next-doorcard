import { create } from "zustand"
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
  activity: z.enum(["Class", "Office Hours", "Lab Hours", "Lab Time", "TBA"], {
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

interface DoorcardState {
  draftId: string | null
  name: string
  doorcardName: string
  officeNumber: string
  term: string
  year: string
  timeBlocks: TimeBlock[]
  currentStep: number
  errors: {
    basicInfo?: Record<string, string>
    timeBlocks?: string[]
    general?: string[]
  }
  setBasicInfo: (info: Partial<BasicInfo>) => void
  setTimeBlocks: (timeBlocks: TimeBlock[]) => void
  addTimeBlock: (timeBlock: TimeBlock) => void
  removeTimeBlock: (id: string) => void
  setCurrentStep: (step: number) => void
  validateCurrentStep: () => boolean
  reset: () => void
  loadDraft: (draftId: string) => Promise<void>
  calculateProgress: () => number
  saveDraft: () => Promise<void>
  autoSaveDraft: () => void
  saveAndReturnToDashboard: () => Promise<void>
  hasViewedPreview: boolean
  hasViewedPrint: boolean
  setStepViewed: (step: "preview" | "print") => void
  saveEntireState: () => Promise<void>
}

const initialState = {
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
}

interface StepProgress {
  totalPoints: number
  completedPoints: number
}

function debounce<F extends (...args: any[]) => any>(func: F, wait: number): (...args: Parameters<F>) => void {
  let timeout: NodeJS.Timeout | null = null
  let lastCall = 0

  return (...args: Parameters<F>) => {
    const now = Date.now()
    if (timeout) clearTimeout(timeout)

    if (now - lastCall >= wait) {
      lastCall = now
      func(...args)
    } else {
      timeout = setTimeout(() => {
        lastCall = now
        func(...args)
      }, wait)
    }
  }
}

export const useDoorcardStore = create<DoorcardState>()((set, get) => ({
  ...initialState,
  setBasicInfo: (info) => {
    set((state) => {
      const newState = {
        ...state,
        ...info,
      }
      // Only trigger auto-save if we have some actual data
      if (Object.values(info).some((value) => value)) {
        newState.autoSaveDraft()
      }
      return { ...newState, errors: {} }
    })
  },
  setTimeBlocks: (timeBlocks) => {
    set((state) => {
      const newState = { ...state, timeBlocks, errors: {} }
      if (timeBlocks.length > 0) {
        newState.autoSaveDraft()
      }
      return newState
    })
  },
  addTimeBlock: (timeBlock) => {
    set((state) => {
      const newState = {
        ...state,
        timeBlocks: [...state.timeBlocks, timeBlock],
        errors: {},
      }
      newState.autoSaveDraft()
      return newState
    })
  },
  removeTimeBlock: (id) =>
    set((state) => ({
      timeBlocks: state.timeBlocks.filter((block) => block.id !== id),
    })),
  setCurrentStep: (step) => set({ currentStep: step }),
  validateCurrentStep: () => {
    const state = get()
    try {
      switch (state.currentStep) {
        case 0:
          basicInfoSchema.parse({
            name: state.name,
            doorcardName: state.doorcardName,
            officeNumber: state.officeNumber,
            term: state.term,
            year: state.year,
          })
          return true
        case 1:
          if (state.timeBlocks.length === 0) {
            throw new Error("At least one time block is required")
          }
          return true
        case 2:
          doorcardSchema.parse({
            name: state.name,
            doorcardName: state.doorcardName,
            officeNumber: state.officeNumber,
            term: state.term,
            year: state.year,
            timeBlocks: state.timeBlocks,
          })
          return true
        default:
          return true
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path) {
            fieldErrors[err.path[0]] = err.message
          }
        })
        set((state) => ({
          ...state,
          errors: {
            ...state.errors,
            basicInfo: fieldErrors,
          },
        }))
      } else if (error instanceof Error) {
        set((state) => ({
          ...state,
          errors: {
            ...state.errors,
            general: [error.message],
          },
        }))
      }
      return false
    }
  },
  reset: () => {
    set(initialState)
  },
  loadDraft: async (draftId: string) => {
    try {
      const response = await fetch(`/api/doorcards/draft/${draftId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch draft")
      }
      const draft = await response.json()
      set({ ...draft.data, draftId: draft.id })
    } catch (error) {
      console.error("Error loading draft:", error)
      throw error
    }
  },
  calculateProgress: () => {
    const state = get()

    const steps: StepProgress[] = [
      {
        totalPoints: 5,
        completedPoints: [state.name, state.doorcardName, state.officeNumber, state.term, state.year].filter(Boolean)
          .length,
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
    ]

    const totalPoints = steps.reduce((sum, step) => sum + step.totalPoints, 0)
    const completedPoints = steps.reduce((sum, step) => sum + step.completedPoints, 0)

    return Math.round((completedPoints / totalPoints) * 100)
  },
  saveDraft: async () => {
    const state = get()

    // Don't save if there's no meaningful data
    if (!state.name && !state.doorcardName && !state.officeNumber && state.timeBlocks.length === 0) {
      return
    }

    try {
      const response = await fetch("/api/doorcards/draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          draftId: state.draftId, // Include the draft ID if it exists
          name: state.name,
          doorcardName: state.doorcardName,
          officeNumber: state.officeNumber,
          term: state.term,
          year: state.year,
          timeBlocks: state.timeBlocks,
          currentStep: state.currentStep,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save draft")
      }

      const data = await response.json()
      set({ draftId: data.id })
    } catch (error) {
      console.error("Error saving draft:", error)
    }
  },
  autoSaveDraft: (() => {
    const debouncedSave = debounce(() => {
      const state = get()
      state.saveDraft()
    }, 5000) // Increase debounce time to 5 seconds
    return () => {
      debouncedSave()
    }
  })(),
  saveAndReturnToDashboard: async () => {
    const state = get()

    // Don't save if there's no meaningful data
    if (!state.name && !state.doorcardName && !state.officeNumber && state.timeBlocks.length === 0) {
      return
    }

    try {
      await state.saveDraft()
      // Note: We don't need to handle navigation here as it's managed in the component
    } catch (error) {
      console.error("Error saving draft:", error)
      throw error // Re-throw the error so it can be handled in the component
    }
  },
  setStepViewed: (step) =>
    set((state) => ({
      ...(step === "preview" && { hasViewedPreview: true }),
      ...(step === "print" && { hasViewedPrint: true }),
    })),
  saveEntireState: async () => {
    const state = get()
    try {
      const response = await fetch("/api/doorcards/draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          draftId: state.draftId,
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
      })

      if (!response.ok) {
        throw new Error("Failed to save draft")
      }

      const data = await response.json()
      set({ draftId: data.id })
    } catch (error) {
      console.error("Error saving entire state:", error)
      throw error
    }
  },
}))

