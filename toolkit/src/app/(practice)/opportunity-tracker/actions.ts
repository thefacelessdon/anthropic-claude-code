"use server";

import { createClient } from "@/lib/supabase/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function raw(supabase: any, table: string) { return supabase.from(table); }

/**
 * Link an interest signal to an existing practitioner in the ecosystem map.
 */
export async function linkInterestToPractitioner(
  interestId: string,
  practitionerId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Verify the practitioner exists
  const { data: practitioner } = await supabase
    .from("practitioners")
    .select("id")
    .eq("id", practitionerId)
    .single();

  if (!practitioner) {
    return { success: false, error: "Practitioner not found" };
  }

  const { error } = await raw(supabase, "opportunity_interests")
    .update({ practitioner_id: practitionerId })
    .eq("id", interestId);

  if (error) {
    return { success: false, error: "Failed to link practitioner" };
  }

  return { success: true };
}

/**
 * Unlink an interest signal from a practitioner.
 */
export async function unlinkInterestFromPractitioner(
  interestId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await raw(supabase, "opportunity_interests")
    .update({ practitioner_id: null })
    .eq("id", interestId);

  if (error) {
    return { success: false, error: "Failed to unlink practitioner" };
  }

  return { success: true };
}

/**
 * Update the status of an interest signal (e.g., expressed → applied → awarded).
 */
export async function updateInterestStatus(
  interestId: string,
  status: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const validStatuses = ["expressed", "applied", "awarded", "not_awarded", "withdrew", "did_not_apply"];
  if (!validStatuses.includes(status)) {
    return { success: false, error: "Invalid status" };
  }

  const { error } = await raw(supabase, "opportunity_interests")
    .update({ status })
    .eq("id", interestId);

  if (error) {
    return { success: false, error: "Failed to update status" };
  }

  return { success: true };
}
