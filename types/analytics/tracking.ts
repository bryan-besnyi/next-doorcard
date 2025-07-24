// Analytics Types

export interface TrackingEvent {
  doorcardId: string;
  eventType: "VIEW" | "PRINT_PREVIEW" | "PRINT_DOWNLOAD" | "EDIT_STARTED" | "SHARE" | "SEARCH_RESULT";
  metadata?: Record<string, unknown>;
} 