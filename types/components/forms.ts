// Form Component Types
import type { Appointment, Doorcard, TimeBlock } from "../doorcard";

// Basic Info Form
export interface BasicInfoFormProps {
  sessionName?: string | null | undefined;
}

// Campus Term Selector
export interface FormTerm {
  id: string;
  name: string;
  year: string;
  season: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  isArchived?: boolean;
  isUpcoming?: boolean;
}

// Resume Doorcard
export interface ResumeDoorcard {
  id: string;
  name: string;
  lastUpdated: string;
  completionPercentage: number;
}

export interface ResumeDoorCardProps {
  draft: ResumeDoorcard;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

// Print Page Types
// Note: Using Appointment from types/doorcard.ts

// Note: Using TimeBlock from types/doorcard.ts

// Note: Using Doorcard from types/doorcard.ts
