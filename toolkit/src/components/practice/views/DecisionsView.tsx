"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CardList, ListCard } from "@/components/ui/CardGrid";
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

function countdownColor(days: number): string {
  if (days <= 30) return "text-status-red";
  if (days <= 90) return "text-status-orange";
  return "text-muted";
}

function formatCountdown(days: number): string {
  if (days > 0) return `${days}d left`;
  if (days === 0) return "Locks today";
  return `${Math.abs(days)}d overdue`;
}

function formatShortDate(date: string | null): string {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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

/* ── Deliberation Timeline ──────────────────────────── */

function DeliberationTimeline({
  deliberationStart,
  deliberationEnd,
  locksDate,
}: {
  deliberationStart: string | null;
  deliberationEnd: string | null;
  locksDate: string | null;
}) {
  if (!deliberationStart || !locksDate) return null;

  const start = new Date(deliberationStart).getTime();
  const end = new Date(locksDate).getTime();
  const now = Date.now();
  const delibEnd = deliberationEnd ? new Date(deliberationEnd).getTime() : end;

  const totalSpan = end - start;
  if (totalSpan <= 0) return null;

  const progressRatio = Math.max(0, Math.min(1, (now - start) / totalSpan));
  const todayPercent = progressRatio * 100;

  // Determine bar fill color
  const daysToLock = daysUntil(locksDate);
  let fillColor = "bg-status-green";
  if (daysToLock !== null && daysToLock <= 14) {
    fillColor = "bg-status-red";
  } else if (now > delibEnd && now <= end) {
    fillColor = "bg-status-orange";
  }

  return (
    <div className="mt-3">
      <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] mb-2">
        Deliberation Timeline
      </p>
      {/* Date labels */}
      <div className="flex justify-between text-[11px] text-dim mb-1">
        <span>{formatShortDate(deliberationStart)}</span>
        <span>{formatShortDate(locksDate)}</span>
      </div>
      {/* Bar */}
      <div className="relative h-2 w-full rounded-full bg-surface-inset overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all ${fillColor}`}
          style={{ width: `${todayPercent}%` }}
        />
      </div>
      {/* Today marker */}
      {progressRatio > 0 && progressRatio < 1 && (
        <div className="relative h-0">
          <div
            className="absolute -top-[14px] w-0.5 h-[14px] bg-text"
            style={{ left: `${todayPercent}%`, transform: "translateX(-50%)" }}
          />
          <div
            className="absolute top-0.5 text-[10px] text-dim"
            style={{ left: `${todayPercent}%`, transform: "translateX(-50%)" }}
          >
            Today
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Props ──────────────────────────────────────────── */

interface DecisionsViewProps {
  decisions: Decision[];
  outputsByDecision: Record<string, Array<{ id: string; title: string; is_published: boolean }>>;
}

/* ── Main Component ─────────────────────────────────── */

export function DecisionsView({ decisions, outputsByDecision }: DecisionsViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const openId = searchParams.get("open");
    if (openId) setSelectedId(openId);
  }, [searchParams]);
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

            <CardList>
              {group.map((d) => {
                const days = daysUntil(d.locks_date);
                const outputs = outputsByDecision[d.id];

                return (
                  <ListCard
                    key={d.id}
                    onClick={() => setSelectedId(d.id)}
                    selected={selectedId === d.id}
                  >
                    {/* Row 1: Status left, lock date + countdown right */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <StatusDot color={statusColor(d.status)} pulse={d.status === "deliberating"} />
                        <span className="text-[13px] font-medium text-text">
                          {DECISION_STATUS_LABELS[d.status] || d.status}
                        </span>
                      </div>
                      {d.locks_date && (
                        <div className="text-right shrink-0">
                          <p className="font-mono text-[15px] font-semibold text-right">
                            Locks {formatShortDate(d.locks_date)}
                          </p>
                          {days !== null && (
                            <p className={`font-mono text-[13px] text-right ${countdownColor(days)}`}>
                              {formatCountdown(days)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-display text-[16px] font-semibold text-text mt-2 leading-snug">
                      {d.decision_title}
                    </h3>

                    {/* Stakeholder org */}
                    {d.stakeholder_name && (
                      <p className="text-[13px] text-muted mt-0.5">{d.stakeholder_name}</p>
                    )}

                    {/* Intervention note */}
                    {d.intervention_needed && (
                      <p className="text-[13px] text-muted mt-2 leading-relaxed line-clamp-2">
                        {d.intervention_needed}
                      </p>
                    )}

                    {/* Output link */}
                    {outputs && outputs.length > 0 && (
                      <div className="mt-2 space-y-0.5">
                        {outputs.map((output) => (
                          <p key={output.id} className="text-[12px] text-accent">
                            &#9656; Output: {output.title}
                            {output.is_published ? " [Published]" : " [Draft]"}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Dependency link */}
                    {d.dependencies && (
                      <p className="text-[12px] text-dim mt-1">
                        &#9656; Depends on: {d.dependencies}
                      </p>
                    )}
                  </ListCard>
                );
              })}
            </CardList>
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
            {/* Entity Details */}
            <DetailSection title="Entity Details">
              <div className="space-y-3">
                {/* Status */}
                <div>
                  <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] mb-0.5">Status</p>
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
                    <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] mb-0.5">Stakeholder</p>
                    <p className="text-[13px] text-text">{selected.stakeholder_name}</p>
                  </div>
                )}

                {/* Locks Date + Countdown */}
                {selected.locks_date && (
                  <div>
                    <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] mb-0.5">Locks Date</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] text-text">{formatDate(selected.locks_date)}</span>
                      {(() => {
                        const days = daysUntil(selected.locks_date);
                        if (days === null) return null;
                        return (
                          <span className={`font-mono text-[12px] font-medium ${countdownColor(days)}`}>
                            ({formatCountdown(days)})
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* Deliberation Period */}
                {(selected.deliberation_start || selected.deliberation_end) && (
                  <div>
                    <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] mb-0.5">Deliberation Period</p>
                    <p className="text-[13px] text-text">
                      {formatDate(selected.deliberation_start)} — {formatDate(selected.deliberation_end)}
                    </p>
                  </div>
                )}

                {/* Description */}
                {selected.description && (
                  <div>
                    <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] mb-0.5">Description</p>
                    <p className="text-[13px] text-text leading-relaxed">{selected.description}</p>
                  </div>
                )}

                {/* Intervention Needed */}
                {selected.intervention_needed && (
                  <div>
                    <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] mb-0.5">Intervention Needed</p>
                    <p className="text-[13px] text-text leading-relaxed bg-surface-inset rounded-md px-4 py-3 border-l-2 border-status-orange">
                      {selected.intervention_needed}
                    </p>
                  </div>
                )}

                {/* Dependencies */}
                {selected.dependencies && (
                  <div>
                    <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] mb-0.5">Dependencies</p>
                    <p className="text-[13px] text-text leading-relaxed">{selected.dependencies}</p>
                  </div>
                )}

                {/* Outcome */}
                {selected.outcome && (
                  <div>
                    <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] mb-0.5">Outcome</p>
                    <p className="text-[13px] text-text leading-relaxed bg-surface-inset rounded-md px-4 py-3">
                      {selected.outcome}
                    </p>
                  </div>
                )}

                {/* Recurrence */}
                {selected.is_recurring && (
                  <div>
                    <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] mb-0.5">Recurrence</p>
                    <div className="flex items-center gap-2">
                      <StatusBadge label="Recurring" color="blue" />
                    </div>
                    {selected.recurrence_pattern && (
                      <p className="text-[13px] text-text mt-1">{selected.recurrence_pattern}</p>
                    )}
                  </div>
                )}
              </div>
            </DetailSection>

            {/* Deliberation Timeline */}
            {(selected.deliberation_start || selected.locks_date) && (
              <DetailSection title="Deliberation Timeline">
                <DeliberationTimeline
                  deliberationStart={selected.deliberation_start}
                  deliberationEnd={selected.deliberation_end}
                  locksDate={selected.locks_date}
                />
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

            {/* Across the Toolkit */}
            {selected.stakeholder_name && (
              <DetailSection title="Across the Toolkit">
                <div className="space-y-2">
                  <InlineRefCard
                    title={selected.stakeholder_name}
                    subtitle="Stakeholder Organization"
                    accentColor="blue"
                  />
                </div>
              </DetailSection>
            )}

            {/* Record */}
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
