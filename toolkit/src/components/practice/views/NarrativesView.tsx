"use client";

import { useState } from "react";
import { CardGrid, GridCard } from "@/components/ui/CardGrid";
import { DetailPanel, DetailSection } from "@/components/ui/DetailPanel";
import { StatusBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils/formatting";
import { GAP_LABELS, NARRATIVE_SOURCE_LABELS } from "@/lib/utils/constants";
import type { Narrative, GapLevel } from "@/lib/supabase/types";

function gapColor(gap: GapLevel): "red" | "orange" | "blue" | "green" {
  const map: Record<GapLevel, "red" | "orange" | "blue" | "green"> = {
    high: "red",
    medium: "orange",
    low: "blue",
    aligned: "green",
  };
  return map[gap];
}

function gapBarColor(gap: GapLevel): string {
  const map: Record<GapLevel, string> = {
    high: "bg-status-red",
    medium: "bg-status-orange",
    low: "bg-status-blue",
    aligned: "bg-status-green",
  };
  return map[gap];
}

interface NarrativesViewProps {
  narratives: Narrative[];
}

export function NarrativesView({ narratives }: NarrativesViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const narrativeMap = new Map(narratives.map((n) => [n.id, n]));
  const selected = selectedId ? narrativeMap.get(selectedId) : null;

  return (
    <>
      <CardGrid columns={2}>
        {narratives.map((narrative) => (
          <GridCard
            key={narrative.id}
            onClick={() => setSelectedId(narrative.id)}
            selected={selectedId === narrative.id}
            aspect="portrait"
            accentBar={gapBarColor(narrative.gap)}
          >
            {/* Gap badge + source type */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <StatusBadge
                label={GAP_LABELS[narrative.gap] || narrative.gap}
                color={gapColor(narrative.gap)}
              />
              <span className="text-[11px] text-dim uppercase tracking-wider">
                {NARRATIVE_SOURCE_LABELS[narrative.source_type] || narrative.source_type}
              </span>
            </div>

            {/* Source name */}
            <h3 className="text-[15px] font-medium text-text leading-snug">
              {narrative.source_name}
            </h3>

            {/* Date */}
            {narrative.date && (
              <p className="text-[12px] text-dim mt-1">
                {formatDate(narrative.date)}
              </p>
            )}

            {/* The Narrative */}
            <div className="mt-3">
              <p className="text-[11px] text-dim uppercase tracking-wider mb-1">
                The Narrative
              </p>
              <p className="text-[13px] text-text leading-relaxed line-clamp-3">
                {narrative.narrative_text}
              </p>
            </div>

            {/* The Reality */}
            {narrative.reality_text && (
              <div className="mt-3">
                <p className="text-[11px] text-dim uppercase tracking-wider mb-1">
                  The Reality
                </p>
                <p className="text-[13px] text-muted leading-relaxed line-clamp-2">
                  {narrative.reality_text}
                </p>
              </div>
            )}
          </GridCard>
        ))}
      </CardGrid>

      {/* Detail Panel */}
      <DetailPanel
        isOpen={!!selected}
        onClose={() => setSelectedId(null)}
        title={selected?.source_name ?? undefined}
        subtitle={
          selected && (
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge
                label={GAP_LABELS[selected.gap] || selected.gap}
                color={gapColor(selected.gap)}
              />
              <StatusBadge
                label={NARRATIVE_SOURCE_LABELS[selected.source_type] || selected.source_type}
                color="dim"
              />
              {selected.date && (
                <span className="text-[13px] text-muted">
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
            {/* The Narrative */}
            <DetailSection title="The Narrative">
              <p className="text-[13px] text-text leading-relaxed">
                {selected.narrative_text}
              </p>
            </DetailSection>

            {/* The Reality */}
            <DetailSection title="The Reality">
              <p className="text-[13px] text-muted leading-relaxed">
                {selected.reality_text || "No reality analysis documented"}
              </p>
            </DetailSection>

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
                {selected.source_url && (
                  <div>
                    <p className="text-[11px] text-dim uppercase tracking-wider mb-0.5">
                      Source URL
                    </p>
                    <a
                      href={selected.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[13px] text-accent hover:underline break-all"
                    >
                      {selected.source_url}
                    </a>
                  </div>
                )}
              </div>
            </DetailSection>

            {/* Record */}
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
