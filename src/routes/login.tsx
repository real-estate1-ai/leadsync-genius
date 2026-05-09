import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { signIn } from "@/lib/auth.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: Login,
  head: () => ({ meta: [{ title: "Sign in — EstateLeads" }] }),
});

function Login() {
  const nav = useNavigate();
  const signInOnServer = useServerFn(signIn);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signInOnServer({ data: { email: email.trim(), password } });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      if (result.session) {
        try {
          await supabase.auth.setSession(result.session);
        } catch {
          // Preview env may block this fetch; session will hydrate on next load.
        }
      }
      toast.success("Welcome back!");
      nav({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex bg-gradient-hero text-primary-foreground p-12 flex-col justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Building2 className="w-6 h-6 text-gold" />
          <span className="font-display text-xl font-bold">EstateLeads</span>
        </Link>
        <div>
          <h2 className="font-display text-4xl font-bold mb-4">Welcome back.</h2>
          <p className="text-primary-foreground/70">Sign in to manage your leads, follow-ups, and deals.</p>
        </div>
        <div className="text-sm text-primary-foreground/60">© EstateLeads</div>
      </div>
      <div className="flex items-center justify-center p-8">
        <form onSubmit={submit} className="w-full max-w-sm space-y-5">
          <div>
            <h1 className="font-display text-3xl font-bold">Sign in</h1>
            <p className="text-muted-foreground text-sm mt-1">Access your agent dashboard.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full bg-gradient-gold text-gold-foreground hover:opacity-90 shadow-gold" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            New here? <Link to="/signup" className="text-primary font-medium">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
