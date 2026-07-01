import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const CENTRAL_WHATSAPP = "5565922300000";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function buildWaUrl(phone: string, message: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "content-type, authorization");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(500).json({ error: "server_misconfigured" });
    }

    const body = (req.body ?? {}) as {
      kind?: string;
      id?: string;
      message?: string;
    };

    const kind = body.kind;
    const id = body.id;
    const rawMessage = typeof body.message === "string" ? body.message : "";
    const message =
      rawMessage.length > 0 && rawMessage.length <= 1000
        ? rawMessage
        : "Olá! Vim do CompreCarrosBr e gostaria de mais informações.";

    if (kind !== "ad" && kind !== "banner") {
      return res.status(400).json({ error: "invalid_kind" });
    }
    if (!id || !UUID_RE.test(id)) {
      return res.status(400).json({ error: "invalid_id" });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const table = kind === "ad" ? "ads" : "banners";
    const { data, error } = await supabase
      .from(table)
      .select("whatsapp_number, is_active")
      .eq("id", id)
      .maybeSingle();

    if (error || !data || !data.is_active) {
      return res.status(404).json({ error: "not_found" });
    }

    const digits = ((data as any).whatsapp_number ?? "").replace(/\D/g, "");
    const phone = digits.length >= 10 ? digits : CENTRAL_WHATSAPP;

    // Anti-cache: número pode ser atualizado a qualquer momento no admin
    res.setHeader("Cache-Control", "no-store, max-age=0");
    return res.status(200).json({ url: buildWaUrl(phone, message) });
  } catch (err) {
    console.error("contact-link error", err);
    return res.status(500).json({ error: "internal_error" });
  }
}
