import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { EcosystemMapView } from "@/components/practice/views/EcosystemMapView";
import type {
  Organization,
  Practitioner,
  Investment,
  Decision,
  Opportunity,
  Narrative,
  Contact,
} from "@/lib/supabase/types";

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
    { data: narratives },
    { data: contacts },
  ] = await Promise.all([
    supabase.from("organizations").select("*").eq("ecosystem_id", NWA_ECOSYSTEM_ID).order("name"),
    supabase.from("practitioners").select("*").eq("ecosystem_id", NWA_ECOSYSTEM_ID).order("name"),
    supabase.from("investments").select("id, source_org_id, initiative_name, amount, compounding, status").eq("ecosystem_id", NWA_ECOSYSTEM_ID),
    supabase.from("decisions").select("id, stakeholder_org_id, decision_title, status, locks_date").eq("ecosystem_id", NWA_ECOSYSTEM_ID),
    supabase.from("opportunities").select("id, source_org_id, title, amount_min, amount_max, deadline, status").eq("ecosystem_id", NWA_ECOSYSTEM_ID),
    supabase.from("narratives").select("id, source_org_id, source_name, gap").eq("ecosystem_id", NWA_ECOSYSTEM_ID),
    supabase.from("contacts").select("*").order("name"),
  ]);

  const organizations = (orgs as Organization[]) || [];
  const practitionerList = (practitioners as Practitioner[]) || [];
  const investmentList = (investments as Pick<Investment, "id" | "source_org_id" | "initiative_name" | "amount" | "compounding" | "status">[]) || [];
  const decisionList = (decisions as Pick<Decision, "id" | "stakeholder_org_id" | "decision_title" | "status" | "locks_date">[]) || [];
  const opportunityList = (opportunities as Pick<Opportunity, "id" | "source_org_id" | "title" | "amount_min" | "amount_max" | "deadline" | "status">[]) || [];
  const contactList = (contacts as Contact[]) || [];

  // Resolve narrative source_name from org when source_name is null
  const orgNameMap = new Map(organizations.map((o) => [o.id, o.name]));
  const narrativeList = ((narratives as Pick<Narrative, "id" | "source_org_id" | "source_name" | "gap">[]) || []).map((n) => ({
    ...n,
    source_name: n.source_name || (n.source_org_id ? orgNameMap.get(n.source_org_id) : null) || null,
  }));

  // Build per-org data for cards and detail panel
  type OrgInvestment = (typeof investmentList)[number];
  type OrgDecision = (typeof decisionList)[number];
  type OrgOpportunity = (typeof opportunityList)[number];
  type OrgNarrative = (typeof narrativeList)[number];

  const orgData: Record<string, {
    investments: OrgInvestment[];
    decisions: OrgDecision[];
    opportunities: OrgOpportunity[];
    narratives: OrgNarrative[];
    contacts: Contact[];
  }> = {};

  organizations.forEach((org) => {
    orgData[org.id] = { investments: [], decisions: [], opportunities: [], narratives: [], contacts: [] };
  });
  investmentList.forEach((inv) => {
    if (inv.source_org_id && orgData[inv.source_org_id]) {
      orgData[inv.source_org_id].investments.push(inv);
    }
  });
  decisionList.forEach((dec) => {
    if (dec.stakeholder_org_id && orgData[dec.stakeholder_org_id]) {
      orgData[dec.stakeholder_org_id].decisions.push(dec);
    }
  });
  opportunityList.forEach((opp) => {
    if (opp.source_org_id && orgData[opp.source_org_id]) {
      orgData[opp.source_org_id].opportunities.push(opp);
    }
  });
  narrativeList.forEach((n) => {
    if (n.source_org_id && orgData[n.source_org_id]) {
      orgData[n.source_org_id].narratives.push(n);
    }
  });
  contactList.forEach((c) => {
    if (orgData[c.organization_id]) {
      orgData[c.organization_id].contacts.push(c);
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
        orgData={orgData}
      />
    </div>
  );
}
