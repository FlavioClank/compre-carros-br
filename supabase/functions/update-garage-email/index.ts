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
  // Echo back the origin if valid; use empty string otherwise (blocks request)
  const allowedOrigin = isValidOrigin(origin) && origin ? origin : "";

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

function validateEmail(email: string): boolean {
  if (typeof email !== "string") return false;
  const trimmed = email.trim();
  if (trimmed.length < 5 || trimmed.length > 255) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed);
}

serve(async (req) => {
  const origin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

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

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const userClient = createClient(supabaseUrl, serviceRoleKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user: adminUser },
    } = await userClient.auth.getUser();

    if (!adminUser) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", adminUser.id)
      .single();

    if (roleError || roleData?.role !== "super_admin") {
      return new Response(
        JSON.stringify({ error: "Apenas Super Admin pode alterar email de garagem" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { garageId, newEmail } = await req.json();

    if (!garageId || typeof garageId !== "string") {
      return new Response(JSON.stringify({ error: "ID da garagem é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!validateEmail(newEmail)) {
      return new Response(JSON.stringify({ error: "Email inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalizedEmail = String(newEmail).trim().toLowerCase();

    const { data: garageRow, error: garageError } = await supabaseAdmin
      .from("garages")
      .select("user_id")
      .eq("id", garageId)
      .single();

    if (garageError || !garageRow) {
      return new Response(JSON.stringify({ error: "Garagem não encontrada" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = garageRow.user_id as string;

    const { data: profileRow, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("id", userId)
      .single();

    if (profileError || !profileRow) {
      return new Response(JSON.stringify({ error: "Perfil não encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const oldEmail = profileRow.email as string | null;

    const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { email: normalizedEmail },
    );

    if (updateAuthError) {
      console.error("Error updating auth email", updateAuthError);
      return new Response(JSON.stringify({ error: updateAuthError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: updateProfileError } = await supabaseAdmin
      .from("profiles")
      .update({ email: normalizedEmail })
      .eq("id", userId);

    if (updateProfileError) {
      console.error("Error updating profile email", updateProfileError);
      return new Response(JSON.stringify({ error: updateProfileError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabaseAdmin.from("action_logs").insert({
      action: "change_garage_email",
      entity_type: "garage",
      entity_id: garageId,
      user_id: adminUser.id,
      details: {
        old_email: oldEmail,
        new_email: normalizedEmail,
      },
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected error in update-garage-email:", error);
    const message = error instanceof Error ? error.message : "Erro interno";
    const origin = req.headers.get("Origin");
    const corsHeaders = getCorsHeaders(origin);

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
