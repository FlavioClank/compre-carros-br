import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

type CityRow = { city: string | null; state: string | null };

function normalizeRows(rows: CityRow[] = []) {
  const seen = new Set<string>();
  const cities: { city: string; state: string }[] = [];

  for (const row of rows) {
    if (!row.city || !row.state) continue;
    const key = `${row.state}-${row.city}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    cities.push({ city: row.city, state: row.state });
  }

  return cities.sort((a, b) => a.city.localeCompare(b.city));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "content-type, authorization");
  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");

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

    const { data, error } = await client
      .from("cars")
      .select("garages!inner(city, state)")
      .eq("status", "available")
      .eq("garage_is_active", true)
      .limit(5000);

    if (!error && data) {
      const rows = data
        .map((row: any) => row.garages)
        .flat()
        .filter(Boolean) as CityRow[];
      return res.status(200).json({ cities: normalizeRows(rows).slice(0, 12) });
    }

    const fallback = await client
      .from("garages")
      .select("city, state")
      .eq("is_active", true)
      .not("city", "is", null)
      .not("state", "is", null)
      .limit(5000);

    if (fallback.error) {
      console.error("active-cities error", error || fallback.error);
      return res.status(500).json({ error: "cities_failed" });
    }

    return res.status(200).json({ cities: normalizeRows(fallback.data || []).slice(0, 12) });
  } catch (err) {
    console.error("active-cities error", err);
    return res.status(500).json({ error: "internal_error" });
  }
}