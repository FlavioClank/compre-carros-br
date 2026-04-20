import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const SETTING_KEY = "vehicle_whatsapp_enabled";

// Cache em memória compartilhado entre instâncias do hook
let cachedEnabled: boolean | null = null;
const listeners = new Set<(v: boolean) => void>();

async function fetchInitial() {
  const { data } = await supabase
    .from("site_settings" as any)
    .select("value")
    .eq("key", SETTING_KEY)
    .maybeSingle();
  const value = (data as any)?.value;
  cachedEnabled = value?.enabled !== false;
  listeners.forEach((l) => l(cachedEnabled!));
}

let initPromise: Promise<void> | null = null;
function ensureInit() {
  if (!initPromise) initPromise = fetchInitial();
  return initPromise;
}

// Realtime global
let channelStarted = false;
function ensureRealtime() {
  if (channelStarted) return;
  channelStarted = true;
  supabase
    .channel("site-settings-whatsapp")
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "site_settings" },
      (payload: any) => {
        if (payload.new?.key === SETTING_KEY) {
          cachedEnabled = payload.new.value?.enabled !== false;
          listeners.forEach((l) => l(cachedEnabled!));
        }
      }
    )
    .subscribe();
}

export function useVehicleWhatsappEnabled() {
  // Começa false para não exibir o botão antes de confirmar a config
  const [enabled, setEnabled] = useState<boolean>(cachedEnabled ?? false);
  const [loading, setLoading] = useState<boolean>(cachedEnabled === null);

  useEffect(() => {
    ensureRealtime();
    const listener = (v: boolean) => {
      setEnabled(v);
      setLoading(false);
    };
    listeners.add(listener);

    if (cachedEnabled === null) {
      ensureInit().then(() => {
        if (cachedEnabled !== null) {
          setEnabled(cachedEnabled);
          setLoading(false);
        }
      });
    } else {
      setEnabled(cachedEnabled);
      setLoading(false);
    }

    return () => {
      listeners.delete(listener);
    };
  }, []);

  const updateSetting = async (newValue: boolean) => {
    const { error } = await supabase
      .from("site_settings" as any)
      .update({ value: { enabled: newValue } })
      .eq("key", SETTING_KEY);
    if (!error) {
      cachedEnabled = newValue;
      listeners.forEach((l) => l(newValue));
    }
    return !error;
  };

  return { enabled, loading, updateSetting };
}
