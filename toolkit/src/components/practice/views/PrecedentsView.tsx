"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CardList, ListCard } from "@/components/ui/CardGrid";
import { DetailPanel, DetailSection, InlineRefCard } from "@/components/ui/DetailPanel";
import { StatusDot } from "@/components/ui/StatusDot";
import { formatDate, daysUntil } from "@/lib/utils/formatting";
import { DECISION_STATUS_LABELS } from "@/lib/utils/constants";
import type { Precedent } from "@/lib/supabase/types";

/* ── Shared types for cross-tool data ──────────────── */

interface InvSummary {
  id: string;
  source_org_id: string | null;
  source_name: string | null;
  initiative_name: string;
  amount: number | null;
  status: string;
  precedent_id: string | null;
}

interface DecSummary {
  id: string;
  stakeholder_org_id: string | null;
  stakeholder_name: string | null;
  decision_title: string;
  status: string;
  locks_date: string | null;
}

interface PrecedentsViewProps {
  precedents: Precedent[];
  orgIdToName: Record<string, string>;
  involvedOrgsByPrecedent: Record<string, string[]>;
  investmentsByPrecedent: Record<string, InvSummary[]>;
  decisionsByOrg: Record<string, DecSummary[]>;
  investmentsByOrg: Record<string, InvSummary[]>;
}

/* ── Helpers ───────────────────────────────────────── */

const labelClass =
  "text-[11px] font-semibold text-dim uppercase tracking-[0.06em]";

