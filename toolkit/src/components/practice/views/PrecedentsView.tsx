"use client";

import { useState } from "react";
import { CardGrid, GridCard } from "@/components/ui/CardGrid";
import { DetailPanel, DetailSection } from "@/components/ui/DetailPanel";
import { formatDate } from "@/lib/utils/formatting";
import type { Precedent } from "@/lib/supabase/types";

interface PrecedentsViewProps {
  precedents: Precedent[];
}

export function PrecedentsView({ precedents }: PrecedentsViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const precedentMap = new Map(precedents.map((p) => [p.id, p]));
  const selected = selectedId ? precedentMap.get(selectedId) : null;

  return (
    <>
      <CardGrid columns={2}>
        {precedents.map((p) => (
          <GridCard
            key={p.id}
            onClick={() => setSelectedId(p.id)}
            selected={selectedId === p.id}
            aspect="portrait"
          >
            {/* Name */}
            <h3 className="text-[15px] font-medium text-text leading-snug">
              {p.name}
            </h3>

            {/* Period */}
            {p.period && (
              <p className="text-[12px] text-dim mt-1">{p.period}</p>
            )}

            {/* Takeaway inset box */}
            {p.takeaway && (
              <div className="bg-surface-inset border-l-2 border-accent rounded-md px-4 py-3 mt-3">
                <p className="text-[11px] text-dim uppercase tracking-wider mb-1">
                  Takeaway
                </p>
                <p className="text-[13px] text-text leading-relaxed line-clamp-4">
                  {p.takeaway}
                </p>
              </div>
            )}

            {/* Connected to */}
            {p.connects_to && (
              <p className="text-[12px] text-dim mt-auto pt-3">
                Connected to: {p.connects_to}
              </p>
            )}
          </GridCard>
        ))}
      </CardGrid>

      {/* Detail Panel */}
      <DetailPanel
        isOpen={!!selected}
        onClose={() => setSelectedId(null)}
        title={selected?.name}
        backLabel="Back to precedents"
      >
        {selected && (
          <>
            {/* Overview */}
            <DetailSection title="Overview">
              <div className="space-y-3">
                {selected.period && (
                  <div>
                    <p className="text-[11px] text-dim uppercase tracking-wider mb-0.5">
                      Period
                    </p>
                    <p className="text-[13px] text-text">{selected.period}</p>
                  </div>
                )}
                {selected.involved && (
                  <div>
                    <p className="text-[11px] text-dim uppercase tracking-wider mb-0.5">
                      Involved Parties
                    </p>
                    <p className="text-[13px] text-text leading-relaxed">
                      {selected.involved}
                    </p>
                  </div>
                )}
                {selected.description && (
                  <div>
                    <p className="text-[11px] text-dim uppercase tracking-wider mb-0.5">
                      Description
                    </p>
                    <p className="text-[13px] text-text leading-relaxed">
                      {selected.description}
                    </p>
                  </div>
                )}
              </div>
            </DetailSection>

            {/* What Produced */}
            {selected.what_produced && (
              <DetailSection title="What Produced">
                <p className="text-[13px] text-text leading-relaxed">
                  {selected.what_produced}
                </p>
              </DetailSection>
            )}

            {/* Lessons */}
            {(selected.what_worked || selected.what_didnt) && (
              <DetailSection title="Lessons">
                <div className="space-y-3">
                  {selected.what_worked && (
                    <div className="bg-surface-inset border-l-2 border-status-green rounded-md px-4 py-3">
                      <p className="text-[11px] text-dim uppercase tracking-wider mb-1">
                        What worked
                      </p>
                      <p className="text-[13px] text-text leading-relaxed">
                        {selected.what_worked}
                      </p>
                    </div>
                  )}
                  {selected.what_didnt && (
                    <div className="bg-surface-inset border-l-2 border-status-red rounded-md px-4 py-3">
                      <p className="text-[11px] text-dim uppercase tracking-wider mb-1">
                        What didn&apos;t work
                      </p>
                      <p className="text-[13px] text-text leading-relaxed">
                        {selected.what_didnt}
                      </p>
                    </div>
                  )}
                </div>
              </DetailSection>
            )}

            {/* Takeaway */}
            {selected.takeaway && (
              <DetailSection title="Takeaway">
                <div className="bg-surface-inset border-l-2 border-accent rounded-md px-4 py-3">
                  <p className="text-[13px] text-text leading-relaxed">
                    {selected.takeaway}
                  </p>
                </div>
              </DetailSection>
            )}

            {/* Connects to */}
            {selected.connects_to && (
              <div className="mt-6">
                <p className="text-[11px] text-dim uppercase tracking-wider mb-0.5">
                  Connects to
                </p>
                <p className="text-[13px] text-text">{selected.connects_to}</p>
              </div>
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
