"use client";

import { useState } from "react";
import { CardGrid, GridCard } from "@/components/ui/CardGrid";
import { DetailPanel, DetailSection } from "@/components/ui/DetailPanel";
import { StatusBadge } from "@/components/ui/Badge";
import { formatCurrency, formatDate, daysUntil } from "@/lib/utils/formatting";
import {
  OPPORTUNITY_STATUS_LABELS,
  OPPORTUNITY_TYPE_LABELS,
} from "@/lib/utils/constants";
import type { Opportunity } from "@/lib/supabase/types";

function statusColor(status: string): "green" | "blue" | "orange" | "dim" {
  const map: Record<string, "green" | "blue" | "orange" | "dim"> = {
    open: "green",
    closing_soon: "orange",
    closed: "dim",
    awarded: "blue",
  };
  return map[status] || "dim";
}

function formatAmountRange(min: number | null, max: number | null): string | null {
  if (min !== null && max !== null) {
    return `${formatCurrency(min)} – ${formatCurrency(max)}`;
  }
  if (min !== null) return formatCurrency(min);
  if (max !== null) return `Up to ${formatCurrency(max)}`;
  return null;
}

function DaysRemaining({ deadline }: { deadline: string | null }) {
  const days = daysUntil(deadline);
  if (days === null) return null;

  let colorClass = "text-muted";
  if (days <= 14) colorClass = "text-status-red";
  else if (days <= 30) colorClass = "text-status-orange";

  return (
    <span className={`font-mono text-[12px] ${colorClass}`}>
      {days <= 0 ? "Past deadline" : `${days}d remaining`}
    </span>
  );
}

interface OpportunitiesViewProps {
  opportunities: Opportunity[];
  investmentMap: Record<string, { id: string; initiative_name: string }>;
}

