import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

function setCommonHeaders(res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "content-type, authorization");
  res.setHeader("Cache-Control", "no-store, max-age=0");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCommonHeaders(res);

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(500).json({ error: "server_misconfigured" });
    }

    const client = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const [showcasesResult, partnersResult] = await Promise.all([
      client
        .from("banners")
        .select("id, image_url, image_desktop, image_mobile, position, click_type, click_target, created_at")
        .eq("is_active", true)
        .order("position", { ascending: true })
        .order("created_at", { ascending: true }),
      client
        .from("ads")
        .select("id, slug, title, category, image_url_home, image_url_search, link, click_type, click_target, is_active, created_at")
        .eq("is_active", true)
        .order("created_at", { ascending: true }),
    ]);

    if (showcasesResult.error) {
      console.error("public-promos showcases error", showcasesResult.error);
      return res.status(500).json({ error: "showcases_failed" });
    }

    if (partnersResult.error) {
      console.error("public-promos partners error", partnersResult.error);
      return res.status(500).json({ error: "partners_failed" });
    }

    return res.status(200).json({
      showcases: showcasesResult.data || [],
      partners: partnersResult.data || [],
    });
  } catch (err) {
    console.error("public-promos error", err);
    return res.status(500).json({ error: "internal_error" });
  }
}