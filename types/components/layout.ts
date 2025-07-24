// Layout Component Types
import type { Appointment, TimeBlock } from "../doorcard";

// Unified Doorcard Types
// Note: Using TimeBlock from types/doorcard.ts

// Note: Using Appointment from types/doorcard.ts

export interface LayoutDoorcardData {
  name: string;
  doorcardName: string;
  officeNumber: string;
  term: string;
  year: string;
  college?: string;
  timeBlocks?: TimeBlock[];
  appointments?: Appointment[];
}

export interface UnifiedDoorcardProps {
  mode: "preview" | "print" | "view";
  data?: LayoutDoorcardData;
  showControls?: boolean;
  showWeekendDays?: boolean;
  onBack?: () => void;
  onPrint?: () => void;
}
