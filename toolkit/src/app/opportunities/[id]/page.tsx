import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { OpportunityDetail } from "@/components/public/OpportunityDetail";
import type { Metadata } from "next";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function raw(supabase: any, table: string) { return supabase.from(table); }

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const supabase = createClient();
  const { data } = await raw(supabase, "opportunities")
    .select("title")
    .eq("id", params.id)
    .single();

  const opp = data as { title: string } | null;
  return {
    title: opp?.title
      ? `${opp.title} — NWA Creative Opportunities`
      : "Opportunity — NWA Creative Opportunities",
  };
}

interface OppRow {
  id: string;
  title: string;
  opportunity_type: string;
  status: string;
  deadline: string | null;
  deadline_description: string | null;
  amount_min: number | null;
  amount_max: number | null;
  amount_description: string | null;
  description: string | null;
  eligibility: string | null;
  application_url: string | null;
  contact_email: string | null;
  source_name: string | null;
  source_org_id: string | null;
  preparation_context: string | null;
  target_disciplines: string[] | null;
}

export default async function OpportunityDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  // Fetch opportunity
  const { data: oppData } = await raw(supabase, "opportunities")
    .select(
      "id, title, opportunity_type, status, deadline, deadline_description, amount_min, amount_max, amount_description, description, eligibility, application_url, contact_email, source_name, source_org_id, preparation_context, target_disciplines"
    )
    .eq("id", params.id)
    .single();

  const opp = oppData as OppRow | null;
  if (!opp) notFound();

  // Resolve source org name
  let sourceOrgName: string | null = opp.source_name;
  let sourceOrgId: string | null = opp.source_org_id;
  if (opp.source_org_id) {
    const { data: org } = await raw(supabase, "organizations")
      .select("id, name")
      .eq("id", opp.source_org_id)
      .single();
    const orgRow = org as { id: string; name: string } | null;
    if (orgRow) {
      sourceOrgName = orgRow.name;
      sourceOrgId = orgRow.id;
    }
  }

  // Funder info: total investments + other open opportunities
  let funderInvestments: { initiative_name: string; amount: number | null }[] = [];
  let funderOtherOpps: { id: string; title: string; deadline: string | null }[] = [];
  let funderTotalInvested = 0;

  if (sourceOrgId) {
    const { data: investments } = await raw(supabase, "investments")
      .select("initiative_name, amount")
      .eq("source_org_id", sourceOrgId);

    funderInvestments = (investments || []) as { initiative_name: string; amount: number | null }[];
    funderTotalInvested = funderInvestments.reduce(
      (s: number, i: { amount: number | null }) => s + (i.amount || 0),
      0
    );

    const { data: otherOpps } = await raw(supabase, "opportunities")
      .select("id, title, deadline")
      .eq("source_org_id", sourceOrgId)
      .neq("id", opp.id)
      .in("status", ["open", "closing_soon"]);

    funderOtherOpps = (otherOpps || []) as { id: string; title: string; deadline: string | null }[];
  }

  // Interest count
  const { count: interestCount } = await raw(supabase, "opportunity_interests")
    .select("id", { count: "exact", head: true })
    .eq("opportunity_id", opp.id);

  // Check if current user has a profile + has expressed interest
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userProfile: { id: string } | null = null;
  let userHasInterest = false;

  if (user) {
    const { data: profileData } = await raw(supabase, "public_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();
    userProfile = profileData as { id: string } | null;

    if (userProfile) {
      const { data: interest } = await raw(supabase, "opportunity_interests")
        .select("id")
        .eq("opportunity_id", opp.id)
        .eq("profile_id", userProfile.id)
        .single();
      userHasInterest = !!interest;
    }
  }

  return (
    <OpportunityDetail
      opportunity={{
        ...opp,
        source_name: sourceOrgName,
        source_org_id: sourceOrgId,
      }}
      funder={{
        totalInvested: funderTotalInvested,
        topInvestments: funderInvestments.slice(0, 3),
        otherOpportunities: funderOtherOpps,
      }}
      interestCount={interestCount || 0}
      user={{
        isLoggedIn: !!user,
        hasProfile: !!userProfile,
        profileId: userProfile?.id || null,
        hasInterest: userHasInterest,
      }}
    />
  );
}
