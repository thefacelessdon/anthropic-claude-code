"use client";

import { useState } from "react";
import { CardGrid, GridCard } from "@/components/ui/CardGrid";
import { DetailPanel, DetailSection, InlineRefCard } from "@/components/ui/DetailPanel";
import { StatusBadge } from "@/components/ui/Badge";
import { StatusDot } from "@/components/ui/StatusDot";
import { formatDate, daysUntil } from "@/lib/utils/formatting";
import { DECISION_STATUS_LABELS } from "@/lib/utils/constants";
import type { Decision } from "@/lib/supabase/types";

function statusColor(status: string): "green" | "red" | "blue" | "orange" | "dim" {
  const map: Record<string, "green" | "red" | "blue" | "orange" | "dim"> = {
    upcoming: "blue",
    deliberating: "orange",
    locked: "red",
    completed: "green",
  };
  return map[status] || "dim";
}

function daysRemainingColor(days: number): string {
  if (days <= 14) return "text-status-red";
  if (days <= 30) return "text-status-orange";
  return "text-status-blue";
}

function getTimeGroup(days: number | null): string {
  if (days === null) return "Beyond 6 Months";
  if (days <= 30) return "Within 30 Days";
  if (days <= 90) return "Within 90 Days";
  if (days <= 180) return "Within 6 Months";
  return "Beyond 6 Months";
}

const TIME_GROUP_ORDER = [
  "Within 30 Days",
  "Within 90 Days",
  "Within 6 Months",
  "Beyond 6 Months",
];

interface DecisionsViewProps {
  decisions: Decision[];
  outputsByDecision: Record<string, Array<{ id: string; title: string; is_published: boolean }>>;
}

