"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CardList, ListCard } from "@/components/ui/CardGrid";
import { DetailPanel, DetailSection, InlineRefCard } from "@/components/ui/DetailPanel";
import { StatusBadge } from "@/components/ui/Badge";
import { StatusDot } from "@/components/ui/StatusDot";
import { formatCurrency, formatDate } from "@/lib/utils/formatting";
import {
  INVESTMENT_STATUS_LABELS,
  COMPOUNDING_LABELS,
  INVESTMENT_CATEGORY_LABELS,
} from "@/lib/utils/constants";
import { InvestmentLandscape } from "@/components/practice/InvestmentLandscape";
import type { Investment, Practitioner } from "@/lib/supabase/types";

type BadgeColor = "green" | "red" | "blue" | "dim" | "orange";

function statusColor(status: string): BadgeColor {
  return ({ active: "green", planned: "blue", completed: "dim", cancelled: "red" } as Record<string, BadgeColor>)[status] || "dim";
}

function compoundingColor(status: string): BadgeColor {
  return ({ compounding: "green", not_compounding: "red", too_early: "blue" } as Record<string, BadgeColor>)[status] || "dim";
}

// ─── Filter Types ─────────────────────────────────────

interface Filters {
  source: string | null;
  category: string | null;
  compounding: string | null;
}

const EMPTY_FILTERS: Filters = { source: null, category: null, compounding: null };

// ─── Filter Badge ─────────────────────────────────────

function FilterBadge({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-accent/15 text-accent text-[12px] font-medium px-2.5 py-1 rounded-full">
      {label}
      <button
        onClick={onClear}
        className="hover:text-text transition-colors leading-none"
        aria-label={`Remove ${label} filter`}
      >
        &times;
      </button>
    </span>
  );
}

// ─── Component ────────────────────────────────────────

interface InvestmentsViewProps {
  investments: Investment[];
  practitioners: Practitioner[];
}

