import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

type AnalyticsEventType = "click" | "visit";
type AnalyticsEntityType = "ad" | "banner" | "car" | "site" | "vehicle";

interface TrackEventPayload {
  type: AnalyticsEventType;
  entityType: AnalyticsEntityType;
  entityId?: string;
  metadata?: Record<string, any>;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow POST only
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return res.status(500).json({ error: "Server configuration incomplete" });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const payload: TrackEventPayload = req.body;

    if (!payload || !payload.type || !payload.entityType) {
      return res.status(400).json({ error: "Missing type or entityType" });
    }

    // Validate entityType
    const validEntityTypes: AnalyticsEntityType[] = ["ad", "banner", "car", "site", "vehicle"];
    if (!validEntityTypes.includes(payload.entityType)) {
      return res.status(400).json({ error: "Invalid entityType" });
    }

    // Validate type
    const validTypes: AnalyticsEventType[] = ["click", "visit"];
    if (!validTypes.includes(payload.type)) {
      return res.status(400).json({ error: "Invalid type" });
    }

    // Map to action_logs format
    const actionMap: Record<string, Record<string, string>> = {
      ad: { click: "ad_click", visit: "ad_view" },
      banner: { click: "banner_click", visit: "banner_view" },
      car: { click: "car_click", visit: "car_view" },
      site: { click: "site_click", visit: "site_view" },
      vehicle: { click: "vehicle_click", visit: "vehicle_view" },
    };

    const action = actionMap[payload.entityType]?.[payload.type];
    if (!action) {
      return res.status(400).json({ error: "Invalid action combination" });
    }

    // Insert into action_logs
    const { error: insertError } = await supabase.from("action_logs").insert({
      action,
      entity_type: payload.entityType,
      entity_id: payload.entityId || null,
      user_id: null, // Anonymous tracking
      details: payload.metadata || null,
    });

    if (insertError) {
      console.error("Failed to insert action_log:", insertError);
      return res.status(500).json({ error: "Failed to track event" });
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Unexpected error in track-analytics:", error);
    return res.status(500).json({ error: error.message || "Internal error" });
  }
}
