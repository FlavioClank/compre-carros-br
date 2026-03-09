import { isProductionEnvironment } from "./supabase-config";

export type AnalyticsEventType = "click" | "visit";

export type AnalyticsEntityType = "ad" | "banner" | "car" | "site" | "vehicle";

interface TrackEventPayload {
  type: AnalyticsEventType;
  entityType: AnalyticsEntityType;
  entityId?: string;
  metadata?: Record<string, any>;
}

/**
 * Get the analytics endpoint URL based on environment
 * - Production (Vercel): /api/track-analytics (same origin, no CORS)
 * - Preview (Lovable Cloud): Supabase Edge Function
 */
function getAnalyticsUrl(): string {
  if (isProductionEnvironment()) {
    // Use Vercel serverless function (same origin = no CORS)
    return "/api/track-analytics";
  }
  
  // Lovable preview: use Supabase Edge Function
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || "kgtscjvgipowuvuindxt";
  return `https://${projectId}.supabase.co/functions/v1/track-analytics`;
}

async function sendEvent(payload: TrackEventPayload) {
  try {
    const url = getAnalyticsUrl();
    const body = JSON.stringify(payload);
    const isSameOrigin = url.startsWith("/");

    // sendBeacon only works reliably for same-origin (production /api/*)
    // Cross-origin with application/json requires CORS preflight which sendBeacon doesn't support
    if (isSameOrigin && navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(url, blob);
      return;
    }

    // For cross-origin (Lovable preview → Edge Function), use fetch
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

// Vehicle-specific tracking functions
export function trackVehicleView(vehicleId: string, metadata?: Record<string, any>) {
  void sendEvent({
    type: "visit",
    entityType: "vehicle",
    entityId: vehicleId,
    metadata,
  });
}

export function trackVehicleClick(vehicleId: string, metadata?: Record<string, any>) {
  void sendEvent({
    type: "click",
    entityType: "vehicle",
    entityId: vehicleId,
    metadata,
  });
}
