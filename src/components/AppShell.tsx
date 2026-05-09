import { Link, useLocation, useNavigate, Outlet } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Building2,
  LayoutDashboard,
  Users,
  Bell,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/leads", label: "Leads", icon: Users },
  { to: "/reminders", label: "Reminders", icon: Bell },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppShell() {
  const { profile, signOut, isAdmin } = useAuth();
  const loc = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  const items = [...navItems, ...(isAdmin ? [{ to: "/admin", label: "Admin", icon: Shield }] : [])];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-sidebar text-sidebar-foreground shadow-elegant">
        <div className="p-6 border-b border-sidebar-border">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-gold flex items-center justify-center">
              <Building2 className="w-5 h-5 text-gold-foreground" />
            </div>
            <span className="font-display text-xl font-bold">EstateLeads</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {items.map((it) => {
            const active = loc.pathname.startsWith(it.to);
            const Icon = it.icon;
            return (
              <Link
                key={it.to}
                to={it.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-gold"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <div className="text-sm mb-3">
            <div className="font-medium truncate">{profile?.name || profile?.email}</div>
            <div className="text-xs text-sidebar-foreground/60 capitalize">{profile?.subscription_plan} plan</div>
          </div>
          <Button variant="outline" size="sm" className="w-full bg-transparent border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" /> Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-sidebar text-sidebar-foreground px-4 py-3 flex items-center justify-between border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-gold" />
          <span className="font-display font-bold">EstateLeads</span>
        </Link>
        <button onClick={() => setOpen(!open)} className="p-2">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden fixed inset-0 top-[52px] z-30 bg-sidebar text-sidebar-foreground p-4 space-y-1">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <Link key={it.to} to={it.to} onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-md hover:bg-sidebar-accent">
                <Icon className="w-4 h-4" /> {it.label}
              </Link>
            );
          })}
          <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-3 rounded-md hover:bg-sidebar-accent text-left">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      )}

      <main className="flex-1 md:pt-0 pt-[52px] overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
