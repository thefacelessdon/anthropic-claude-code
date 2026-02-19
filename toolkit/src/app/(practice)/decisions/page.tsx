import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { DecisionsView } from "@/components/practice/views/DecisionsView";
import type { Decision, Output, Organization } from "@/lib/supabase/types";

const NWA_ECOSYSTEM_ID = "a0000000-0000-0000-0000-000000000001";

export const metadata = {
  title: "Decisions — Cultural Architecture Toolkit",
};

export default async function DecisionsPage() {
  const supabase = createClient();

  const [{ data: decisionData }, { data: outputData }, { data: orgData }] = await Promise.all([
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

  return (
    <div className="space-y-section">
      <PageHeader title="Decisions" subtitle="What's being decided right now, when it locks, and where we need to show up." />

      {decisions.length === 0 ? (
        <EmptyState
          title="No decisions yet"
          description="Decisions will appear here once added to the ecosystem."
        />
      ) : (
        <DecisionsView decisions={decisions} outputsByDecision={outputsByDecision} />
      )}
    </div>
  );
}
