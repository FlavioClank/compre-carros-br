import { createClient } from "@supabase/supabase-js";

const SITE_URL = "https://comprecarrosbr.com.br";

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Escape the 5 XML entities so a stray `&`, `<`, `>`, `'` or `"` inside a
 * slug can never produce an invalid document. Slugs are already normalized,
 * but this is a cheap belt-and-suspenders guarantee for sitemaps.org.
 */
function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).send("Method not allowed");
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Fetch active cars
    const { data: cars, error: carsError } = await supabaseAdmin
      .from("cars")
      .select("slug, id, updated_at")
      .eq("status", "available")
      .eq("garage_is_active", true)
      .order("updated_at", { ascending: false });

    if (carsError) console.error("Error fetching cars:", carsError);

    // Fetch active ads
    const { data: ads, error: adsError } = await supabaseAdmin
      .from("ads")
      .select("id, slug, updated_at")
      .eq("is_active", true)
      .order("updated_at", { ascending: false });

    if (adsError) console.error("Error fetching ads:", adsError);

    // Fetch distinct city/state combinations from active garages with vehicles
    const { data: garages, error: garagesError } = await supabaseAdmin
      .from("garages")
      .select("city, state")
      .eq("is_active", true)
      .not("city", "is", null)
      .not("state", "is", null);

    if (garagesError) console.error("Error fetching garages:", garagesError);

    // Build unique city/state set (only garages that actually have available cars)
    const garageLocations = new Map<string, { city: string; state: string }>();
    if (garages) {
      for (const g of garages) {
        if (g.city && g.state) {
          const key = `${g.state.toLowerCase()}-${toSlug(g.city)}`;
          if (!garageLocations.has(key)) {
            garageLocations.set(key, { city: g.city, state: g.state.toLowerCase() });
          }
        }
      }
    }

    const today = new Date().toISOString().split("T")[0];

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/carros</loc>
    <lastmod>${today}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/marcas</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;

    // Add city/state pages
    for (const [, loc] of garageLocations) {
      const citySlug = xmlEscape(toSlug(loc.city));
      const stateSlug = xmlEscape(loc.state);
      sitemap += `  <url>
    <loc>${SITE_URL}/carros/${stateSlug}/${citySlug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;
    }

    if (cars && cars.length > 0) {
      for (const car of cars) {
        const carUrl = xmlEscape(car.slug || car.id);
        const lastmod = car.updated_at ? car.updated_at.split("T")[0] : today;
        sitemap += `  <url>
    <loc>${SITE_URL}/carro/${carUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;
      }
    }

    if (ads && ads.length > 0) {
      for (const ad of ads) {
        const adUrl = ad.slug || ad.id;
        const lastmod = ad.updated_at ? ad.updated_at.split("T")[0] : today;
        sitemap += `  <url>
    <loc>${SITE_URL}/anuncio/${adUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
      }
    }

    sitemap += `</urlset>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
    return res.status(200).send(sitemap);
  } catch (error) {
    console.error("Sitemap error:", error);
    return res.status(500).send("Internal server error");
  }
}
