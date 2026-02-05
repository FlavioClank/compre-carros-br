/**
 * API client for calling Vercel serverless functions
 * These replace Supabase Edge Functions in production to avoid CORS issues
 */

import { supabase } from "./supabase";
import { isProductionEnvironment } from "./supabase-config";

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

/**
 * Get the base URL for API calls
 * Production (Vercel): /api (same origin)
 * Preview (Lovable): Supabase Edge Functions
 */
function getApiBase(): { type: "vercel" | "supabase" } {
  if (isProductionEnvironment()) {
    return { type: "vercel" };
  }
  return { type: "supabase" };
}

/**
 * Get the current session token for authenticated requests
 */
async function getAuthToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
}

/**
 * Create a new garage (Super Admin only)
 */
export async function createGarage(payload: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
}): Promise<ApiResponse> {
  const token = await getAuthToken();
  if (!token) {
    return { error: "Sessão expirada. Faça login novamente." };
  }

  const { type } = getApiBase();

  if (type === "vercel") {
    try {
      const response = await fetch("/api/create-garage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || "Erro ao criar garagem" };
      }

      return { data };
    } catch (err: any) {
      return { error: err.message || "Erro de rede" };
    }
  }

  // Fallback: Supabase Edge Function
  const { data, error } = await supabase.functions.invoke("create-garage", {
    body: payload,
  });

  if (error) {
    return { error: error.message };
  }

  if (data?.error) {
    return { error: data.error };
  }

  return { data };
}

/**
 * Reset garage password (Super Admin only)
 */
export async function resetGaragePassword(payload: {
  userId: string;
  password: string;
}): Promise<ApiResponse> {
  const token = await getAuthToken();
  if (!token) {
    return { error: "Sessão expirada. Faça login novamente." };
  }

  const { type } = getApiBase();

  if (type === "vercel") {
    try {
      const response = await fetch("/api/reset-garage-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || "Erro ao redefinir senha" };
      }

      return { data };
    } catch (err: any) {
      return { error: err.message || "Erro de rede" };
    }
  }

  // Fallback: Supabase Edge Function
  const { data, error } = await supabase.functions.invoke("reset-garage-password", {
    body: payload,
  });

  if (error) {
    return { error: error.message };
  }

  if (data?.error) {
    return { error: data.error };
  }

  return { data };
}

/**
 * Update garage email (Super Admin only)
 */
export async function updateGarageEmail(payload: {
  garageId: string;
  newEmail: string;
}): Promise<ApiResponse> {
  const token = await getAuthToken();
  if (!token) {
    return { error: "Sessão expirada. Faça login novamente." };
  }

  const { type } = getApiBase();

  if (type === "vercel") {
    try {
      const response = await fetch("/api/update-garage-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || "Erro ao atualizar email" };
      }

      return { data };
    } catch (err: any) {
      return { error: err.message || "Erro de rede" };
    }
  }

  // Fallback: Supabase Edge Function
  const { data, error } = await supabase.functions.invoke("update-garage-email", {
    body: payload,
  });

  if (error) {
    return { error: error.message };
  }

  if (data?.error) {
    return { error: data.error };
  }

  return { data };
}
