import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { EcosystemMapView } from "@/components/practice/views/EcosystemMapView";
import type { Organization, Practitioner, Investment, Decision, Opportunity } from "@/lib/supabase/types";

const NWA_ECOSYSTEM_ID = "a0000000-0000-0000-0000-000000000001";

export const metadata = {
  title: "Ecosystem Map — Cultural Architecture Toolkit",
};

export default async function EcosystemMapPage() {
  const supabase = createClient();

  const [
    { data: orgs },
    { data: practitioners },
    { data: investments },
    { data: decisions },
    { data: opportunities },
  ] = await Promise.all([
    supabase.from("organizations").select("*").eq("ecosystem_id", NWA_ECOSYSTEM_ID).order("name"),
    supabase.from("practitioners").select("*").eq("ecosystem_id", NWA_ECOSYSTEM_ID).order("name"),
    supabase.from("investments").select("id, source_org_id, status").eq("ecosystem_id", NWA_ECOSYSTEM_ID),
    supabase.from("decisions").select("id, stakeholder_org_id, status").eq("ecosystem_id", NWA_ECOSYSTEM_ID),
    supabase.from("opportunities").select("id, source_org_id, status").eq("ecosystem_id", NWA_ECOSYSTEM_ID),
  ]);

  const organizations = (orgs as Organization[]) || [];
  const practitionerList = (practitioners as Practitioner[]) || [];
  const investmentList = (investments as Pick<Investment, "id" | "source_org_id" | "status">[]) || [];
  const decisionList = (decisions as Pick<Decision, "id" | "stakeholder_org_id" | "status">[]) || [];
  const opportunityList = (opportunities as Pick<Opportunity, "id" | "source_org_id" | "status">[]) || [];

  // Build connection counts per org as a plain object (serializable)
  const orgConnectionCounts: Record<string, { investments: number; decisions: number; opportunities: number }> = {};
  organizations.forEach((org) => {
    orgConnectionCounts[org.id] = { investments: 0, decisions: 0, opportunities: 0 };
  });
  investmentList.forEach((inv) => {
    if (inv.source_org_id && orgConnectionCounts[inv.source_org_id]) {
      orgConnectionCounts[inv.source_org_id].investments++;
    }
  });
  decisionList.forEach((dec) => {
    if (dec.stakeholder_org_id && orgConnectionCounts[dec.stakeholder_org_id]) {
      orgConnectionCounts[dec.stakeholder_org_id].decisions++;
    }
  });
  opportunityList.forEach((opp) => {
    if (opp.source_org_id && orgConnectionCounts[opp.source_org_id]) {
      orgConnectionCounts[opp.source_org_id].opportunities++;
    }
  });

  if (organizations.length === 0 && practitionerList.length === 0) {
    return (
      <div className="space-y-section">
        <PageHeader
          title="Ecosystem Map"
          subtitle="Every institution, funder, and practitioner in the system — and how they connect."
        />
        <EmptyState
          title="No entities yet"
          description="Organizations and practitioners will appear here once added."
        />
      </div>
    );
  }

  return (
    <div className="space-y-section">
      <PageHeader
        title="Ecosystem Map"
        subtitle="Every institution, funder, and practitioner in the system — and how they connect."
      />

      <EcosystemMapView
        organizations={organizations}
        practitioners={practitionerList}
        orgConnectionCounts={orgConnectionCounts}
      />
    </div>
  );
}
