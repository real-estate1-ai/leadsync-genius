import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LEAD_SOURCE, LEAD_PRIORITY, PROPERTY_TYPE, BUDGET_RANGE } from "@/lib/constants";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/leads/new")({
  component: NewLead,
});

function NewLead() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    whatsapp: "",
    email: "",
    source: "manual",
    property_interest: "",
    location_preference: "",
    budget_range: "",
    priority: "warm",
    notes: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const payload = {
      agent_id: user.id,
      name: form.name,
      phone: form.phone,
      whatsapp: form.whatsapp || null,
      email: form.email || null,
      source: form.source,
      property_interest: form.property_interest || null,
      location_preference: form.location_preference || null,
      budget_range: form.budget_range || null,
      priority: form.priority,
      notes: form.notes || null,
    };
    const { error, data } = await supabase.from("leads").insert(payload).select().single();
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Lead added");
    nav({ to: "/leads/$id", params: { id: data.id } });
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
      <Link to="/leads" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4 mr-1" /> Back to leads</Link>
      <Card>
        <CardHeader><CardTitle className="font-display text-2xl">Add new lead</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full name *</Label>
                <Input id="name" required value={form.name} onChange={(e) => set("name", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input id="phone" required value={form.phone} onChange={(e) => set("phone", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input id="whatsapp" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="Same as phone if blank" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Source</Label>
                <Select value={form.source} onValueChange={(v) => set("source", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{LEAD_SOURCE.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => set("priority", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{LEAD_PRIORITY.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Property interest</Label>
                <Select value={form.property_interest} onValueChange={(v) => set("property_interest", v)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>{PROPERTY_TYPE.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Budget</Label>
                <Select value={form.budget_range} onValueChange={(v) => set("budget_range", v)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>{BUDGET_RANGE.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="location">Location preference</Label>
                <Input id="location" value={form.location_preference} onChange={(e) => set("location_preference", e.target.value)} placeholder="e.g. Bandra West, Mumbai" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" rows={4} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Link to="/leads"><Button type="button" variant="outline">Cancel</Button></Link>
              <Button type="submit" disabled={loading} className="bg-gradient-gold text-gold-foreground shadow-gold">
                {loading ? "Saving…" : "Create lead"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
