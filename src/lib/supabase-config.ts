/**
 * Supabase Configuration for Production vs Development
 * 
 * This file detects the environment and returns the correct Supabase credentials.
 * - In production (comprecarrosbr.com.br): Uses the external Supabase project
 * - In development/preview: Uses Lovable Cloud Supabase
 */

// External Supabase project credentials (production)
const EXTERNAL_SUPABASE_URL = "https://vpunpbozwidlzukplfts.supabase.co";
const EXTERNAL_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwdW5wYm96d2lkbHp1a3BsZnRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2OTE4MzksImV4cCI6MjA1MjI2NzgzOX0.jOhamfNnXXv4Zl0f1_QGvzxQJJtH5ZmqnJh6LGqnQbE";

// Production domains
const PRODUCTION_DOMAINS = [
  "comprecarrosbr.com.br",
  "www.comprecarrosbr.com.br",
];

/**
 * Check if the current environment is production
 */
export function isProductionEnvironment(): boolean {
  if (typeof window === "undefined") return false;
  
  const hostname = window.location.hostname;
  return PRODUCTION_DOMAINS.some(domain => 
    hostname === domain || hostname.endsWith(`.${domain}`)
  );
}

/**
 * Get the Supabase URL for the current environment
 */
export function getSupabaseUrl(): string {
  if (isProductionEnvironment()) {
    return EXTERNAL_SUPABASE_URL;
  }
  // Fall back to Lovable Cloud (from environment variables)
  return import.meta.env.VITE_SUPABASE_URL || EXTERNAL_SUPABASE_URL;
}

/**
 * Get the Supabase Anon Key for the current environment
 */
export function getSupabaseAnonKey(): string {
  if (isProductionEnvironment()) {
    return EXTERNAL_SUPABASE_ANON_KEY;
  }
  // Fall back to Lovable Cloud (from environment variables)
  return import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || EXTERNAL_SUPABASE_ANON_KEY;
}

/**
 * Get the Supabase project ID for the current environment
 */
export function getSupabaseProjectId(): string {
  if (isProductionEnvironment()) {
    return "vpunpbozwidlzukplfts";
  }
  return import.meta.env.VITE_SUPABASE_PROJECT_ID || "vpunpbozwidlzukplfts";
}

// Export production constants for reference
export const PRODUCTION_CONFIG = {
  url: EXTERNAL_SUPABASE_URL,
  anonKey: EXTERNAL_SUPABASE_ANON_KEY,
  projectId: "vpunpbozwidlzukplfts",
  domains: PRODUCTION_DOMAINS,
};
