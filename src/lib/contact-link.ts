/**
 * Server-side contact link resolver.
 *
 * Fetches a wa.me URL for an ad or banner via the `contact-link` edge
 * function so the advertiser's phone number never leaves the backend.
 */
import { supabase, getSupabaseUrl } from "@/lib/supabase";

type ContactKind = "ad" | "banner";

const FUNCTION_PATH = "/functions/v1/contact-link";

export async function resolveContactWhatsAppUrl(
  kind: ContactKind,
  id: string,
  message?: string,
): Promise<string | null> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;

    const res = await fetch(`${getSupabaseUrl()}${FUNCTION_PATH}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ kind, id, message }),
    });

    if (!res.ok) return null;
    const json = (await res.json()) as { url?: string };
    return typeof json.url === "string" ? json.url : null;
  } catch {
    return null;
  }
}
