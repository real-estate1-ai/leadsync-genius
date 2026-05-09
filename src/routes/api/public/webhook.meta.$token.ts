import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/public/webhook/meta/$token")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const challenge = url.searchParams.get("hub.challenge");
        if (challenge) return new Response(challenge);
        return Response.json({ ok: true });
      },
      POST: async ({ request, params }) => {
        try {
          const { data: profile } = await supabaseAdmin
            .from("profiles").select("id").eq("webhook_token", params.token).maybeSingle();
          if (!profile) return new Response("Invalid token", { status: 404 });

          const body = await request.json().catch(() => ({} as any));
          const fields: Record<string, string> = {};
          const fd = body?.entry?.[0]?.changes?.[0]?.value?.field_data || body.field_data || [];
          for (const f of fd) fields[f.name] = Array.isArray(f.values) ? f.values[0] : f.value;

          const name = fields.full_name || fields.name || body.name || "Meta Lead";
          const phone = fields.phone_number || fields.phone || body.phone || "";
          const email = fields.email || body.email || null;
          const campaign = body?.entry?.[0]?.changes?.[0]?.value?.ad_name || body.campaign_name || null;

          if (!phone) return new Response("Missing phone", { status: 400 });

          await supabaseAdmin.from("leads").insert({
            agent_id: profile.id, name, phone, email,
            source: "meta_ads", priority: "warm", campaign_name: campaign,
          } as any);
          return Response.json({ ok: true });
        } catch (e: any) {
          return new Response(e.message || "Error", { status: 500 });
        }
      },
    },
  },
});
