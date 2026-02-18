import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatsBar } from "@/components/practice/StatsBar";
import {
  getEcosystemStats,
  getStaleEntries,
  getUpcomingInterventions,
  getRecentActivity,
} from "@/lib/queries/stats";
import {
  formatDate,
  formatRelativeDate,
  daysUntil,
} from "@/lib/utils/formatting";
import { DECISION_STATUS_LABELS, GAP_LABELS } from "@/lib/utils/constants";
import type { Narrative, Submission } from "@/lib/supabase/types";

const NWA_ECOSYSTEM_ID = "a0000000-0000-0000-0000-000000000001";

export const metadata = {
  title: "Dashboard — Cultural Architecture Toolkit",
};

function decisionStatusColor(status: string): "green" | "red" | "blue" | "orange" | "dim" {
  const map: Record<string, "green" | "red" | "blue" | "orange" | "dim"> = {
    upcoming: "blue",
    deliberating: "orange",
    locked: "red",
    completed: "green",
  };
  return map[status] || "dim";
}

function entityTypeLabel(type: string): string {
  const map: Record<string, string> = {
    organization: "Org",
    investment: "Investment",
    decision: "Decision",
    opportunity: "Opportunity",
    practitioner: "Practitioner",
  };
  return map[type] || type;
}

export default async function DashboardPage() {
  const supabase = createClient();

  const [stats, staleEntries, interventions, activity, { data: narrativeData }, { data: submissionData }] =
    await Promise.all([
      getEcosystemStats(),
      getStaleEntries(),
      getUpcomingInterventions(),
      getRecentActivity(),
      supabase
        .from("narratives")
        .select("*")
        .eq("ecosystem_id", NWA_ECOSYSTEM_ID)
        .in("gap", ["high", "medium"])
        .order("date", { ascending: false })
        .limit(5),
      supabase
        .from("submissions")
        .select("*")
        .eq("ecosystem_id", NWA_ECOSYSTEM_ID)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const highGapNarratives = (narrativeData as Narrative[]) || [];
  const pendingSubmissions = (submissionData as Submission[]) || [];

  // Build unified "Needs Attention" queue
  type AttentionItem = {
    type: "decision" | "submission" | "opportunity" | "stale";
    urgency: number;
    id: string;
    title: string;
    subtitle: string;
    badge: string;
    badgeColor: "green" | "red" | "blue" | "orange" | "dim";
    action: string;
    href: string;
  };

  const attentionItems: AttentionItem[] = [];

  // Decisions needing intervention
  interventions.forEach((d) => {
    const days = daysUntil(d.locks_date);
    attentionItems.push({
      type: "decision",
      urgency: days !== null ? days : 999,
      id: d.id,
      title: d.decision_title,
      subtitle: `${d.stakeholder_org_name || "Unknown"} · Locks ${formatDate(d.locks_date)}${days !== null ? ` (${days}d)` : ""}`,
      badge: DECISION_STATUS_LABELS[d.status] || d.status,
      badgeColor: decisionStatusColor(d.status),
      action: d.intervention_needed || "Review decision",
      href: "/decisions",
    });
  });

  // Pending submissions
  pendingSubmissions.forEach((s) => {
    const sd = s.data as Record<string, unknown>;
    const title = (sd?.title as string) || (sd?.name as string) || s.submission_type;
    attentionItems.push({
      type: "submission",
      urgency: 50,
      id: s.id,
      title,
      subtitle: `From ${s.submitter_name || "Unknown"}${s.submitter_org ? ` (${s.submitter_org})` : ""} · Pending review`,
      badge: "Submission",
      badgeColor: "orange",
      action: "Review",
      href: "/submissions",
    });
  });

  // Stale entries
  staleEntries.slice(0, 3).forEach((entry) => {
    attentionItems.push({
      type: "stale",
      urgency: 100,
      id: entry.entity_id,
      title: entry.name,
      subtitle: `${entityTypeLabel(entry.entity_type)} · Not reviewed since ${formatRelativeDate(entry.last_reviewed_at)}`,
      badge: "Stale",
      badgeColor: "dim",
      action: "Review",
      href: `/${entry.entity_type === "organization" ? "ecosystem-map" : entry.entity_type + "s"}`,
    });
  });

  // Sort by urgency (lowest = most urgent)
  attentionItems.sort((a, b) => a.urgency - b.urgency);

  return (
    <div className="space-y-section">
      <PageHeader title="Dashboard" subtitle="The state of the NWA cultural ecosystem at a glance." />

      {/* Hero stats */}
      <StatsBar stats={stats} />

      {/* Needs Attention — merged prioritized queue */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="font-display text-base font-semibold text-text">Needs Attention</h2>
          <span className="text-[13px] text-muted">Things that need action in the next 30 days</span>
        </div>

        {attentionItems.length === 0 ? (
          <Card>
            <p className="text-[13px] text-dim py-4 text-center">Nothing needs immediate attention.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {attentionItems.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="bg-surface-card border border-border rounded-card px-5 py-4 hover:border-border-medium transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <StatusBadge
                        label={item.badge}
                        color={item.badgeColor}
                      />
                      <span className="text-sm font-medium text-text truncate">
                        {item.title}
                      </span>
                    </div>
                    <p className="text-[12px] text-muted mt-1">{item.subtitle}</p>
                    {item.type === "decision" && item.action && (
                      <p className="text-[12px] text-dim mt-1 italic">{item.action}</p>
                    )}
                  </div>
                  <span className="text-[12px] text-accent shrink-0">
                    View →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ecosystem Pulse — Narrative gaps */}
      {highGapNarratives.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-display text-base font-semibold text-text">Narrative Gaps</h2>
            <span className="text-[13px] text-muted">Where the story doesn&rsquo;t match the data</span>
          </div>
          <div className="space-y-2">
            {highGapNarratives.map((n) => (
              <div
                key={n.id}
                className="bg-surface-card border border-border rounded-card px-5 py-4 hover:border-border-medium transition-colors cursor-pointer flex"
              >
                {/* Gap bar */}
                <div className={`w-1 shrink-0 rounded-full mr-4 ${n.gap === "high" ? "bg-status-red" : "bg-status-orange"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <StatusBadge
                      label={GAP_LABELS[n.gap] || n.gap}
                      color={n.gap === "high" ? "red" : "orange"}
                    />
                    <span className="text-sm font-medium text-text">
                      {n.source_name}
                    </span>
                  </div>
                  <p className="text-[12px] text-muted mt-1 line-clamp-1">
                    {n.reality_text || n.narrative_text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="font-display text-base font-semibold text-text">Recent Activity</h2>
        </div>
        {activity.length === 0 ? (
          <Card>
            <p className="text-[13px] text-dim py-4 text-center">No recent activity.</p>
          </Card>
        ) : (
          <div className="space-y-1">
            {activity.map((entry) => {
              const changes = entry.changes as Record<string, unknown> | null;
              const title =
                (changes?.title as string) ||
                (changes?.initiative_name as string) ||
                (changes?.name as string) ||
                (changes?.source as string) ||
                entry.entity_type;

              return (
                <div
                  key={entry.id}
                  className="flex items-center justify-between py-2.5 px-3 rounded hover:bg-surface-elevated/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded tracking-wider ${
                        entry.action === "created"
                          ? "text-status-green bg-status-green/10"
                          : entry.action === "published"
                          ? "text-status-purple bg-status-purple/10"
                          : entry.action === "updated"
                          ? "text-status-orange bg-status-orange/10"
                          : "text-dim bg-dim/10"
                      }`}
                    >
                      {entry.action}
                    </span>
                    <span className="text-[11px] text-dim uppercase tracking-wider">
                      {entry.entity_type}
                    </span>
                    <span className="text-sm text-text truncate font-medium">
                      {title}
                    </span>
                  </div>
                  <span className="text-[12px] text-dim shrink-0 ml-2">
                    {formatRelativeDate(entry.created_at)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
