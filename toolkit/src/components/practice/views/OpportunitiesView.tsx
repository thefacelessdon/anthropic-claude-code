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
import { formatCurrency, formatDate, daysUntil } from "@/lib/utils/formatting";
import {
  OPPORTUNITY_STATUS_LABELS,
  OPPORTUNITY_TYPE_LABELS,
} from "@/lib/utils/constants";
import type { Opportunity } from "@/lib/supabase/types";

/* ── Helpers ───────────────────────────────────────────── */

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
    return `${formatCurrency(min)} \u2013 ${formatCurrency(max)}`;
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

/** Short countdown for card row 2 — e.g. "Due Mar 15 (27d)" */
function DeadlineCompact({ deadline }: { deadline: string | null }) {
  if (!deadline) return null;
  const days = daysUntil(deadline);
  const dateStr = new Date(deadline).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  let countdownColor = "text-muted";
  if (days !== null && days <= 14) countdownColor = "text-status-red";
  else if (days !== null && days <= 30) countdownColor = "text-status-orange";

  const countdownText =
    days === null
      ? ""
      : days <= 0
        ? "(Past)"
        : `(${days}d)`;

  return (
    <span className="font-mono text-[13px]">
      <span className="text-muted">Due {dateStr}</span>{" "}
      <span className={countdownColor}>{countdownText}</span>
    </span>
  );
}

/* ── Label style ───────────────────────────────────────── */

const labelClass = "text-[11px] font-semibold text-dim uppercase tracking-[0.06em]";

/* ── Props ─────────────────────────────────────────────── */

interface OpportunitiesViewProps {
  opportunities: Opportunity[];
  investmentMap: Record<string, { id: string; initiative_name: string }>;
}

/* ── Main View ─────────────────────────────────────────── */

export function OpportunitiesView({
  opportunities,
  investmentMap,
}: OpportunitiesViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const openId = searchParams.get("open");
    if (openId) setSelectedId(openId);
  }, [searchParams]);

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
          <CardList>
            {closingSoon.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                selected={selectedId === opp.id}
                onClick={() => setSelectedId(opp.id)}
              />
            ))}
          </CardList>
        </div>
      )}

      {/* ── Open ────────────────────────────────────────── */}
      {open.length > 0 && (
        <div className="mb-8">
          <h2 className="font-display text-base font-semibold text-text mb-4">
            Open
          </h2>
          <CardList>
            {open.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                selected={selectedId === opp.id}
                onClick={() => setSelectedId(opp.id)}
              />
            ))}
          </CardList>
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
            {/* Entity Details */}
            <DetailSection title="Details">
              <div className="space-y-3">
                {selected.source_name && (
                  <div>
                    <p className={`${labelClass} mb-0.5`}>Source</p>
                    <p className="text-[13px] text-text">
                      {selected.source_name}
                    </p>
                  </div>
                )}
                {selected.deadline && (
                  <div>
                    <p className={`${labelClass} mb-0.5`}>Deadline</p>
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
                    <p className={`${labelClass} mb-0.5`}>Description</p>
                    <p className="text-[13px] text-text leading-relaxed">
                      {selected.description}
                    </p>
                  </div>
                )}
                {selected.eligibility && (
                  <div>
                    <p className={`${labelClass} mb-0.5`}>Eligibility</p>
                    <p className="text-[13px] text-text leading-relaxed">
                      {selected.eligibility}
                    </p>
                  </div>
                )}
                {selected.amount_description && (
                  <div>
                    <p className={`${labelClass} mb-0.5`}>Amount Description</p>
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
                    <p className={`${labelClass} mb-0.5`}>Application URL</p>
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
                    <p className={`${labelClass} mb-0.5`}>Contact Email</p>
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
                      <p className={`${labelClass} mb-0.5`}>Awarded To</p>
                      <p className="text-[13px] text-text">
                        {selected.awarded_to}
                      </p>
                    </div>
                  )}
                  {selected.awarded_investment_id &&
                    investmentMap[selected.awarded_investment_id] && (
                      <div>
                        <p className={`${labelClass} mb-0.5`}>
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

            {/* Across the Toolkit */}
            {(selected.source_name ||
              (selected.awarded_investment_id &&
                investmentMap[selected.awarded_investment_id])) && (
              <DetailSection title="Across the Toolkit">
                <div className="space-y-2">
                  {selected.source_name && (
                    <InlineRefCard
                      title={selected.source_name}
                      subtitle="Source organization"
                      accentColor="green"
                    />
                  )}
                  {selected.awarded_investment_id &&
                    investmentMap[selected.awarded_investment_id] && (
                      <InlineRefCard
                        title={
                          investmentMap[selected.awarded_investment_id]
                            .initiative_name
                        }
                        subtitle="Linked investment"
                        accentColor="gold"
                      />
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
    <ListCard onClick={onClick} selected={selected}>
      {/* Row 1: Type + Status badges (left) | Amount (right) */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase text-accent bg-accent-glow border border-border-accent px-2 py-0.5 rounded">
            {OPPORTUNITY_TYPE_LABELS[opportunity.opportunity_type] ||
              opportunity.opportunity_type}
          </span>
          <StatusBadge
            label={
              OPPORTUNITY_STATUS_LABELS[opportunity.status] ||
              opportunity.status
            }
            color={statusColor(opportunity.status)}
          />
        </div>
        {amount && (
          <span className="font-mono text-[16px] font-semibold text-text shrink-0">
            {amount}
          </span>
        )}
      </div>

      {/* Row 2: Deadline + countdown (right-aligned) */}
      {opportunity.deadline && (
        <div className="flex justify-end mt-1">
          <DeadlineCompact deadline={opportunity.deadline} />
        </div>
      )}

      {/* Title */}
      <h3 className="font-display text-[16px] font-semibold text-text leading-snug mt-2">
        {opportunity.title}
      </h3>

      {/* Description preview — 2-line max */}
      {opportunity.description && (
        <p className="text-[13px] text-muted mt-1.5 leading-relaxed line-clamp-2">
          {opportunity.description}
        </p>
      )}

      {/* Eligibility — always visible */}
      {opportunity.eligibility && (
        <p className="text-[12px] text-dim mt-2">
          Eligibility: {opportunity.eligibility}
        </p>
      )}
    </ListCard>
  );
}
