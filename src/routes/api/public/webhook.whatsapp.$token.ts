import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/public/webhook/whatsapp/$token")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        try {
          const { data: profile } = await supabaseAdmin
            .from("profiles").select("id").eq("webhook_token", params.token).maybeSingle();
          if (!profile) return new Response("Invalid token", { status: 404 });

          const body = await request.json().catch(() => ({} as any));
          const name = body.sender_name || body.name || body.contact?.name || "WhatsApp Lead";
          const phone = body.phone || body.sender || body.contact?.phone || body.from || "";
          const message = body.message || body.text || body.body || "";

          if (!phone) return new Response("Missing phone", { status: 400 });

          await supabaseAdmin.from("leads").insert({
            agent_id: profile.id, name, phone, whatsapp: phone,
            source: "whatsapp", priority: "warm", notes: message || null,
          } as any);
          return Response.json({ ok: true });
        } catch (e: any) {
          return new Response(e.message || "Error", { status: 500 });
        }
      },
    },
  },
});
