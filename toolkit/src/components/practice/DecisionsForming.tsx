import Link from "next/link";
import { StatusDot } from "@/components/ui/StatusDot";
import { formatDate, daysUntil } from "@/lib/utils/formatting";
import { DECISION_STATUS_LABELS } from "@/lib/utils/constants";
import type { Decision } from "@/lib/supabase/types";

interface DecisionsFormingProps {
  decisions: Decision[];
  /** Map of decision id → output title (for linked outputs) */
  outputMap: Record<string, string>;
}

function countdownColor(days: number | null): string {
  if (days === null) return "text-muted";
  if (days <= 30) return "text-status-red";
  if (days <= 90) return "text-status-orange";
  return "text-muted";
}

function statusDotColor(status: string): "green" | "red" | "blue" | "orange" | "dim" {
  const map: Record<string, "green" | "red" | "blue" | "orange" | "dim"> = {
    upcoming: "blue",
    deliberating: "orange",
    locked: "red",
    completed: "green",
  };
  return map[status] || "dim";
}

export function DecisionsForming({ decisions, outputMap }: DecisionsFormingProps) {
  if (decisions.length === 0) {
    return (
      <p className="text-[13px] text-dim">
        No decisions forming in the near term.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {decisions.map((d) => {
        const days = daysUntil(d.locks_date);
        const outputTitle = outputMap[d.id];

        return (
          <Link
            key={d.id}
            href={`/decisions?open=${d.id}`}
            className="block bg-surface-card border border-border rounded-card px-5 py-4 hover:border-border-medium transition-colors"
          >
            {/* Row 1: status · org · countdown */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <StatusDot color={statusDotColor(d.status)} />
                <span className="text-[12px] font-semibold text-muted uppercase tracking-[0.04em]">
                  {DECISION_STATUS_LABELS[d.status] || d.status}
                </span>
                {d.stakeholder_name && (
                  <span className="text-[12px] text-dim uppercase tracking-[0.04em]">
                    {d.stakeholder_name}
                  </span>
                )}
              </div>
              <div className="text-right shrink-0">
                {days !== null && (
                  <span className={`font-mono text-[13px] font-semibold ${countdownColor(days)}`}>
                    Locks in {days}d
                  </span>
                )}
                {d.locks_date && (
                  <span className="block text-[12px] text-dim">
                    {formatDate(d.locks_date)}
                  </span>
                )}
              </div>
            </div>

            {/* Title */}
            <p className="font-display text-[16px] font-semibold text-text mt-2">
              {d.decision_title}
            </p>

            {/* Intervention note */}
            {d.intervention_needed && (
              <p className="text-[13px] text-muted mt-1.5 line-clamp-2">
                {d.intervention_needed}
              </p>
            )}

            {/* Linked output */}
            {outputTitle && (
              <p className="text-[12px] text-accent mt-2">
                &#9656; Output ready: {outputTitle}
              </p>
            )}
          </Link>
        );
      })}
    </div>
  );
}
