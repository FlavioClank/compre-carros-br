/**
 * Production-aware Supabase Client
 * 
 * This client automatically switches between:
 * - External Supabase (vpunpbozwidlzukplfts) for production (comprecarrosbr.com.br)
 * - Lovable Cloud Supabase for development/preview
 * 
 * Usage:
 *   import { supabase } from "@/lib/supabase";
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { getSupabaseUrl, getSupabaseAnonKey, isProductionEnvironment } from "./supabase-config";

// Create the Supabase client with environment-aware configuration
const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();

export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: typeof window !== "undefined" ? localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// Log which environment we're using (only in development)
if (typeof window !== "undefined" && !isProductionEnvironment()) {
  console.log("[Supabase] Using Lovable Cloud:", supabaseUrl);
} else if (typeof window !== "undefined") {
  console.log("[Supabase] Using Production:", supabaseUrl);
}

// Re-export helper functions
export { isProductionEnvironment, getSupabaseUrl, getSupabaseAnonKey };
