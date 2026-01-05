export type AnalyticsEventType = "click" | "visit";

export type AnalyticsEntityType = "ad" | "banner" | "car" | "site";

interface TrackEventPayload {
  type: AnalyticsEventType;
  entityType: AnalyticsEntityType;
  entityId?: string;
  metadata?: Record<string, any>;
}

const FUNCTION_PATH = "/functions/v1/track-analytics";

function getEdgeFunctionUrl(): string | null {
  const baseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  if (!baseUrl) return null;
  return `${baseUrl}${FUNCTION_PATH}`;
}

async function sendEvent(payload: TrackEventPayload) {
  try {
    const url = getEdgeFunctionUrl();
    if (!url) return;

    const body = JSON.stringify(payload);

    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(url, blob);
      return;
    }

    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
      keepalive: true,
    });
  } catch {
    // Silently ignore - may be blocked by AdBlocker or network issues
  }
}

export function trackClick(entityType: AnalyticsEntityType, entityId: string, metadata?: Record<string, any>) {
  void sendEvent({
    type: "click",
    entityType,
    entityId,
    metadata,
  });
}

export function trackView(entityType: AnalyticsEntityType, entityId: string, metadata?: Record<string, any>) {
  void sendEvent({
    type: "visit",
    entityType,
    entityId,
    metadata,
  });
}

export function trackSiteVisit(metadata?: Record<string, any>) {
  void sendEvent({
    type: "visit",
    entityType: "site",
    metadata,
  });
}
