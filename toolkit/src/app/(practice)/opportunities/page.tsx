import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { OpportunitiesView } from "@/components/practice/views/OpportunitiesView";
import type { Opportunity, Investment, Organization } from "@/lib/supabase/types";

const NWA_ECOSYSTEM_ID = "a0000000-0000-0000-0000-000000000001";

export const metadata = {
  title: "Opportunities — Cultural Architecture Toolkit",
};

export default async function OpportunitiesPage() {
  const supabase = createClient();

  const [{ data: oppData }, { data: investmentData }, { data: orgData }] = await Promise.all([
    supabase
      .from("opportunities")
      .select("*")
      .eq("ecosystem_id", NWA_ECOSYSTEM_ID)
      .order("deadline", { ascending: true }),
    supabase
      .from("investments")
      .select("id, initiative_name")
      .eq("ecosystem_id", NWA_ECOSYSTEM_ID),
    supabase
      .from("organizations")
      .select("id, name")
      .eq("ecosystem_id", NWA_ECOSYSTEM_ID),
  ]);

  // Resolve source_name from source_org_id when source_name is null
  const orgNameMap = new Map(
    ((orgData as Pick<Organization, "id" | "name">[]) || []).map((o) => [o.id, o.name])
  );
  const opportunities: Opportunity[] = ((oppData as Opportunity[]) || []).map((opp) => ({
    ...opp,
    source_name: opp.source_name || (opp.source_org_id ? orgNameMap.get(opp.source_org_id) : null) || null,
  }));
  const investments = (investmentData as Pick<Investment, "id" | "initiative_name">[]) || [];

  // Build plain object map (serializable for client)
  const investmentMap: Record<string, { id: string; initiative_name: string }> = {};
  investments.forEach((i) => {
    investmentMap[i.id] = { id: i.id, initiative_name: i.initiative_name };
  });

  return (
    <div className="space-y-section">
      <PageHeader
        title="Opportunities"
        subtitle="Every open grant, commission, RFP, and residency flowing through the ecosystem."
      />

      {opportunities.length === 0 ? (
        <EmptyState
          title="No opportunities yet"
          description="Opportunities will appear here once added."
        />
      ) : (
        <OpportunitiesView opportunities={opportunities} investmentMap={investmentMap} />
      )}
    </div>
  );
}
