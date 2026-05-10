import { createClient, type User } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type AdminClient = ReturnType<typeof createClient<Database>>;

export function createAdminClient(): AdminClient {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Backend is not configured yet.");
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

export async function requireUser(accessToken: string): Promise<{ admin: AdminClient; user: User; userId: string }> {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.getUser(accessToken);

  if (error || !data.user) {
    throw new Error("Your session expired. Please sign in again.");
  }

  return { admin, user: data.user, userId: data.user.id };
}

export async function userIsAdmin(admin: AdminClient, userId: string) {
  const { data, error } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  return !!data?.some((row) => row.role === "admin");
}

export async function ensureAdmin(admin: AdminClient, userId: string) {
  const isAdmin = await userIsAdmin(admin, userId);
  if (!isAdmin) throw new Error("Admin access required.");
  return true;
}
