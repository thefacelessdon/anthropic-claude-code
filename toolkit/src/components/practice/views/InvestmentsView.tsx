"use client";

import { useState } from "react";
import { CardGrid, GridCard } from "@/components/ui/CardGrid";
import { DetailPanel, DetailSection, InlineRefCard } from "@/components/ui/DetailPanel";
import { StatusBadge } from "@/components/ui/Badge";
import { StatusDot } from "@/components/ui/StatusDot";
import { formatCurrency, formatDate } from "@/lib/utils/formatting";
import {
  INVESTMENT_STATUS_LABELS,
  COMPOUNDING_LABELS,
  INVESTMENT_CATEGORY_LABELS,
} from "@/lib/utils/constants";
import type { Investment } from "@/lib/supabase/types";

function statusColor(status: string): "green" | "red" | "blue" | "orange" | "dim" {
  const map: Record<string, "green" | "red" | "blue" | "orange" | "dim"> = {
    active: "green",
    planned: "blue",
    completed: "dim",
    cancelled: "red",
  };
  return map[status] || "dim";
}

function compoundingColor(status: string): "green" | "red" | "blue" | "orange" | "dim" {
  const map: Record<string, "green" | "red" | "blue" | "orange" | "dim"> = {
    compounding: "green",
    not_compounding: "red",
    too_early: "blue",
    unknown: "dim",
  };
  return map[status] || "dim";
}

interface InvestmentsViewProps {
  investments: Investment[];
}

export function InvestmentsView({ investments }: InvestmentsViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const investmentMap = new Map(investments.map((i) => [i.id, i]));
  const selected = selectedId ? investmentMap.get(selectedId) : null;

  return (
    <>
      <CardGrid>
        {investments.map((inv) => {
          const buildsOn = inv.builds_on_id ? investmentMap.get(inv.builds_on_id) : null;

          return (
            <GridCard
              key={inv.id}
              onClick={() => setSelectedId(inv.id)}
              selected={selectedId === inv.id}
            >
              {/* Status + compounding badges */}
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <StatusBadge
                  label={INVESTMENT_STATUS_LABELS[inv.status] || inv.status}
                  color={statusColor(inv.status)}
                />
                <StatusBadge
                  label={COMPOUNDING_LABELS[inv.compounding] || inv.compounding}
                  color={compoundingColor(inv.compounding)}
                />
              </div>

              {/* Title + amount */}
              <h3 className="text-[15px] font-medium text-text leading-snug">
                {inv.initiative_name}
              </h3>
              {inv.amount !== null && (
                <p className="font-mono text-[14px] font-medium text-accent mt-1">
                  {formatCurrency(inv.amount)}
                </p>
              )}

              {/* Source + period */}
              <div className="flex items-center gap-2 mt-2 text-[12px] text-muted">
                {inv.source_name && <span>{inv.source_name}</span>}
                {inv.source_name && inv.period && <span className="text-dim">&middot;</span>}
                {inv.period && <span>{inv.period}</span>}
              </div>

              {/* Outcome preview */}
              {inv.outcome && (
                <p className="text-[12px] text-muted mt-3 leading-relaxed line-clamp-3">
                  {inv.outcome}
                </p>
              )}

              {/* Chain hint */}
              {buildsOn && (
                <p className="text-[11px] text-dim mt-2">
                  Builds on: <span className="text-muted">{buildsOn.initiative_name}</span>
                </p>
              )}
            </GridCard>
          );
        })}
      </CardGrid>

      {/* Detail Panel */}
      <DetailPanel
        isOpen={!!selected}
        onClose={() => setSelectedId(null)}
        title={selected?.initiative_name}
        subtitle={
          selected && (
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge
                label={INVESTMENT_STATUS_LABELS[selected.status] || selected.status}
                color={statusColor(selected.status)}
              />
              <StatusBadge
                label={COMPOUNDING_LABELS[selected.compounding] || selected.compounding}
                color={compoundingColor(selected.compounding)}
              />
              {selected.amount !== null && (
                <span className="font-mono text-[15px] font-medium text-accent">
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
            {/* Key Details */}
            <DetailSection title="Investment Details">
              <div className="space-y-3">
                {selected.source_name && (
                  <div>
                    <p className="text-[11px] text-dim uppercase tracking-wider mb-0.5">Source</p>
                    <p className="text-[13px] text-text">{selected.source_name}</p>
                  </div>
                )}
                {selected.period && (
                  <div>
                    <p className="text-[11px] text-dim uppercase tracking-wider mb-0.5">Period</p>
                    <p className="text-[13px] text-text">{selected.period}</p>
                  </div>
                )}
                {selected.category && (
                  <div>
                    <p className="text-[11px] text-dim uppercase tracking-wider mb-0.5">Category</p>
                    <p className="text-[13px] text-text">
                      {INVESTMENT_CATEGORY_LABELS[selected.category] || selected.category}
                    </p>
                  </div>
                )}
                {selected.description && (
                  <div>
                    <p className="text-[11px] text-dim uppercase tracking-wider mb-0.5">Description</p>
                    <p className="text-[13px] text-text leading-relaxed">{selected.description}</p>
                  </div>
                )}
                {selected.outcome && (
                  <div>
                    <p className="text-[11px] text-dim uppercase tracking-wider mb-0.5">Outcome</p>
                    <p className="text-[13px] text-text leading-relaxed">{selected.outcome}</p>
                  </div>
                )}
              </div>
            </DetailSection>

            {/* Compounding Analysis */}
            <DetailSection title="Compounding Analysis">
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

            {/* Compounding Chain */}
            {(selected.builds_on_id || selected.led_to_id) && (
              <DetailSection title="Compounding Chain">
                <div className="space-y-2">
                  {selected.builds_on_id && investmentMap.get(selected.builds_on_id) && (
                    <InlineRefCard
                      title={investmentMap.get(selected.builds_on_id)!.initiative_name}
                      subtitle="Builds on this investment"
                      accentColor="blue"
                      onClick={() => setSelectedId(selected.builds_on_id!)}
                    />
                  )}
                  <div className="bg-accent-glow border border-border-accent rounded-md px-4 py-3">
                    <p className="text-[13px] font-semibold text-accent">
                      {selected.initiative_name}
                    </p>
                    <p className="text-[11px] text-dim mt-0.5">Current investment</p>
                  </div>
                  {selected.led_to_id && investmentMap.get(selected.led_to_id) && (
                    <InlineRefCard
                      title={investmentMap.get(selected.led_to_id)!.initiative_name}
                      subtitle="This investment led to"
                      accentColor="green"
                      onClick={() => setSelectedId(selected.led_to_id!)}
                    />
                  )}
                </div>
              </DetailSection>
            )}

            {/* Metadata */}
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
