import type { Session } from "@supabase/supabase-js";

export const SUPABASE_SESSION_EVENT = "estateleads:supabase-session";

type StoredSession = Pick<Session, "access_token" | "refresh_token" | "expires_at" | "expires_in" | "token_type" | "user">;

function getStorageKey() {
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  if (projectId) return `sb-${projectId}-auth-token`;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) return null;

  try {
    return `sb-${new URL(supabaseUrl).hostname.split(".")[0]}-auth-token`;
  } catch {
    return null;
  }
}

export function normalizeSession(session: StoredSession): Session {
  const now = Math.floor(Date.now() / 1000);
  const expiresIn = session.expires_in ?? Math.max((session.expires_at ?? now + 3600) - now, 0);

  return {
    ...session,
    token_type: session.token_type ?? "bearer",
    expires_in: expiresIn,
    expires_at: session.expires_at ?? now + expiresIn,
  } as Session;
}

export function persistSupabaseSession(session: StoredSession) {
  if (typeof window === "undefined") return;
  const key = getStorageKey();
  if (!key) return;

  const normalized = normalizeSession(session);
  window.localStorage.setItem(key, JSON.stringify(normalized));
  window.dispatchEvent(new CustomEvent<Session | null>(SUPABASE_SESSION_EVENT, { detail: normalized }));
}

export function readPersistedSupabaseSession() {
  if (typeof window === "undefined") return null;
  const key = getStorageKey();
  if (!key) return null;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredSession>;
    if (!parsed.access_token || !parsed.refresh_token) return null;
    return normalizeSession(parsed as StoredSession);
  } catch {
    return null;
  }
}

export function clearSupabaseSession() {
  if (typeof window === "undefined") return;
  const key = getStorageKey();
  if (key) window.localStorage.removeItem(key);
  window.dispatchEvent(new CustomEvent<Session | null>(SUPABASE_SESSION_EVENT, { detail: null }));
}