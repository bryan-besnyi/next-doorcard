// API Utility Types

import type { Session } from "next-auth";
import type { NextResponse } from "next/server";

export type AuthenticatedHandler<T> = (session: Session) => Promise<T>;

export interface DraftData {
  draftId?: string;
  originalDoorcardId?: string;
  name?: string;
  doorcardName?: string;
  officeNumber?: string;
  term?: string;
  year?: string;
  college?: string;
  timeBlocks?: Array<{
    id: string;
    day: string;
    startTime: string;
    endTime: string;
    activity: string;
    location?: string;
    category?: string;
  }>;
  currentStep?: number;
  hasViewedPreview?: boolean;
  hasViewedPrint?: boolean;
}

// Public API Types
export interface WhereClause {
  isPublic: boolean;
  isActive: boolean;
  college?: "SKYLINE" | "CSM" | "CANADA";
  term?: string;
  year?: string;
  OR?: Array<{
    name?: { contains: string; mode: "insensitive" };
    doorcardName?: { contains: string; mode: "insensitive" };
    user?: { name: { contains: string; mode: "insensitive" } };
  }>;
} 