export function InvestmentsView({ investments, practitioners }: InvestmentsViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "landscape">("list");
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const openId = searchParams.get("open");
    if (openId) setSelectedId(openId);
  }, [searchParams]);

  // ── Filtered investments ───────────────────────────
  const filteredInvestments = useMemo(() => {
    let result = investments;
    if (filters.source) {
      result = result.filter((i) => (i.source_name || "Unattributed") === filters.source);
    }
    if (filters.category) {
      result = result.filter((i) => (i.category || "uncategorized") === filters.category);
    }
    if (filters.compounding) {
      result = result.filter((i) => i.compounding === filters.compounding);
    }
    return result;
  }, [investments, filters]);

  const investmentMap = new Map(investments.map((i) => [i.id, i]));
  const selected = selectedId ? investmentMap.get(selectedId) : null;

  // Build children map for chain visualization
  const childrenMap = new Map<string, Investment[]>();
  investments.forEach((inv) => {
    if (inv.builds_on_id) {
      const arr = childrenMap.get(inv.builds_on_id) || [];
      arr.push(inv);
      childrenMap.set(inv.builds_on_id, arr);
    }
  });

  const hasFilters = filters.source || filters.category || filters.compounding;

  // ── Click-to-filter handlers from Landscape ────────
  function handleFilterSource(source: string) {
    setFilters({ ...EMPTY_FILTERS, source });
    setView("list");
  }

  function handleFilterCategory(category: string) {
    setFilters({ ...EMPTY_FILTERS, category });
    setView("list");
  }

  function handleFilterSourceCompounding(source: string, compounding: string) {
    setFilters({ ...EMPTY_FILTERS, source, compounding });
    setView("list");
  }

  const handleNavigateDiscipline = useCallback(
    (discipline: string) => {
      router.push(`/ecosystem-map?tab=practitioners&discipline=${encodeURIComponent(discipline)}`);
    },
    [router]
  );

  return (
    <>
      {/* ── View Toggle + Filter Badges ──────────────── */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {hasFilters && (
            <>
              {filters.source && (
                <FilterBadge
                  label={`Source: ${filters.source}`}
                  onClear={() => setFilters((f) => ({ ...f, source: null }))}
                />
              )}
              {filters.category && (
                <FilterBadge
                  label={`Category: ${INVESTMENT_CATEGORY_LABELS[filters.category] || filters.category}`}
                  onClear={() => setFilters((f) => ({ ...f, category: null }))}
                />
              )}
              {filters.compounding && (
                <FilterBadge
                  label={COMPOUNDING_LABELS[filters.compounding] || filters.compounding}
                  onClear={() => setFilters((f) => ({ ...f, compounding: null }))}
                />
              )}
              <button
                onClick={() => setFilters(EMPTY_FILTERS)}
                className="text-[12px] text-dim hover:text-muted transition-colors ml-1"
              >
                Clear all
              </button>
            </>
          )}
        </div>

        <div className="flex bg-surface-inset border border-border rounded-md overflow-hidden shrink-0">
          <button
            onClick={() => setView("list")}
            className={`px-3 py-1.5 text-[12px] font-medium transition-colors ${
              view === "list"
                ? "bg-surface-card text-text"
                : "text-dim hover:text-muted"
            }`}
          >
            List
          </button>
          <button
            onClick={() => setView("landscape")}
            className={`px-3 py-1.5 text-[12px] font-medium transition-colors ${
              view === "landscape"
                ? "bg-surface-card text-text"
                : "text-dim hover:text-muted"
            }`}
          >
            Landscape
          </button>
        </div>
      </div>

      {/* ── Filter count ─────────────────────────────── */}
      {hasFilters && (
        <p className="text-[12px] text-dim mb-4">
          Showing {filteredInvestments.length} of {investments.length} investments
        </p>
      )}

      {/* ── Landscape View ───────────────────────────── */}
      {view === "landscape" && (
        <InvestmentLandscape
          investments={investments}
          practitioners={practitioners}
          onFilterSource={handleFilterSource}
          onFilterCategory={handleFilterCategory}
          onFilterSourceCompounding={handleFilterSourceCompounding}
          onNavigateDiscipline={handleNavigateDiscipline}
        />
      )}

      {/* ── List View ────────────────────────────────── */}
      {view === "list" && (
        <CardList>
          {filteredInvestments.map((inv) => {
            const buildsOn = inv.builds_on_id ? investmentMap.get(inv.builds_on_id) : null;
            const ledTo = inv.led_to_id ? investmentMap.get(inv.led_to_id) : null;
            const children = childrenMap.get(inv.id) || [];

            const accentBar =
              inv.compounding === "compounding"
                ? "bg-status-green"
                : inv.compounding === "not_compounding"
                  ? "bg-status-red"
                  : "bg-status-blue";

            return (
              <ListCard
                key={inv.id}
                onClick={() => setSelectedId(inv.id)}
                selected={selectedId === inv.id}
                accentBar={accentBar}
              >
                {/* Row 1: badges left, amount right — L-shaped scan */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusDot color={compoundingColor(inv.compounding)} />
                    <span className="text-[13px] text-muted">
                      {COMPOUNDING_LABELS[inv.compounding] || inv.compounding}
                    </span>
                    <StatusBadge
                      label={INVESTMENT_STATUS_LABELS[inv.status] || inv.status}
                      color={statusColor(inv.status)}
                    />
                  </div>
                  <div className="text-right shrink-0">
                    {inv.amount !== null && (
                      <p className="font-mono text-[22px] font-bold text-text leading-none">
                        {formatCurrency(inv.amount)}
                      </p>
                    )}
                    {inv.period && (
                      <p className="text-[12px] text-dim mt-1">{inv.period}</p>
                    )}
                  </div>
                </div>

                {/* Row 2: Title */}
                <h3 className="font-display text-[16px] font-semibold text-text leading-snug mt-2">
                  {inv.initiative_name}
                </h3>

                {/* Row 3: Source + category */}
                <p className="text-[13px] text-muted mt-1">
                  {[inv.source_name, inv.category ? (INVESTMENT_CATEGORY_LABELS[inv.category] || inv.category) : null]
                    .filter(Boolean)
                    .join(" · ")}
                </p>

                {/* Row 4: Outcome (2-line max) */}
                {inv.outcome && (
                  <p className="text-[13px] text-muted mt-2 leading-relaxed line-clamp-2">
                    {inv.outcome}
                  </p>
                )}

                {/* Row 5: Chain links */}
                {buildsOn && (
                  <p
                    className="text-[12px] text-accent mt-2 cursor-pointer hover:underline"
                    onClick={(e) => { e.stopPropagation(); setSelectedId(buildsOn.id); }}
                  >
                    Builds on → {buildsOn.initiative_name}
                  </p>
                )}
                {ledTo && (
                  <p
                    className="text-[12px] text-accent mt-1 cursor-pointer hover:underline"
                    onClick={(e) => { e.stopPropagation(); setSelectedId(ledTo.id); }}
                  >
                    Led to → {ledTo.initiative_name}
                  </p>
                )}
                {children.filter((c) => c.id !== ledTo?.id).map((child) => (
                  <p
                    key={child.id}
                    className="text-[12px] text-accent mt-1 cursor-pointer hover:underline"
                    onClick={(e) => { e.stopPropagation(); setSelectedId(child.id); }}
                  >
                    Led to → {child.initiative_name}
                  </p>
                ))}
              </ListCard>
            );
          })}
        </CardList>
      )}

      {/* Detail Panel */}
      <DetailPanel
        isOpen={!!selected}
        onClose={() => setSelectedId(null)}
        title={selected?.initiative_name}
        subtitle={
          selected && (
            <div className="flex items-center gap-3 flex-wrap">
              <StatusDot color={compoundingColor(selected.compounding)} />
              <span className="text-[13px] text-muted">
                {COMPOUNDING_LABELS[selected.compounding] || selected.compounding}
              </span>
              <StatusBadge
                label={INVESTMENT_STATUS_LABELS[selected.status] || selected.status}
                color={statusColor(selected.status)}
              />
              {selected.amount !== null && (
                <span className="font-mono text-[15px] font-semibold text-accent">
                  {formatCurrency(selected.amount)}
                </span>
              )}
            </div>
          )
        }
        backLabel="Back to investments"
      >
        {selected && (
          <>
            {/* Section 1: Entity Details */}
            <DetailSection title="Investment Details">
              <div className="space-y-3">
                {selected.source_name && (
                  <div>
                    <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] mb-0.5">Source</p>
                    <p className="text-[13px] text-text">{selected.source_name}</p>
                  </div>
                )}
                {selected.period && (
                  <div>
                    <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] mb-0.5">Period</p>
                    <p className="text-[13px] text-text font-mono">{selected.period}</p>
                  </div>
                )}
                {selected.category && (
                  <div>
                    <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] mb-0.5">Category</p>
                    <p className="text-[13px] text-text">
                      {INVESTMENT_CATEGORY_LABELS[selected.category] || selected.category}
                    </p>
                  </div>
                )}
                {selected.description && (
                  <div>
                    <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] mb-0.5">Description</p>
                    <p className="text-[13px] text-text leading-relaxed">{selected.description}</p>
                  </div>
                )}
                {selected.outcome && (
                  <div>
                    <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] mb-0.5">Outcome</p>
                    <p className="text-[13px] text-text leading-relaxed">{selected.outcome}</p>
                  </div>
                )}
              </div>
            </DetailSection>

            {/* Compounding Assessment */}
            <DetailSection title="Compounding Assessment">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <StatusDot color={compoundingColor(selected.compounding)} />
                  <span className="text-[13px] font-medium text-text">
                    {COMPOUNDING_LABELS[selected.compounding] || selected.compounding}
                  </span>
                </div>
                {selected.compounding_notes && (
                  <p className="text-[13px] text-muted leading-relaxed bg-surface-inset rounded-md px-4 py-3">
                    {selected.compounding_notes}
                  </p>
                )}
              </div>
            </DetailSection>

            {/* Compounding Chain Visualization */}
            {(() => {
              const chain: Investment[] = [];
              let walk: Investment | undefined = selected;
              const visited = new Set<string>();
              while (walk?.builds_on_id && !visited.has(walk.builds_on_id)) {
                visited.add(walk.id);
                const parent = investmentMap.get(walk.builds_on_id);
                if (parent) { chain.unshift(parent); walk = parent; } else break;
              }
              chain.push(selected);
              walk = selected;
              visited.clear();
              while (walk?.led_to_id && !visited.has(walk.led_to_id)) {
                visited.add(walk.id);
                const child = investmentMap.get(walk.led_to_id);
                if (child) { chain.push(child); walk = child; } else break;
              }
              const directChildren = childrenMap.get(selected.id) || [];
              directChildren.forEach((c) => {
                if (!chain.find((x) => x.id === c.id)) chain.push(c);
              });

              if (chain.length <= 1) return null;

              return (
                <DetailSection title="Compounding Chain">
                  <div className="flex items-stretch gap-2 overflow-x-auto pb-2">
                    {chain.map((inv, i) => {
                      const isCurrent = inv.id === selected.id;
                      return (
                        <div key={inv.id} className="flex items-stretch gap-2 shrink-0">
                          <div
                            onClick={() => !isCurrent && setSelectedId(inv.id)}
                            className={`rounded-md px-3 py-2.5 min-w-[160px] max-w-[200px] border transition-colors ${
                              isCurrent
                                ? "border-accent bg-accent-glow"
                                : "border-border bg-surface-inset cursor-pointer hover:border-border-medium"
                            }`}
                          >
                            <p className={`text-[13px] font-medium truncate ${isCurrent ? "text-accent" : "text-text"}`}>
                              {inv.initiative_name}
                            </p>
                            <p className="text-[11px] text-dim mt-0.5 font-mono">
                              {inv.amount !== null ? formatCurrency(inv.amount) : "—"} · {INVESTMENT_STATUS_LABELS[inv.status] || inv.status}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <StatusDot color={compoundingColor(inv.compounding)} />
                              <span className="text-[10px] text-dim">
                                {COMPOUNDING_LABELS[inv.compounding] || inv.compounding}
                              </span>
                            </div>
                            {isCurrent && (
                              <p className="text-[10px] text-accent font-semibold mt-1">▲ YOU ARE HERE</p>
                            )}
                          </div>
                          {i < chain.length - 1 && (
                            <div className="flex items-center text-dim text-[14px]">→</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </DetailSection>
              );
            })()}

            {/* Section 2: Across the Toolkit */}
            <DetailSection title="Across the Toolkit" subtitle="Connected data from other tools">
              <div className="space-y-2">
                {selected.source_org_id && (
                  <InlineRefCard
                    title={selected.source_name || "Source Organization"}
                    subtitle="Organization"
                    accentColor="gold"
                  />
                )}
                {selected.builds_on_id && investmentMap.get(selected.builds_on_id) && (
                  <InlineRefCard
                    title={investmentMap.get(selected.builds_on_id)!.initiative_name}
                    subtitle="Builds on this investment"
                    accentColor="gold"
                    onClick={() => setSelectedId(selected.builds_on_id!)}
                  />
                )}
                {selected.led_to_id && investmentMap.get(selected.led_to_id) && (
                  <InlineRefCard
                    title={investmentMap.get(selected.led_to_id)!.initiative_name}
                    subtitle="This investment led to"
                    accentColor="gold"
                    onClick={() => setSelectedId(selected.led_to_id!)}
                  />
                )}
                {!selected.source_org_id && !selected.builds_on_id && !selected.led_to_id && (
                  <p className="text-[13px] text-dim">No cross-tool connections found.</p>
                )}
              </div>
            </DetailSection>

            {/* Section 3: Record */}
            <DetailSection title="Record">
              <div className="space-y-1 text-[12px] text-dim">
                <p>Created: {formatDate(selected.created_at)}</p>
                <p>Last reviewed: {selected.last_reviewed_at ? formatDate(selected.last_reviewed_at) : "Never"}</p>
              </div>
            </DetailSection>
          </>
        )}
      </DetailPanel>
    </>
  );
}
