import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { ensureAdmin, requireUser, userIsAdmin } from "@/lib/app-data.server";
import type { Database } from "@/integrations/supabase/types";

const authSchema = z.object({ accessToken: z.string().min(1) });
const idSchema = authSchema.extend({ id: z.string().uuid() });

type LeadInsert = Database["public"]["Tables"]["leads"]["Insert"];
type LeadUpdate = Database["public"]["Tables"]["leads"]["Update"];

const nullableString = z.string().trim().optional().transform((v) => v || null);

export const getSessionContext = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => authSchema.parse(input))
  .handler(async ({ data }) => {
    const { admin, user, userId } = await requireUser(data.accessToken);
    const [{ data: profile, error: profileError }, { data: roles, error: rolesError }] = await Promise.all([
      admin.from("profiles").select("*").eq("id", userId).maybeSingle(),
      admin.from("user_roles").select("role").eq("user_id", userId),
    ]);

    if (profileError) throw new Error(profileError.message);
    if (rolesError) throw new Error(rolesError.message);

    return {
      user,
      profile,
      roles: roles || [],
      isAdmin: !!roles?.some((role) => role.role === "admin"),
    };
  });

export const getDashboardData = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => authSchema.parse(input))
  .handler(async ({ data }) => {
    const { admin, userId } = await requireUser(data.accessToken);
    const [{ data: leads, error: leadsError }, { data: reminders, error: remindersError }] = await Promise.all([
      admin.from("leads").select("*").eq("agent_id", userId).order("created_at", { ascending: false }),
      admin
        .from("reminders")
        .select("*, leads(name)")
        .eq("agent_id", userId)
        .eq("is_done", false)
        .order("reminder_at"),
    ]);

    if (leadsError) throw new Error(leadsError.message);
    if (remindersError) throw new Error(remindersError.message);

    return { leads: leads || [], reminders: reminders || [] };
  });

export const listLeads = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => authSchema.parse(input))
  .handler(async ({ data }) => {
    const { admin, userId } = await requireUser(data.accessToken);
    const { data: leads, error } = await admin
      .from("leads")
      .select("*")
      .eq("agent_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return leads || [];
  });

export const createLead = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    authSchema
      .extend({
        name: z.string().trim().min(1, "Name is required"),
        phone: z.string().trim().min(1, "Phone is required"),
        whatsapp: nullableString,
        email: nullableString,
        source: z.string().trim().default("manual"),
        property_interest: nullableString,
        location_preference: nullableString,
        budget_range: nullableString,
        priority: z.string().trim().default("warm"),
        notes: nullableString,
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { admin, userId } = await requireUser(data.accessToken);
    const payload: LeadInsert = {
      agent_id: userId,
      name: data.name,
      phone: data.phone,
      whatsapp: data.whatsapp,
      email: data.email,
      source: data.source as LeadInsert["source"],
      property_interest: data.property_interest as LeadInsert["property_interest"],
      location_preference: data.location_preference,
      budget_range: data.budget_range as LeadInsert["budget_range"],
      priority: data.priority as LeadInsert["priority"],
      notes: data.notes,
    };

    const { data: lead, error } = await admin.from("leads").insert(payload).select().single();
    if (error) throw new Error(error.message);
    return lead;
  });

export const getLeadDetail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => idSchema.parse(input))
  .handler(async ({ data }) => {
    const { admin, userId } = await requireUser(data.accessToken);
    const isAdmin = await userIsAdmin(admin, userId);
    const leadQuery = admin.from("leads").select("*").eq("id", data.id);
    if (!isAdmin) leadQuery.eq("agent_id", userId);

    const { data: lead, error: leadError } = await leadQuery.maybeSingle();
    if (leadError) throw new Error(leadError.message);
    if (!lead) return { lead: null, activities: [], reminders: [] };

    const [{ data: activities, error: activitiesError }, { data: reminders, error: remindersError }] = await Promise.all([
      admin.from("activities").select("*").eq("lead_id", data.id).order("created_at", { ascending: false }),
      admin.from("reminders").select("*").eq("lead_id", data.id).order("reminder_at"),
    ]);

    if (activitiesError) throw new Error(activitiesError.message);
    if (remindersError) throw new Error(remindersError.message);

    return { lead, activities: activities || [], reminders: reminders || [] };
  });

