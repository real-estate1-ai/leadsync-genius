import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const signupSchema = z.object({
  name: z.string().trim().min(1, "Full name is required"),
  phone: z.string().trim().optional(),
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  redirectTo: z.string().url(),
});

export const createAccount = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const parsed = signupSchema.safeParse(input);
    if (!parsed.success) {
      return { __error: parsed.error.issues[0]?.message ?? "Invalid input" } as never;
    }
    return parsed.data;
  })
  .handler(async ({ data }) => {
    if ((data as any).__error) {
      return { ok: false as const, error: (data as any).__error };
    }
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabasePublishableKey) {
      throw new Error("Authentication is not configured yet.");
    }

    const serverSupabase = createClient<Database>(supabaseUrl, supabasePublishableKey, {
      auth: {
        storage: undefined,
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: result, error } = await serverSupabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          phone: data.phone || null,
        },
        emailRedirectTo: data.redirectTo,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      user: result.user
        ? {
            id: result.user.id,
            email: result.user.email ?? data.email,
          }
        : null,
      session: result.session
        ? {
            access_token: result.session.access_token,
            refresh_token: result.session.refresh_token,
          }
        : null,
    };
  });