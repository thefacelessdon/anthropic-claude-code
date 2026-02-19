import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { OpportunitiesView } from "@/components/practice/views/OpportunitiesView";
import type { Opportunity, Investment, Organization } from "@/lib/supabase/types";

const NWA_ECOSYSTEM_ID = "a0000000-0000-0000-0000-000000000001";

export const metadata = {
  title: "Opportunity Tracker — Cultural Architecture Toolkit",
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
      .select("id, source_org_id, source_name, initiative_name, amount, status, compounding")
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

  type InvSummary = Pick<Investment, "id" | "source_org_id" | "source_name" | "initiative_name" | "amount" | "status" | "compounding">;
  const investments = (investmentData as InvSummary[]) || [];

  // Build investment map for awarded_investment_id lookups
  const investmentMap: Record<string, InvSummary> = {};
  for (const i of investments) {
    investmentMap[i.id] = i;
  }

  // Build investments-by-org for "What [Org] has invested" section
  const investmentsByOrg: Record<string, InvSummary[]> = {};
  for (const inv of investments) {
    if (inv.source_org_id) {
      if (!investmentsByOrg[inv.source_org_id]) investmentsByOrg[inv.source_org_id] = [];
      investmentsByOrg[inv.source_org_id].push(inv);
    }
  }

  // Build opportunities-by-org for "Also from [Org]" section
  const oppsByOrg: Record<string, Array<{ id: string; title: string; status: string; deadline: string | null }>> = {};
  for (const opp of opportunities) {
    if (opp.source_org_id) {
      if (!oppsByOrg[opp.source_org_id]) oppsByOrg[opp.source_org_id] = [];
      oppsByOrg[opp.source_org_id].push({
        id: opp.id,
        title: opp.title,
        status: opp.status,
        deadline: opp.deadline,
      });
    }
  }

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
        <OpportunitiesView
          opportunities={opportunities}
          investmentMap={investmentMap}
          investmentsByOrg={investmentsByOrg}
          oppsByOrg={oppsByOrg}
        />
      )}
    </div>
  );
}
