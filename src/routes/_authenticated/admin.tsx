import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getAdminData, setAgentStatus } from "@/lib/app-data.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({ component: Admin });

function Admin() {
  const { isAdmin, loading, session } = useAuth();
  const getAdminDataOnServer = useServerFn(getAdminData);
  const setAgentStatusOnServer = useServerFn(setAgentStatus);
  const nav = useNavigate();
  const [agents, setAgents] = useState<any[]>([]);
  const [leadsCount, setLeadsCount] = useState(0);

  useEffect(() => {
    if (!loading && !isAdmin) nav({ to: "/dashboard" });
  }, [loading, isAdmin, nav]);

  const load = async () => {
    if (!session?.access_token) return;
    const data = await getAdminDataOnServer({ data: { accessToken: session.access_token } });
    setAgents(data.agents || []);
    setLeadsCount(data.leadsCount || 0);
  };
  useEffect(() => { if (isAdmin) load(); /* eslint-disable-next-line */ }, [isAdmin, session?.access_token]);

  const setStatus = async (id: string, status: "active" | "pending" | "inactive") => {
    if (!session?.access_token) return;
    try {
      await setAgentStatusOnServer({ data: { accessToken: session.access_token, id, status } });
      toast.success("Updated");
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update agent");
    }
  };

  if (!isAdmin) return null;

  const active = agents.filter((a) => a.status === "active").length;
  const pending = agents.filter((a) => a.status === "pending").length;
  const paid = agents.filter((a) => a.subscription_plan !== "trial").length;

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <h1 className="font-display text-3xl font-bold">Super Admin</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Total agents" value={agents.length} />
        <Stat label="Active" value={active} />
        <Stat label="Pending" value={pending} />
        <Stat label="Paid plans" value={paid} />
      </div>
      <Card>
        <CardHeader><CardTitle className="text-lg">All agents · {leadsCount} total leads</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {agents.map((a) => (
              <div key={a.id} className="p-4 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{a.name || a.email}</div>
                  <div className="text-xs text-muted-foreground">{a.email} · {a.phone || "no phone"}</div>
                </div>
                <Badge variant="outline" className="capitalize">{a.subscription_plan}</Badge>
                <Badge className={a.status === "active" ? "bg-success text-success-foreground" : a.status === "pending" ? "bg-warning text-warning-foreground" : ""}>{a.status}</Badge>
                {a.status !== "active" && <Button size="sm" onClick={() => setStatus(a.id, "active")}>Approve</Button>}
                {a.status === "active" && <Button size="sm" variant="outline" onClick={() => setStatus(a.id, "inactive")}>Deactivate</Button>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card><CardContent className="p-4">
      <div className="text-xs uppercase text-muted-foreground">{label}</div>
      <div className="text-3xl font-display font-bold mt-1">{value}</div>
    </CardContent></Card>
  );
}
