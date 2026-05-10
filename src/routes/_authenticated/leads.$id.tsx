import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  addReminder as addReminderFn,
  deleteLead,
  getLeadDetail,
  toggleReminder as toggleReminderFn,
  updateLead,
} from "@/lib/app-data.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LEAD_STATUS, LEAD_PRIORITY, PROPERTY_TYPE, BUDGET_RANGE, sourceLabel } from "@/lib/constants";
import { toast } from "sonner";
import { ArrowLeft, MessageCircle, Phone, Trash2, Bell, Save } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/leads/$id")({
  component: LeadDetail,
});

type Lead = any;
type Activity = { id: string; action_type: string; description: string | null; created_at: string };
type Reminder = { id: string; reminder_at: string; note: string | null; is_done: boolean };

function LeadDetail() {
  const { id } = Route.useParams();
  const { session } = useAuth();
  const getLeadDetailOnServer = useServerFn(getLeadDetail);
  const updateLeadOnServer = useServerFn(updateLead);
  const deleteLeadOnServer = useServerFn(deleteLead);
  const addReminderOnServer = useServerFn(addReminderFn);
  const toggleReminderOnServer = useServerFn(toggleReminderFn);
  const nav = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [reminderAt, setReminderAt] = useState("");
  const [reminderNote, setReminderNote] = useState("");

  const load = async () => {
    if (!session?.access_token) return;
    const result = await getLeadDetailOnServer({ data: { accessToken: session.access_token, id } });
    setLead(result.lead);
    setActivities(result.activities as Activity[]);
    setReminders(result.reminders as Reminder[]);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id, session?.access_token]);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading…</div>;
  if (!lead) return <div className="p-8 text-center">Lead not found.</div>;

  const update = (k: string, v: any) => setLead({ ...lead, [k]: v });

  const save = async () => {
    if (!session?.access_token) return;
    try {
      await updateLeadOnServer({ data: { accessToken: session.access_token, id, ...lead } });
      toast.success("Saved");
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save lead");
    }
  };

  const del = async () => {
    if (!confirm("Delete this lead permanently?")) return;
    if (!session?.access_token) return;
    try {
      await deleteLeadOnServer({ data: { accessToken: session.access_token, id } });
      toast.success("Deleted");
      nav({ to: "/leads" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete lead");
    }
  };

  const addReminder = async () => {
    if (!reminderAt || !session?.access_token) return;
    try {
      await addReminderOnServer({ data: { accessToken: session.access_token, id, reminder_at: new Date(reminderAt).toISOString(), note: reminderNote } });
      setReminderAt(""); setReminderNote("");
      toast.success("Reminder set");
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not set reminder");
    }
  };

  const toggleReminder = async (r: Reminder) => {
    if (!session?.access_token) return;
    await toggleReminderOnServer({ data: { accessToken: session.access_token, reminderId: r.id, is_done: !r.is_done } });
    load();
  };

  const wa = lead.whatsapp || lead.phone;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <Link to="/leads" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display text-3xl font-bold">{lead.name}</h1>
            <Badge variant="outline">{sourceLabel(lead.source)}</Badge>
            <Badge className={lead.priority === "hot" ? "bg-hot text-white" : lead.priority === "warm" ? "bg-warm text-warning-foreground" : "bg-cold text-white"}>
              {lead.priority}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Added {format(new Date(lead.created_at), "PP")}</p>
        </div>
        <div className="flex gap-2">
          <a href={`tel:${lead.phone}`}><Button variant="outline" size="sm"><Phone className="w-4 h-4 mr-1" /> Call</Button></a>
          <a href={`https://wa.me/${wa.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"><Button variant="outline" size="sm" className="text-success border-success/40"><MessageCircle className="w-4 h-4 mr-1" /> WhatsApp</Button></a>
          <Button variant="outline" size="sm" onClick={del} className="text-destructive border-destructive/40"><Trash2 className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Edit form */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Lead details</CardTitle>
            <Button size="sm" onClick={save} className="bg-gradient-gold text-gold-foreground"><Save className="w-4 h-4 mr-1" /> Save</Button>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <Field label="Name"><Input value={lead.name} onChange={(e) => update("name", e.target.value)} /></Field>
            <Field label="Phone"><Input value={lead.phone} onChange={(e) => update("phone", e.target.value)} /></Field>
            <Field label="WhatsApp"><Input value={lead.whatsapp || ""} onChange={(e) => update("whatsapp", e.target.value)} /></Field>
            <Field label="Email"><Input type="email" value={lead.email || ""} onChange={(e) => update("email", e.target.value)} /></Field>
            <Field label="Status">
              <Select value={lead.status} onValueChange={(v) => update("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{LEAD_STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Priority">
              <Select value={lead.priority} onValueChange={(v) => update("priority", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{LEAD_PRIORITY.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Property type">
              <Select value={lead.property_interest || ""} onValueChange={(v) => update("property_interest", v)}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>{PROPERTY_TYPE.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Budget">
              <Select value={lead.budget_range || ""} onValueChange={(v) => update("budget_range", v)}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>{BUDGET_RANGE.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Location" className="sm:col-span-2"><Input value={lead.location_preference || ""} onChange={(e) => update("location_preference", e.target.value)} /></Field>
            <Field label="Notes" className="sm:col-span-2"><Textarea rows={4} value={lead.notes || ""} onChange={(e) => update("notes", e.target.value)} /></Field>
          </CardContent>
        </Card>

        {/* Reminders + activity */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bell className="w-4 h-4" /> Set reminder</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Input type="datetime-local" value={reminderAt} onChange={(e) => setReminderAt(e.target.value)} />
              <Input placeholder="Note (optional)" value={reminderNote} onChange={(e) => setReminderNote(e.target.value)} />
              <Button size="sm" onClick={addReminder} className="w-full">Add reminder</Button>
              <div className="space-y-2 pt-2">
                {reminders.map((r) => (
                  <div key={r.id} className={`p-2 rounded text-xs border ${r.is_done ? "opacity-50 line-through" : ""}`}>
                    <div className="font-medium">{format(new Date(r.reminder_at), "PPp")}</div>
                    {r.note && <div className="text-muted-foreground">{r.note}</div>}
                    <button onClick={() => toggleReminder(r)} className="text-primary text-[11px] mt-1">{r.is_done ? "Undo" : "Mark done"}</button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Activity</CardTitle></CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <div className="text-xs text-muted-foreground">No activity yet.</div>
              ) : (
                <ul className="space-y-3">
                  {activities.map((a) => (
                    <li key={a.id} className="text-xs">
                      <div className="font-medium">{a.description || a.action_type}</div>
                      <div className="text-muted-foreground">{format(new Date(a.created_at), "PPp")}</div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className || ""}`}>
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
