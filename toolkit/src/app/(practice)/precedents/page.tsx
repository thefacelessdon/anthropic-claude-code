import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { PrecedentsView } from "@/components/practice/views/PrecedentsView";
import type { Precedent, Organization, Investment, Decision } from "@/lib/supabase/types";

const NWA_ECOSYSTEM_ID = "a0000000-0000-0000-0000-000000000001";

export const metadata = {
  title: "Precedents — Cultural Architecture Toolkit",
};

export default async function PrecedentsPage() {
  const supabase = createClient();

  const [
    { data: precedentData },
    { data: orgData },
    { data: investmentData },
    { data: decisionData },
  ] = await Promise.all([
    supabase
      .from("precedents")
      .select("*")
      .eq("ecosystem_id", NWA_ECOSYSTEM_ID)
      .order("created_at", { ascending: false }),
    supabase
      .from("organizations")
      .select("id, name, org_type")
      .eq("ecosystem_id", NWA_ECOSYSTEM_ID),
    supabase
      .from("investments")
      .select("id, source_org_id, source_name, initiative_name, amount, status, precedent_id")
      .eq("ecosystem_id", NWA_ECOSYSTEM_ID),
    supabase
      .from("decisions")
      .select("id, stakeholder_org_id, stakeholder_name, decision_title, status, locks_date")
      .eq("ecosystem_id", NWA_ECOSYSTEM_ID)
      .in("status", ["deliberating", "upcoming"]),
  ]);

  const precedents = (precedentData as Precedent[]) || [];
  const orgs = (orgData as Pick<Organization, "id" | "name" | "org_type">[]) || [];
  const investments = (investmentData as Pick<Investment, "id" | "source_org_id" | "source_name" | "initiative_name" | "amount" | "status" | "precedent_id">[]) || [];
  const activeDecisions = (decisionData as Pick<Decision, "id" | "stakeholder_org_id" | "stakeholder_name" | "decision_title" | "status" | "locks_date">[]) || [];

  // Build org name → id map for heuristic matching
  const orgNameToId: Record<string, string> = {};
  const orgIdToName: Record<string, string> = {};
  for (const org of orgs) {
    orgNameToId[org.name.toLowerCase()] = org.id;
    orgIdToName[org.id] = org.name;
  }

  // Build investments-by-precedent (direct FK link)
  const investmentsByPrecedent: Record<string, typeof investments> = {};
  for (const inv of investments) {
    if (inv.precedent_id) {
      if (!investmentsByPrecedent[inv.precedent_id]) investmentsByPrecedent[inv.precedent_id] = [];
      investmentsByPrecedent[inv.precedent_id].push(inv);
    }
  }

  // Parse org names from "involved" field and match to org IDs
  function parseOrgIds(involved: string | null): string[] {
    if (!involved) return [];
    const parts = involved.split(",").map((p) => p.replace(/\(.*?\)/g, "").trim().toLowerCase());
    const ids: string[] = [];
    for (const part of parts) {
      if (orgNameToId[part]) ids.push(orgNameToId[part]);
    }
    return ids;
  }

  // For each precedent, compute involved org IDs
  const involvedOrgsByPrecedent: Record<string, string[]> = {};
  for (const p of precedents) {
    involvedOrgsByPrecedent[p.id] = parseOrgIds(p.involved);
  }

  // Active decisions by org
  const decisionsByOrg: Record<string, typeof activeDecisions> = {};
  for (const d of activeDecisions) {
    if (d.stakeholder_org_id) {
      if (!decisionsByOrg[d.stakeholder_org_id]) decisionsByOrg[d.stakeholder_org_id] = [];
      decisionsByOrg[d.stakeholder_org_id].push(d);
    }
  }

  // Active investments by org
  const investmentsByOrg: Record<string, typeof investments> = {};
  for (const inv of investments) {
    if (inv.source_org_id && inv.status === "active") {
      if (!investmentsByOrg[inv.source_org_id]) investmentsByOrg[inv.source_org_id] = [];
      investmentsByOrg[inv.source_org_id].push(inv);
    }
  }

  return (
    <div className="space-y-section">
      <PageHeader
        title="Precedents"
        subtitle="What's been tried before. The institutional memory that prevents starting from scratch."
      />

      {precedents.length === 0 ? (
        <EmptyState
          title="No precedents yet"
          description="Start documenting what's been tried."
        />
      ) : (
        <PrecedentsView
          precedents={precedents}
          orgIdToName={orgIdToName}
          involvedOrgsByPrecedent={involvedOrgsByPrecedent}
          investmentsByPrecedent={investmentsByPrecedent}
          decisionsByOrg={decisionsByOrg}
          investmentsByOrg={investmentsByOrg}
        />
      )}
    </div>
  );
}
