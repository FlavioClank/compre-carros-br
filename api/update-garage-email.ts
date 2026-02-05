import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

function validateEmail(email: string): boolean {
  if (typeof email !== "string") return false;
  const trimmed = email.trim();
  if (trimmed.length < 5 || trimmed.length > 255) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed);
}

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
    const { data: { user: adminUser }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !adminUser) {
      return res.status(401).json({ error: "Não autorizado" });
    }

    // Check if caller is super_admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", adminUser.id)
      .single();

    if (roleError || roleData?.role !== "super_admin") {
      return res.status(403).json({ error: "Apenas Super Admin pode alterar email de garagem" });
    }

    const { garageId, newEmail } = req.body;

    if (!garageId || typeof garageId !== "string") {
      return res.status(400).json({ error: "ID da garagem é obrigatório" });
    }

    if (!validateEmail(newEmail)) {
      return res.status(400).json({ error: "Email inválido" });
    }

    const normalizedEmail = String(newEmail).trim().toLowerCase();

    // Get garage user_id
    const { data: garageRow, error: garageError } = await supabaseAdmin
      .from("garages")
      .select("user_id")
      .eq("id", garageId)
      .single();

    if (garageError || !garageRow) {
      return res.status(404).json({ error: "Garagem não encontrada" });
    }

    const userId = garageRow.user_id as string;

    // Get old email for logging
    const { data: profileRow, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("id", userId)
      .single();

    if (profileError || !profileRow) {
      return res.status(404).json({ error: "Perfil não encontrado" });
    }

    const oldEmail = profileRow.email as string | null;

    // Update auth email
    const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      email: normalizedEmail,
    });

    if (updateAuthError) {
      console.error("Error updating auth email", updateAuthError);
      return res.status(400).json({ error: updateAuthError.message });
    }

    // Update profile email
    const { error: updateProfileError } = await supabaseAdmin
      .from("profiles")
      .update({ email: normalizedEmail })
      .eq("id", userId);

    if (updateProfileError) {
      console.error("Error updating profile email", updateProfileError);
      return res.status(400).json({ error: updateProfileError.message });
    }

    // Log action
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

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Unexpected error in update-garage-email:", error);
    return res.status(500).json({ error: error.message || "Erro interno" });
  }
}
