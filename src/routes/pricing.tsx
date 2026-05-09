import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export const Route = createFileRoute("/pricing")({ component: Pricing });

function Pricing() {
  const plans = [
    { name: "Free Trial", price: "₹0", period: "for 14 days", features: ["Up to 50 leads", "Manual entry", "Basic reminders"], cta: "Start Free" },
    { name: "Basic", price: "₹999", period: "/month", features: ["Unlimited leads", "WhatsApp + Meta integration", "Reminders", "Email support"], cta: "Get Basic", highlight: true },
    { name: "Pro", price: "₹1,999", period: "/month", features: ["Everything in Basic", "Advanced analytics", "Bulk export", "Priority support"], cta: "Get Pro" },
  ];
  return (
    <div className="min-h-screen bg-background py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold">Pricing</h1>
          <p className="text-muted-foreground mt-3">Start free. Upgrade when you start closing.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div key={p.name} className={`p-8 rounded-2xl border ${p.highlight ? "bg-gradient-hero text-primary-foreground border-gold shadow-elegant" : "bg-card border-border"}`}>
              {p.highlight && <div className="text-xs font-bold uppercase tracking-wider text-gold mb-3">Most Popular</div>}
              <h3 className="font-display text-2xl font-bold">{p.name}</h3>
              <div className="my-4"><span className="text-4xl font-bold">{p.price}</span><span className={p.highlight ? "text-primary-foreground/70" : "text-muted-foreground"}> {p.period}</span></div>
              <ul className="space-y-3 mb-8">
                {p.features.map((f) => <li key={f} className="flex items-start gap-2 text-sm"><Check className={`w-4 h-4 mt-0.5 shrink-0 ${p.highlight ? "text-gold" : "text-success"}`} />{f}</li>)}
              </ul>
              <Link to="/signup"><Button className={`w-full ${p.highlight ? "bg-gradient-gold text-gold-foreground shadow-gold" : ""}`} variant={p.highlight ? "default" : "outline"}>{p.cta}</Button></Link>
            </div>
          ))}
        </div>
        <p className="text-center mt-8 text-sm text-muted-foreground">WhatsApp integration requires a free <a className="underline text-primary" href="https://aisensy.com" target="_blank" rel="noreferrer">AiSensy</a> account.</p>
        <div className="text-center mt-6"><Link to="/" className="text-sm text-muted-foreground hover:text-primary">← Back to home</Link></div>
      </div>
    </div>
  );
}
