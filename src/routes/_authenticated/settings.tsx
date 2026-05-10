import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { updateMetaConnection, updateProfile, updateWhatsAppSettings } from "@/lib/app-data.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Copy, MessageSquare, Megaphone, User } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({ component: Settings });

function Settings() {
  const { profile, session, user, refreshProfile } = useAuth();
  const updateProfileOnServer = useServerFn(updateProfile);
  const updateWhatsAppSettingsOnServer = useServerFn(updateWhatsAppSettings);
  const updateMetaConnectionOnServer = useServerFn(updateMetaConnection);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [aisensy, setAisensy] = useState("");
  const [meta, setMeta] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setPhone(profile.phone || "");
      setAisensy(profile.aisensy_api_key || "");
      setMeta(profile.meta_ads_connected);
    }
  }, [profile]);

  if (!profile || !user) return <div className="p-8">Loading…</div>;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const waUrl = `${origin}/api/public/webhook/whatsapp/${profile.webhook_token}`;
  const metaUrl = `${origin}/api/public/webhook/meta/${profile.webhook_token}`;

  const saveProfile = async () => {
    if (!session?.access_token) return;
    try {
      await updateProfileOnServer({ data: { accessToken: session.access_token, name, phone } });
      toast.success("Profile saved");
      refreshProfile();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save profile");
    }
  };

  const saveAisensy = async () => {
    if (!session?.access_token) return;
    try {
      await updateWhatsAppSettingsOnServer({ data: { accessToken: session.access_token, aisensy_api_key: aisensy } });
      toast.success("WhatsApp settings saved");
      refreshProfile();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save WhatsApp settings");
    }
  };

  const saveMeta = async (val: boolean) => {
    if (!session?.access_token) return;
    try {
      await updateMetaConnectionOnServer({ data: { accessToken: session.access_token, meta_ads_connected: val } });
      setMeta(val);
      toast.success("Meta connection updated");
      refreshProfile();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update Meta connection");
    }
  };

  const copy = (t: string) => { navigator.clipboard.writeText(t); toast.success("Copied"); };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="font-display text-3xl font-bold">Settings</h1>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><User className="w-5 h-5" /> Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          </div>
          <div className="space-y-2"><Label>Email</Label><Input value={profile.email} disabled /></div>
          <Button onClick={saveProfile} className="bg-gradient-gold text-gold-foreground">Save profile</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="w-5 h-5" /> WhatsApp (AiSensy)
            <Badge variant={profile.aisensy_api_key ? "default" : "secondary"} className={profile.aisensy_api_key ? "bg-success text-success-foreground" : ""}>
              {profile.aisensy_api_key ? "Connected" : "Not connected"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
            <li>Sign up free at <a className="text-primary underline" href="https://aisensy.com" target="_blank" rel="noreferrer">aisensy.com</a></li>
            <li>In AiSensy go to <strong>Settings → Webhooks</strong> and paste the webhook URL below.</li>
            <li>Paste your AiSensy API key here.</li>
          </ol>
          <div className="space-y-2">
            <Label>Your unique webhook URL</Label>
            <div className="flex gap-2">
              <Input value={waUrl} readOnly className="font-mono text-xs" />
              <Button size="icon" variant="outline" onClick={() => copy(waUrl)}><Copy className="w-4 h-4" /></Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>AiSensy API Key</Label>
            <Input value={aisensy} onChange={(e) => setAisensy(e.target.value)} placeholder="Paste your API key" />
          </div>
          <Button onClick={saveAisensy} className="bg-gradient-gold text-gold-foreground">Save WhatsApp settings</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Megaphone className="w-5 h-5" /> Meta Ads
            <Badge variant={meta ? "default" : "secondary"} className={meta ? "bg-success text-success-foreground" : ""}>
              {meta ? "Connected" : "Not connected"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p className="text-muted-foreground">Configure your Meta Lead Ads webhook to deliver leads to the URL below.</p>
          <div className="space-y-2">
            <Label>Your unique Meta webhook URL</Label>
            <div className="flex gap-2">
              <Input value={metaUrl} readOnly className="font-mono text-xs" />
              <Button size="icon" variant="outline" onClick={() => copy(metaUrl)}><Copy className="w-4 h-4" /></Button>
            </div>
          </div>
          <Button variant={meta ? "outline" : "default"} onClick={() => saveMeta(!meta)} className={!meta ? "bg-gradient-gold text-gold-foreground" : ""}>
            {meta ? "Disconnect" : "Mark as connected"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Subscription</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">Plan: <strong className="capitalize">{profile.subscription_plan}</strong></p>
          {profile.subscription_expires_at && <p className="text-xs text-muted-foreground">Renews/expires {new Date(profile.subscription_expires_at).toLocaleDateString()}</p>}
          <a href="/pricing"><Button variant="outline" size="sm" className="mt-2">View plans</Button></a>
        </CardContent>
      </Card>
    </div>
  );
}
