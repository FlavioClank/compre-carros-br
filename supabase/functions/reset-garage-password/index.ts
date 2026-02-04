import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

// Production domains
const PRODUCTION_DOMAINS = [
  "comprecarrosbr.com.br",
  "www.comprecarrosbr.com.br",
];

// Dynamic CORS - validates and echoes valid origins
function isValidOrigin(origin: string | null): boolean {
  if (!origin) return false;
  
  // Check production domains
  for (const domain of PRODUCTION_DOMAINS) {
    if (origin === `https://${domain}` || origin === `http://${domain}`) {
      return true;
    }
  }
  
  // Check Lovable preview domains
  if (origin.endsWith(".lovable.app") || origin.endsWith(".lovableproject.com")) {
    return true;
  }
  
  // Check localhost for development
  if (origin.startsWith("http://localhost:")) {
    return true;
  }
  
  return false;
}

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = isValidOrigin(origin) && origin ? origin : "";
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

// Validação de inputs - Super Admin pode definir qualquer senha
function validatePassword(password: string, isSuperAdmin: boolean = false): boolean {
  if (isSuperAdmin) {
    // Super Admin: apenas validação mínima (não vazio, máximo 128)
    return typeof password === "string" && password.length >= 1 && password.length <= 128;
  }
  // Usuário comum: 8-128 caracteres
  return typeof password === "string" && password.length >= 8 && password.length <= 128;
}

function validateUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return typeof id === "string" && uuidRegex.test(id);
}

serve(async (req) => {
  const origin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método não permitido" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(supabaseUrl, serviceRoleKey);
    const userClient = createClient(supabaseUrl, serviceRoleKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Check if user is super admin
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roleData } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleData?.role !== "super_admin") {
      return new Response(JSON.stringify({ error: "Apenas Super Admin pode redefinir senhas" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { userId, password } = await req.json();

    // Validate UUID format
    if (!validateUUID(userId)) {
      return new Response(JSON.stringify({ error: "ID de usuário inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate password - Super Admin ignora validações restritivas
    if (!validatePassword(password, true)) {
      return new Response(JSON.stringify({ error: "Senha não pode estar vazia (máx. 128 caracteres)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update user password
    const { error } = await supabaseClient.auth.admin.updateUserById(userId, {
      password: password,
    });

    if (error) {
      console.error("Error resetting password:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Password reset for user ${userId} by admin ${user.id}`);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Erro interno";
    const origin = req.headers.get("Origin");
    const corsHeaders = getCorsHeaders(origin);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
