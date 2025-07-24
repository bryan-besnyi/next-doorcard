// View Page Types

export interface Doorcard {
  id: string;
  name: string;
  doorcardName: string;
  officeNumber: string;
  startDate?: string;
  endDate?: string;
  term: string;
  year: string;
  college?: string;
  isActive: boolean;
  isPublic: boolean;
  slug?: string;
  userId: string;
  termId?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    name?: string;
    college?: string;
  };
  appointments: Array<{
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    dayOfWeek: string;
    category: string;
    location?: string;
  }>;
} 