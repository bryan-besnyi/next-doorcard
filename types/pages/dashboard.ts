// Dashboard Page Types

export interface Doorcard {
  id: string;
  name: string;
  doorcardName: string;
  officeNumber: string;
  term: string;
  year: string;
  college?: string;
  slug?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    name?: string;
    username?: string;
    email?: string;
    college?: string;
  };
  timeBlocks?: Array<{
    id: string;
    day: string;
    startTime: string;
    endTime: string;
    activity: string;
  }>;
  appointments?: Array<{
    id: string;
    day: string;
    startTime: string;
    endTime: string;
    activity: string;
  }>;
}

export interface DraftDoorcard {
  id: string;
  name: string;
  lastUpdated: string;
  completionPercentage: number;
}

export interface CompletionData {
  name?: string;
  doorcardName?: string;
  officeNumber?: string;
  term?: string;
  year?: string;
  timeBlocks?: {
    day: string;
    startTime: string;
    endTime: string;
    activity: string;
  }[];
  hasViewedPreview?: boolean;
  hasViewedPrint?: boolean;
  [key: string]: unknown;
}

export interface LoadingState {
  doorcards: boolean;
  drafts: boolean;
} 