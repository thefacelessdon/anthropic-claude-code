"use server";

import { createClient } from "@/lib/supabase/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function raw(supabase: any, table: string) { return supabase.from(table); }

/**
 * Original auth-gated interest expression (kept for backward compat).
 * Used when a logged-in user with a profile clicks the quick button.
 */
export async function expressInterest(
  opportunityId: string,
  profileId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Verify profile belongs to user
  const { data: profileData } = await raw(supabase, "public_profiles")
    .select("id, name, email, primary_skill")
    .eq("id", profileId)
    .eq("user_id", user.id)
    .single();

  const profile = profileData as { id: string; name: string; email: string; primary_skill: string } | null;

  if (!profile) {
    return { success: false, error: "Profile not found" };
  }

  // Check for existing interest
  const { data: existing } = await raw(supabase, "opportunity_interests")
    .select("id")
    .eq("opportunity_id", opportunityId)
    .eq("profile_id", profileId)
    .single();

  if (existing) {
    return { success: true }; // Already expressed interest
  }

  const { error } = await raw(supabase, "opportunity_interests").insert({
    opportunity_id: opportunityId,
    profile_id: profileId,
    practitioner_name: profile.name,
    practitioner_email: profile.email,
    practitioner_discipline: profile.primary_skill,
    status: "expressed",
  });

  if (error) {
    return { success: false, error: "Failed to record interest" };
  }

  return { success: true };
}

/**
 * Open intent form — no auth required.
 * Collects name, email, discipline, and optional notes.
 */
export async function submitIntent(
  opportunityId: string,
  data: {
    name: string;
    email: string;
    discipline: string;
    notes: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  // Basic validation
  if (!data.name.trim() || !data.email.trim() || !data.discipline.trim()) {
    return { success: false, error: "Name, email, and discipline are required." };
  }

  // Simple email format check
  if (!data.email.includes("@") || !data.email.includes(".")) {
    return { success: false, error: "Please enter a valid email address." };
  }

  // Check for duplicate interest from same email on same opportunity
  const { data: existing } = await raw(supabase, "opportunity_interests")
    .select("id")
    .eq("opportunity_id", opportunityId)
    .eq("practitioner_email", data.email.trim().toLowerCase())
    .single();

  if (existing) {
    return { success: true }; // Already expressed — don't error, just confirm
  }

  // Try to link to existing profile
  let profileId: string | null = null;
  const { data: profileData } = await raw(supabase, "public_profiles")
    .select("id")
    .eq("email", data.email.trim().toLowerCase())
    .single();

  if (profileData) {
    profileId = (profileData as { id: string }).id;
  }

  const { error } = await raw(supabase, "opportunity_interests").insert({
    opportunity_id: opportunityId,
    profile_id: profileId,
    practitioner_name: data.name.trim(),
    practitioner_email: data.email.trim().toLowerCase(),
    practitioner_discipline: data.discipline.trim(),
    notes: data.notes.trim() || null,
    status: "expressed",
  });

  if (error) {
    return { success: false, error: "Failed to record interest. Please try again." };
  }

  return { success: true };
}
