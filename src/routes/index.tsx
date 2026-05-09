import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Building2, MessageSquare, Megaphone, Bell, BarChart3, Check, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "EstateLeads — Never Miss a Real Estate Lead Again" },
      { name: "description", content: "Capture WhatsApp & Meta Ads leads automatically. Set reminders. Close more property deals. Free 14-day trial." },
      { property: "og:title", content: "EstateLeads — Real Estate CRM for Agents" },
      { property: "og:description", content: "WhatsApp + Meta Ads leads in one place. Set reminders. Close more deals." },
    ],
  }),
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-hero flex items-center justify-center">
              <Building2 className="w-5 h-5 text-gold" />
            </div>
            <span className="font-display text-xl font-bold">EstateLeads</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="hover:text-primary">Features</a>
            <a href="#pricing" className="hover:text-primary">Pricing</a>
            <Link to="/pricing" className="hover:text-primary">Plans</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
            <Link to="/signup"><Button size="sm" className="bg-gradient-gold text-gold-foreground hover:opacity-90 shadow-gold">Start Free</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero text-primary-foreground">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, rgba(201,168,76,0.4), transparent 50%), radial-gradient(circle at 70% 80%, rgba(201,168,76,0.3), transparent 50%)" }} />
        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm mb-8">
            <Zap className="w-4 h-4 text-gold" />
            <span>Built for Indian real estate agents</span>
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6">
            Never Miss a <span className="text-gold">Real Estate</span><br />Lead Again
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10">
            Connect WhatsApp + Meta Ads. All your property leads in one beautiful dashboard. Set reminders. Close more deals.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/signup"><Button size="lg" className="bg-gradient-gold text-gold-foreground hover:opacity-90 shadow-gold">Start 14-Day Free Trial</Button></Link>
            <a href="#features"><Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-primary-foreground hover:bg-white/20">See how it works</Button></a>
          </div>
          <p className="mt-6 text-sm text-primary-foreground/60">No credit card required · Works with AiSensy WhatsApp API</p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">Everything you need to close more deals</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">From the moment a lead comes in to the day you hand over the keys.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: MessageSquare, title: "WhatsApp Auto-Capture", desc: "Every WhatsApp inquiry becomes a lead instantly via AiSensy." },
            { icon: Megaphone, title: "Meta Ads Sync", desc: "Lead form submissions arrive in your dashboard in seconds." },
            { icon: Bell, title: "Smart Reminders", desc: "Never forget a follow-up. Overdue alerts in red." },
            { icon: BarChart3, title: "Conversion Analytics", desc: "Track funnel, source ROI, and best-converting times." },
          ].map((f) => (
            <div key={f.title} className="p-6 rounded-xl bg-card border border-border shadow-elegant hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-lg bg-gradient-hero flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-display text-xl font-bold mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-secondary/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">Simple, honest pricing</h2>
            <p className="text-muted-foreground text-lg">Start free. Upgrade when you start closing.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { name: "Free Trial", price: "₹0", period: "for 14 days", features: ["Up to 50 leads", "Manual lead entry", "Basic reminders", "Email support"], cta: "Start Free" },
              { name: "Basic", price: "₹999", period: "/month", features: ["Unlimited leads", "WhatsApp integration", "Meta Ads integration", "Reminders & notifications", "Email support"], cta: "Get Basic", highlight: true },
              { name: "Pro", price: "₹1,999", period: "/month", features: ["Everything in Basic", "Advanced analytics", "Bulk export to CSV", "Priority support", "Custom campaigns"], cta: "Get Pro" },
            ].map((p) => (
              <div key={p.name} className={`p-8 rounded-2xl border ${p.highlight ? "bg-gradient-hero text-primary-foreground border-gold shadow-elegant scale-105" : "bg-card border-border"}`}>
                {p.highlight && <div className="text-xs font-bold uppercase tracking-wider text-gold mb-3">Most Popular</div>}
                <h3 className="font-display text-2xl font-bold mb-2">{p.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{p.price}</span>
                  <span className={p.highlight ? "text-primary-foreground/70" : "text-muted-foreground"}> {p.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className={`w-4 h-4 mt-0.5 shrink-0 ${p.highlight ? "text-gold" : "text-success"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/signup">
                  <Button className={`w-full ${p.highlight ? "bg-gradient-gold text-gold-foreground hover:opacity-90 shadow-gold" : ""}`} variant={p.highlight ? "default" : "outline"}>{p.cta}</Button>
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center mt-8 text-sm text-muted-foreground">
            WhatsApp integration requires a free <a href="https://aisensy.com" target="_blank" rel="noreferrer" className="text-primary underline underline-offset-4">AiSensy</a> account.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">Ready to never miss a lead?</h2>
          <p className="text-muted-foreground text-lg mb-8">Join hundreds of agents using EstateLeads to close more deals.</p>
          <Link to="/signup"><Button size="lg" className="bg-gradient-gold text-gold-foreground hover:opacity-90 shadow-gold">Start Your Free 14-Day Trial</Button></Link>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} EstateLeads. Built for real estate professionals.
      </footer>
    </div>
  );
}
