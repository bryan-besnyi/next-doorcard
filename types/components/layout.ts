// Layout Component Types

// Unified Doorcard Types
export interface TimeBlock {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  activity: string;
  location?: string;
  category?: string;
}

export interface Appointment {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  dayOfWeek: string;
  category: string;
  location?: string;
}

export interface DoorcardData {
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
  data?: DoorcardData;
  showControls?: boolean;
  showWeekendDays?: boolean;
  onBack?: () => void;
  onPrint?: () => void;
} 