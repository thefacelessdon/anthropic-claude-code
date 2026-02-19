import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PublicProfileView } from "@/components/public/PublicProfileView";
import type { Metadata } from "next";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function raw(supabase: any, table: string) { return supabase.from(table); }

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const supabase = createClient();
  const { data } = await raw(supabase, "public_profiles")
    .select("name, primary_skill")
    .eq("id", params.id)
    .single();
  const profile = data as { name: string; primary_skill: string } | null;
  return {
    title: profile
      ? `${profile.name} — ${profile.primary_skill}`
      : "Profile — NWA Creative Opportunities",
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: profileData } = await raw(supabase, "public_profiles")
    .select("*")
    .eq("id", params.id)
    .single();

  const profile = profileData as {
    id: string;
    name: string;
    primary_skill: string;
    location: string;
    bio: string | null;
    portfolio_url: string | null;
    is_verified: boolean;
    looking_for: string[] | null;
    availability: string;
    additional_skills: string[] | null;
  } | null;

  if (!profile) notFound();

  // Get completed engagements only
  const { data: engData } = await raw(supabase, "engagements")
    .select("id, title, funder_org_id, completed_at")
    .eq("profile_id", profile.id)
    .eq("status", "complete")
    .order("completed_at", { ascending: false });

  const engagements = (engData || []) as { id: string; title: string; funder_org_id: string | null; completed_at: string | null }[];

  const enriched = await Promise.all(
    engagements.map(async (eng) => {
      let funderName: string | null = null;
      if (eng.funder_org_id) {
        const { data: org } = await raw(supabase, "organizations")
          .select("name")
          .eq("id", eng.funder_org_id)
          .single();
        funderName = (org as { name: string } | null)?.name || null;
      }
      return { ...eng, funder_name: funderName };
    })
  );

  return <PublicProfileView profile={profile} completedEngagements={enriched} />;
}
