import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getDashboardData } from "@/lib/app-data.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, TrendingUp, Bell, MessageSquare, Megaphone, AlertCircle } from "lucide-react";
import { LEAD_STATUS, statusLabel } from "@/lib/constants";
import { format, isPast, isToday } from "date-fns";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

type Lead = {
  id: string;
  name: string;
  phone: string;
  status: string;
  priority: string;
  source: string;
  created_at: string;
};

type Reminder = {
  id: string;
  lead_id: string;
  reminder_at: string;
  note: string | null;
  is_done: boolean;
  leads?: { name: string } | null;
};

function Dashboard() {
  const { session, profile } = useAuth();
  const getDashboardDataOnServer = useServerFn(getDashboardData);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.access_token) return;
    let alive = true;
    const load = async () => {
      try {
        const result = await getDashboardDataOnServer({ data: { accessToken: session.access_token } });
        if (!alive) return;
        setLeads(result.leads as Lead[]);
        setReminders(result.reminders as Reminder[]);
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => { alive = false; };
  }, [session?.access_token, getDashboardDataOnServer]);

  const monthLeads = leads.filter((l) => new Date(l.created_at).getMonth() === new Date().getMonth());
  const closedWon = leads.filter((l) => l.status === "closed_won").length;
  const closed = leads.filter((l) => l.status.startsWith("closed")).length;
  const conversion = closed > 0 ? Math.round((closedWon / closed) * 100) : 0;

  const todayReminders = reminders.filter((r) => isToday(new Date(r.reminder_at)) || isPast(new Date(r.reminder_at)));

  const byStatus = LEAD_STATUS.map((s) => ({
    ...s,
    count: leads.filter((l) => l.status === s.value).length,
  }));

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Welcome back, {profile?.name?.split(" ")[0] || "Agent"} 👋</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your leads today.</p>
        </div>
        <Link to="/leads/new"><Button className="bg-gradient-gold text-gold-foreground shadow-gold"><Plus className="w-4 h-4 mr-2" />Add Lead</Button></Link>
      </div>

      {/* Connection status */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link to="/settings" className="block">
          <Card className="hover:shadow-elegant transition-shadow">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">WhatsApp (AiSensy)</div>
                <div className="text-xs text-muted-foreground">{profile?.aisensy_api_key ? "Connected" : "Not connected"}</div>
              </div>
              <Badge variant={profile?.aisensy_api_key ? "default" : "secondary"} className={profile?.aisensy_api_key ? "bg-success text-success-foreground" : ""}>
                {profile?.aisensy_api_key ? "✓" : "Setup"}
              </Badge>
            </CardContent>
          </Card>
        </Link>
        <Link to="/settings" className="block">
          <Card className="hover:shadow-elegant transition-shadow">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <Megaphone className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">Meta Ads</div>
                <div className="text-xs text-muted-foreground">{profile?.meta_ads_connected ? "Connected" : "Not connected"}</div>
              </div>
              <Badge variant={profile?.meta_ads_connected ? "default" : "secondary"} className={profile?.meta_ads_connected ? "bg-success text-success-foreground" : ""}>
                {profile?.meta_ads_connected ? "✓" : "Setup"}
              </Badge>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Users} label="Total leads" value={leads.length} />
        <KpiCard icon={TrendingUp} label="This month" value={monthLeads.length} />
        <KpiCard icon={Bell} label="Today's reminders" value={todayReminders.length} highlight={todayReminders.length > 0} />
        <KpiCard icon={TrendingUp} label="Conversion" value={`${conversion}%`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's reminders */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="w-5 h-5" /> Today's follow-ups
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : todayReminders.length === 0 ? (
              <div className="text-sm text-muted-foreground">No reminders for today. You're all caught up.</div>
            ) : (
              <ul className="space-y-3">
                {todayReminders.slice(0, 6).map((r) => {
                  const overdue = isPast(new Date(r.reminder_at)) && !isToday(new Date(r.reminder_at));
                  return (
                    <li key={r.id}>
                      <Link to="/leads/$id" params={{ id: r.lead_id }} className={`block p-3 rounded-lg border ${overdue ? "border-destructive/40 bg-destructive/5" : "border-border bg-card"} hover:shadow-sm transition-shadow`}>
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm truncate">{r.leads?.name || "Lead"}</span>
                          {overdue && <Badge variant="destructive" className="text-[10px]"><AlertCircle className="w-3 h-3 mr-1" />Overdue</Badge>}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{format(new Date(r.reminder_at), "PPp")}</div>
                        {r.note && <div className="text-xs mt-1 line-clamp-2">{r.note}</div>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Leads by status */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Leads by status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {byStatus.map((s) => (
                <div key={s.value} className="p-3 rounded-lg bg-secondary/50">
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                  <div className="text-2xl font-display font-bold mt-1">{s.count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent leads */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent leads</CardTitle>
          <Link to="/leads"><Button variant="ghost" size="sm">View all →</Button></Link>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="mb-4">No leads yet. Add your first one!</p>
              <Link to="/leads/new"><Button size="sm" className="bg-gradient-gold text-gold-foreground"><Plus className="w-4 h-4 mr-2" />Add lead</Button></Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {leads.slice(0, 5).map((l) => (
                <Link key={l.id} to="/leads/$id" params={{ id: l.id }} className="flex items-center gap-3 py-3 hover:bg-secondary/30 px-2 rounded-md transition-colors">
                  <div className={`w-2 h-10 rounded-full ${l.priority === "hot" ? "bg-hot" : l.priority === "warm" ? "bg-warm" : "bg-cold"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{l.name}</div>
                    <div className="text-xs text-muted-foreground">{l.phone}</div>
                  </div>
                  <Badge variant="secondary" className="text-xs">{statusLabel(l.status)}</Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, highlight }: { icon: any; label: string; value: string | number; highlight?: boolean }) {
  return (
    <Card className={highlight ? "border-destructive/40" : ""}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
          <Icon className={`w-4 h-4 ${highlight ? "text-destructive" : "text-muted-foreground"}`} />
        </div>
        <div className="text-3xl font-display font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
