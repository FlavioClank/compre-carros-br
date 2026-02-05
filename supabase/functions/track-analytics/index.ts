import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ===== CORS com Allowlist (SEM wildcard quando credentials são usadas) =====
const ALLOWED_ORIGINS = [
  "https://compre-carros-br.vercel.app",
  "https://comprecarrosbr.com.br",
  "https://www.comprecarrosbr.com.br",
];

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  
  // Check exact match in allowlist
  if (ALLOWED_ORIGINS.includes(origin)) {
    return true;
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
  // IMPORTANTE: Nunca usar "*" quando credentials são enviados
  // Se origin é válido, retornar o origin exato; caso contrário, string vazia
  const allowedOrigin = isAllowedOrigin(origin) && origin ? origin : "";
  
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  };
}

interface TrackAnalyticsRequest {
  type: "click" | "visit";
  entityType: "ad" | "banner" | "car" | "site" | "vehicle";
  entityId?: string;
  metadata?: Record<string, any>;
}

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle preflight OPTIONS request - DEVE retornar 200 OK
  if (req.method === "OPTIONS") {
    return new Response("ok", { 
      status: 200,
      headers: corsHeaders 
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método não permitido" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = (await req.json()) as TrackAnalyticsRequest;

    if (!body || (body.type !== "click" && body.type !== "visit")) {
      return new Response(JSON.stringify({ error: "Payload inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const now = new Date().toISOString();

    const { error } = await supabaseAdmin.from("action_logs").insert({
      action: body.type,
      entity_type: body.entityType,
      entity_id: body.entityId ?? null,
      details: body.metadata ?? null,
      created_at: now,
      user_id: null,
    });

    if (error) {
      console.error("Error inserting analytics log", error);
      return new Response(JSON.stringify({ error: "Erro ao registrar evento" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected error in track-analytics", error);
    const message = error instanceof Error ? error.message : "Erro interno";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...getCorsHeaders(req.headers.get("Origin")), "Content-Type": "application/json" },
    });
  }
});
