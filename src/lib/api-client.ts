/**
 * API client unificado para produção na Vercel
 * - Em produção → SEMPRE usa /api/*
 * - Em preview/local → usa Supabase Edge Functions (opcional)
 */

import { supabase } from "./supabase";
import { isProductionEnvironment } from "./supabase-config";

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

/**
 * Obtém o token do usuário logado
 */
async function getAuthToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
}

/**
 * Helper para POST na Vercel
 */
async function postToVercel(path: string, body: any, token?: string) {
  const res = await fetch(`/api/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let json: any;

  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }

  if (!res.ok) {
    throw new Error(json?.error || json?.message || `HTTP ${res.status}`);
  }

  return json;
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

  try {
    if (isProductionEnvironment()) {
      const data = await postToVercel("create-garage", payload, token);
      return { data };
    }

    // --- Fallback para preview/local (Edge Function) ---
    const { data, error } = await supabase.functions.invoke("create-garage", {
      body: payload,
    });

    if (error) throw error;
    return { data };
  } catch (err: any) {
    return { error: err.message || "Erro ao criar garagem" };
  }
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

  try {
    if (isProductionEnvironment()) {
      const data = await postToVercel(
        "reset-garage-password",
        payload,
        token
      );
      return { data };
    }

    const { data, error } = await supabase.functions.invoke(
      "reset-garage-password",
      { body: payload }
    );

    if (error) throw error;
    return { data };
  } catch (err: any) {
    return { error: err.message || "Erro ao redefinir senha" };
  }
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

  try {
    if (isProductionEnvironment()) {
      const data = await postToVercel(
        "update-garage-email",
        payload,
        token
      );
      return { data };
    }

    const { data, error } = await supabase.functions.invoke(
      "update-garage-email",
      { body: payload }
    );

    if (error) throw error;
    return { data };
  } catch (err: any) {
    return { error: err.message || "Erro ao atualizar email" };
  }
}
