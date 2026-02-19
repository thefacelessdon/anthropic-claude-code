"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DetailPanel, DetailSection, InlineRefCard } from "@/components/ui/DetailPanel";
import { formatDate } from "@/lib/utils/formatting";
import { GAP_LABELS, NARRATIVE_SOURCE_LABELS } from "@/lib/utils/constants";
import type { Narrative, GapLevel } from "@/lib/supabase/types";

/* ── Helpers ───────────────────────────────────────────── */

function gapBorderColor(gap: GapLevel): string {
  const map: Record<GapLevel, string> = {
    high: "border-l-status-red",
    medium: "border-l-status-orange",
    low: "border-l-status-blue",
    aligned: "border-l-status-green",
  };
  return map[gap];
}

function gapTextColor(gap: GapLevel): string {
  const map: Record<GapLevel, string> = {
    high: "text-status-red",
    medium: "text-status-orange",
    low: "text-status-blue",
    aligned: "text-status-green",
  };
  return map[gap];
}

const GAP_SORT_ORDER: Record<string, number> = {
  high: 0,
  medium: 1,
  low: 2,
  aligned: 3,
};

function formatAmountShort(amount: number | null): string {
  if (amount === null) return "\u2014";
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

const labelStyle = "text-[11px] font-semibold text-dim uppercase tracking-[0.06em]";

type SortKey = "gap" | "recent";

/* ── Cross-tool types ──────────────────────────────────── */

interface DecisionRef {
  id: string;
  stakeholder_org_id: string | null;
  stakeholder_name: string | null;
  decision_title: string;
  locks_date: string | null;
  status: string;
}

interface InvRef {
  id: string;
  source_org_id: string | null;
  source_name: string | null;
  initiative_name: string;
  amount: number | null;
  status: string;
  compounding: string;
}

/* ── Props ─────────────────────────────────────────────── */

interface NarrativesViewProps {
  narratives: Narrative[];
  decisionsByOrg?: Record<string, DecisionRef[]>;
  investmentsByOrg?: Record<string, InvRef[]>;
}

/* ── Main View ─────────────────────────────────────────── */

export function NarrativesView({
  narratives,
  decisionsByOrg = {},
  investmentsByOrg = {},
}: NarrativesViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState("all");
  const [sort, setSort] = useState<SortKey>("gap");
  const searchParams = useSearchParams();
  const router = useRouter();

  const navigateTo = useCallback(
    (path: string) => router.push(path),
    [router]
  );

  useEffect(() => {
    const openId = searchParams.get("open");
    if (openId) setSelectedId(openId);
  }, [searchParams]);

  // Derive filter options
  const sourceTypes = useMemo(() => {
    const set = new Set(narratives.map((n) => n.source_type));
    return Array.from(set).sort();
  }, [narratives]);

  // Filter + sort
  const filtered = useMemo(() => {
    let result = narratives;
    if (sourceFilter !== "all") {
      result = result.filter((n) => n.source_type === sourceFilter);
    }

    const sorted = [...result];
    if (sort === "gap") {
      sorted.sort((a, b) => {
        const gapDiff = (GAP_SORT_ORDER[a.gap] ?? 4) - (GAP_SORT_ORDER[b.gap] ?? 4);
        if (gapDiff !== 0) return gapDiff;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    } else {
      sorted.sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    }
    return sorted;
  }, [narratives, sourceFilter, sort]);

  const narrativeMap = new Map(narratives.map((n) => [n.id, n]));
  const selected = selectedId ? narrativeMap.get(selectedId) ?? null : null;

  // Cross-tool data for selected narrative
  const selectedOrgId = selected?.source_org_id;
  const connectedDecisions = selectedOrgId ? (decisionsByOrg[selectedOrgId] || []) : [];
  const orgInvestments = selectedOrgId ? (investmentsByOrg[selectedOrgId] || []).slice(0, 5) : [];
  const otherNarratives = selectedOrgId
    ? narratives.filter((n) => n.source_org_id === selectedOrgId && n.id !== selected?.id)
    : [];

  return (
    <>
      {/* Filters + Sort */}
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className={`text-[13px] px-3 py-1.5 rounded-md border transition-colors cursor-pointer bg-surface text-text ${
            sourceFilter !== "all"
              ? "border-accent bg-accent/5"
              : "border-border-medium"
          }`}
        >
          <option value="all">All sources</option>
          {sourceTypes.map((t) => (
            <option key={t} value={t}>
              {NARRATIVE_SOURCE_LABELS[t] || t}
            </option>
          ))}
        </select>

        <span className="text-[13px] text-dim ml-auto flex items-center gap-1">
          Sort:{" "}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="text-[13px] px-2 py-1 rounded-md border border-border-medium bg-surface text-text cursor-pointer"
          >
            <option value="gap">Gap severity</option>
            <option value="recent">Most recent</option>
          </select>
        </span>
      </div>

      {/* Card list */}
      <div className="space-y-3">
        {filtered.map((narrative) => {
          const connDec = narrative.source_org_id
            ? (decisionsByOrg[narrative.source_org_id] || [])[0]
            : null;

          return (
            <div
              key={narrative.id}
              onClick={() => setSelectedId(narrative.id)}
              className={`bg-surface-card border border-border rounded-r-lg px-5 py-4 cursor-pointer transition-colors hover:bg-surface-inset border-l-[3px] ${gapBorderColor(narrative.gap)} ${
                selectedId === narrative.id ? "ring-1 ring-accent" : ""
              }`}
            >
              {/* Row 1: Gap badge + source type + date */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[11px] font-bold uppercase tracking-[0.06em] ${gapTextColor(narrative.gap)}`}
                  >
                    {GAP_LABELS[narrative.gap] || narrative.gap}
                  </span>
                  <span className="text-[11px] text-dim">&middot;</span>
                  <span className="text-[11px] text-dim uppercase tracking-[0.06em]">
                    {NARRATIVE_SOURCE_LABELS[narrative.source_type] || narrative.source_type}
                  </span>
                </div>
                {narrative.date && (
                  <span className="text-[12px] text-dim font-mono shrink-0 ml-4">
                    {new Date(narrative.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                )}
              </div>

              {/* Source name */}
              <h3 className="font-display text-[16px] font-semibold text-text leading-snug mb-3">
                {narrative.source_name}
              </h3>

              {/* SAYS — italic, 2-line clamp */}
              <div className="mb-2">
                <p className="text-[11px] font-semibold text-dim tracking-[0.04em] mb-0.5">
                  SAYS
                </p>
                <p className="text-[14px] text-muted italic leading-relaxed line-clamp-2">
                  {narrative.narrative_text}
                </p>
              </div>

              {/* REALITY — normal weight, 2-line clamp */}
              {narrative.reality_text && (
                <div className="mb-2">
                  <p className="text-[11px] font-semibold text-dim tracking-[0.04em] mb-0.5">
                    REALITY
                  </p>
                  <p className="text-[14px] text-text leading-relaxed line-clamp-2">
                    {narrative.reality_text}
                  </p>
                </div>
              )}

              {/* Connected decision */}
              {connDec && (
                <p
                  className="text-[12px] text-accent mt-2 cursor-pointer hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateTo(`/decisions?open=${connDec.id}`);
                  }}
                >
                  &#9656; Connected to: {connDec.decision_title}
                  {connDec.locks_date && (
                    <span className="text-dim ml-1">
                      (locks {new Date(connDec.locks_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })})
                    </span>
                  )}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Detail Panel */}
      <DetailPanel
        isOpen={!!selected}
        onClose={() => setSelectedId(null)}
        title={selected?.source_name ?? undefined}
        subtitle={
          selected && (
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[11px] font-bold uppercase tracking-[0.06em] ${gapTextColor(selected.gap)}`}
              >
                {GAP_LABELS[selected.gap] || selected.gap}
              </span>
              <span className="text-[11px] text-dim">&middot;</span>
              <span className="text-[11px] text-dim uppercase tracking-[0.06em]">
                {NARRATIVE_SOURCE_LABELS[selected.source_type] || selected.source_type}
              </span>
              {selected.date && (
                <span className="text-[13px] text-muted ml-1">
                  {formatDate(selected.date)}
                </span>
              )}
            </div>
          )
        }
        backLabel="Back to narratives"
      >
        {selected && (
          <>
            {/* What's Being Said */}
            <DetailSection title="What's Being Said">
              <p className="text-[13px] text-text leading-relaxed italic">
                {selected.narrative_text}
              </p>
            </DetailSection>

            {/* What's Actually Happening */}
            <DetailSection title="What's Actually Happening">
              <p className="text-[13px] text-text leading-relaxed">
                {selected.reality_text || "No reality analysis documented"}
              </p>
            </DetailSection>

            {/* Why This Gap Matters — only if significance exists */}
            {selected.significance && (
              <DetailSection title="Why This Gap Matters">
                <div className="bg-surface-inset border-l-2 border-l-accent rounded-r-md px-4 py-3">
                  <p className="text-[13px] text-text leading-relaxed">
                    {selected.significance}
                  </p>
                </div>
              </DetailSection>
            )}

            {/* Evidence */}
            <DetailSection title="Evidence">
              <div className="space-y-3">
                {selected.evidence_notes ? (
                  <p className="text-[13px] text-text leading-relaxed">
                    {selected.evidence_notes}
                  </p>
                ) : (
                  <p className="text-[13px] text-muted">No evidence notes documented</p>
                )}
              </div>
            </DetailSection>

            {/* Across the Toolkit */}
            {(() => {
              const orgId = selected.source_org_id;
              const orgName = selected.source_name;
              const hasContent = orgName || connectedDecisions.length > 0 || otherNarratives.length > 0 || orgInvestments.length > 0;
              if (!hasContent) return null;

              return (
                <DetailSection
                  title="Across the Toolkit"
                  subtitle="Connected data from other tools"
                >
                  <div className="space-y-5">
                    {/* Source Organization */}
                    {orgName && (
                      <div>
                        <p className={`${labelStyle} mb-2`}>Source Organization</p>
                        <InlineRefCard
                          title={orgName}
                          subtitle="Organization"
                          accentColor="gold"
                          onClick={
                            orgId
                              ? () => navigateTo(`/ecosystem-map?open=${orgId}`)
                              : undefined
                          }
                        />
                      </div>
                    )}

                    {/* Connected Decisions */}
                    {connectedDecisions.length > 0 && (
                      <div>
                        <p className={`${labelStyle} mb-2`}>Connected Decisions</p>
                        <div className="space-y-2">
                          {connectedDecisions.map((d) => (
                            <InlineRefCard
                              key={d.id}
                              title={d.decision_title}
                              subtitle={`${d.stakeholder_name || orgName || "\u2014"} \u00b7 ${d.status}${
                                d.locks_date
                                  ? ` \u00b7 Locks ${new Date(d.locks_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                                  : ""
                              }`}
                              accentColor="orange"
                              onClick={() => navigateTo(`/decisions?open=${d.id}`)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Other Narratives from Same Source */}
                    {otherNarratives.length > 0 && (
                      <div>
                        <p className={`${labelStyle} mb-2`}>Other Narratives from This Source</p>
                        <div className="space-y-2">
                          {otherNarratives.map((n) => (
                            <InlineRefCard
                              key={n.id}
                              title={n.source_name || "Unknown"}
                              subtitle={`${GAP_LABELS[n.gap] || n.gap}${
                                n.date
                                  ? ` \u00b7 ${new Date(n.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                                  : ""
                              }`}
                              accentColor={
                                n.gap === "high" ? "red" : n.gap === "aligned" ? "green" : "orange"
                              }
                              onClick={() => setSelectedId(n.id)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* What This Source Has Invested */}
                    {orgInvestments.length > 0 && (
                      <div>
                        <p className={`${labelStyle} mb-2`}>
                          What {orgName} Has Invested
                        </p>
                        <div className="space-y-2">
                          {orgInvestments.map((inv) => (
                            <InlineRefCard
                              key={inv.id}
                              title={inv.initiative_name}
                              subtitle={`${formatAmountShort(inv.amount)} \u00b7 ${COMPOUNDING_LABELS[inv.compounding] || inv.compounding}`}
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

            {/* Source */}
            {selected.source_url && (
              <DetailSection title="Source">
                <div className="space-y-2">
                  <div>
                    <p className={`${labelStyle} mb-0.5`}>URL</p>
                    <a
                      href={selected.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[13px] text-accent hover:underline break-all"
                    >
                      {selected.source_url}
                    </a>
                  </div>
                  {selected.date && (
                    <div>
                      <p className={`${labelStyle} mb-0.5`}>Published</p>
                      <p className="text-[13px] text-text">{formatDate(selected.date)}</p>
                    </div>
                  )}
                </div>
              </DetailSection>
            )}

            {/* Record */}
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