export const updateLead = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    idSchema
      .extend({
        name: z.string().trim().min(1),
        phone: z.string().trim().min(1),
        whatsapp: nullableString,
        email: nullableString,
        status: z.string().trim(),
        priority: z.string().trim(),
        property_interest: nullableString,
        budget_range: nullableString,
        location_preference: nullableString,
        notes: nullableString,
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { admin, userId } = await requireUser(data.accessToken);
    const patch: LeadUpdate = {
      name: data.name,
      phone: data.phone,
      whatsapp: data.whatsapp,
      email: data.email,
      status: data.status as LeadUpdate["status"],
      priority: data.priority as LeadUpdate["priority"],
      property_interest: data.property_interest as LeadUpdate["property_interest"],
      budget_range: data.budget_range as LeadUpdate["budget_range"],
      location_preference: data.location_preference,
      notes: data.notes,
    };

    const { error } = await admin.from("leads").update(patch).eq("id", data.id).eq("agent_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteLead = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => idSchema.parse(input))
  .handler(async ({ data }) => {
    const { admin, userId } = await requireUser(data.accessToken);
    const { error } = await admin.from("leads").delete().eq("id", data.id).eq("agent_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const addReminder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    idSchema.extend({ reminder_at: z.string().datetime(), note: nullableString }).parse(input),
  )
  .handler(async ({ data }) => {
    const { admin, userId } = await requireUser(data.accessToken);
    const { data: lead, error: leadError } = await admin
      .from("leads")
      .select("id")
      .eq("id", data.id)
      .eq("agent_id", userId)
      .maybeSingle();
    if (leadError) throw new Error(leadError.message);
    if (!lead) throw new Error("Lead not found.");

    const { error } = await admin.from("reminders").insert({
      lead_id: data.id,
      agent_id: userId,
      reminder_at: data.reminder_at,
      note: data.note,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const toggleReminder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    authSchema.extend({ reminderId: z.string().uuid(), is_done: z.boolean() }).parse(input),
  )
  .handler(async ({ data }) => {
    const { admin, userId } = await requireUser(data.accessToken);
    const { error } = await admin
      .from("reminders")
      .update({ is_done: data.is_done })
      .eq("id", data.reminderId)
      .eq("agent_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listReminders = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => authSchema.parse(input))
  .handler(async ({ data }) => {
    const { admin, userId } = await requireUser(data.accessToken);
    const { data: reminders, error } = await admin
      .from("reminders")
      .select("*, leads(name)")
      .eq("agent_id", userId)
      .order("reminder_at");
    if (error) throw new Error(error.message);
    return reminders || [];
  });

export const updateProfile = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => authSchema.extend({ name: z.string().trim(), phone: z.string().trim() }).parse(input))
  .handler(async ({ data }) => {
    const { admin, userId } = await requireUser(data.accessToken);
    const { error } = await admin.from("profiles").update({ name: data.name, phone: data.phone }).eq("id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateWhatsAppSettings = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => authSchema.extend({ aisensy_api_key: nullableString }).parse(input))
  .handler(async ({ data }) => {
    const { admin, userId } = await requireUser(data.accessToken);
    const { error } = await admin.from("profiles").update({ aisensy_api_key: data.aisensy_api_key }).eq("id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateMetaConnection = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => authSchema.extend({ meta_ads_connected: z.boolean() }).parse(input))
  .handler(async ({ data }) => {
    const { admin, userId } = await requireUser(data.accessToken);
    const { error } = await admin.from("profiles").update({ meta_ads_connected: data.meta_ads_connected }).eq("id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getAdminData = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => authSchema.parse(input))
  .handler(async ({ data }) => {
    const { admin, userId } = await requireUser(data.accessToken);
    await ensureAdmin(admin, userId);

    const [{ data: agents, error: agentsError }, { count, error: countError }] = await Promise.all([
      admin.from("profiles").select("*").order("created_at", { ascending: false }),
      admin.from("leads").select("*", { count: "exact", head: true }),
    ]);

    if (agentsError) throw new Error(agentsError.message);
    if (countError) throw new Error(countError.message);

    return { agents: agents || [], leadsCount: count || 0 };
  });

export const setAgentStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    authSchema.extend({ id: z.string().uuid(), status: z.enum(["active", "pending", "inactive"]) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { admin, userId } = await requireUser(data.accessToken);
    await ensureAdmin(admin, userId);
    const { error } = await admin.from("profiles").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
