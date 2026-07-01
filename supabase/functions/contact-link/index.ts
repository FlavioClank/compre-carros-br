import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://compre-carros-br.vercel.app",
  "https://comprecarrosbr.com.br",
  "https://www.comprecarrosbr.com.br",
];

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (origin.endsWith(".vercel.app") && origin.startsWith("https://")) return true;
  if (origin.endsWith(".lovable.app") || origin.endsWith(".lovableproject.com")) return true;
  if (origin.startsWith("http://localhost:")) return true;
  return false;
}

function cors(origin: string | null): Record<string, string> {
  const allowedOrigin = isAllowedOrigin(origin) && origin ? origin : "";
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
    "Content-Type": "application/json",
  };
}

const CENTRAL_WHATSAPP = "5565922300000";

function buildWaUrl(phoneDigits: string, message: string): string {
  return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`;
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const headers = cors(origin);

  if (req.method === "OPTIONS") return new Response(null, { headers });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers,
    });
  }

  let body: { kind?: string; id?: string; message?: string } = {};
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers,
    });
  }

  const kind = String(body.kind ?? "");
  const id = String(body.id ?? "");
  const rawMessage = typeof body.message === "string" ? body.message : "";
  const message =
    rawMessage.length > 0 && rawMessage.length <= 1000
      ? rawMessage
      : "Olá! Vim do CompreCarrosBr e gostaria de mais informações.";

  if (!["ad", "banner"].includes(kind)) {
    return new Response(JSON.stringify({ error: "invalid_kind" }), {
      status: 400,
      headers,
    });
  }
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return new Response(JSON.stringify({ error: "invalid_id" }), {
      status: 400,
      headers,
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const table = kind === "ad" ? "ads" : "banners";
  const { data, error } = await supabase
    .from(table)
    .select("whatsapp_number, is_active")
    .eq("id", id)
    .maybeSingle();

  if (error || !data || !data.is_active) {
    return new Response(JSON.stringify({ error: "not_found" }), {
      status: 404,
      headers,
    });
  }

  const digits = (data.whatsapp_number ?? "").replace(/\D/g, "");
  const phone = digits.length >= 10 ? digits : CENTRAL_WHATSAPP;
  return new Response(JSON.stringify({ url: buildWaUrl(phone, message) }), {
    status: 200,
    headers,
  });
});
