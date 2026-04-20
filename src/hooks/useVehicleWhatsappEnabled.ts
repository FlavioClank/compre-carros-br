import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const SETTING_KEY = "vehicle_whatsapp_enabled";

export function useVehicleWhatsappEnabled() {
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchSetting = async () => {
    const { data } = await supabase
      .from("site_settings" as any)
      .select("value")
      .eq("key", SETTING_KEY)
      .maybeSingle();
    const value = (data as any)?.value;
    setEnabled(value?.enabled !== false);
    setLoading(false);
  };

  const updateSetting = async (newValue: boolean) => {
    const { error } = await supabase
      .from("site_settings" as any)
      .update({ value: { enabled: newValue } })
      .eq("key", SETTING_KEY);
    if (!error) setEnabled(newValue);
    return !error;
  };

  useEffect(() => {
    fetchSetting();

    const channel = supabase
      .channel("site-settings-whatsapp")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "site_settings" },
        (payload: any) => {
          if (payload.new?.key === SETTING_KEY) {
            setEnabled(payload.new.value?.enabled !== false);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { enabled, loading, updateSetting };
}
