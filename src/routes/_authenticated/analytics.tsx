import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LEAD_STATUS, LEAD_SOURCE } from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/analytics")({ component: Analytics });

function Analytics() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<any[]>([]);
  useEffect(() => {
    if (!user) return;
    supabase.from("leads").select("*").eq("agent_id", user.id).then(({ data }) => setLeads(data || []));
  }, [user]);

  const bySource = LEAD_SOURCE.map((s) => ({ ...s, count: leads.filter((l) => l.source === s.value).length }));
  const byStatus = LEAD_STATUS.map((s) => ({ ...s, count: leads.filter((l) => l.status === s.value).length }));
  const max = Math.max(1, ...byStatus.map((s) => s.count));

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <h1 className="font-display text-3xl font-bold">Analytics</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Funnel by status</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {byStatus.map((s) => (
              <div key={s.value}>
                <div className="flex justify-between text-xs mb-1"><span>{s.label}</span><span className="font-bold">{s.count}</span></div>
                <div className="h-2 rounded bg-secondary overflow-hidden"><div className="h-full bg-gradient-gold" style={{ width: `${(s.count / max) * 100}%` }} /></div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Leads by source</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {bySource.map((s) => (
              <div key={s.value} className="flex items-center justify-between p-2 rounded bg-secondary/50">
                <span className="text-sm">{s.label}</span>
                <span className="font-bold">{s.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-4xl font-display font-bold text-primary">{leads.length}</div>
          <div className="text-sm text-muted-foreground mt-1">Total leads tracked</div>
        </CardContent>
      </Card>
    </div>
  );
}
