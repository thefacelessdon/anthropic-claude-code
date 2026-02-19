import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { DecisionsView } from "@/components/practice/views/DecisionsView";
import type { Decision, Output, Organization, DecisionDependency, Investment, Precedent, Narrative } from "@/lib/supabase/types";

const NWA_ECOSYSTEM_ID = "a0000000-0000-0000-0000-000000000001";

export const metadata = {
  title: "Decisions — Cultural Architecture Toolkit",
};

export default async function DecisionsPage() {
  const supabase = createClient();

  const [
    { data: decisionData },
    { data: outputData },
    { data: orgData },
    { data: depData },
    { data: investmentData },
    { data: precedentData },
    { data: narrativeData },
  ] = await Promise.all([
    supabase
      .from("decisions")
      .select("*")
      .eq("ecosystem_id", NWA_ECOSYSTEM_ID)
      .order("locks_date", { ascending: true }),
    supabase
      .from("outputs")
      .select("id, title, triggered_by_decision_id, is_published")
      .eq("ecosystem_id", NWA_ECOSYSTEM_ID),
    supabase
      .from("organizations")
      .select("id, name")
      .eq("ecosystem_id", NWA_ECOSYSTEM_ID),
    supabase
      .from("decision_dependencies")
      .select("decision_id, depends_on_id, description"),
    supabase
      .from("investments")
      .select("id, source_org_id, initiative_name, amount, compounding, status")
      .eq("ecosystem_id", NWA_ECOSYSTEM_ID)
      .order("amount", { ascending: false }),
    supabase
      .from("precedents")
      .select("id, name, period, involved, takeaway")
      .eq("ecosystem_id", NWA_ECOSYSTEM_ID),
    supabase
      .from("narratives")
      .select("id, source_org_id, source_name, gap, narrative_text, reality_text")
      .eq("ecosystem_id", NWA_ECOSYSTEM_ID),
  ]);

  // Resolve stakeholder_name from stakeholder_org_id when stakeholder_name is null
  const orgNameMap = new Map(
    ((orgData as Pick<Organization, "id" | "name">[]) || []).map((o) => [o.id, o.name])
  );
  const decisions: Decision[] = ((decisionData as Decision[]) || []).map((d) => ({
    ...d,
    stakeholder_name: d.stakeholder_name || (d.stakeholder_org_id ? orgNameMap.get(d.stakeholder_org_id) : null) || null,
  }));
  const outputs = (outputData as Pick<Output, "id" | "title" | "triggered_by_decision_id" | "is_published">[]) || [];

  // Build output lookup by decision ID as a plain object (serializable)
  const outputsByDecision: Record<string, Array<{ id: string; title: string; is_published: boolean }>> = {};
  outputs.forEach((o) => {
    if (o.triggered_by_decision_id) {
      if (!outputsByDecision[o.triggered_by_decision_id]) {
        outputsByDecision[o.triggered_by_decision_id] = [];
      }
      outputsByDecision[o.triggered_by_decision_id].push({
        id: o.id,
        title: o.title,
        is_published: o.is_published,
      });
    }
  });

  // Build dependency lookups: dependsOn (what this decision depends on) and dependedOnBy (what depends on this)
  const deps = (depData as DecisionDependency[]) || [];
  const dependsOn: Record<string, Array<{ id: string; description: string | null }>> = {};
  const dependedOnBy: Record<string, Array<{ id: string; description: string | null }>> = {};
  deps.forEach((dep) => {
    if (!dependsOn[dep.decision_id]) dependsOn[dep.decision_id] = [];
    dependsOn[dep.decision_id].push({ id: dep.depends_on_id, description: dep.description });
    if (!dependedOnBy[dep.depends_on_id]) dependedOnBy[dep.depends_on_id] = [];
    dependedOnBy[dep.depends_on_id].push({ id: dep.decision_id, description: dep.description });
  });

  // Build per-org investment lookup (top 5 per org)
  type InvSummary = Pick<Investment, "id" | "initiative_name" | "amount" | "compounding" | "status">;
  const investmentsByOrg: Record<string, InvSummary[]> = {};
  ((investmentData as (InvSummary & { source_org_id: string | null })[]) || []).forEach((inv) => {
    if (inv.source_org_id) {
      if (!investmentsByOrg[inv.source_org_id]) investmentsByOrg[inv.source_org_id] = [];
      if (investmentsByOrg[inv.source_org_id].length < 5) {
        investmentsByOrg[inv.source_org_id].push({
          id: inv.id, initiative_name: inv.initiative_name,
          amount: inv.amount, compounding: inv.compounding, status: inv.status,
        });
      }
    }
  });

  // Build per-org narrative lookup
  type NarrSummary = Pick<Narrative, "id" | "source_name" | "gap" | "reality_text">;
  const narrativesByOrg: Record<string, NarrSummary[]> = {};
  ((narrativeData as (NarrSummary & { source_org_id: string | null })[]) || []).forEach((n) => {
    if (n.source_org_id) {
      if (!narrativesByOrg[n.source_org_id]) narrativesByOrg[n.source_org_id] = [];
      narrativesByOrg[n.source_org_id].push({
        id: n.id, source_name: n.source_name || orgNameMap.get(n.source_org_id) || null,
        gap: n.gap, reality_text: n.reality_text,
      });
    }
  });

  // Precedents list (matched by org name in "involved" field at render time)
  type PrecSummary = Pick<Precedent, "id" | "name" | "period" | "involved" | "takeaway">;
  const precedents: PrecSummary[] = (precedentData as PrecSummary[]) || [];

  return (
    <div className="space-y-section">
      <PageHeader title="Decisions" subtitle="What's being decided right now, when it locks, and where we need to show up." />

      {decisions.length === 0 ? (
        <EmptyState
          title="No decisions yet"
          description="Decisions will appear here once added to the ecosystem."
        />
      ) : (
        <DecisionsView
          decisions={decisions}
          outputsByDecision={outputsByDecision}
          dependsOn={dependsOn}
          dependedOnBy={dependedOnBy}
          investmentsByOrg={investmentsByOrg}
          narrativesByOrg={narrativesByOrg}
          precedents={precedents}
        />
      )}
    </div>
  );
}
