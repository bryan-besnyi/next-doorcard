// Admin Page Types

export interface Term {
  id: string;
  name: string;
  year: string;
  season: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isArchived: boolean;
  isUpcoming: boolean;
  archiveDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminDoorcard {
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
    email?: string;
    username?: string;
    college?: string;
  };
  _count: {
    appointments: number;
  };
}
