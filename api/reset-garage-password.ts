import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return res.status(500).json({ error: "Configuração do servidor incompleta" });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Verify caller is super_admin
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Não autorizado" });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: callerUser }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !callerUser) {
      return res.status(401).json({ error: "Token inválido" });
    }

    // Check if caller is super_admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", callerUser.id)
      .eq("role", "super_admin")
      .single();

    if (roleError || !roleData) {
      return res.status(403).json({ error: "Apenas Super Admin pode redefinir senhas" });
    }

    const { userId, password } = req.body;

    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "ID do usuário é obrigatório" });
    }

    if (!password || typeof password !== "string" || password.length < 1) {
      return res.status(400).json({ error: "Senha é obrigatória" });
    }

    if (password.length > 128) {
      return res.status(400).json({ error: "Senha muito longa (máx. 128 caracteres)" });
    }

    // Update user password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password,
    });

    if (updateError) {
      console.error("Error updating password:", updateError);
      return res.status(400).json({ error: updateError.message });
    }

    // Log action
    await supabaseAdmin.from("action_logs").insert({
      action: "reset_garage_password",
      entity_type: "garage",
      entity_id: userId,
      user_id: callerUser.id,
      details: { target_user_id: userId },
    });

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Unexpected error in reset-garage-password:", error);
    return res.status(500).json({ error: error.message || "Erro interno" });
  }
}
