"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  if (days <= 14) return "text-status-red font-bold";
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

  const todayRatio = Math.max(0, Math.min(1, (now - start) / totalSpan));
  const todayPercent = todayRatio * 100;
  const delibEndPercent = Math.max(0, Math.min(1, (delibEnd - start) / totalSpan)) * 100;
  const pastDeliberation = now > delibEnd && now <= end;

  // Green fill from start to min(today, deliberation_end)
  const greenWidth = pastDeliberation ? delibEndPercent : todayPercent;
  // Orange fill from deliberation_end to today (only when past deliberation)
  const orangeLeft = delibEndPercent;
  const orangeWidth = pastDeliberation ? todayPercent - delibEndPercent : 0;

  return (
    <div>
      {/* Three date markers */}
      <div className="relative flex justify-between font-mono text-[11px] text-dim mb-1.5">
        <div className="text-left">
          <span>{formatShortDate(deliberationStart)}</span>
          <span className="block text-[10px] text-dim">Started</span>
        </div>
        {deliberationEnd && delibEndPercent > 15 && delibEndPercent < 85 && (
          <div className="absolute text-center" style={{ left: `${delibEndPercent}%`, transform: "translateX(-50%)" }}>
            <span>{formatShortDate(deliberationEnd)}</span>
            <span className="block text-[10px] text-dim">Deliberation ends</span>
          </div>
        )}
        <div className="text-right">
          <span>{formatShortDate(locksDate)}</span>
          <span className="block text-[10px] text-dim uppercase font-semibold">Locks</span>
        </div>
      </div>

      {/* Bar */}
      <div className="relative h-2 w-full rounded-full bg-surface-inset">
        {/* Green: deliberation progress */}
        {greenWidth > 0 && (
          <div
            className="absolute inset-y-0 left-0 rounded-l-full bg-status-green"
            style={{ width: `${greenWidth}%`, borderRadius: greenWidth >= 100 ? "4px" : undefined }}
          />
        )}
        {/* Orange: decision window (past deliberation end, before lock) */}
        {orangeWidth > 0 && (
          <div
            className="absolute inset-y-0 bg-status-orange"
            style={{ left: `${orangeLeft}%`, width: `${orangeWidth}%` }}
          />
        )}
        {/* Deliberation end tick mark */}
        {deliberationEnd && delibEndPercent > 0 && delibEndPercent < 100 && (
          <div
            className="absolute top-0 w-px h-full bg-border-medium"
            style={{ left: `${delibEndPercent}%` }}
          />
        )}
      </div>

      {/* Today marker */}
      {todayRatio > 0 && todayRatio < 1 && (
        <div className="relative h-5 mt-0.5">
          <div
            className="absolute top-0 w-0.5 h-3 bg-text"
            style={{ left: `${todayPercent}%`, transform: "translateX(-50%)" }}
          />
          <div
            className="absolute top-3 text-[10px] font-semibold text-text"
            style={{ left: `${todayPercent}%`, transform: "translateX(-50%)" }}
          >
            Today
          </div>
        </div>
      )}

      {/* Phase labels */}
      {pastDeliberation && (
        <p className="text-[10px] text-status-orange mt-1 font-mono">
          Decision window — lock approaching
        </p>
      )}
    </div>
  );
}

/* ── Props ──────────────────────────────────────────── */

interface DepLink {
  id: string;
  description: string | null;
}

interface InvSummary {
  id: string;
  initiative_name: string;
  amount: number | null;
  compounding: string;
  status: string;
}

interface NarrSummary {
  id: string;
  source_name: string | null;
  gap: string;
  reality_text: string | null;
}

interface PrecSummary {
  id: string;
  name: string;
  period: string | null;
  involved: string | null;
  takeaway: string | null;
}

interface DecisionsViewProps {
  decisions: Decision[];
  outputsByDecision: Record<string, Array<{ id: string; title: string; is_published: boolean }>>;
  dependsOn: Record<string, DepLink[]>;
  dependedOnBy: Record<string, DepLink[]>;
  investmentsByOrg: Record<string, InvSummary[]>;
  narrativesByOrg: Record<string, NarrSummary[]>;
  precedents: PrecSummary[];
}

