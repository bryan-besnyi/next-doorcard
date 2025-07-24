import type { TrackingEvent } from "@/types/analytics/tracking";

class AnalyticsTracker {
  private sessionId: string;

  constructor() {
    // Generate or retrieve session ID
    this.sessionId = this.getOrCreateSessionId();
  }

  private getOrCreateSessionId(): string {
    if (typeof window === "undefined") return "";

    let sessionId = sessionStorage.getItem("doorcard-session-id");
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      sessionStorage.setItem("doorcard-session-id", sessionId);
    }
    return sessionId;
  }

  async track(event: TrackingEvent): Promise<void> {
    try {
      await fetch("/api/analytics/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-ID": this.sessionId,
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error("Analytics tracking failed:", error);
      // Fail silently in production
    }
  }

  // Convenience methods
  trackView(doorcardId: string, metadata?: Record<string, unknown>) {
    return this.track({ doorcardId, eventType: "VIEW", metadata });
  }

  trackPrint(doorcardId: string, type: "preview" | "download") {
    return this.track({
      doorcardId,
      eventType: type === "preview" ? "PRINT_PREVIEW" : "PRINT_DOWNLOAD",
    });
  }

  trackEdit(doorcardId: string) {
    return this.track({ doorcardId, eventType: "EDIT_STARTED" });
  }

  trackShare(doorcardId: string, method: string) {
    return this.track({
      doorcardId,
      eventType: "SHARE",
      metadata: { method },
    });
  }

  trackSearchResult(doorcardId: string, query: string, position: number) {
    return this.track({
      doorcardId,
      eventType: "SEARCH_RESULT",
      metadata: { query, position },
    });
  }
}

// Export singleton instance
export const analytics = new AnalyticsTracker();