export function OpportunitiesView({
  opportunities,
  investmentMap,
}: OpportunitiesViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const opportunityLookup = new Map(opportunities.map((o) => [o.id, o]));
  const selected = selectedId ? opportunityLookup.get(selectedId) : null;

  // Split into sections
  const closingSoon = opportunities.filter((o) => o.status === "closing_soon");
  const open = opportunities.filter((o) => o.status === "open");
  const closed = opportunities.filter(
    (o) => o.status === "closed" || o.status === "awarded"
  );

  const amountRange = selected
    ? formatAmountRange(selected.amount_min, selected.amount_max)
    : null;

  return (
    <>
      {/* ── Closing Soon ────────────────────────────────── */}
      {closingSoon.length > 0 && (
        <div className="mb-8">
          <h2 className="font-display text-base font-semibold text-text mb-4">
            Closing Soon
          </h2>
          <CardGrid columns={2}>
            {closingSoon.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                selected={selectedId === opp.id}
                onClick={() => setSelectedId(opp.id)}
              />
            ))}
          </CardGrid>
        </div>
      )}

      {/* ── Open ────────────────────────────────────────── */}
      {open.length > 0 && (
        <div className="mb-8">
          <h2 className="font-display text-base font-semibold text-text mb-4">
            Open
          </h2>
          <CardGrid columns={2}>
            {open.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                selected={selectedId === opp.id}
                onClick={() => setSelectedId(opp.id)}
              />
            ))}
          </CardGrid>
        </div>
      )}

      {/* ── Closed & Awarded ────────────────────────────── */}
      {closed.length > 0 && (
        <div className="mb-8">
          <h2 className="font-display text-base font-semibold text-text mb-4">
            Closed &amp; Awarded
          </h2>
          <div className="space-y-1">
            {closed.map((opp) => {
              const linkedInvestment = opp.awarded_investment_id
                ? investmentMap[opp.awarded_investment_id]
                : null;

              return (
                <div
                  key={opp.id}
                  onClick={() => setSelectedId(opp.id)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-md cursor-pointer transition-colors hover:bg-surface-inset ${
                    selectedId === opp.id
                      ? "bg-surface-inset ring-1 ring-accent"
                      : ""
                  }`}
                >
                  <span className="text-[11px] uppercase text-accent bg-accent-glow border border-border-accent px-2 py-0.5 rounded shrink-0">
                    {OPPORTUNITY_TYPE_LABELS[opp.opportunity_type] ||
                      opp.opportunity_type}
                  </span>
                  <span className="text-[13px] text-text truncate">
                    {opp.title}
                  </span>
                  <StatusBadge
                    label={
                      OPPORTUNITY_STATUS_LABELS[opp.status] || opp.status
                    }
                    color={statusColor(opp.status)}
                  />
                  {opp.awarded_to && (
                    <span className="text-[12px] text-muted shrink-0">
                      {opp.awarded_to}
                    </span>
                  )}
                  {linkedInvestment && (
                    <span className="text-[12px] text-accent shrink-0">
                      &rarr; Became: {linkedInvestment.initiative_name}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Detail Panel ────────────────────────────────── */}
      <DetailPanel
        isOpen={!!selected}
        onClose={() => setSelectedId(null)}
        title={selected?.title}
        subtitle={
          selected && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] uppercase text-accent bg-accent-glow border border-border-accent px-2 py-0.5 rounded">
                {OPPORTUNITY_TYPE_LABELS[selected.opportunity_type] ||
                  selected.opportunity_type}
              </span>
              <StatusBadge
                label={
                  OPPORTUNITY_STATUS_LABELS[selected.status] || selected.status
                }
                color={statusColor(selected.status)}
              />
              {amountRange && (
                <span className="font-mono text-[14px] font-medium text-accent">
                  {amountRange}
                </span>
              )}
            </div>
          )
        }
        backLabel="Back to opportunities"
      >
        {selected && (
          <>
            {/* Details */}
            <DetailSection title="Details">
              <div className="space-y-3">
                {selected.source_name && (
                  <div>
                    <p className="text-[11px] text-dim uppercase tracking-wider mb-0.5">
                      Source
                    </p>
                    <p className="text-[13px] text-text">
                      {selected.source_name}
                    </p>
                  </div>
                )}
                {selected.deadline && (
                  <div>
                    <p className="text-[11px] text-dim uppercase tracking-wider mb-0.5">
                      Deadline
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] text-text">
                        {formatDate(selected.deadline)}
                      </p>
                      <DaysRemaining deadline={selected.deadline} />
                    </div>
                    {selected.deadline_description && (
                      <p className="text-[12px] text-muted mt-0.5">
                        {selected.deadline_description}
                      </p>
                    )}
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
                {selected.eligibility && (
                  <div>
                    <p className="text-[11px] text-dim uppercase tracking-wider mb-0.5">
                      Eligibility
                    </p>
                    <p className="text-[13px] text-text leading-relaxed">
                      {selected.eligibility}
                    </p>
                  </div>
                )}
                {selected.amount_description && (
                  <div>
                    <p className="text-[11px] text-dim uppercase tracking-wider mb-0.5">
                      Amount Description
                    </p>
                    <p className="text-[13px] text-text leading-relaxed">
                      {selected.amount_description}
                    </p>
                  </div>
                )}
              </div>
            </DetailSection>

            {/* Application */}
            <DetailSection title="Application">
              <div className="space-y-3">
                {selected.application_url && (
                  <div>
                    <p className="text-[11px] text-dim uppercase tracking-wider mb-0.5">
                      Application URL
                    </p>
                    <a
                      href={selected.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[13px] text-accent hover:underline break-all"
                    >
                      {selected.application_url}
                    </a>
                  </div>
                )}
                {selected.contact_email && (
                  <div>
                    <p className="text-[11px] text-dim uppercase tracking-wider mb-0.5">
                      Contact Email
                    </p>
                    <a
                      href={`mailto:${selected.contact_email}`}
                      className="text-[13px] text-accent hover:underline"
                    >
                      {selected.contact_email}
                    </a>
                  </div>
                )}
                {!selected.application_url && !selected.contact_email && (
                  <p className="text-[12px] text-dim">
                    No application information available.
                  </p>
                )}
              </div>
            </DetailSection>

            {/* Award (only if awarded) */}
            {(selected.awarded_to || selected.awarded_investment_id) && (
              <DetailSection title="Award">
                <div className="space-y-3">
                  {selected.awarded_to && (
                    <div>
                      <p className="text-[11px] text-dim uppercase tracking-wider mb-0.5">
                        Awarded To
                      </p>
                      <p className="text-[13px] text-text">
                        {selected.awarded_to}
                      </p>
                    </div>
                  )}
                  {selected.awarded_investment_id &&
                    investmentMap[selected.awarded_investment_id] && (
                      <div>
                        <p className="text-[11px] text-dim uppercase tracking-wider mb-0.5">
                          Linked Investment
                        </p>
                        <p className="text-[13px] text-accent">
                          {
                            investmentMap[selected.awarded_investment_id]
                              .initiative_name
                          }
                        </p>
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
                {selected.submitted_by && (
                  <p>Submitted by: {selected.submitted_by}</p>
                )}
                <p>
                  Submitted externally:{" "}
                  {selected.submitted_externally ? "Yes" : "No"}
                </p>
              </div>
            </DetailSection>
          </>
        )}
      </DetailPanel>
    </>
  );
}

/* ── Card sub-component ──────────────────────────────── */

function OpportunityCard({
  opportunity,
  selected,
  onClick,
}: {
  opportunity: Opportunity;
  selected: boolean;
  onClick: () => void;
}) {
  const amount = formatAmountRange(
    opportunity.amount_min,
    opportunity.amount_max
  );

  return (
    <GridCard
      onClick={onClick}
      selected={selected}
      aspect="portrait"
    >
      {/* Type badge */}
      <div className="mb-3">
        <span className="text-[11px] uppercase text-accent bg-accent-glow border border-border-accent px-2 py-0.5 rounded">
          {OPPORTUNITY_TYPE_LABELS[opportunity.opportunity_type] ||
            opportunity.opportunity_type}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-[15px] font-medium text-text leading-snug">
        {opportunity.title}
      </h3>

      {/* Source */}
      {opportunity.source_name && (
        <p className="text-[12px] text-muted mt-1">
          {opportunity.source_name}
        </p>
      )}

      {/* Amount range */}
      {amount && (
        <p className="font-mono text-[14px] font-medium text-accent mt-2">
          {amount}
        </p>
      )}

      {/* Days remaining */}
      {opportunity.deadline && (
        <div className="mt-2">
          <DaysRemaining deadline={opportunity.deadline} />
        </div>
      )}

      {/* Description preview */}
      {opportunity.description && (
        <p className="text-[12px] text-muted mt-3 leading-relaxed line-clamp-2">
          {opportunity.description}
        </p>
      )}
    </GridCard>
  );
}
