import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { listLeads } from "@/lib/app-data.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Download, Users } from "lucide-react";
import { LEAD_STATUS, LEAD_SOURCE, LEAD_PRIORITY, statusLabel, sourceLabel } from "@/lib/constants";
import { format } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/leads")({
  component: LeadsList,
});

type Lead = {
  id: string;
  name: string;
  phone: string;
  whatsapp: string | null;
  email: string | null;
  status: string;
  source: string;
  priority: string;
  created_at: string;
};

function LeadsList() {
  const { session } = useAuth();
  const listLeadsOnServer = useServerFn(listLeads);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState("all");
  const [sourceF, setSourceF] = useState("all");
  const [priorityF, setPriorityF] = useState("all");

  useEffect(() => {
    if (!session?.access_token) return;
    let alive = true;
    const load = async () => {
      try {
        const data = await listLeadsOnServer({ data: { accessToken: session.access_token } });
        if (alive) setLeads(data as Lead[]);
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => { alive = false; };
  }, [session?.access_token, listLeadsOnServer]);

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (statusF !== "all" && l.status !== statusF) return false;
      if (sourceF !== "all" && l.source !== sourceF) return false;
      if (priorityF !== "all" && l.priority !== priorityF) return false;
      if (search) {
        const s = search.toLowerCase();
        if (!l.name.toLowerCase().includes(s) && !l.phone.includes(s) && !(l.whatsapp || "").includes(s)) return false;
      }
      return true;
    });
  }, [leads, search, statusF, sourceF, priorityF]);

  const exportCsv = () => {
    const headers = ["Name", "Phone", "WhatsApp", "Email", "Source", "Status", "Priority", "Created"];
    const rows = filtered.map((l) => [l.name, l.phone, l.whatsapp || "", l.email || "", l.source, l.status, l.priority, l.created_at]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported");
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">All Leads</h1>
          <p className="text-muted-foreground text-sm mt-1">{filtered.length} of {leads.length} leads</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv} disabled={filtered.length === 0}><Download className="w-4 h-4 mr-2" />Export</Button>
          <Link to="/leads/new"><Button className="bg-gradient-gold text-gold-foreground shadow-gold"><Plus className="w-4 h-4 mr-2" />Add lead</Button></Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 grid md:grid-cols-5 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search name, phone, WhatsApp" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusF} onValueChange={setStatusF}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              {LEAD_STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sourceF} onValueChange={setSourceF}>
            <SelectTrigger><SelectValue placeholder="Source" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              {LEAD_SOURCE.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={priorityF} onValueChange={setPriorityF}>
            <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              {LEAD_PRIORITY.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-muted-foreground mb-4">No leads match your filters.</p>
              <Link to="/leads/new"><Button size="sm" className="bg-gradient-gold text-gold-foreground"><Plus className="w-4 h-4 mr-2" />Add lead</Button></Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((l) => (
                <Link key={l.id} to="/leads/$id" params={{ id: l.id }} className="flex items-center gap-4 p-4 hover:bg-secondary/40 transition-colors">
                  <div className={`w-1.5 h-12 rounded-full ${l.priority === "hot" ? "bg-hot" : l.priority === "warm" ? "bg-warm" : "bg-cold"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{l.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{l.phone} · {sourceLabel(l.source)}</div>
                  </div>
                  <div className="hidden sm:block text-xs text-muted-foreground">{format(new Date(l.created_at), "PP")}</div>
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
