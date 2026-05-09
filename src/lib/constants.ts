export const LEAD_STATUS = [
  { value: "new", label: "New" },
  { value: "called", label: "Called" },
  { value: "site_visit_scheduled", label: "Site Visit Scheduled" },
  { value: "site_visit_done", label: "Site Visit Done" },
  { value: "negotiation", label: "Negotiation" },
  { value: "closed_won", label: "Closed Won" },
  { value: "closed_lost", label: "Closed Lost" },
] as const;

export const LEAD_PRIORITY = [
  { value: "hot", label: "Hot" },
  { value: "warm", label: "Warm" },
  { value: "cold", label: "Cold" },
] as const;

export const LEAD_SOURCE = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "meta_ads", label: "Meta Ads" },
  { value: "manual", label: "Manual" },
  { value: "referral", label: "Referral" },
  { value: "other", label: "Other" },
] as const;

export const PROPERTY_TYPE = [
  { value: "1bhk", label: "1 BHK" },
  { value: "2bhk", label: "2 BHK" },
  { value: "3bhk", label: "3 BHK" },
  { value: "villa", label: "Villa" },
  { value: "plot", label: "Plot" },
  { value: "commercial", label: "Commercial" },
] as const;

export const BUDGET_RANGE = [
  { value: "under_20l", label: "Under ₹20L" },
  { value: "20_50l", label: "₹20L – ₹50L" },
  { value: "50l_1cr", label: "₹50L – ₹1Cr" },
  { value: "1cr_plus", label: "₹1Cr+" },
] as const;

export function statusLabel(v: string) {
  return LEAD_STATUS.find((s) => s.value === v)?.label ?? v;
}
export function sourceLabel(v: string) {
  return LEAD_SOURCE.find((s) => s.value === v)?.label ?? v;
}
export function propertyLabel(v: string | null) {
  return v ? PROPERTY_TYPE.find((s) => s.value === v)?.label ?? v : "—";
}
export function budgetLabel(v: string | null) {
  return v ? BUDGET_RANGE.find((s) => s.value === v)?.label ?? v : "—";
}
