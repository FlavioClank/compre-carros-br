import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WHATSAPP_NUMBER as DEFAULT_NUMBER } from "@/lib/constants";

const SETTING_KEY = "vehicle_whatsapp_number";

let cachedNumber: string | null = null;
const listeners = new Set<(v: string) => void>();

function sanitize(raw: unknown): string {
  const digits = String(raw ?? "").replace(/\D/g, "");
  return digits.length >= 10 ? digits : DEFAULT_NUMBER;
}

async function fetchInitial() {
  const { data } = await supabase
    .from("site_settings" as any)
    .select("value")
    .eq("key", SETTING_KEY)
    .maybeSingle();
  const value = (data as any)?.value;
  cachedNumber = sanitize(value?.number);
  listeners.forEach((l) => l(cachedNumber!));
}

let initPromise: Promise<void> | null = null;
function ensureInit() {
  if (!initPromise) initPromise = fetchInitial();
  return initPromise;
}

let channelStarted = false;
function ensureRealtime() {
  if (channelStarted) return;
  channelStarted = true;
  supabase
    .channel("site-settings-whatsapp-number")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "site_settings" },
      (payload: any) => {
        const row = payload.new ?? payload.old;
        if (row?.key === SETTING_KEY) {
          cachedNumber = sanitize(payload.new?.value?.number);
          listeners.forEach((l) => l(cachedNumber!));
        }
      }
    )
    .subscribe();
}

export function useVehicleWhatsappNumber() {
  const [number, setNumber] = useState<string>(cachedNumber ?? DEFAULT_NUMBER);
  const [loading, setLoading] = useState<boolean>(cachedNumber === null);

  useEffect(() => {
    ensureRealtime();
    const listener = (v: string) => {
      setNumber(v);
      setLoading(false);
    };
    listeners.add(listener);

    if (cachedNumber === null) {
      ensureInit().then(() => {
        if (cachedNumber !== null) {
          setNumber(cachedNumber);
          setLoading(false);
        }
      });
    } else {
      setNumber(cachedNumber);
      setLoading(false);
    }

    return () => {
      listeners.delete(listener);
    };
  }, []);

  const updateNumber = async (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (digits.length < 10) return false;

    // Tenta update; se não existir, insere
    const { data: updated, error: updateError } = await supabase
      .from("site_settings" as any)
      .update({ value: { number: digits } })
      .eq("key", SETTING_KEY)
      .select("id")
      .maybeSingle();

    if (updateError) return false;

    if (!updated) {
      const { error: insertError } = await supabase
        .from("site_settings" as any)
        .insert({ key: SETTING_KEY, value: { number: digits } });
      if (insertError) return false;
    }

    cachedNumber = digits;
    listeners.forEach((l) => l(digits));
    return true;
  };

  return { number, loading, updateNumber };
}

// Formata BR: +55 (65) 9223-0000 / +55 (65) 99223-0000
export function formatBrPhone(digits: string): string {
  const d = digits.replace(/\D/g, "");
  if (d.length < 12) return digits;
  const cc = d.slice(0, 2);
  const area = d.slice(2, 4);
  const rest = d.slice(4);
  if (rest.length === 9) {
    return `+${cc} (${area}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
  }
  return `+${cc} (${area}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
}
