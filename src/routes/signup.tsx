import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { createAccount } from "@/lib/auth.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  component: Signup,
  head: () => ({ meta: [{ title: "Create account — EstateLeads" }] }),
});

function Signup() {
  const nav = useNavigate();
  const createAccountOnServer = useServerFn(createAccount);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await createAccountOnServer({
        data: {
          name,
          phone,
          email,
          password,
          redirectTo: window.location.origin + "/dashboard",
        },
      });

      if (result.session) {
        const { error } = await supabase.auth.setSession(result.session);
        if (error) throw error;
        toast.success("Account created — welcome!");
        nav({ to: "/dashboard" });
        return;
      }

      toast.success("Account created. Please check your email to verify it.");
      nav({ to: "/login" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create account");
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
          <h2 className="font-display text-4xl font-bold mb-4">Start closing more deals.</h2>
          <p className="text-primary-foreground/70">14-day free trial. No credit card required.</p>
        </div>
        <div className="text-sm text-primary-foreground/60">© EstateLeads</div>
      </div>
      <div className="flex items-center justify-center p-8">
        <form onSubmit={submit} className="w-full max-w-sm space-y-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Create your account</h1>
            <p className="text-muted-foreground text-sm mt-1">Become a smarter agent in 60 seconds.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full bg-gradient-gold text-gold-foreground hover:opacity-90 shadow-gold" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Already have an account? <Link to="/login" className="text-primary font-medium">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
