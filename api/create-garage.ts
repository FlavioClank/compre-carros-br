import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

// Validation helpers
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

function validatePassword(password: string): boolean {
  return password.length >= 1 && password.length <= 128;
}

function validateName(name: string): boolean {
  return name.trim().length >= 2 && name.length <= 100;
}

function validateOptionalString(value: string | undefined, maxLength: number): boolean {
  if (!value) return true;
  return value.length <= maxLength;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
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
      console.error("Auth error:", authError);
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
      console.error("Role check failed:", roleError);
      return res.status(403).json({ error: "Apenas Super Admin pode criar garagens" });
    }

    const { name, email, password, phone, address, city, state } = req.body;

    // Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Nome, email e senha são obrigatórios" });
    }

    if (!validateName(name)) {
      return res.status(400).json({ error: "Nome deve ter entre 2 e 100 caracteres" });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: "Email inválido ou muito longo" });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ error: "Senha não pode estar vazia (máx. 128 caracteres)" });
    }

    if (!validateOptionalString(phone, 20)) {
      return res.status(400).json({ error: "Telefone muito longo (máx. 20 caracteres)" });
    }

    if (!validateOptionalString(address, 255)) {
      return res.status(400).json({ error: "Endereço muito longo (máx. 255 caracteres)" });
    }

    if (!validateOptionalString(city, 100)) {
      return res.status(400).json({ error: "Cidade muito longa (máx. 100 caracteres)" });
    }

    if (!validateOptionalString(state, 50)) {
      return res.status(400).json({ error: "Estado muito longo (máx. 50 caracteres)" });
    }

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u) => u.email === email);

    if (existingUser) {
      console.error("User already exists:", email);
      return res.status(400).json({ error: "Este email já está cadastrado no sistema" });
    }

    let createdUserId: string | null = null;

    try {
      // Step 1: Create auth user
      console.log("Step 1: Creating auth user...");
      const { data: authData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name },
      });

      if (createUserError || !authData.user) {
        console.error("Failed to create auth user:", createUserError);
        throw new Error(createUserError?.message || "Falha ao criar usuário");
      }

      createdUserId = authData.user.id;
      console.log("Auth user created:", createdUserId);

      // Step 2: Create profile
      console.log("Step 2: Creating profile...");
      const { error: profileError } = await supabaseAdmin.from("profiles").insert({
        id: createdUserId,
        email,
        name,
      });

      if (profileError) {
        console.error("Failed to create profile:", profileError);
        throw new Error(`Falha ao criar perfil: ${profileError.message}`);
      }
      console.log("Profile created successfully");

      // Step 3: Add garage role
      console.log("Step 3: Adding garage role...");
      const { error: roleInsertError } = await supabaseAdmin.from("user_roles").insert({
        user_id: createdUserId,
        role: "garage",
      });

      if (roleInsertError) {
        console.error("Failed to add role:", roleInsertError);
        throw new Error(`Falha ao atribuir papel: ${roleInsertError.message}`);
      }
      console.log("Role assigned successfully");

      // Step 4: Create garage
      console.log("Step 4: Creating garage...");
      const { data: garageData, error: garageError } = await supabaseAdmin
        .from("garages")
        .insert({
          user_id: createdUserId,
          name,
          phone: phone || null,
          address: address || null,
          city: city || null,
          state: state || null,
        })
        .select()
        .single();

      if (garageError) {
        console.error("Failed to create garage:", garageError);
        throw new Error(`Falha ao criar garagem: ${garageError.message}`);
      }
      console.log("Garage created successfully:", garageData.id);

      // Log action
      await supabaseAdmin.from("action_logs").insert({
        entity_type: "garage",
        action: "create",
        entity_id: garageData.id,
        user_id: callerUser.id,
        details: { garage_name: name, garage_email: email },
      });

      return res.status(200).json({
        success: true,
        garage: garageData,
        message: "Garagem criada com sucesso!",
      });
    } catch (stepError: any) {
      // Rollback: delete the created user if any step fails
      if (createdUserId) {
        console.log("Rolling back - deleting user:", createdUserId);
        try {
          await supabaseAdmin.from("garages").delete().eq("user_id", createdUserId);
          await supabaseAdmin.from("user_roles").delete().eq("user_id", createdUserId);
          await supabaseAdmin.from("profiles").delete().eq("id", createdUserId);
          await supabaseAdmin.auth.admin.deleteUser(createdUserId);
          console.log("Rollback completed successfully");
        } catch (rollbackError) {
          console.error("Rollback failed:", rollbackError);
        }
      }
      throw stepError;
    }
  } catch (error: any) {
    console.error("Error creating garage:", error);
    return res.status(500).json({ error: error.message || "Erro interno do servidor" });
  }
}
