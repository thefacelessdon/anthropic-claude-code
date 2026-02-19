import { createClient } from "@/lib/supabase/server";
import { PublicOpportunities } from "@/components/public/PublicOpportunities";

const NWA_ECOSYSTEM_ID = "a0000000-0000-0000-0000-000000000001";

export default async function PublicOpportunitiesPage() {
  const supabase = createClient();

  const { data: oppData } = await supabase
    .from("opportunities")
    .select(
      "id, title, opportunity_type, status, deadline, amount_min, amount_max, amount_description, description, eligibility, application_url, contact_email, source_name, source_org_id"
    )
    .eq("ecosystem_id", NWA_ECOSYSTEM_ID)
    .in("status", ["open", "closing_soon"])
    .order("deadline", { ascending: true });

  // Resolve source_name from org join when null
  const { data: orgData } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("ecosystem_id", NWA_ECOSYSTEM_ID);

  const orgNameMap = new Map(
    (orgData || []).map((o: { id: string; name: string }) => [o.id, o.name])
  );

  // Shape data for public surface — strip internal IDs
  const opportunities = (oppData || []).map(
    (opp: {
      id: string;
      title: string;
      opportunity_type: string;
      status: string;
      deadline: string | null;
      amount_min: number | null;
      amount_max: number | null;
      amount_description: string | null;
      description: string | null;
      eligibility: string | null;
      application_url: string | null;
      contact_email: string | null;
      source_name: string | null;
      source_org_id: string | null;
    }) => ({
      id: opp.id,
      title: opp.title,
      opportunity_type: opp.opportunity_type,
      status: opp.status,
      deadline: opp.deadline,
      amount_min: opp.amount_min,
      amount_max: opp.amount_max,
      amount_description: opp.amount_description,
      description: opp.description,
      eligibility: opp.eligibility,
      application_url: opp.application_url,
      contact_email: opp.contact_email,
      source_name:
        opp.source_name ||
        (opp.source_org_id ? orgNameMap.get(opp.source_org_id) : null) ||
        null,
    })
  );

  return <PublicOpportunities opportunities={opportunities} />;
}
