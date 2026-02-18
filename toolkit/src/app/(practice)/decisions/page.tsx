import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/ui/Badge";
import { StatusDot } from "@/components/ui/StatusDot";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatDate, daysUntil } from "@/lib/utils/formatting";
import { DECISION_STATUS_LABELS } from "@/lib/utils/constants";
import type { Decision, Output } from "@/lib/supabase/types";

const NWA_ECOSYSTEM_ID = "a0000000-0000-0000-0000-000000000001";

function statusColor(status: string): "green" | "red" | "blue" | "orange" | "dim" {
  const map: Record<string, "green" | "red" | "blue" | "orange" | "dim"> = {
    upcoming: "blue",
    deliberating: "orange",
    locked: "red",
    completed: "green",
  };
  return map[status] || "dim";
}

export const metadata = {
  title: "Decisions — Cultural Architecture Toolkit",
};

export default async function DecisionsPage() {
  const supabase = createClient();

  const [{ data: decisionData }, { data: outputData }] = await Promise.all([
    supabase
      .from("decisions")
      .select("*")
      .eq("ecosystem_id", NWA_ECOSYSTEM_ID)
      .order("locks_date", { ascending: true }),
    supabase
      .from("outputs")
      .select("id, title, triggered_by_decision_id, is_published")
      .eq("ecosystem_id", NWA_ECOSYSTEM_ID),
  ]);

  const decisions = (decisionData as Decision[]) || [];
  const outputs = (outputData as Pick<Output, "id" | "title" | "triggered_by_decision_id" | "is_published">[]) || [];

  // Build output lookup by decision ID
  const outputsByDecision = new Map<string, typeof outputs>();
  outputs.forEach((o) => {
    if (o.triggered_by_decision_id) {
      const existing = outputsByDecision.get(o.triggered_by_decision_id) || [];
      existing.push(o);
      outputsByDecision.set(o.triggered_by_decision_id, existing);
    }
  });

  // Group active decisions by temporal proximity
  const activeDecisions = decisions.filter(
    (d) => d.status === "upcoming" || d.status === "deliberating"
  );
  const completedDecisions = decisions.filter(
    (d) => d.status === "completed" || d.status === "locked"
  );

  const within30 = activeDecisions.filter((d) => {
    const days = daysUntil(d.locks_date);
    return days !== null && days <= 30;
  });
  const within90 = activeDecisions.filter((d) => {
    const days = daysUntil(d.locks_date);
    return days !== null && days > 30 && days <= 90;
  });
  const within6mo = activeDecisions.filter((d) => {
    const days = daysUntil(d.locks_date);
    return days !== null && days > 90 && days <= 180;
  });
  const beyond6mo = activeDecisions.filter((d) => {
    const days = daysUntil(d.locks_date);
    return days === null || days > 180;
  });

  const timeGroups = [
    { label: "Within 30 Days", decisions: within30, urgency: "red" as const },
    { label: "Within 90 Days", decisions: within90, urgency: "orange" as const },
    { label: "Within 6 Months", decisions: within6mo, urgency: "blue" as const },
    { label: "Beyond 6 Months", decisions: beyond6mo, urgency: "dim" as const },
  ].filter((g) => g.decisions.length > 0);

  return (
    <div className="space-y-section">
      <PageHeader title="Decisions" subtitle="What's being decided right now, when it locks, and where we need to show up." />

      {/* Timeline-grouped decisions */}
      {activeDecisions.length === 0 ? (
        <EmptyState
          title="No active decisions"
          description="Active decisions will appear here, grouped by urgency."
        />
      ) : (
        <div className="space-y-8">
          {timeGroups.map((group) => (
            <div key={group.label}>
              {/* Group header */}
              <div className="flex items-center gap-3 mb-4">
                <h2 className="font-display text-base font-semibold text-text">
                  {group.label}
                </h2>
                <span className="text-[11px] font-mono text-dim bg-surface-inset px-1.5 py-0.5 rounded">
                  {group.decisions.length}
                </span>
              </div>

              <div className="space-y-3">
                {group.decisions.map((d) => {
                  const days = daysUntil(d.locks_date);
                  const relatedOutputs = outputsByDecision.get(d.id) || [];

                  return (
                    <div
                      key={d.id}
                      className="bg-surface-card border border-border rounded-card p-6 hover:border-border-medium transition-all duration-card cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2.5">
                            <StatusDot
                              color={statusColor(d.status)}
                              pulse={d.status === "deliberating"}
                            />
                            <span className="text-[15px] font-medium text-text">
                              {d.decision_title}
                            </span>
                            <StatusBadge
                              label={DECISION_STATUS_LABELS[d.status] || d.status}
                              color={statusColor(d.status)}
                            />
                          </div>
                          <div className="flex items-center gap-2 mt-1.5 ml-5 text-[13px] text-muted">
                            {d.stakeholder_name && <span>{d.stakeholder_name}</span>}
                            {d.stakeholder_name && d.locks_date && <span className="text-dim">&middot;</span>}
                            {d.locks_date && (
                              <span>
                                Locks {formatDate(d.locks_date)}
                                {days !== null && (
                                  <span className={`ml-1 font-mono font-medium ${
                                    days <= 14 ? "text-status-red" :
                                    days <= 30 ? "text-status-orange" :
                                    "text-status-blue"
                                  }`}>
                                    ({days}d)
                                  </span>
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Intervention needed */}
                      {d.intervention_needed && (
                        <p className="text-[13px] text-muted mt-3 ml-5 leading-relaxed">
                          {d.intervention_needed}
                        </p>
                      )}

                      {/* Related outputs */}
                      {relatedOutputs.length > 0 && (
                        <div className="mt-3 ml-5 space-y-1">
                          {relatedOutputs.map((o) => (
                            <div key={o.id} className="flex items-center gap-2 text-[12px]">
                              <span className="text-dim">▸ Related output:</span>
                              <span className="text-muted font-medium">{o.title}</span>
                              <StatusBadge
                                label={o.is_published ? "Published" : "Draft"}
                                color={o.is_published ? "green" : "dim"}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Dependencies */}
                      {d.dependencies && (
                        <p className="text-[12px] text-dim mt-2 ml-5">
                          <span className="text-dim">▸ Depends on:</span>{" "}
                          <span className="text-muted">{d.dependencies}</span>
                        </p>
                      )}

                      {/* View indicator */}
                      <div className="mt-3 text-[12px] text-dim group-hover:text-accent transition-colors text-right">
                        View details →
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Completed / Locked decisions */}
      {completedDecisions.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-display text-base font-semibold text-text">
              Completed & Locked
            </h2>
            <span className="text-[11px] font-mono text-dim bg-surface-inset px-1.5 py-0.5 rounded">
              {completedDecisions.length}
            </span>
          </div>
          <div className="space-y-2">
            {completedDecisions.map((d) => (
              <div
                key={d.id}
                className="bg-surface-card border border-border rounded-card px-5 py-3 flex items-center justify-between hover:border-border-medium transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <StatusDot color={statusColor(d.status)} />
                  <span className="text-sm text-text truncate font-medium">
                    {d.decision_title}
                  </span>
                  <StatusBadge
                    label={DECISION_STATUS_LABELS[d.status] || d.status}
                    color={statusColor(d.status)}
                  />
                </div>
                {d.outcome && (
                  <span className="text-[12px] text-dim shrink-0 ml-3 max-w-[250px] truncate">
                    {d.outcome}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
