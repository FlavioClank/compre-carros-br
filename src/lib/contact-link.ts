/**
 * Server-side contact link resolver.
 *
 * Fetches a wa.me URL for an ad or banner without ever exposing the
 * advertiser's phone number to the browser.
 *
 * - Em produção (Vercel / domínio publicado) → chama /api/contact-link,
 *   que lê do banco externo com a service role.
 * - No preview da Lovable / dev → chama a Edge Function `contact-link`
 *   do Lovable Cloud interno.
 */
import { supabase, getSupabaseUrl } from "@/lib/supabase";
import { isProductionEnvironment } from "@/lib/supabase-config";

type ContactKind = "ad" | "banner";

const EDGE_PATH = "/functions/v1/contact-link";
const VERCEL_PATH = "/api/contact-link";

export async function resolveContactWhatsAppUrl(
  kind: ContactKind,
  id: string,
  message?: string,
): Promise<string | null> {
  try {
    const useVercel = isProductionEnvironment();
    const endpoint = useVercel
      ? VERCEL_PATH
      : `${getSupabaseUrl()}${EDGE_PATH}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Edge Function precisa do token; a rota Vercel é pública (usa service role no server).
    if (!useVercel) {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({ kind, id, message }),
      cache: "no-store",
    });

    if (!res.ok) return null;
    const json = (await res.json()) as { url?: string };
    return typeof json.url === "string" ? json.url : null;
  } catch {
    return null;
  }
}
