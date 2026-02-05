/**
 * Supabase Configuration for Production vs Development
 * 
 * Priority order:
 * 1. Environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY) - used in Vercel/production
 * 2. Hardcoded external Supabase for production domains - fallback
 * 3. Lovable Cloud for preview/localhost
 */

// External Supabase project credentials (production fallback)
const EXTERNAL_SUPABASE_URL = "https://vpunpbozwidlzukplfts.supabase.co";
const EXTERNAL_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwdW5wYm96d2lkbHp1a3BsZnRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2OTE4MzksImV4cCI6MjA1MjI2NzgzOX0.jOhamfNnXXv4Zl0f1_QGvzxQJJtH5ZmqnJh6LGqnQbE";

// Production domains (custom domain + Vercel)
const PRODUCTION_DOMAINS = [
  "comprecarrosbr.com.br",
  "www.comprecarrosbr.com.br",
];

/**
 * Check if running on Vercel (production or preview)
 */
function isVercelEnvironment(): boolean {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname;
  return hostname.endsWith(".vercel.app");
}

/**
 * Check if the current environment is production (custom domain)
 */
function isCustomDomainProduction(): boolean {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname;
  return PRODUCTION_DOMAINS.some(domain => 
    hostname === domain || hostname.endsWith(`.${domain}`)
  );
}

/**
 * Check if we should use external Supabase
 * - True for: Vercel deployments, custom production domains
 * - False for: Lovable preview, localhost (unless env vars are set)
 */
export function isProductionEnvironment(): boolean {
  // Build de produção
  if (import.meta.env.PROD) return true;

  // Se estiver rodando no browser, detecta domínios publicados
  if (typeof window !== "undefined") {
    const host = window.location.hostname;

    // Vercel
    if (host.endsWith("vercel.app")) return true;

    // Seu domínio final (quando colocar)
    if (host.includes("comprecarrosbr.com.br") || host.includes("comprecarrosbr")) return true;

    // seu subdomínio atual também
    if (host.includes("compre-carros-br")) return true;
  }

  return false;
}


/**
 * Check if we're in Lovable preview
 */
function isLovablePreview(): boolean {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname;
  return hostname.endsWith(".lovable.app") || hostname.endsWith(".lovableproject.com");
}

/**
 * Get the Supabase URL for the current environment
 * Priority: env vars (Vercel) > production domains > Lovable Cloud
 */
export function getSupabaseUrl(): string {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  
  // If we have env vars AND we're in production (Vercel or custom domain), use them
  if (envUrl && isProductionEnvironment()) {
    return envUrl;
  }
  
  // If we're on production domains, use external Supabase
  if (isCustomDomainProduction() || isVercelEnvironment()) {
    return EXTERNAL_SUPABASE_URL;
  }
  
  // Lovable preview uses env vars (which point to Lovable Cloud)
  if (isLovablePreview() && envUrl) {
    return envUrl;
  }
  
  // Localhost: use env vars if set, otherwise external
  return envUrl || EXTERNAL_SUPABASE_URL;
}

/**
 * Get the Supabase Anon Key for the current environment
 */
export function getSupabaseAnonKey(): string {
  const envKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  
  // If we have env vars AND we're in production (Vercel or custom domain), use them
  if (envKey && isProductionEnvironment()) {
    return envKey;
  }
  
  // If we're on production domains, use external Supabase
  if (isCustomDomainProduction() || isVercelEnvironment()) {
    return EXTERNAL_SUPABASE_ANON_KEY;
  }
  
  // Lovable preview uses env vars (which point to Lovable Cloud)
  if (isLovablePreview() && envKey) {
    return envKey;
  }
  
  // Localhost: use env vars if set, otherwise external
  return envKey || EXTERNAL_SUPABASE_ANON_KEY;
}

/**
 * Get the Supabase project ID for the current environment
 */
export function getSupabaseProjectId(): string {
  const envProjectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  
  if (isProductionEnvironment()) {
    return envProjectId || "vpunpbozwidlzukplfts";
  }
  
  return envProjectId || "vpunpbozwidlzukplfts";
}

// Export production constants for reference
export const PRODUCTION_CONFIG = {
  url: EXTERNAL_SUPABASE_URL,
  anonKey: EXTERNAL_SUPABASE_ANON_KEY,
  projectId: "vpunpbozwidlzukplfts",
  domains: PRODUCTION_DOMAINS,
};
