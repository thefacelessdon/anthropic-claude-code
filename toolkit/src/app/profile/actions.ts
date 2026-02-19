"use server";

import { createClient } from "@/lib/supabase/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function raw(supabase: any, table: string) { return supabase.from(table); }

export async function upsertProfile(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const name = (formData.get("name") as string)?.trim();
  const primarySkill = (formData.get("primary_skill") as string)?.trim();
  const location = (formData.get("location") as string)?.trim();

  if (!name || !primarySkill || !location) {
    return { success: false, error: "Name, primary skill, and location are required." };
  }

  const lookingForRaw = formData.getAll("looking_for") as string[];
  const additionalSkillsRaw = (formData.get("additional_skills") as string)?.trim();

  const profileData = {
    user_id: user.id,
    name,
    email: user.email || (formData.get("email") as string)?.trim() || "",
    primary_skill: primarySkill,
    location,
    bio: (formData.get("bio") as string)?.trim() || null,
    portfolio_url: (formData.get("portfolio_url") as string)?.trim() || null,
    additional_skills: additionalSkillsRaw
      ? additionalSkillsRaw.split(",").map((s) => s.trim()).filter(Boolean)
      : null,
    rate_range: (formData.get("rate_range") as string)?.trim() || null,
    availability: (formData.get("availability") as string) || "available",
    looking_for: lookingForRaw.length > 0 ? lookingForRaw : null,
  };

  // Check if profile exists
  const { data: existing } = await raw(supabase, "public_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (existing) {
    const { error } = await raw(supabase, "public_profiles")
      .update({ ...profileData, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);
    if (error) return { success: false, error: "Failed to update profile." };
  } else {
    const { error } = await raw(supabase, "public_profiles")
      .insert(profileData);
    if (error) return { success: false, error: error.message || "Failed to create profile." };
  }

  return { success: true };
}
