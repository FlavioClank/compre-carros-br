import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateGarageRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verify the caller is a super_admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header");
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: callerUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !callerUser) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Token inválido" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
      return new Response(
        JSON.stringify({ error: "Apenas Super Admin pode criar garagens" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: CreateGarageRequest = await req.json();
    console.log("Creating garage for email:", body.email);

    // Validate required fields
    if (!body.name || !body.email || !body.password) {
      return new Response(
        JSON.stringify({ error: "Nome, email e senha são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === body.email);
    
    if (existingUser) {
      console.error("User already exists:", body.email);
      return new Response(
        JSON.stringify({ error: "Este email já está cadastrado no sistema" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let createdUserId: string | null = null;

    try {
      // Step 1: Create auth user
      console.log("Step 1: Creating auth user...");
      const { data: authData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
        email: body.email,
        password: body.password,
        email_confirm: true,
        user_metadata: { name: body.name },
      });

      if (createUserError || !authData.user) {
        console.error("Failed to create auth user:", createUserError);
        throw new Error(createUserError?.message || "Falha ao criar usuário");
      }

      createdUserId = authData.user.id;
      console.log("Auth user created:", createdUserId);

      // Step 2: Create profile
      console.log("Step 2: Creating profile...");
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .insert({
          id: createdUserId,
          email: body.email,
          name: body.name,
        });

      if (profileError) {
        console.error("Failed to create profile:", profileError);
        throw new Error(`Falha ao criar perfil: ${profileError.message}`);
      }
      console.log("Profile created successfully");

      // Step 3: Add garage role
      console.log("Step 3: Adding garage role...");
      const { error: roleInsertError } = await supabaseAdmin
        .from("user_roles")
        .insert({
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
          name: body.name,
          phone: body.phone || null,
          address: body.address || null,
          city: body.city || null,
          state: body.state || null,
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
        details: { garage_name: body.name, garage_email: body.email },
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          garage: garageData,
          message: "Garagem criada com sucesso!" 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } catch (stepError: any) {
      // Rollback: delete the created user if any step fails
      if (createdUserId) {
        console.log("Rolling back - deleting user:", createdUserId);
        try {
          // Delete from garages first (if exists)
          await supabaseAdmin.from("garages").delete().eq("user_id", createdUserId);
          // Delete from user_roles (if exists)
          await supabaseAdmin.from("user_roles").delete().eq("user_id", createdUserId);
          // Delete from profiles (if exists)
          await supabaseAdmin.from("profiles").delete().eq("id", createdUserId);
          // Delete auth user
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
    return new Response(
      JSON.stringify({ error: error.message || "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
