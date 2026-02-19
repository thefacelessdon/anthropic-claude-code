"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CardList, ListCard } from "@/components/ui/CardGrid";
import { DetailPanel, DetailSection, InlineRefCard } from "@/components/ui/DetailPanel";
import { formatDate } from "@/lib/utils/formatting";
import { GAP_LABELS, NARRATIVE_SOURCE_LABELS } from "@/lib/utils/constants";
import type { Narrative, GapLevel } from "@/lib/supabase/types";

function gapBarColor(gap: GapLevel): string {
  const map: Record<GapLevel, string> = {
    high: "bg-status-red",
    medium: "bg-status-orange",
    low: "bg-status-blue",
    aligned: "bg-status-green",
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

const labelStyle = "text-[11px] font-semibold text-dim uppercase tracking-[0.06em]";

interface NarrativesViewProps {
  narratives: Narrative[];
}

export function NarrativesView({ narratives }: NarrativesViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const openId = searchParams.get("open");
    if (openId) setSelectedId(openId);
  }, [searchParams]);
  const narrativeMap = new Map(narratives.map((n) => [n.id, n]));
  const selected = selectedId ? narrativeMap.get(selectedId) : null;

  return (
    <>
      <CardList>
        {narratives.map((narrative) => (
          <ListCard
            key={narrative.id}
            onClick={() => setSelectedId(narrative.id)}
            selected={selectedId === narrative.id}
            accentBar={gapBarColor(narrative.gap)}
          >
            {/* Row 1: Gap level + source type on left, date on right */}
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
                <span className="text-[12px] text-dim shrink-0 ml-4">
                  {formatDate(narrative.date)}
                </span>
              )}
            </div>

            {/* Source name */}
            <h3 className="font-display text-[16px] font-semibold text-text leading-snug mb-3">
              {narrative.source_name}
            </h3>

            {/* SAYS */}
            <div className="mb-2">
              <p className="text-[11px] font-semibold text-dim tracking-[0.04em] mb-0.5">
                SAYS
              </p>
              <p className="text-[13px] text-text italic leading-relaxed line-clamp-2">
                {narrative.narrative_text}
              </p>
            </div>

            {/* REALITY */}
            {narrative.reality_text && (
              <div className="mb-2">
                <p className="text-[11px] font-semibold text-dim tracking-[0.04em] mb-0.5">
                  REALITY
                </p>
                <p className="text-[13px] text-text leading-relaxed line-clamp-2">
                  {narrative.reality_text}
                </p>
              </div>
            )}

            {/* Evidence */}
            {narrative.evidence_notes && (
              <p className="text-[12px] text-accent">
                Evidence: {narrative.evidence_notes}
              </p>
            )}
          </ListCard>
        ))}
      </CardList>

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
            {/* The Narrative */}
            <DetailSection title="The Narrative">
              <p className="text-[13px] text-text leading-relaxed">
                {selected.narrative_text}
              </p>
            </DetailSection>

            {/* The Reality */}
            <DetailSection title="The Reality">
              <p className="text-[13px] text-text leading-relaxed">
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
                    <p className={`${labelStyle} mb-0.5`}>Source URL</p>
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

            {/* Across the Toolkit */}
            {selected.source_org_id && (
              <DetailSection title="Across the Toolkit" subtitle="Connected data from other tools">
                <InlineRefCard
                  title={selected.source_name || "Source Organization"}
                  subtitle="Organization"
                  accentColor="orange"
                />
              </DetailSection>
            )}

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