export function DecisionsView({ decisions, outputsByDecision }: DecisionsViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const decisionMap = new Map(decisions.map((d) => [d.id, d]));
  const selected = selectedId ? decisionMap.get(selectedId) : null;

  // Separate active vs completed/locked
  const activeDecisions = decisions.filter(
    (d) => d.status === "upcoming" || d.status === "deliberating"
  );
  const closedDecisions = decisions.filter(
    (d) => d.status === "completed" || d.status === "locked"
  );

  // Group active decisions by temporal proximity (based on locks_date)
  const groupedActive: Record<string, Decision[]> = {};
  for (const group of TIME_GROUP_ORDER) {
    groupedActive[group] = [];
  }
  for (const d of activeDecisions) {
    const days = daysUntil(d.locks_date);
    const group = getTimeGroup(days);
    groupedActive[group].push(d);
  }

  return (
    <>
      {/* Active decisions grouped by temporal proximity */}
      {TIME_GROUP_ORDER.map((groupName) => {
        const group = groupedActive[groupName];
        if (group.length === 0) return null;

        return (
          <div key={groupName} className="mb-8">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
              <h3 className="font-display text-base font-semibold text-text">
                {groupName}
              </h3>
              <span className="text-[11px] text-dim bg-surface-inset px-1.5 py-0.5 rounded font-mono">
                {group.length}
              </span>
            </div>

            <CardGrid>
              {group.map((d) => {
                const days = daysUntil(d.locks_date);

                return (
                  <GridCard
                    key={d.id}
                    onClick={() => setSelectedId(d.id)}
                    selected={selectedId === d.id}
                    aspect="portrait"
                  >
                    {/* Status dot + badge */}
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <StatusDot color={statusColor(d.status)} pulse={d.status === "deliberating"} />
                      <StatusBadge
                        label={DECISION_STATUS_LABELS[d.status] || d.status}
                        color={statusColor(d.status)}
                      />
                    </div>

                    {/* Title */}
                    <h3 className="text-[15px] font-medium text-text leading-snug">
                      {d.decision_title}
                    </h3>

                    {/* Stakeholder */}
                    {d.stakeholder_name && (
                      <p className="text-[12px] text-muted mt-1">{d.stakeholder_name}</p>
                    )}

                    {/* Days remaining */}
                    {days !== null && (
                      <p className={`font-mono text-[14px] font-medium mt-2 ${daysRemainingColor(days)}`}>
                        {days > 0 ? `${days}d remaining` : days === 0 ? "Locks today" : `${Math.abs(days)}d overdue`}
                      </p>
                    )}

                    {/* Intervention needed (truncated) */}
                    {d.intervention_needed && (
                      <p className="text-[12px] text-muted mt-3 leading-relaxed line-clamp-3">
                        {d.intervention_needed}
                      </p>
                    )}
                  </GridCard>
                );
              })}
            </CardGrid>
          </div>
        );
      })}

      {/* Completed / Locked decisions — compact list */}
      {closedDecisions.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
            <h3 className="font-display text-base font-semibold text-text">
              Completed & Locked
            </h3>
            <span className="text-[11px] text-dim bg-surface-inset px-1.5 py-0.5 rounded font-mono">
              {closedDecisions.length}
            </span>
          </div>

          <div className="space-y-1">
            {closedDecisions.map((d) => (
              <div
                key={d.id}
                onClick={() => setSelectedId(d.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-md cursor-pointer transition-colors ${
                  selectedId === d.id
                    ? "bg-surface-inset ring-1 ring-accent"
                    : "hover:bg-surface-inset"
                }`}
              >
                <StatusDot color={statusColor(d.status)} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-text truncate">
                    {d.decision_title}
                  </p>
                  {d.stakeholder_name && (
                    <p className="text-[11px] text-dim truncate">{d.stakeholder_name}</p>
                  )}
                </div>
                <StatusBadge
                  label={DECISION_STATUS_LABELS[d.status] || d.status}
                  color={statusColor(d.status)}
                />
                {d.locks_date && (
                  <span className="text-[11px] text-dim shrink-0">{formatDate(d.locks_date)}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail Panel */}
      <DetailPanel
        isOpen={!!selected}
        onClose={() => setSelectedId(null)}
        title={selected?.decision_title}
        subtitle={
          selected && (
            <div className="flex items-center gap-2 flex-wrap">
              <StatusDot color={statusColor(selected.status)} pulse={selected.status === "deliberating"} />
              <StatusBadge
                label={DECISION_STATUS_LABELS[selected.status] || selected.status}
                color={statusColor(selected.status)}
              />
              {selected.stakeholder_name && (
                <span className="text-[13px] text-muted">{selected.stakeholder_name}</span>
              )}
            </div>
          )
        }
        backLabel="Back to decisions"
      >
        {selected && (
          <>
            {/* Description */}
            {selected.description && (
              <DetailSection title="Description">
                <p className="text-[13px] text-text leading-relaxed">{selected.description}</p>
              </DetailSection>
            )}

            {/* Decision Details */}
            <DetailSection title="Decision Details">
              <div className="space-y-3">
                {/* Status */}
                <div>
                  <p className="text-[11px] text-dim uppercase tracking-wider mb-0.5">Status</p>
                  <div className="flex items-center gap-2">
                    <StatusDot color={statusColor(selected.status)} />
                    <span className="text-[13px] font-medium text-text">
                      {DECISION_STATUS_LABELS[selected.status] || selected.status}
                    </span>
                  </div>
                </div>

                {/* Stakeholder */}
                {selected.stakeholder_name && (
                  <div>
                    <p className="text-[11px] text-dim uppercase tracking-wider mb-0.5">Stakeholder</p>
                    <p className="text-[13px] text-text">{selected.stakeholder_name}</p>
                  </div>
                )}

                {/* Locks Date + Days Remaining */}
                {selected.locks_date && (
                  <div>
                    <p className="text-[11px] text-dim uppercase tracking-wider mb-0.5">Locks Date</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] text-text">{formatDate(selected.locks_date)}</span>
                      {(() => {
                        const days = daysUntil(selected.locks_date);
                        if (days === null) return null;
                        return (
                          <span className={`font-mono text-[12px] font-medium ${daysRemainingColor(days)}`}>
                            {days > 0 ? `(${days}d remaining)` : days === 0 ? "(Locks today)" : `(${Math.abs(days)}d overdue)`}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* Deliberation Period */}
                {(selected.deliberation_start || selected.deliberation_end) && (
                  <div>
                    <p className="text-[11px] text-dim uppercase tracking-wider mb-0.5">Deliberation Period</p>
                    <p className="text-[13px] text-text">
                      {formatDate(selected.deliberation_start)} — {formatDate(selected.deliberation_end)}
                    </p>
                  </div>
                )}
              </div>
            </DetailSection>

            {/* Intervention Needed */}
            {selected.intervention_needed && (
              <DetailSection title="Intervention Needed">
                <p className="text-[13px] text-text leading-relaxed bg-surface-inset rounded-md px-4 py-3 border-l-2 border-status-orange">
                  {selected.intervention_needed}
                </p>
              </DetailSection>
            )}

            {/* Dependencies */}
            {selected.dependencies && (
              <DetailSection title="Dependencies">
                <p className="text-[13px] text-text leading-relaxed">{selected.dependencies}</p>
              </DetailSection>
            )}

            {/* Outcome */}
            {selected.outcome && (
              <DetailSection title="Outcome">
                <p className="text-[13px] text-text leading-relaxed bg-surface-inset rounded-md px-4 py-3">
                  {selected.outcome}
                </p>
              </DetailSection>
            )}

            {/* Recurrence */}
            {selected.is_recurring && (
              <DetailSection title="Recurrence">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <StatusBadge label="Recurring" color="blue" />
                  </div>
                  {selected.recurrence_pattern && (
                    <div>
                      <p className="text-[11px] text-dim uppercase tracking-wider mb-0.5">Pattern</p>
                      <p className="text-[13px] text-text">{selected.recurrence_pattern}</p>
                    </div>
                  )}
                </div>
              </DetailSection>
            )}

            {/* Related Outputs */}
            {(() => {
              const outputs = outputsByDecision[selected.id];
              if (!outputs || outputs.length === 0) return null;
              return (
                <DetailSection title="Related Outputs" count={outputs.length}>
                  <div className="space-y-2">
                    {outputs.map((output) => (
                      <InlineRefCard
                        key={output.id}
                        title={output.title}
                        subtitle={output.is_published ? "Published" : "Draft"}
                        accentColor="purple"
                      />
                    ))}
                  </div>
                </DetailSection>
              );
            })()}

            {/* Record Metadata */}
            <DetailSection title="Record">
              <div className="space-y-1 text-[12px] text-dim">
                <p>Created: {formatDate(selected.created_at)}</p>
                <p>Updated: {formatDate(selected.updated_at)}</p>
                <p>Last reviewed: {selected.last_reviewed_at ? formatDate(selected.last_reviewed_at) : "Never"}</p>
              </div>
            </DetailSection>
          </>
        )}
      </DetailPanel>
    </>
  );
}