function formatAmount(amount: number | null): string {
  if (amount === null) return "";
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount}`;
}

const COMPOUNDING_LABELS: Record<string, string> = {
  compounding: "Compounding",
  not_compounding: "Not compounding",
  too_early: "Too early to tell",
  unknown: "Unknown",
};

const GAP_COLORS: Record<string, string> = {
  high: "text-status-red",
  medium: "text-status-orange",
  low: "text-status-blue",
  aligned: "text-status-green",
};

/* ── Decision Timeline View ──────────────────────────── */

function DecisionTimeline({
  decisions,
  onSelect,
  selectedId,
}: {
  decisions: Decision[];
  onSelect: (id: string) => void;
  selectedId: string | null;
}) {
  // Only show active decisions with dates
  const timelineDecisions = decisions.filter(
    (d) =>
      (d.status === "upcoming" || d.status === "deliberating") &&
      d.locks_date
  );

  if (timelineDecisions.length === 0) {
    return <p className="text-[13px] text-dim">No active decisions with lock dates to display.</p>;
  }

  // Calculate timeline range: 2 weeks before today to 2 weeks after latest lock
  const now = new Date();
  const timelineStart = new Date(now);
  timelineStart.setDate(timelineStart.getDate() - 14);

  const latestLock = Math.max(
    ...timelineDecisions.map((d) => new Date(d.locks_date!).getTime())
  );
  const timelineEnd = new Date(latestLock);
  timelineEnd.setDate(timelineEnd.getDate() + 14);

  const totalMs = timelineEnd.getTime() - timelineStart.getTime();
  const todayPercent = ((now.getTime() - timelineStart.getTime()) / totalMs) * 100;

  function getPercent(dateStr: string): number {
    const t = new Date(dateStr).getTime();
    return Math.max(0, Math.min(100, ((t - timelineStart.getTime()) / totalMs) * 100));
  }

  // Generate month labels
  const months: { label: string; percent: number }[] = [];
  const cursor = new Date(timelineStart.getFullYear(), timelineStart.getMonth() + 1, 1);
  while (cursor.getTime() < timelineEnd.getTime()) {
    months.push({
      label: cursor.toLocaleDateString("en-US", { month: "short" }),
      percent: ((cursor.getTime() - timelineStart.getTime()) / totalMs) * 100,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  // Sort by deliberation start or locks_date
  const sorted = [...timelineDecisions].sort((a, b) => {
    const aStart = a.deliberation_start || a.locks_date || "";
    const bStart = b.deliberation_start || b.locks_date || "";
    return aStart.localeCompare(bStart);
  });

  return (
    <div className="bg-surface-card border border-border rounded-card p-6 overflow-x-auto">
      {/* Month labels */}
      <div className="relative h-6 ml-[200px]">
        {months.map((m) => (
          <span
            key={m.label}
            className="absolute font-mono text-[11px] text-dim border-l border-border-medium pl-1"
            style={{ left: `${m.percent}%`, top: 0 }}
          >
            {m.label}
          </span>
        ))}
      </div>

      {/* Today line + rows */}
      <div className="relative">
        {/* Today line spanning all rows */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-accent z-10"
          style={{ left: `calc(200px + ${todayPercent}%)` }}
        />
        <div
          className="absolute -top-5 font-mono text-[10px] font-semibold text-accent z-10"
          style={{ left: `calc(200px + ${todayPercent}%)`, transform: "translateX(-50%)" }}
        >
          Today
        </div>

        {/* Decision rows */}
        {sorted.map((d) => {
          const barStart = d.deliberation_start
            ? getPercent(d.deliberation_start)
            : Math.max(0, getPercent(d.locks_date!) - 10);
          const delibEnd = d.deliberation_end
            ? getPercent(d.deliberation_end)
            : getPercent(d.locks_date!);
          const barEnd = getPercent(d.locks_date!);
          const days = daysUntil(d.locks_date);

          return (
            <div
              key={d.id}
              className={`flex items-center h-12 cursor-pointer transition-colors rounded ${
                selectedId === d.id ? "bg-surface-inset" : "hover:bg-surface-inset/50"
              }`}
              onClick={() => onSelect(d.id)}
            >
              {/* Label */}
              <div className="w-[200px] shrink-0 pr-4">
                <p className="font-display text-[13px] font-semibold text-text truncate leading-tight">
                  {d.decision_title}
                </p>
                <p className="text-[11px] text-dim truncate">
                  {d.stakeholder_name || "—"}
                </p>
              </div>

              {/* Track */}
              <div className="flex-1 relative h-6">
                {/* Deliberation bar (green) */}
                <div
                  className="absolute h-full bg-status-green/50 rounded-l"
                  style={{ left: `${barStart}%`, width: `${Math.max(0, delibEnd - barStart)}%` }}
                />
                {/* Lock window bar (orange) */}
                {barEnd > delibEnd && (
                  <div
                    className="absolute h-full bg-status-orange/40 rounded-r"
                    style={{ left: `${delibEnd}%`, width: `${barEnd - delibEnd}%` }}
                  />
                )}
                {/* Status dot at bar start */}
                <div
                  className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${
                    d.status === "deliberating" ? "bg-status-orange" : "bg-status-blue"
                  }`}
                  style={{ left: `${barStart}%`, transform: "translateX(-50%) translateY(-50%)" }}
                />
                {/* Lock date label at bar end */}
                <span
                  className={`absolute top-1/2 -translate-y-1/2 text-[10px] font-mono ml-1 ${
                    days !== null ? countdownColor(days) : "text-dim"
                  }`}
                  style={{ left: `${barEnd}%` }}
                >
                  Locks {formatShortDate(d.locks_date)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────── */

export function DecisionsView({
  decisions, outputsByDecision, dependsOn, dependedOnBy,
  investmentsByOrg, narrativesByOrg, precedents,
}: DecisionsViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "timeline">("list");
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const openId = searchParams.get("open");
    if (openId) setSelectedId(openId);
  }, [searchParams]);

  const navigateTo = useCallback((path: string) => {
    router.push(path);
  }, [router]);

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
      {/* View toggle */}
      <div className="flex items-center gap-1 mb-6">
        <button
          onClick={() => setView("list")}
          className={`px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors ${
            view === "list"
              ? "bg-surface-inset text-text"
              : "text-muted hover:text-text"
          }`}
        >
          List
        </button>
        <button
          onClick={() => setView("timeline")}
          className={`px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors ${
            view === "timeline"
              ? "bg-surface-inset text-text"
              : "text-muted hover:text-text"
          }`}
        >
          Timeline
        </button>
      </div>

      {/* Timeline view */}
      {view === "timeline" && (
        <DecisionTimeline
          decisions={decisions}
          onSelect={setSelectedId}
          selectedId={selectedId}
        />
      )}

      {/* List view — Active decisions grouped by temporal proximity */}
      {view === "list" && TIME_GROUP_ORDER.map((groupName) => {
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

                    {/* Stakeholder org — clickable to ecosystem map */}
                    {d.stakeholder_name && (
                      <p
                        className="text-[13px] text-muted mt-0.5 cursor-pointer hover:text-accent transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (d.stakeholder_org_id) navigateTo(`/ecosystem-map?open=${d.stakeholder_org_id}`);
                        }}
                      >
                        {d.stakeholder_name}
                      </p>
                    )}

                    {/* Intervention note */}
                    {d.intervention_needed && (
                      <p className="text-[13px] text-muted mt-2 leading-relaxed line-clamp-2">
                        {d.intervention_needed}
                      </p>
                    )}

                    {/* Output link — clickable to outputs page */}
                    {outputs && outputs.length > 0 && (
                      <div className="mt-2 space-y-0.5">
                        {outputs.map((output) => (
                          <p
                            key={output.id}
                            className="text-[12px] text-accent cursor-pointer hover:underline"
                            onClick={(e) => { e.stopPropagation(); navigateTo(`/outputs?open=${output.id}`); }}
                          >
                            &#9656; Output: {output.title}
                            {output.is_published ? " [Published]" : " [Draft]"}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Dependency links — show linked decision names, fall back to text */}
                    {(() => {
                      const deps = dependsOn[d.id];
                      if (deps && deps.length > 0) {
                        return deps.map((dep) => {
                          const linked = decisionMap.get(dep.id);
                          return (
                            <p
                              key={dep.id}
                              className="text-[12px] text-accent mt-1 cursor-pointer hover:underline"
                              onClick={(e) => { e.stopPropagation(); setSelectedId(dep.id); }}
                            >
                              &#9656; Depends on: {linked?.decision_title || "Unknown decision"}
                            </p>
                          );
                        });
                      }
                      if (d.dependencies) {
                        return (
                          <p className="text-[12px] text-dim mt-1">
                            &#9656; Depends on: {d.dependencies}
                          </p>
                        );
                      }
                      return null;
                    })()}
                  </ListCard>
                );
              })}
            </CardList>
          </div>
        );
      })}

      {/* Completed / Locked decisions — list view only */}
      {view === "list" && closedDecisions.length > 0 && (
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
            {/* Decision Details — no section heading, fields are self-labelled */}
            <div className="space-y-3 px-6 pt-2">
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

            {/* Intervention Needed — callout block */}
            {selected.intervention_needed && (
              <DetailSection title="Intervention Needed">
                <p className="text-[13px] text-text leading-relaxed bg-surface-inset rounded-md px-4 py-3 border-l-2 border-status-orange">
                  {selected.intervention_needed}
                </p>
              </DetailSection>
            )}

            {/* Dependencies — linked decision cards + context text */}
            {(() => {
              const deps = dependsOn[selected.id];
              const depBy = dependedOnBy[selected.id];
              const hasLinked = (deps && deps.length > 0) || (depBy && depBy.length > 0);
              const hasText = !!selected.dependencies;
              if (!hasLinked && !hasText) return null;
              return (
                <DetailSection title="Dependencies">
                  {/* Depends On — linked cards */}
                  {deps && deps.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] mb-2">Depends On</p>
                      <div className="space-y-2">
                        {deps.map((dep) => {
                          const linked = decisionMap.get(dep.id);
                          if (!linked) return null;
                          const depDays = daysUntil(linked.locks_date);
                          return (
                            <InlineRefCard
                              key={dep.id}
                              title={linked.decision_title}
                              subtitle={`${linked.stakeholder_name || "Unknown"} · ${DECISION_STATUS_LABELS[linked.status] || linked.status}${linked.locks_date ? ` · Locks ${formatShortDate(linked.locks_date)}` : ""}${depDays !== null ? ` (${formatCountdown(depDays)})` : ""}`}
                              accentColor="blue"
                              onClick={() => setSelectedId(dep.id)}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Depended On By — reverse linked cards */}
                  {depBy && depBy.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] mb-2">Depended On By</p>
                      <div className="space-y-2">
                        {depBy.map((dep) => {
                          const linked = decisionMap.get(dep.id);
                          if (!linked) return null;
                          const depDays = daysUntil(linked.locks_date);
                          return (
                            <InlineRefCard
                              key={dep.id}
                              title={linked.decision_title}
                              subtitle={`${linked.stakeholder_name || "Unknown"} · ${DECISION_STATUS_LABELS[linked.status] || linked.status}${linked.locks_date ? ` · Locks ${formatShortDate(linked.locks_date)}` : ""}${depDays !== null ? ` (${formatCountdown(depDays)})` : ""}`}
                              accentColor="blue"
                              onClick={() => setSelectedId(dep.id)}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Dependency Context — the text field */}
                  {hasText && (
                    <div>
                      {hasLinked && (
                        <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] mb-2">Dependency Context</p>
                      )}
                      <p className="text-[13px] text-muted leading-relaxed bg-surface-inset rounded-r-md px-4 py-3 border-l-2 border-border-medium">
                        {selected.dependencies}
                      </p>
                    </div>
                  )}
                </DetailSection>
              );
            })()}

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

            {/* Across the Toolkit — all cross-tool context */}
            {(() => {
              const outputs = outputsByDecision[selected.id];
              const orgId = selected.stakeholder_org_id;
              const orgName = selected.stakeholder_name;
              const orgInvestments = orgId ? investmentsByOrg[orgId] : undefined;
              const orgNarratives = orgId ? narrativesByOrg[orgId] : undefined;
              // Match precedents by org name appearing in the "involved" field
              const relevantPrecedents = orgName
                ? precedents.filter((p) => p.involved?.toLowerCase().includes(orgName.toLowerCase()))
                : [];

              const hasContent = orgName || (outputs && outputs.length > 0) ||
                (orgInvestments && orgInvestments.length > 0) ||
                relevantPrecedents.length > 0 ||
                (orgNarratives && orgNarratives.length > 0);

              if (!hasContent) return null;

              return (
                <DetailSection title="Across the Toolkit" subtitle="Connected data from other tools">
                  <div className="space-y-5">
                    {/* Stakeholder Organization — clickable to ecosystem map */}
                    {orgName && (
                      <div>
                        <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] mb-2">Stakeholder Organization</p>
                        <InlineRefCard
                          title={orgName}
                          subtitle="Organization"
                          accentColor="gold"
                          onClick={orgId ? () => navigateTo(`/ecosystem-map?open=${orgId}`) : undefined}
                        />
                      </div>
                    )}

                    {/* Related Outputs — clickable to outputs page */}
                    {outputs && outputs.length > 0 && (
                      <div>
                        <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] mb-2">Related Outputs</p>
                        <div className="space-y-2">
                          {outputs.map((output) => (
                            <InlineRefCard
                              key={output.id}
                              title={output.title}
                              subtitle={output.is_published ? "Published" : "Draft"}
                              accentColor="purple"
                              onClick={() => navigateTo(`/outputs?open=${output.id}`)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Stakeholder's Investments */}
                    {orgInvestments && orgInvestments.length > 0 && (
                      <div>
                        <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] mb-2">
                          What {orgName} has invested
                        </p>
                        <div className="space-y-2">
                          {orgInvestments.map((inv) => (
                            <InlineRefCard
                              key={inv.id}
                              title={inv.initiative_name}
                              subtitle={`${inv.amount ? formatAmount(inv.amount) : "—"} · ${COMPOUNDING_LABELS[inv.compounding] || inv.compounding}`}
                              accentColor="gold"
                              onClick={() => navigateTo(`/investments?open=${inv.id}`)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Relevant Precedents */}
                    {relevantPrecedents.length > 0 && (
                      <div>
                        <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] mb-2">
                          What&rsquo;s been tried before
                        </p>
                        <div className="space-y-2">
                          {relevantPrecedents.map((p) => (
                            <InlineRefCard
                              key={p.id}
                              title={p.name}
                              subtitle={`${p.period || "—"} · ${p.takeaway ? p.takeaway.slice(0, 80) + (p.takeaway.length > 80 ? "…" : "") : ""}`}
                              onClick={() => navigateTo(`/precedents?open=${p.id}`)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Related Narratives */}
                    {orgNarratives && orgNarratives.length > 0 && (
                      <div>
                        <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] mb-2">
                          What&rsquo;s being said
                        </p>
                        <div className="space-y-2">
                          {orgNarratives.map((n) => (
                            <InlineRefCard
                              key={n.id}
                              title={n.source_name || "Unknown source"}
                              subtitle={n.reality_text ? n.reality_text.slice(0, 80) + (n.reality_text.length > 80 ? "…" : "") : undefined}
                              accentColor="orange"
                              onClick={() => navigateTo(`/narratives?open=${n.id}`)}
                            >
                              <span className={`text-[11px] font-semibold uppercase tracking-[0.06em] ${GAP_COLORS[n.gap] || "text-dim"}`}>
                                {n.gap} gap
                              </span>
                            </InlineRefCard>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </DetailSection>
              );
            })()}

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
