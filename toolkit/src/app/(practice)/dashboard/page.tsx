import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { StatusDot } from "@/components/ui/StatusDot";
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
import { DECISION_STATUS_LABELS } from "@/lib/utils/constants";

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
  const [stats, staleEntries, interventions, activity] = await Promise.all([
    getEcosystemStats(),
    getStaleEntries(),
    getUpcomingInterventions(),
    getRecentActivity(),
  ]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-text">Dashboard</h1>
        <p className="text-sm text-muted mt-1">
          {stats?.name || "Ecosystem"} overview
        </p>
      </div>

      {/* Stats bar */}
      <StatsBar stats={stats} />

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Interventions */}
        <Card>
          <CardHeader
            title="Upcoming Interventions"
            description="Decisions that need action before they lock"
          />
          {interventions.length === 0 ? (
            <p className="text-sm text-dim">No upcoming interventions</p>
          ) : (
            <div className="space-y-3">
              {interventions.map((d) => {
                const days = daysUntil(d.locks_date);
                const urgency =
                  days !== null && days <= 14
                    ? "red"
                    : days !== null && days <= 30
                    ? "orange"
                    : "blue";

                return (
                  <div
                    key={d.id}
                    className="border border-border rounded-lg p-3 hover:border-dim/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <StatusDot
                            color={decisionStatusColor(d.status)}
                            pulse={d.status === "deliberating"}
                          />
                          <span className="text-sm font-medium text-text truncate">
                            {d.decision_title}
                          </span>
                        </div>
                        {d.stakeholder_org_name && (
                          <p className="text-xs text-muted mt-1 ml-4">
                            {d.stakeholder_org_name}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <StatusBadge
                          label={DECISION_STATUS_LABELS[d.status] || d.status}
                          color={decisionStatusColor(d.status)}
                        />
                        {d.locks_date && (
                          <p className="text-[10px] text-dim mt-1">
                            Locks {formatDate(d.locks_date)}
                            {days !== null && (
                              <span
                                className={`ml-1 ${
                                  urgency === "red"
                                    ? "text-status-red"
                                    : urgency === "orange"
                                    ? "text-status-orange"
                                    : "text-status-blue"
                                }`}
                              >
                                ({days}d)
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                    {d.intervention_needed && (
                      <p className="text-xs text-muted mt-2 ml-4 border-l-2 border-accent-dim/30 pl-2">
                        {d.intervention_needed}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Stale Items */}
        <Card>
          <CardHeader
            title="Needs Review"
            description="Items past their review threshold"
          />
          {staleEntries.length === 0 ? (
            <p className="text-sm text-dim">Everything is up to date</p>
          ) : (
            <div className="space-y-1">
              {staleEntries.map((entry) => (
                <div
                  key={`${entry.entity_type}-${entry.entity_id}`}
                  className="flex items-center justify-between py-2 px-2 rounded hover:bg-surface/50 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <StatusDot color="orange" />
                    <span className="text-sm text-text truncate">
                      {entry.name}
                    </span>
                    <span className="text-[10px] text-dim uppercase shrink-0">
                      {entityTypeLabel(entry.entity_type)}
                    </span>
                  </div>
                  <span className="text-xs text-dim shrink-0 ml-2">
                    {formatRelativeDate(entry.last_reviewed_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent Activity"
            description="Latest changes across the ecosystem"
          />
          {activity.length === 0 ? (
            <p className="text-sm text-dim">No recent activity</p>
          ) : (
            <div className="space-y-2">
              {activity.map((entry) => {
                const changes = entry.changes as Record<string, unknown> | null;
                const title =
                  (changes?.title as string) ||
                  (changes?.source as string) ||
                  entry.entity_type;

                return (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between py-2 px-2 rounded hover:bg-surface/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`text-[10px] uppercase font-medium px-1.5 py-0.5 rounded ${
                          entry.action === "created"
                            ? "text-status-green bg-status-green/10"
                            : entry.action === "published"
                            ? "text-status-blue bg-status-blue/10"
                            : entry.action === "updated"
                            ? "text-status-orange bg-status-orange/10"
                            : "text-dim bg-dim/10"
                        }`}
                      >
                        {entry.action}
                      </span>
                      <span className="text-xs text-dim uppercase">
                        {entry.entity_type}
                      </span>
                      <span className="text-sm text-text truncate">
                        {title}
                      </span>
                    </div>
                    <span className="text-xs text-dim shrink-0 ml-2">
                      {formatRelativeDate(entry.created_at)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
