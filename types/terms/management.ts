// Term Management Types

export interface TermData {
  id?: string;
  name: string;
  year: string;
  season: string;
  startDate: Date;
  endDate: Date;
  isActive?: boolean;
  isArchived?: boolean;
  isUpcoming?: boolean;
  archiveDate?: Date;
}

export interface TermTransitionOptions {
  archiveOldTerm?: boolean;
  activateNewTerm?: boolean;
  archiveOldDoorcards?: boolean;
  notifyUsers?: boolean;
}
