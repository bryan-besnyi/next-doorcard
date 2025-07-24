// Form Component Types

// Basic Info Form
export interface BasicInfoFormProps {
  sessionName?: string | null | undefined;
}

// Campus Term Selector
export interface Term {
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
export interface DraftDoorcard {
  id: string;
  name: string;
  lastUpdated: string;
  completionPercentage: number;
}

export interface ResumeDoorCardProps {
  draft: DraftDoorcard;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

// Print Page Types
export interface Appointment {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  dayOfWeek: string;
  category: string;
  location?: string;
}

export interface TimeBlock {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  activity: string;
  location?: string;
  category?: string;
}

export interface Doorcard {
  id: string;
  name: string;
  doorcardName: string;
  officeNumber: string;
  term: string;
  year: string;
  college?: string;
  appointments: Appointment[];
}
