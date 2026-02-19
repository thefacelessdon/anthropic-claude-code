import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileEditor } from "@/components/public/ProfileEditor";
import type { Metadata } from "next";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function raw(supabase: any, table: string) { return supabase.from(table); }

export const metadata: Metadata = {
  title: "Your Profile — NWA Creative Opportunities",
};

export default async function ProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?redirect=/profile");

  // Check for existing profile
  const { data: profileData } = await raw(supabase, "public_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const profile = profileData as {
    id: string;
    name: string;
    email: string;
    primary_skill: string;
    location: string;
    bio: string | null;
    portfolio_url: string | null;
    additional_skills: string[] | null;
    rate_range: string | null;
    availability: string;
    looking_for: string[] | null;
    is_verified: boolean;
  } | null;

  // Get engagements for this profile
  let engagements: {
    id: string;
    title: string;
    status: string;
    total_amount: number | null;
    completed_at: string | null;
    funder_org: { name: string } | null;
    milestones_total: number;
    milestones_done: number;
  }[] = [];

  let interests: {
    id: string;
    created_at: string;
    opportunity: { id: string; title: string; deadline: string | null; status: string } | null;
  }[] = [];

  if (profile) {
    const { data: engData } = await raw(supabase, "engagements")
      .select("id, title, status, total_amount, completed_at, funder_org_id")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false });

    const engRows = (engData || []) as { id: string; title: string; status: string; total_amount: number | null; completed_at: string | null; funder_org_id: string | null }[];

    if (engRows.length > 0) {
      const enriched = await Promise.all(
        engRows.map(async (eng) => {
          let funderName: string | null = null;
          if (eng.funder_org_id) {
            const { data: org } = await raw(supabase, "organizations")
              .select("name")
              .eq("id", eng.funder_org_id)
              .single();
            funderName = (org as { name: string } | null)?.name || null;
          }
          const { count: total } = await raw(supabase, "engagement_milestones")
            .select("id", { count: "exact", head: true })
            .eq("engagement_id", eng.id);
          const { count: done } = await raw(supabase, "engagement_milestones")
            .select("id", { count: "exact", head: true })
            .eq("engagement_id", eng.id)
            .not("completed_at", "is", null);
          return {
            id: eng.id,
            title: eng.title,
            status: eng.status,
            total_amount: eng.total_amount,
            completed_at: eng.completed_at,
            funder_org: funderName ? { name: funderName } : null,
            milestones_total: total || 0,
            milestones_done: done || 0,
          };
        })
      );
      engagements = enriched;
    }

    const { data: intData } = await raw(supabase, "opportunity_interests")
      .select("id, created_at, opportunity_id")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false });

    const intRows = (intData || []) as { id: string; created_at: string; opportunity_id: string }[];

    if (intRows.length > 0) {
      const enrichedInt = await Promise.all(
        intRows.map(async (int) => {
          const { data: oppData } = await raw(supabase, "opportunities")
            .select("id, title, deadline, status")
            .eq("id", int.opportunity_id)
            .single();
          return {
            id: int.id,
            created_at: int.created_at,
            opportunity: (oppData as { id: string; title: string; deadline: string | null; status: string } | null) || null,
          };
        })
      );
      interests = enrichedInt;
    }
  }

  return (
    <ProfileEditor
      userId={user.id}
      userEmail={user.email || ""}
      existingProfile={profile}
      engagements={engagements}
      interests={interests}
    />
  );
}
