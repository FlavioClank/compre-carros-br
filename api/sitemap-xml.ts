import { createClient } from "@supabase/supabase-js";

const SITE_URL = "https://comprecarrosbr.com.br";

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

    if (cars && cars.length > 0) {
      for (const car of cars) {
        const carUrl = car.slug || car.id;
        const lastmod = car.updated_at ? car.updated_at.split("T")[0] : today;
        sitemap += `  <url>
    <loc>${SITE_URL}/carro/${carUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
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