function formatAmount(amount: number | null): string {
  if (amount === null) return "—";
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount}`;
}

function formatShortDate(date: string | null): string {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatCountdown(days: number): string {
  if (days > 0) return `${days}d`;
  if (days === 0) return "today";
  return `${Math.abs(days)}d overdue`;
}

/** Parse entity names from connects_to text (names before analytical prose). */
function parseConnectsToNames(text: string): string[] {
  // Try to extract capitalized multi-word names (e.g. "Downtown Cultural District Planning")
  // These appear as proper nouns in the connects_to text
  const names: string[] = [];
  // Match sequences of capitalized words (2+ words starting with uppercase)
  const matches = text.match(/[A-Z][a-z]+(?:\s+(?:[A-Z][a-z]+|of|the|for|and|in))+/g);
  if (matches) {
    for (const m of matches) {
      // Skip very short matches or common phrases
      if (m.length > 5) names.push(m.trim());
    }
  }
  return Array.from(new Set(names));
}

/* ── Main Component ────────────────────────────────── */

export function PrecedentsView({
  precedents,
  orgIdToName,
  involvedOrgsByPrecedent,
  investmentsByPrecedent,
  decisionsByOrg,
  investmentsByOrg,
}: PrecedentsViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const openId = searchParams.get("open");
    if (openId) setSelectedId(openId);
  }, [searchParams]);

  const navigateTo = useCallback(
    (path: string) => {
      router.push(path);
    },
    [router]
  );

  const precedentMap = new Map(precedents.map((p) => [p.id, p]));
  const selected = selectedId ? precedentMap.get(selectedId) : null;

  /** Get relevant active decisions for a precedent (by shared orgs). */
  function getRelevantDecisions(pId: string): DecSummary[] {
    const orgIds = involvedOrgsByPrecedent[pId] || [];
    const seen = new Set<string>();
    const results: DecSummary[] = [];
    for (const orgId of orgIds) {
      for (const d of decisionsByOrg[orgId] || []) {
        if (!seen.has(d.id)) {
          seen.add(d.id);
          results.push(d);
        }
      }
    }
    return results.sort((a, b) => {
      const da = daysUntil(a.locks_date);
      const db = daysUntil(b.locks_date);
      return (da ?? 999) - (db ?? 999);
    });
  }

  /** Get relevant active investments for a precedent (direct FK + shared orgs). */
  function getRelevantInvestments(pId: string): InvSummary[] {
    const direct = investmentsByPrecedent[pId] || [];
    const orgIds = involvedOrgsByPrecedent[pId] || [];
    const seen = new Set(direct.map((i) => i.id));
    const results = [...direct];
    for (const orgId of orgIds) {
      for (const inv of investmentsByOrg[orgId] || []) {
        if (!seen.has(inv.id)) {
          seen.add(inv.id);
          results.push(inv);
        }
      }
    }
    return results;
  }

  return (
    <>
      <CardList>
        {precedents.map((p) => {
          const entityNames = p.connects_to ? parseConnectsToNames(p.connects_to) : [];
          const relevantDecs = getRelevantDecisions(p.id);
          // Find the most urgent relevant decision
          const urgentDec = relevantDecs.length > 0 ? relevantDecs[0] : null;
          const urgentDays = urgentDec ? daysUntil(urgentDec.locks_date) : null;

          return (
            <ListCard
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              selected={selectedId === p.id}
            >
              {/* Row 1: Title + Period */}
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-display text-[16px] font-semibold text-text">
                  {p.name}
                </h3>
                {p.period && (
                  <span className="font-mono text-[13px] text-dim shrink-0">
                    {p.period}
                  </span>
                )}
              </div>

              {/* Involved */}
              {p.involved && (
                <p className="text-[13px] text-muted mt-1 truncate">
                  {p.involved}
                </p>
              )}

              {/* Takeaway — pull quote */}
              {p.takeaway && (
                <p className="text-[14px] text-text italic border-l-2 border-accent pl-3 mt-3">
                  &ldquo;{p.takeaway}&rdquo;
                </p>
              )}

              {/* Connects to — entity names only, clickable */}
              {entityNames.length > 0 && (
                <p className="text-[12px] text-dim mt-3 truncate">
                  Connects to:{" "}
                  {entityNames.slice(0, 2).map((name, i) => (
                    <span key={name}>
                      {i > 0 && ", "}
                      <span
                        className="text-accent cursor-pointer hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedId(p.id);
                        }}
                      >
                        {name}
                      </span>
                    </span>
                  ))}
                  {entityNames.length > 2 && (
                    <span
                      className="text-accent cursor-pointer hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedId(p.id);
                      }}
                    >
                      {" "}and {entityNames.length - 2} more
                    </span>
                  )}
                </p>
              )}
              {/* Fallback: show raw text truncated if no entity names parsed */}
              {entityNames.length === 0 && p.connects_to && (
                <p className="text-[12px] text-accent mt-3 truncate">
                  Connects to: {p.connects_to}
                </p>
              )}

              {/* Relevance signal — active decision approaching lock */}
              {urgentDec && (
                <p
                  className={`text-[12px] mt-2 flex items-center gap-1 ${
                    urgentDays !== null && urgentDays <= 30
                      ? "text-status-red"
                      : "text-accent"
                  }`}
                >
                  <StatusDot
                    color={urgentDays !== null && urgentDays <= 30 ? "red" : "orange"}
                    pulse={urgentDays !== null && urgentDays <= 30}
                  />
                  Active: Relevant to {urgentDec.decision_title}
                  {urgentDays !== null && ` (${formatCountdown(urgentDays)})`}
                </p>
              )}
            </ListCard>
          );
        })}
      </CardList>

      {/* Detail Panel */}
      <DetailPanel
        isOpen={!!selected}
        onClose={() => setSelectedId(null)}
        title={selected?.name}
        backLabel="Back to precedents"
      >
        {selected && (
          <>
            {/* 1. Takeaway — first, prominent pull-quote */}
            {selected.takeaway && (
              <div className="px-6 pt-2 pb-4">
                <p className="font-serif text-[16px] italic text-text leading-relaxed border-l-3 border-accent pl-5 py-4 bg-accent/5 rounded-r-md">
                  &ldquo;{selected.takeaway}&rdquo;
                </p>
              </div>
            )}

            {/* 2. Overview */}
            <DetailSection title="Overview">
              <div className="space-y-3">
                {selected.period && (
                  <div>
                    <p className={labelClass}>Period</p>
                    <p className="text-[13px] text-text mt-0.5">
                      {selected.period}
                    </p>
                  </div>
                )}
                {selected.involved && (
                  <div>
                    <p className={labelClass}>Involved Parties</p>
                    <p className="text-[13px] text-text leading-relaxed mt-0.5">
                      {selected.involved}
                    </p>
                  </div>
                )}
                {selected.description && (
                  <div>
                    <p className={labelClass}>Description</p>
                    <p className="text-[13px] text-text leading-relaxed mt-0.5">
                      {selected.description}
                    </p>
                  </div>
                )}
              </div>
            </DetailSection>

            {/* 3. Lessons */}
            {(selected.what_produced ||
              selected.what_worked ||
              selected.what_didnt) && (
              <DetailSection title="Lessons">
                <div className="space-y-3">
                  {selected.what_produced && (
                    <div>
                      <p className={labelClass}>What Produced</p>
                      <p className="text-[13px] text-text leading-relaxed mt-0.5">
                        {selected.what_produced}
                      </p>
                    </div>
                  )}
                  {selected.what_worked && (
                    <div className="border-l-2 border-status-green pl-3">
                      <p className={labelClass}>What Worked</p>
                      <p className="text-[13px] text-text leading-relaxed mt-0.5">
                        {selected.what_worked}
                      </p>
                    </div>
                  )}
                  {selected.what_didnt && (
                    <div className="border-l-2 border-status-red pl-3">
                      <p className={labelClass}>What Didn&apos;t Work</p>
                      <p className="text-[13px] text-text leading-relaxed mt-0.5">
                        {selected.what_didnt}
                      </p>
                    </div>
                  )}
                </div>
              </DetailSection>
            )}

            {/* 4. Connects To — linked cards + context text */}
            {selected.connects_to && (() => {
              const directInvestments = investmentsByPrecedent[selected.id] || [];
              return (
                <DetailSection title="Connects To">
                  {/* Linked entity cards */}
                  {directInvestments.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {directInvestments.map((inv) => (
                        <InlineRefCard
                          key={inv.id}
                          title={inv.initiative_name}
                          subtitle={`${inv.source_name || "—"} · ${formatAmount(inv.amount)} · ${inv.status}`}
                          accentColor="gold"
                          onClick={() => navigateTo(`/investments?open=${inv.id}`)}
                        />
                      ))}
                    </div>
                  )}

                  {/* Connection context — the analytical prose */}
                  <div>
                    {directInvestments.length > 0 && (
                      <p className={`${labelClass} mb-2`}>Connection Context</p>
                    )}
                    <p className="text-[13px] text-muted leading-relaxed bg-surface-inset rounded-r-md px-4 py-3 border-l-2 border-border-medium">
                      {selected.connects_to}
                    </p>
                  </div>
                </DetailSection>
              );
            })()}

            {/* 5. Currently Relevant To — active decisions/investments by shared stakeholders */}
            {(() => {
              const relDecisions = getRelevantDecisions(selected.id);
              const relInvestments = getRelevantInvestments(selected.id);
              if (relDecisions.length === 0 && relInvestments.length === 0) return null;

              return (
                <DetailSection
                  title="Currently Relevant To"
                  subtitle="Active decisions and investments involving the same stakeholders"
                >
                  <div className="space-y-4">
                    {relDecisions.length > 0 && (
                      <div>
                        <p className={`${labelClass} mb-2`}>Active Decisions</p>
                        <div className="space-y-2">
                          {relDecisions.map((d) => {
                            const days = daysUntil(d.locks_date);
                            return (
                              <InlineRefCard
                                key={d.id}
                                title={d.decision_title}
                                subtitle={`${d.stakeholder_name || "—"} · ${DECISION_STATUS_LABELS[d.status] || d.status}${d.locks_date ? ` · Locks ${formatShortDate(d.locks_date)}` : ""}${days !== null ? ` (${formatCountdown(days)})` : ""}`}
                                accentColor="blue"
                                onClick={() => navigateTo(`/decisions?open=${d.id}`)}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {relInvestments.length > 0 && (
                      <div>
                        <p className={`${labelClass} mb-2`}>Related Investments</p>
                        <div className="space-y-2">
                          {relInvestments.map((inv) => (
                            <InlineRefCard
                              key={inv.id}
                              title={inv.initiative_name}
                              subtitle={`${inv.source_name || "—"} · ${formatAmount(inv.amount)} · ${inv.status}`}
                              accentColor="gold"
                              onClick={() => navigateTo(`/investments?open=${inv.id}`)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </DetailSection>
              );
            })()}

            {/* 6. Across the Toolkit — involved orgs */}
            {(() => {
              const orgIds = involvedOrgsByPrecedent[selected.id] || [];
              if (orgIds.length === 0) return null;
              return (
                <DetailSection title="Across the Toolkit" subtitle="Connected data from other tools">
                  <div>
                    <p className={`${labelClass} mb-2`}>Involved Organizations</p>
                    <div className="space-y-2">
                      {orgIds.map((orgId) => (
                        <InlineRefCard
                          key={orgId}
                          title={orgIdToName[orgId] || "Unknown"}
                          subtitle="Organization"
                          accentColor="gold"
                          onClick={() => navigateTo(`/ecosystem-map?open=${orgId}`)}
                        />
                      ))}
                    </div>
                  </div>
                </DetailSection>
              );
            })()}

            {/* 7. Record */}
            <DetailSection title="Record">
              <div className="space-y-1 text-[12px] text-dim">
                <p>Created: {formatDate(selected.created_at)}</p>
                <p>
                  Last reviewed:{" "}
                  {selected.last_reviewed_at
                    ? formatDate(selected.last_reviewed_at)
                    : "Never"}
                </p>
              </div>
            </DetailSection>
          </>
        )}
      </DetailPanel>
    </>
  );
}
