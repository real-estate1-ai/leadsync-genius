import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import type { Session, User } from "@supabase/supabase-js";
import { getSessionContext } from "@/lib/app-data.functions";
import { clearSupabaseSession, readPersistedSupabaseSession, SUPABASE_SESSION_EVENT } from "@/lib/supabase-session";

type Profile = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  status: "pending" | "active" | "inactive";
  subscription_plan: "trial" | "basic" | "pro";
  subscription_expires_at: string | null;
  aisensy_api_key: string | null;
  meta_ads_connected: boolean;
  webhook_token: string;
  avatar_url: string | null;
};

type AuthCtx = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const getSessionContextOnServer = useServerFn(getSessionContext);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (accessToken: string) => {
    try {
      const result = await getSessionContextOnServer({ data: { accessToken } });
      setProfile(result.profile as Profile | null);
      setIsAdmin(result.isAdmin);
    } catch {
      setProfile(null);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    const hydrate = (s: Session | null) => {
      setLoading(true);
      setSession(s);
      if (s?.user) {
        loadProfile(s.access_token).finally(() => setLoading(false));
      } else {
        setProfile(null);
        setIsAdmin(false);
        setLoading(false);
      }
    };

    const storedSession = readPersistedSupabaseSession();
    hydrate(storedSession);

    const onManualSession = (event: Event) => hydrate((event as CustomEvent<Session | null>).detail);
    window.addEventListener(SUPABASE_SESSION_EVENT, onManualSession);

    return () => {
      window.removeEventListener(SUPABASE_SESSION_EVENT, onManualSession);
    };
  }, []);

  const refreshProfile = async () => {
    if (session?.access_token) await loadProfile(session.access_token);
  };

  const signOut = async () => {
    clearSupabaseSession();
  };

  return (
    <Ctx.Provider value={{ user: session?.user ?? null, session, profile, isAdmin, loading, refreshProfile, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
