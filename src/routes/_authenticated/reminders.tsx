import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, isPast, isToday } from "date-fns";
import { Bell } from "lucide-react";

export const Route = createFileRoute("/_authenticated/reminders")({ component: Reminders });

type R = { id: string; lead_id: string; reminder_at: string; note: string | null; is_done: boolean; leads?: { name: string } | null };

function Reminders() {
  const { user } = useAuth();
  const [items, setItems] = useState<R[]>([]);
  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("reminders").select("*, leads(name)").eq("agent_id", user.id).order("reminder_at");
    setItems((data || []) as R[]);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user]);

  const toggle = async (r: R) => { await supabase.from("reminders").update({ is_done: !r.is_done }).eq("id", r.id); load(); };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Reminders</h1>
        <p className="text-muted-foreground text-sm mt-1">All your follow-ups in one place.</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Bell className="w-5 h-5" /> Upcoming & overdue</CardTitle></CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-sm text-muted-foreground py-8 text-center">No reminders yet. Set them from the lead detail page.</div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((r) => {
                const d = new Date(r.reminder_at);
                const overdue = !r.is_done && isPast(d) && !isToday(d);
                return (
                  <li key={r.id} className={`py-3 flex items-center gap-3 ${r.is_done ? "opacity-50" : ""}`}>
                    <div className="flex-1 min-w-0">
                      <Link to="/leads/$id" params={{ id: r.lead_id }} className="font-medium hover:text-primary">
                        {r.leads?.name || "Lead"}
                      </Link>
                      <div className="text-xs text-muted-foreground">{format(d, "PPp")}{r.note ? ` · ${r.note}` : ""}</div>
                    </div>
                    {overdue && <Badge variant="destructive">Overdue</Badge>}
                    <Button size="sm" variant="outline" onClick={() => toggle(r)}>{r.is_done ? "Undo" : "Done"}</Button>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
