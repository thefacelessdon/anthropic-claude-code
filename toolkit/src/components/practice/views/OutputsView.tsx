"use client";

import { useState } from "react";
import { CardGrid, GridCard } from "@/components/ui/CardGrid";
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
            <CardGrid columns={2}>
              {published.map((o) => {
                const typeLabel =
                  OUTPUT_TYPE_LABELS[o.output_type] ?? o.output_type;
                const decision = o.triggered_by_decision_id
                  ? decisionMap[o.triggered_by_decision_id]
                  : null;
                const stakeholder = o.target_stakeholder_id
                  ? orgMap[o.target_stakeholder_id]
                  : null;

                return (
                  <GridCard
                    key={o.id}
                    onClick={() => setSelectedId(o.id)}
                    selected={selectedId === o.id}
                    aspect="portrait"
                  >
                    {/* Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge label={typeLabel} color="purple" />
                      <StatusBadge label="Published" color="green" />
                    </div>

                    {/* Published date */}
                    <p className="text-[12px] text-dim mt-2">
                      {formatDate(o.published_at)}
                    </p>

                    {/* Title */}
                    <h3 className="text-[15px] font-medium text-text leading-snug mt-1.5">
                      {o.title}
                    </h3>

                    {/* Summary */}
                    {o.summary && (
                      <p className="text-[13px] text-muted leading-relaxed line-clamp-3 mt-2">
                        {o.summary}
                      </p>
                    )}

                    {/* Triggered by */}
                    {decision && (
                      <p className="text-[12px] text-dim mt-auto pt-2">
                        Triggered by: {decision.decision_title}
                      </p>
                    )}

                    {/* Delivered to */}
                    {stakeholder && (
                      <p className="text-[12px] text-dim mt-1">
                        Delivered to: {stakeholder.name}
                      </p>
                    )}
                  </GridCard>
                );
              })}
            </CardGrid>
          )}
        </>
      )}

      {/* Drafts tab */}
      {activeTab === "drafts" && (
        <>
          {drafts.length === 0 ? (
            <p className="text-[13px] text-muted">No drafts.</p>
          ) : (
            <div className="space-y-2">
              {drafts.map((o) => {
                const typeLabel =
                  OUTPUT_TYPE_LABELS[o.output_type] ?? o.output_type;

                return (
                  <div
                    key={o.id}
                    onClick={() => setSelectedId(o.id)}
                    className={`flex items-center gap-3 px-4 py-3 bg-surface-card border rounded-md cursor-pointer transition-all hover:border-border-medium hover:shadow-[0_2px_8px_rgba(0,0,0,0.15)] ${
                      selectedId === o.id
                        ? "ring-1 ring-accent border-accent"
                        : "border-border"
                    }`}
                  >
                    <StatusBadge label={typeLabel} color="purple" />
                    <StatusBadge label="Draft" color="dim" />
                    <span className="text-[14px] font-medium text-text truncate flex-1 min-w-0">
                      {o.title}
                    </span>
                    <span className="text-[12px] text-dim shrink-0">
                      {formatDate(o.created_at)}
                    </span>
                  </div>
                );
              })}
            </div>
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
              <StatusBadge
                label={
                  OUTPUT_TYPE_LABELS[selected.output_type] ??
                  selected.output_type
                }
                color="purple"
              />
              <StatusBadge
                label={selected.is_published ? "Published" : "Draft"}
                color={selected.is_published ? "green" : "dim"}
              />
              <span className="text-[12px] text-dim">
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

            {/* Content */}
            {selected.content && (
              <DetailSection title="Content">
                <div className="text-[13px] text-text leading-loose whitespace-pre-wrap">
                  {selected.content}
                </div>
              </DetailSection>
            )}

            {/* Triggered by */}
            {selected.triggered_by_decision_id &&
              decisionMap[selected.triggered_by_decision_id] && (
                <DetailSection title="Triggered by">
                  <InlineRefCard
                    title={
                      decisionMap[selected.triggered_by_decision_id]
                        .decision_title
                    }
                    subtitle="Decision"
                    accentColor="orange"
                  />
                </DetailSection>
              )}

            {/* Delivered to */}
            {selected.target_stakeholder_id &&
              orgMap[selected.target_stakeholder_id] && (
                <DetailSection title="Delivered to">
                  <InlineRefCard
                    title={orgMap[selected.target_stakeholder_id].name}
                    subtitle="Organization"
                    accentColor="blue"
                  />
                </DetailSection>
              )}

            {/* Record */}
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
