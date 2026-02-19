import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { NarrativesView } from "@/components/practice/views/NarrativesView";
import type { Narrative, Organization, Decision, Investment } from "@/lib/supabase/types";

const NWA_ECOSYSTEM_ID = "a0000000-0000-0000-0000-000000000001";

export const metadata = {
  title: "Narratives — Cultural Architecture Toolkit",
};

export default async function NarrativesPage() {
  const supabase = createClient();

  const [
    { data },
    { data: orgData },
    { data: decisionData },
    { data: investmentData },
  ] = await Promise.all([
    supabase
      .from("narratives")
      .select("*")
      .eq("ecosystem_id", NWA_ECOSYSTEM_ID)
      .order("date", { ascending: false }),
    supabase
      .from("organizations")
      .select("id, name")
      .eq("ecosystem_id", NWA_ECOSYSTEM_ID),
    supabase
      .from("decisions")
      .select("id, stakeholder_org_id, stakeholder_name, decision_title, locks_date, status")
      .eq("ecosystem_id", NWA_ECOSYSTEM_ID)
      .in("status", ["upcoming", "deliberating"])
      .order("locks_date", { ascending: true }),
    supabase
      .from("investments")
      .select("id, source_org_id, source_name, initiative_name, amount, status, compounding")
      .eq("ecosystem_id", NWA_ECOSYSTEM_ID),
  ]);

  // Resolve source_name from source_org_id when source_name is null
  const orgNameMap = new Map(
    ((orgData as Pick<Organization, "id" | "name">[]) || []).map((o) => [o.id, o.name])
  );
  const narratives: Narrative[] = ((data as Narrative[]) || []).map((n) => ({
    ...n,
    source_name: n.source_name || (n.source_org_id ? orgNameMap.get(n.source_org_id) : null) || null,
  }));

  // Build decisions-by-org for connected decision on cards
  type DecisionRef = Pick<Decision, "id" | "stakeholder_org_id" | "stakeholder_name" | "decision_title" | "locks_date" | "status">;
  const decisions = (decisionData as DecisionRef[]) || [];
  const decisionsByOrg: Record<string, DecisionRef[]> = {};
  for (const d of decisions) {
    if (d.stakeholder_org_id) {
      if (!decisionsByOrg[d.stakeholder_org_id]) decisionsByOrg[d.stakeholder_org_id] = [];
      decisionsByOrg[d.stakeholder_org_id].push(d);
    }
  }

  // Build investments-by-org for detail panel
  type InvRef = Pick<Investment, "id" | "source_org_id" | "source_name" | "initiative_name" | "amount" | "status" | "compounding">;
  const investments = (investmentData as InvRef[]) || [];
  const investmentsByOrg: Record<string, InvRef[]> = {};
  for (const inv of investments) {
    if (inv.source_org_id) {
      if (!investmentsByOrg[inv.source_org_id]) investmentsByOrg[inv.source_org_id] = [];
      investmentsByOrg[inv.source_org_id].push(inv);
    }
  }

  // Compute editorial stats
  const total = narratives.length;
  const sources = new Set(narratives.map((n) => n.source_name).filter(Boolean)).size;
  const highGap = narratives.filter((n) => n.gap === "high");
  const mediumGap = narratives.filter((n) => n.gap === "medium");
  const lowGap = narratives.filter((n) => n.gap === "low");
  const aligned = narratives.filter((n) => n.gap === "aligned");
  const widest = highGap[0] || mediumGap[0];

  return (
    <div className="space-y-section">
      <PageHeader
        title="Narratives"
        subtitle="What's being said about this ecosystem versus what's actually happening."
      />

      {/* Editorial stats */}
      {total > 0 && (
        <div className="bg-surface-card border border-border rounded-card p-6">
          <p className="text-[15px] text-muted leading-relaxed">
            <span className="font-semibold text-text">{total}</span>{" "}
            narrative{total !== 1 ? "s" : ""} tracked across{" "}
            <span className="font-semibold text-text">{sources}</span>{" "}
            source{sources !== 1 ? "s" : ""}.{" "}
            {highGap.length > 0 && (
              <>
                <span className="font-semibold text-text">{highGap.length}</span>{" "}
                show{highGap.length === 1 ? "s" : ""} high gaps between story and reality.{" "}
              </>
            )}
            {highGap.length === 0 && mediumGap.length > 0 && (
              <>
                <span className="font-semibold text-text">{mediumGap.length}</span>{" "}
                show medium gaps.{" "}
              </>
            )}
            {widest && (
              <>
                The widest gap:{" "}
                <span className="font-semibold text-text">
                  {widest.source_name}
                </span>
                {widest.narrative_text && (
                  <>
                    &rsquo;s{" "}
                    {widest.narrative_text.length > 80
                      ? `"${widest.narrative_text.slice(0, 80).trim()}..."`
                      : `"${widest.narrative_text}"`}
                  </>
                )}
                .
              </>
            )}
          </p>
          <div className="flex items-center gap-5 mt-3">
            {highGap.length > 0 && (
              <span className="flex items-center gap-1.5 text-sm">
                <span className="inline-block w-2.5 h-2.5 rounded-sm bg-status-red" />
                <span className="font-mono font-medium text-text">{highGap.length}</span>
                <span className="text-[11px] text-dim">high gap</span>
              </span>
            )}
            {mediumGap.length > 0 && (
              <span className="flex items-center gap-1.5 text-sm">
                <span className="inline-block w-2.5 h-2.5 rounded-sm bg-status-orange" />
                <span className="font-mono font-medium text-text">{mediumGap.length}</span>
                <span className="text-[11px] text-dim">medium</span>
              </span>
            )}
            {lowGap.length > 0 && (
              <span className="flex items-center gap-1.5 text-sm">
                <span className="inline-block w-2.5 h-2.5 rounded-sm bg-status-blue" />
                <span className="font-mono font-medium text-text">{lowGap.length}</span>
                <span className="text-[11px] text-dim">low</span>
              </span>
            )}
            {aligned.length > 0 && (
              <span className="flex items-center gap-1.5 text-sm">
                <span className="inline-block w-2.5 h-2.5 rounded-sm bg-status-green" />
                <span className="font-mono font-medium text-text">{aligned.length}</span>
                <span className="text-[11px] text-dim">aligned</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Narrative cards — client component with grid + detail panel */}
      {narratives.length === 0 ? (
        <EmptyState
          title="No narratives yet"
          description="Narratives will appear here once documented."
        />
      ) : (
        <NarrativesView
          narratives={narratives}
          decisionsByOrg={decisionsByOrg}
          investmentsByOrg={investmentsByOrg}
        />
      )}
    </div>
  );
}
