import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { EcosystemHeadline } from "@/components/practice/EcosystemHeadline";
import { DecisionsForming } from "@/components/practice/DecisionsForming";
import {
  getEcosystemStats,
  getFormingDecisions,
  getOutputForDecision,
  getRecentActivity,
  resolveEntityName,
} from "@/lib/queries/stats";
import { formatRelativeDate } from "@/lib/utils/formatting";
import { GAP_LABELS } from "@/lib/utils/constants";
import type { Narrative, Organization } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/server";

const NWA_ECOSYSTEM_ID = "a0000000-0000-0000-0000-000000000001";

export const metadata = {
  title: "Northwest Arkansas — Cultural Architecture Toolkit",
};

export default async function DashboardPage() {
  const supabase = createClient();

  const [stats, decisions, activity, { data: narrativeData }, { data: orgData }] =
    await Promise.all([
      getEcosystemStats(),
      getFormingDecisions(),
      getRecentActivity(),
      supabase
        .from("narratives")
        .select("*")
        .eq("ecosystem_id", NWA_ECOSYSTEM_ID)
        .in("gap", ["high", "medium"])
        .order("gap", { ascending: true }) // high before medium
        .order("date", { ascending: false })
        .limit(5),
      supabase
        .from("organizations")
        .select("id, name")
        .eq("ecosystem_id", NWA_ECOSYSTEM_ID),
    ]);

  // Resolve narrative source_name from source_org_id when source_name is null
  const orgNameMap = new Map(
    ((orgData as Pick<Organization, "id" | "name">[]) || []).map((o) => [o.id, o.name])
  );
  const highGapNarratives: Narrative[] = ((narrativeData as Narrative[]) || []).map((n) => ({
    ...n,
    source_name: n.source_name || (n.source_org_id ? orgNameMap.get(n.source_org_id) : null) || null,
  }));

  // Resolve output titles for forming decisions
  const outputEntries = await Promise.all(
    decisions.map(async (d) => {
      const out = await getOutputForDecision(d.id);
      return [d.id, out?.title ?? null] as const;
    })
  );
  const outputMap: Record<string, string> = {};
  for (const [id, title] of outputEntries) {
    if (title) outputMap[id] = title;
  }

  // Resolve real entity names for activity entries
  const activityWithNames = await Promise.all(
    activity.map(async (entry) => {
      const name = await resolveEntityName(
        entry.entity_type,
        entry.entity_id,
        entry.changes
      );
      return { ...entry, resolvedName: name };
    })
  );

  // Entity type → page path mapping for clickable activity rows
  function entityHref(entityType: string, entityId: string): string {
    const map: Record<string, string> = {
      organization: "/ecosystem-map",
      investment: "/investments",
      decision: "/decisions",
      precedent: "/precedents",
      opportunity: "/opportunities",
      narrative: "/narratives",
      output: "/outputs",
      practitioner: "/ecosystem-map",
    };
    const base = map[entityType] || "/dashboard";
    return `${base}?open=${entityId}`;
  }

  function entityTypeLabel(type: string): string {
    const map: Record<string, string> = {
      organization: "Organization",
      investment: "Investment",
      decision: "Decision",
      opportunity: "Opportunity",
      practitioner: "Practitioner",
      precedent: "Precedent",
      narrative: "Narrative",
      output: "Output",
    };
    return map[type] || type;
  }

  function actionBadgeClasses(action: string): string {
    switch (action) {
      case "published":
        return "text-accent bg-accent/10";
      case "created":
        return "text-status-green bg-status-green/10";
      case "updated":
        return "text-status-blue bg-status-blue/10";
      case "reviewed":
        return "text-dim bg-dim/10";
      default:
        return "text-dim bg-dim/10";
    }
  }

  return (
    <div>
      <PageHeader
        title="Northwest Arkansas"
        subtitle="Current state of the cultural ecosystem."
      />

      {/* ── Section 1: Ecosystem Headline ─────────────────── */}
      <EcosystemHeadline stats={stats} />

      {/* ── Section 2: Decisions Forming ──────────────────── */}
      <div className="mt-16">
        <div className="mb-4">
          <h2 className="font-display text-base font-semibold text-text">
            Decisions Forming
          </h2>
          <p className="text-[13px] text-muted mt-0.5">
            What&rsquo;s being decided now and when it locks
          </p>
        </div>
        <DecisionsForming decisions={decisions} outputMap={outputMap} />
      </div>

      {/* ── Section 3: Narrative Gaps ─────────────────────── */}
      <div className="mt-16">
        <div className="mb-4">
          <h2 className="font-display text-base font-semibold text-text">
            Narrative Gaps
          </h2>
          <p className="text-[13px] text-muted mt-0.5">
            Where the story doesn&rsquo;t match the data
          </p>
        </div>

        {highGapNarratives.length === 0 ? (
          <p className="text-[13px] text-dim">
            No high or medium narrative gaps at this time.
          </p>
        ) : (
          <div className="space-y-3">
            {highGapNarratives.map((n) => (
              <Link
                key={n.id}
                href={`/narratives?open=${n.id}`}
                className="block bg-surface-card border border-border rounded-card hover:border-border-medium transition-colors"
              >
                <div className="flex">
                  {/* Left accent border */}
                  <div
                    className={`w-[3px] shrink-0 rounded-l-card ${
                      n.gap === "high" ? "bg-status-red" : "bg-status-orange"
                    }`}
                  />
                  <div className="flex-1 min-w-0 px-5 py-4">
                    {/* Gap level label */}
                    <span
                      className={`text-[11px] font-bold uppercase tracking-[0.06em] ${
                        n.gap === "high"
                          ? "text-status-red"
                          : "text-status-orange"
                      }`}
                    >
                      {GAP_LABELS[n.gap] || n.gap}
                    </span>
                    {/* Source name */}
                    <p className="font-display text-[15px] font-semibold text-text mt-1">
                      {n.source_name}
                    </p>
                    {/* Reality text — show the truth, not the claim */}
                    {n.reality_text && (
                      <p className="text-[13px] text-muted mt-1 line-clamp-2">
                        {n.reality_text}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}

            {highGapNarratives.length >= 5 && (
              <Link
                href="/narratives"
                className="inline-block text-[13px] text-accent mt-1 hover:underline"
              >
                View all in Narratives &rarr;
              </Link>
            )}
          </div>
        )}
      </div>

      {/* ── Section 4: Recent Changes ─────────────────────── */}
      <div className="mt-16 mb-8">
        <div className="mb-4">
          <h2 className="font-display text-base font-semibold text-text">
            Recent Changes
          </h2>
        </div>

        {activityWithNames.length === 0 ? (
          <p className="text-[13px] text-dim">No recent changes.</p>
        ) : (
          <div>
            {activityWithNames.map((entry, i) => (
              <Link
                key={entry.id}
                href={entityHref(entry.entity_type, entry.entity_id)}
                className={`flex items-center justify-between py-2.5 px-3 rounded hover:bg-surface-elevated/50 transition-colors ${
                  i < activityWithNames.length - 1
                    ? "border-b border-border"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded tracking-[0.06em] shrink-0 ${actionBadgeClasses(
                      entry.action
                    )}`}
                  >
                    {entry.action}
                  </span>
                  <span className="text-[11px] font-semibold text-dim uppercase tracking-[0.04em] shrink-0">
                    {entityTypeLabel(entry.entity_type)}
                  </span>
                  <span className="text-[13px] text-text truncate">
                    {entry.resolvedName}
                  </span>
                </div>
                <span className="text-[12px] text-dim shrink-0 ml-3">
                  {formatRelativeDate(entry.created_at)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
