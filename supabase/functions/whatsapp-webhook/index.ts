import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const SYSTEM_PROMPT = `Você é o assistente virtual da CompreCarrosBr, a maior plataforma automotiva de Cáceres-MT. Sua missão é atender com prestatividade.

Regras de Atendimento:
- Se o cliente busca carros ou serviços automotivos (peças, oficina, mecânica, elétrica, etc.), responda gentilmente convidando-o a visitar nosso portal: https://www.comprecarrosbr.com.br
- Explique que no site o cliente encontrará todos os nossos parceiros da cidade de Cáceres-MT com descontos e promoções exclusivas.
- Incentive o cliente a clicar no botão de WhatsApp dos parceiros diretamente no site para um atendimento ágil.
- Após enviar a mensagem, encerre sugerindo que, caso ele precise de algo mais específico, ele pode solicitar atendimento humano aqui mesmo no chat.

Seja cordial, breve e objetivo.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Validar token do webhook
    const expectedToken = Deno.env.get("WHATSAPP_WEBHOOK_TOKEN");
    const providedToken =
      req.headers.get("x-webhook-token") ??
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

    if (!expectedToken || providedToken !== expectedToken) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Validar body
    const body = await req.json().catch(() => null);
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    const phone_number =
      typeof body?.phone_number === "string" ? body.phone_number.trim() : "";

    if (!message || !phone_number) {
      return new Response(
        JSON.stringify({ error: "message and phone_number are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 3. Chamar Lovable AI Gateway (Gemini)
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const aiResp = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Lovable-API-Key": lovableApiKey,
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: message },
          ],
        }),
      },
    );

    if (aiResp.status === 429) {
      return new Response(
        JSON.stringify({ error: "Rate limit excedido. Tente novamente." }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
    if (aiResp.status === 402) {
      return new Response(
        JSON.stringify({ error: "Créditos de IA esgotados." }),
        {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, errText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const aiData = await aiResp.json();
    const aiResponse: string =
      aiData?.choices?.[0]?.message?.content?.trim() ??
      "Desculpe, não consegui responder agora. Por favor, acesse https://www.comprecarrosbr.com.br";

    // 4. Salvar log
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { error: logError } = await supabase.from("whatsapp_logs").insert({
      phone_number,
      message,
      ai_response: aiResponse,
    });
    if (logError) {
      console.error("Failed to log whatsapp interaction:", logError);
    }

    // 5. Retornar resposta
    return new Response(JSON.stringify({ reply: aiResponse }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("whatsapp-webhook error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
