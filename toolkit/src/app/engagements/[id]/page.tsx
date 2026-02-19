import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { EngagementWorkspace } from "@/components/public/EngagementWorkspace";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Engagement — NWA Creative Opportunities",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function raw(supabase: any, table: string) {
  return supabase.from(table);
}

export default async function EngagementPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/auth/login?redirect=/engagements/${params.id}`);

  // Fetch engagement
  const { data: engData } = await raw(supabase, "engagements")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!engData) notFound();

  const engagement = engData as {
    id: string;
    title: string;
    scope: string | null;
    total_amount: number | null;
    start_date: string | null;
    end_date: string | null;
    status: string;
    payment_terms: Record<string, unknown>[];
    practitioner_confirmed_complete: boolean;
    funder_confirmed_complete: boolean;
    completed_at: string | null;
    profile_id: string;
    funder_org_id: string | null;
    opportunity_id: string | null;
  };

  // Fetch related data
  const { data: profileData } = await raw(supabase, "public_profiles")
    .select("id, name, primary_skill")
    .eq("id", engagement.profile_id)
    .single();
  const profile = (profileData as { id: string; name: string; primary_skill: string } | null) || {
    id: "",
    name: "Unknown",
    primary_skill: "",
  };

  let funderName: string | null = null;
  if (engagement.funder_org_id) {
    const { data: org } = await raw(supabase, "organizations")
      .select("name")
      .eq("id", engagement.funder_org_id)
      .single();
    funderName = (org as { name: string } | null)?.name || null;
  }

  const { data: milestones } = await raw(supabase, "engagement_milestones")
    .select("*")
    .eq("engagement_id", params.id)
    .order("sort_order", { ascending: true });

  const { data: deliverables } = await raw(supabase, "engagement_deliverables")
    .select("*")
    .eq("engagement_id", params.id)
    .order("sort_order", { ascending: true });

  const { data: activity } = await raw(supabase, "engagement_activity")
    .select("*")
    .eq("engagement_id", params.id)
    .order("created_at", { ascending: false });

  // Check if current user is the practitioner
  const { data: userProfileData } = await raw(supabase, "public_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();
  const isPractitioner = (userProfileData as { id: string } | null)?.id === engagement.profile_id;

  return (
    <EngagementWorkspace
      engagement={engagement}
      practitioner={profile}
      funderName={funderName}
      milestones={(milestones || []) as { id: string; title: string; due_date: string | null; completed_at: string | null; sort_order: number }[]}
      deliverables={(deliverables || []) as { id: string; title: string; file_url: string | null; submitted_at: string | null; accepted_at: string | null; sort_order: number }[]}
      activity={(activity || []) as { id: string; actor: string; action: string; detail: string | null; created_at: string }[]}
      isPractitioner={isPractitioner}
    />
  );
}
