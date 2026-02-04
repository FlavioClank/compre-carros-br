import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SITE_URL = "https://comprecarrosbr.com.br";

// Production domains
const PRODUCTION_DOMAINS = [
  "comprecarrosbr.com.br",
  "www.comprecarrosbr.com.br",
];

function isValidOrigin(origin: string | null): boolean {
  if (!origin) return false;
  
  // Check production domains
  for (const domain of PRODUCTION_DOMAINS) {
    if (origin === `https://${domain}` || origin === `http://${domain}`) {
      return true;
    }
  }
  
  // Check Vercel deployments (*.vercel.app)
  if (origin.endsWith(".vercel.app") && origin.startsWith("https://")) {
    return true;
  }
  
  // Check Lovable preview domains
  if (origin.endsWith(".lovable.app") || origin.endsWith(".lovableproject.com")) {
    return true;
  }
  
  // Check localhost for development
  if (origin.startsWith("http://localhost:")) {
    return true;
  }
  
  return false;
}

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = isValidOrigin(origin) && origin ? origin : "*";
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Content-Type": "application/xml; charset=utf-8",
    "Cache-Control": "public, max-age=3600",
  };
}

interface Car {
  slug: string | null;
  id: string;
  updated_at: string;
}

interface Ad {
  id: string;
  slug: string | null;
  updated_at: string;
}

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }

  if (req.method !== "GET") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Fetch active cars with their slugs
    const { data: cars, error: carsError } = await supabaseAdmin
      .from("cars")
      .select("slug, id, updated_at")
      .eq("status", "available")
      .eq("garage_is_active", true)
      .order("updated_at", { ascending: false });

    if (carsError) {
      console.error("Error fetching cars:", carsError);
    }

    // Fetch active ads with their slugs
    const { data: ads, error: adsError } = await supabaseAdmin
      .from("ads")
      .select("id, slug, updated_at")
      .eq("is_active", true)
      .order("updated_at", { ascending: false });

    if (adsError) {
      console.error("Error fetching ads:", adsError);
    }

    const today = new Date().toISOString().split("T")[0];

    // Build sitemap XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static pages -->
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

    // Add car pages
    if (cars && cars.length > 0) {
      for (const car of cars as Car[]) {
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

    // Add ad pages (use slug if available, otherwise id)
    if (ads && ads.length > 0) {
      for (const ad of ads as Ad[]) {
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

    return new Response(sitemap, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Unexpected error generating sitemap:", error);
    return new Response("Internal server error", {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  }
});
