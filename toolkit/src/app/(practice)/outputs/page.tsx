import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { OutputsView } from "@/components/practice/views/OutputsView";
import type { Output, Decision, Organization } from "@/lib/supabase/types";

const NWA_ECOSYSTEM_ID = "a0000000-0000-0000-0000-000000000001";

export const metadata = {
  title: "Outputs — Cultural Architecture Toolkit",
};

export default async function OutputsPage() {
  const supabase = createClient();

  const [{ data: outputData }, { data: decisionData }, { data: orgData }] = await Promise.all([
    supabase
      .from("outputs")
      .select("*")
      .eq("ecosystem_id", NWA_ECOSYSTEM_ID)
      .order("created_at", { ascending: false }),
    supabase
      .from("decisions")
      .select("id, decision_title")
      .eq("ecosystem_id", NWA_ECOSYSTEM_ID),
    supabase
      .from("organizations")
      .select("id, name")
      .eq("ecosystem_id", NWA_ECOSYSTEM_ID),
  ]);

  const outputs = (outputData as Output[]) || [];
  const decisions = (decisionData as Pick<Decision, "id" | "decision_title">[]) || [];
  const orgs = (orgData as Pick<Organization, "id" | "name">[]) || [];

  // Build plain object maps (serializable for client)
  const decisionMap: Record<string, { id: string; decision_title: string }> = {};
  decisions.forEach((d) => { decisionMap[d.id] = { id: d.id, decision_title: d.decision_title }; });

  const orgMap: Record<string, { id: string; name: string }> = {};
  orgs.forEach((o) => { orgMap[o.id] = { id: o.id, name: o.name }; });

  return (
    <div className="space-y-section">
      <PageHeader
        title="Outputs"
        subtitle="Briefs, analyses, and frameworks we've produced from the intelligence."
      />

      {outputs.length === 0 ? (
        <EmptyState
          title="No outputs yet"
          description="Published intelligence will appear here."
        />
      ) : (
        <OutputsView outputs={outputs} decisionMap={decisionMap} orgMap={orgMap} />
      )}
    </div>
  );
}
