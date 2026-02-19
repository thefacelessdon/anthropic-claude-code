"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CardList, ListCard } from "@/components/ui/CardGrid";
import {
  DetailPanel,
  DetailSection,
  InlineRefCard,
} from "@/components/ui/DetailPanel";
import { StatusBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils/formatting";
import { OUTPUT_TYPE_LABELS } from "@/lib/utils/constants";
import type { Output } from "@/lib/supabase/types";

interface OutputsViewProps {
  outputs: Output[];
  decisionMap: Record<string, { id: string; decision_title: string }>;
  orgMap: Record<string, { id: string; name: string }>;
}

export function OutputsView({
  outputs,
  decisionMap,
  orgMap,
}: OutputsViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const openId = searchParams.get("open");
    if (openId) setSelectedId(openId);
  }, [searchParams]);

  const [activeTab, setActiveTab] = useState<"published" | "drafts">(
    "published"
  );

  const outputMap = new Map(outputs.map((o) => [o.id, o]));
  const selected = selectedId ? outputMap.get(selectedId) : null;

  const published = outputs.filter((o) => o.is_published);
  const drafts = outputs.filter((o) => !o.is_published);

  return (
    <>
      {/* Tab-style header */}
      <div className="flex items-center gap-1 mb-6 border-b border-border">
        <button
          onClick={() => setActiveTab("published")}
          className={`px-4 py-2.5 text-[13px] font-medium transition-colors relative ${
            activeTab === "published"
              ? "text-text"
              : "text-muted hover:text-text"
          }`}
        >
          Published
          <span className="ml-1.5 text-[11px] text-dim bg-surface-inset px-1.5 py-0.5 rounded font-mono">
            {published.length}
          </span>
          {activeTab === "published" && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-text rounded-t" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("drafts")}
          className={`px-4 py-2.5 text-[13px] font-medium transition-colors relative ${
            activeTab === "drafts"
              ? "text-text"
              : "text-muted hover:text-text"
          }`}
        >
          Drafts
          <span className="ml-1.5 text-[11px] text-dim bg-surface-inset px-1.5 py-0.5 rounded font-mono">
            {drafts.length}
          </span>
          {activeTab === "drafts" && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-text rounded-t" />
          )}
        </button>
      </div>

      {/* Published tab */}
      {activeTab === "published" && (
        <>
          {published.length === 0 ? (
            <p className="text-[13px] text-muted">
              No published outputs yet.
            </p>
          ) : (
            <CardList>
              {published.map((o) => {
                const typeLabel = OUTPUT_TYPE_LABELS[o.output_type] ?? o.output_type;
                const decision = o.triggered_by_decision_id
                  ? decisionMap[o.triggered_by_decision_id]
                  : null;
                const stakeholder = o.target_stakeholder_id
                  ? orgMap[o.target_stakeholder_id]
                  : null;

                return (
                  <ListCard
                    key={o.id}
                    onClick={() => setSelectedId(o.id)}
                    selected={selectedId === o.id}
                  >
                    {/* Row 1: Type badge + published left, date right */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-status-purple">
                          {typeLabel}
                        </span>
                        <StatusBadge label="Published" color="green" />
                      </div>
                      <span className="text-[13px] text-dim font-mono shrink-0">
                        {formatDate(o.published_at)}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-display text-[16px] font-semibold text-text leading-snug mt-2">
                      {o.title}
                    </h3>

                    {/* Summary */}
                    {o.summary && (
                      <p className="text-[13px] text-muted leading-relaxed line-clamp-2 mt-1.5">
                        {o.summary}
                      </p>
                    )}

                    {/* Triggered by + Delivered to */}
                    <div className="mt-2 space-y-0.5">
                      {decision && (
                        <p className="text-[12px] text-accent">
                          Triggered by: {decision.decision_title}
                        </p>
                      )}
                      {stakeholder && (
                        <p className="text-[12px] text-dim">
                          Delivered to: {stakeholder.name}
                        </p>
                      )}
                    </div>
                  </ListCard>
                );
              })}
            </CardList>
          )}
        </>
      )}

      {/* Drafts tab */}
      {activeTab === "drafts" && (
        <>
          {drafts.length === 0 ? (
            <p className="text-[13px] text-muted">No drafts.</p>
          ) : (
            <CardList>
              {drafts.map((o) => {
                const typeLabel = OUTPUT_TYPE_LABELS[o.output_type] ?? o.output_type;

                return (
                  <ListCard
                    key={o.id}
                    onClick={() => setSelectedId(o.id)}
                    selected={selectedId === o.id}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-status-purple shrink-0">
                        {typeLabel}
                      </span>
                      <StatusBadge label="Draft" color="dim" />
                      <span className="text-[14px] font-display font-semibold text-text truncate flex-1 min-w-0">
                        {o.title}
                      </span>
                      <span className="text-[12px] text-dim font-mono shrink-0">
                        {formatDate(o.created_at)}
                      </span>
                    </div>
                  </ListCard>
                );
              })}
            </CardList>
          )}
        </>
      )}

      {/* Detail Panel */}
      <DetailPanel
        isOpen={!!selected}
        onClose={() => setSelectedId(null)}
        title={selected?.title}
        backLabel="Back to outputs"
        subtitle={
          selected ? (
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-status-purple">
                {OUTPUT_TYPE_LABELS[selected.output_type] ?? selected.output_type}
              </span>
              <StatusBadge
                label={selected.is_published ? "Published" : "Draft"}
                color={selected.is_published ? "green" : "dim"}
              />
              <span className="text-[12px] text-dim font-mono">
                {selected.is_published
                  ? formatDate(selected.published_at)
                  : formatDate(selected.created_at)}
              </span>
            </div>
          ) : undefined
        }
      >
        {selected && (
          <>
            {/* Summary */}
            {selected.summary && (
              <DetailSection title="Summary">
                <p className="text-[13px] text-text leading-relaxed">
                  {selected.summary}
                </p>
              </DetailSection>
            )}

            {/* Content — rendered as formatted prose */}
            {selected.content && (
              <DetailSection title="Content">
                <div className="text-[13px] text-text leading-loose whitespace-pre-wrap">
                  {selected.content}
                </div>
              </DetailSection>
            )}

            {/* Section 2: Across the Toolkit */}
            <DetailSection title="Across the Toolkit" subtitle="Connected data from other tools">
              <div className="space-y-2">
                {selected.triggered_by_decision_id &&
                  decisionMap[selected.triggered_by_decision_id] && (
                    <InlineRefCard
                      title={decisionMap[selected.triggered_by_decision_id].decision_title}
                      subtitle="Triggering decision"
                      accentColor="blue"
                    />
                  )}
                {selected.target_stakeholder_id &&
                  orgMap[selected.target_stakeholder_id] && (
                    <InlineRefCard
                      title={orgMap[selected.target_stakeholder_id].name}
                      subtitle="Delivered to"
                      accentColor="green"
                    />
                  )}
                {!selected.triggered_by_decision_id && !selected.target_stakeholder_id && (
                  <p className="text-[13px] text-dim">No cross-tool connections found.</p>
                )}
              </div>
            </DetailSection>

            {/* Section 3: Record */}
            <DetailSection title="Record">
              <div className="space-y-1 text-[12px] text-dim">
                <p>Created: {formatDate(selected.created_at)}</p>
                <p>
                  Published:{" "}
                  {selected.published_at
                    ? formatDate(selected.published_at)
                    : "Not published"}
                </p>
              </div>
            </DetailSection>
          </>
        )}
      </DetailPanel>
    </>
  );
}
