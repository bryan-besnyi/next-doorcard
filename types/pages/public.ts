// Public Page Types

export interface PublicDoorcard {
  id: string;
  name: string;
  doorcardName: string;
  officeNumber: string;
  term: string;
  year: string;
  college?: string;
  slug?: string;
  user: {
    name: string;
    username?: string;
    college?: string;
  };
  appointmentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PublicDoorcardResponse {
  doorcards: PublicDoorcard[];
  success: boolean;
  error?: string;
}
