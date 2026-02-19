"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CardList, ListCard } from "@/components/ui/CardGrid";
import { DetailPanel, DetailSection } from "@/components/ui/DetailPanel";
import { formatDate } from "@/lib/utils/formatting";
import type { Precedent } from "@/lib/supabase/types";

interface PrecedentsViewProps {
  precedents: Precedent[];
}

const labelClass =
  "text-[11px] font-semibold text-dim uppercase tracking-[0.06em]";

export function PrecedentsView({ precedents }: PrecedentsViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const openId = searchParams.get("open");
    if (openId) setSelectedId(openId);
  }, [searchParams]);

  const precedentMap = new Map(precedents.map((p) => [p.id, p]));
  const selected = selectedId ? precedentMap.get(selectedId) : null;

  return (
    <>
      <CardList>
        {precedents.map((p) => (
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

            {/* Connects to */}
            {p.connects_to && (
              <p className="text-[12px] text-accent mt-3">
                Connects to: {p.connects_to}
              </p>
            )}
          </ListCard>
        ))}
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
            {/* 1. Overview */}
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

            {/* 2. Lessons */}
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

            {/* 3. Takeaway — pull quote */}
            {selected.takeaway && (
              <DetailSection title="Takeaway">
                <p className="text-[14px] text-text italic border-l-2 border-accent pl-3">
                  &ldquo;{selected.takeaway}&rdquo;
                </p>
              </DetailSection>
            )}

            {/* 4. Connects to */}
            {selected.connects_to && (
              <div className="mt-8">
                <p className={labelClass}>Connects to</p>
                <p className="text-[13px] text-accent mt-0.5">
                  {selected.connects_to}
                </p>
              </div>
            )}

            {/* 5. Record */}
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
