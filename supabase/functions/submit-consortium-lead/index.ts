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

function isValidCpf(raw: string): boolean {
  const c = raw.replace(/\D/g, "");
  if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(c.charAt(i)) * (10 - i);
  let d = 11 - (sum % 11);
  if (d >= 10) d = 0;
  if (parseInt(c.charAt(9)) !== d) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(c.charAt(i)) * (11 - i);
  d = 11 - (sum % 11);
  if (d >= 10) d = 0;
  return parseInt(c.charAt(10)) === d;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Very small in-memory rate-limit per IP (best-effort; edge instances are ephemeral)
const HITS = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const rec = HITS.get(ip);
  if (!rec || rec.resetAt < now) {
    HITS.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  rec.count += 1;
  return rec.count > MAX_PER_WINDOW;
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

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("cf-connecting-ip") ||
    "unknown";
  if (rateLimited(ip)) {
    return new Response(JSON.stringify({ error: "rate_limited" }), {
      status: 429,
      headers,
    });
  }

  let payload: Record<string, unknown> = {};
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers,
    });
  }

  const name = String(payload.name ?? "").trim();
  const birthDate = String(payload.birth_date ?? "").trim();
  const email = String(payload.email ?? "").trim().toLowerCase();
  const cpf = String(payload.cpf ?? "").replace(/\D/g, "");
  const phone = String(payload.phone ?? "").replace(/\D/g, "");
  const vehicleInfo = String(payload.vehicle_info ?? "").trim();
  const vehicleId =
    typeof payload.vehicle_id === "string" && UUID_RE.test(payload.vehicle_id)
      ? payload.vehicle_id
      : null;

  const errors: Record<string, string> = {};
  if (!name || name.length < 2 || name.length > 120) errors.name = "invalid";
  if (!DATE_RE.test(birthDate)) errors.birth_date = "invalid";
  if (!EMAIL_RE.test(email) || email.length > 200) errors.email = "invalid";
  if (!isValidCpf(cpf)) errors.cpf = "invalid";
  if (phone.length < 10 || phone.length > 11) errors.phone = "invalid";
  if (!vehicleInfo || vehicleInfo.length > 500) errors.vehicle_info = "invalid";

  if (Object.keys(errors).length > 0) {
    return new Response(JSON.stringify({ error: "validation_failed", errors }), {
      status: 400,
      headers,
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const { error: insertError } = await supabase.from("consortium_leads").insert({
    name,
    birth_date: birthDate,
    email,
    cpf,
    phone,
    vehicle_info: vehicleInfo,
    vehicle_id: vehicleId,
  });

  if (insertError) {
    return new Response(JSON.stringify({ error: "insert_failed" }), {
      status: 500,
      headers,
    });
  }

  // Fetch consortium whatsapp settings to build the redirect URL server-side
  const { data: settings } = await supabase
    .from("consortium_settings")
    .select("whatsapp_number, is_enabled")
    .limit(1)
    .maybeSingle();

  let waUrl: string | null = null;
  if (settings?.is_enabled && settings.whatsapp_number) {
    const digits = String(settings.whatsapp_number).replace(/\D/g, "");
    if (digits.length >= 10) {
      const message = `Olá! Vim através do site CompreCarrosBr e tenho interesse em fazer um *consórcio*.\n\n📋 *Meus dados:*\nNome: ${name}\nEmail: ${email}\nCelular: ${phone}\n\n🚗 *Veículo de interesse:*\n${vehicleInfo}\n\nPoderia me passar mais informações?`;
      waUrl = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
    }
  }

  return new Response(JSON.stringify({ ok: true, url: waUrl }), {
    status: 200,
    headers,
  });
});
