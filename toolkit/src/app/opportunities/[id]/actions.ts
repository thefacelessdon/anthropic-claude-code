"use server";

import { createClient } from "@/lib/supabase/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function raw(supabase: any, table: string) { return supabase.from(table); }

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
    .select("id")
    .eq("id", profileId)
    .eq("user_id", user.id)
    .single();

  const profile = profileData as { id: string } | null;

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
  });

  if (error) {
    return { success: false, error: "Failed to record interest" };
  }

  return { success: true };
}
