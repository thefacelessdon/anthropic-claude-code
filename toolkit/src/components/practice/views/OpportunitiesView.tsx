"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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

/* ── Cross-tool types ─────────────────────────────────── */

interface InvSummary {
  id: string;
  source_org_id: string | null;
  source_name: string | null;
  initiative_name: string;
  amount: number | null;
  status: string;
  compounding: string;
}

interface OppRef {
  id: string;
  title: string;
  status: string;
  deadline: string | null;
}

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

/** Priority 1: single amount when min=max, fallback to description */
function formatAmountRange(min: number | null, max: number | null): string | null {
  if (min === null && max === null) return null;
  if (min === null) return `Up to ${formatCurrency(max)}`;
  if (max === null) return `From ${formatCurrency(min)}`;
  if (min === max) return formatCurrency(min);
  return `${formatCurrency(min)} \u2013 ${formatCurrency(max)}`;
}

function formatAmountShort(amount: number | null): string {
  if (amount === null) return "\u2014";
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount}`;
}

/** Priority 9: 4-tier deadline countdown */
function deadlineColorClass(days: number | null): string {
  if (days === null) return "text-muted";
  if (days <= 7) return "text-status-red font-bold";
  if (days <= 14) return "text-status-red";
  if (days <= 30) return "text-status-orange";
  return "text-muted";
}

/** Priority 7: distinct color per opportunity type */
function typeBadgeClasses(type: string): string {
  const map: Record<string, string> = {
    grant: "text-status-green border-status-green bg-status-green/10",
    rfp: "text-status-blue border-status-blue bg-status-blue/10",
    commission: "text-accent border-accent bg-accent/10",
    residency: "text-status-purple border-status-purple bg-status-purple/10",
    fellowship: "text-status-orange border-status-orange bg-status-orange/10",
    project: "text-muted border-border-medium bg-surface-inset",
    program: "text-muted border-border-medium bg-surface-inset",
  };
  return map[type] || "text-accent border-border-accent bg-accent-glow";
}

const COMPOUNDING_LABELS: Record<string, string> = {
  compounding: "Compounding",
  not_compounding: "Not compounding",
  too_early: "Too early to tell",
  unknown: "Unknown",
};

function DaysRemaining({ deadline }: { deadline: string | null }) {
  const days = daysUntil(deadline);
  if (days === null) return null;
  return (
    <span className={`font-mono text-[12px] ${deadlineColorClass(days)}`}>
      {days <= 0 ? "Past deadline" : `${days}d remaining`}
    </span>
  );
}

function DeadlineCompact({ deadline }: { deadline: string | null }) {
  if (!deadline) return null;
  const days = daysUntil(deadline);
  const dateStr = new Date(deadline).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const countdownText =
    days === null ? "" : days <= 0 ? "(Past)" : `(${days}d)`;
  return (
    <span className="font-mono text-[13px]">
      <span className="text-muted">Due {dateStr}</span>{" "}
      <span className={deadlineColorClass(days)}>{countdownText}</span>
    </span>
  );
}

const labelClass = "text-[11px] font-semibold text-dim uppercase tracking-[0.06em]";

/* ── Interest types ────────────────────────────────────── */

interface InterestRecord {
  id: string;
  opportunity_id: string;
  profile_id: string | null;
  practitioner_name: string | null;
  practitioner_email: string | null;
  practitioner_discipline: string | null;
  notes: string | null;
  status: string;
  created_at: string;
}

const INTEREST_STATUS_LABELS: Record<string, string> = {
  expressed: "Expressed",
  applied: "Applied",
  awarded: "Awarded",
  not_awarded: "Not selected",
  withdrew: "Withdrew",
  did_not_apply: "Did not apply",
};

const INTEREST_STATUS_COLORS: Record<string, string> = {
  expressed: "text-muted",
  applied: "text-status-blue",
  awarded: "text-status-green",
  not_awarded: "text-status-red",
  withdrew: "text-dim",
  did_not_apply: "text-dim",
};

/* ── Props ─────────────────────────────────────────────── */

interface OpportunitiesViewProps {
  opportunities: Opportunity[];
  investmentMap: Record<string, InvSummary>;
  investmentsByOrg: Record<string, InvSummary[]>;
  oppsByOrg: Record<string, OppRef[]>;
  interestsByOpp?: Record<string, InterestRecord[]>;
}

type TabKey = "open" | "closing_soon" | "closed";

const TAB_LABELS: Record<TabKey, string> = {
  open: "Open",
  closing_soon: "Closing Soon",
  closed: "Closed & Awarded",
};

/* ── Main View ─────────────────────────────────────────── */

export function OpportunitiesView({
  opportunities,
  investmentMap,
  investmentsByOrg,
  oppsByOrg,
  interestsByOpp = {},
}: OpportunitiesViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("open");
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const openId = searchParams.get("open");
    if (openId) setSelectedId(openId);
  }, [searchParams]);

  const navigateTo = useCallback(
    (path: string) => router.push(path),
    [router]
  );

  const selected = selectedId
    ? opportunities.find((o) => o.id === selectedId) ?? null
    : null;

  const closingSoon = opportunities.filter((o) => o.status === "closing_soon");
  const open = opportunities.filter((o) => o.status === "open");
  const closed = opportunities.filter(
    (o) => o.status === "closed" || o.status === "awarded"
  );

  const tabCounts: Record<TabKey, number> = {
    open: open.length,
    closing_soon: closingSoon.length,
    closed: closed.length,
  };

  const amountRange = selected
    ? formatAmountRange(selected.amount_min, selected.amount_max)
    : null;

  const hasApplicationInfo = selected
    ? !!(selected.application_url || selected.contact_email)
    : false;

  return (
    <>
      {/* Priority 3: Tab bar */}
      <div className="flex items-center gap-1 mb-6">
        {(["open", "closing_soon", "closed"] as TabKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors ${
              tab === key
                ? "bg-surface-inset text-text"
                : "text-muted hover:text-text"
            }`}
          >
            {TAB_LABELS[key]}
            <span className="ml-1.5 text-[11px] text-dim bg-surface-inset px-1.5 py-0.5 rounded font-mono">
              {tabCounts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* Open tab */}
      {tab === "open" && (
        <CardList>
          {open.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              selected={selectedId === opp.id}
              onClick={() => setSelectedId(opp.id)}
              onOrgClick={
                opp.source_org_id
                  ? () => navigateTo(`/ecosystem-map?open=${opp.source_org_id}`)
                  : undefined
              }
            />
          ))}
        </CardList>
      )}

      {/* Closing Soon tab */}
      {tab === "closing_soon" && (
        <CardList>
          {closingSoon.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              selected={selectedId === opp.id}
              onClick={() => setSelectedId(opp.id)}
              onOrgClick={
                opp.source_org_id
                  ? () => navigateTo(`/ecosystem-map?open=${opp.source_org_id}`)
                  : undefined
              }
            />
          ))}
        </CardList>
      )}

      {/* Closed & Awarded tab */}
      {tab === "closed" && (
        <div className="space-y-1">
          {closed.map((opp) => {
            const linkedInv = opp.awarded_investment_id
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
                <span
                  className={`text-[11px] uppercase px-2 py-0.5 rounded border ${typeBadgeClasses(
                    opp.opportunity_type
                  )}`}
                >
                  {OPPORTUNITY_TYPE_LABELS[opp.opportunity_type] ||
                    opp.opportunity_type}
                </span>
                <span className="text-[13px] text-text truncate flex-1 min-w-0">
                  {opp.title}
                </span>
                {opp.source_name && (
                  <span className="text-[12px] text-muted shrink-0">
                    {opp.source_name}
                  </span>
                )}
                <StatusBadge
                  label={OPPORTUNITY_STATUS_LABELS[opp.status] || opp.status}
                  color={statusColor(opp.status)}
                />
                {opp.awarded_to && (
                  <span className="text-[12px] text-muted shrink-0">
                    {opp.awarded_to}
                  </span>
                )}
                {linkedInv && (
                  <span
                    className="text-[12px] text-accent shrink-0 cursor-pointer hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateTo(`/investments?open=${linkedInv.id}`);
                    }}
                  >
                    &rarr; {linkedInv.initiative_name}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Panel */}
      <DetailPanel
        isOpen={!!selected}
        onClose={() => setSelectedId(null)}
        title={selected?.title}
        subtitle={
          selected && (
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[11px] uppercase px-2 py-0.5 rounded border ${typeBadgeClasses(
                  selected.opportunity_type
                )}`}
              >
                {OPPORTUNITY_TYPE_LABELS[selected.opportunity_type] ||
                  selected.opportunity_type}
              </span>
              <StatusBadge
                label={OPPORTUNITY_STATUS_LABELS[selected.status] || selected.status}
                color={statusColor(selected.status)}
              />
              {amountRange && (
                <span className="font-mono text-[14px] font-medium text-accent">
                  {amountRange}
                </span>
              )}
              {!amountRange && selected.amount_description && (
                <span className="text-[13px] text-muted">
                  {selected.amount_description}
                </span>
              )}
            </div>
          )
        }
        backLabel="Back to opportunities"
      >
        {selected && (
          <>
            {/* Priority 5: no "Details" heading — self-labelled fields */}
            <div className="space-y-3 px-6 pt-2">
              {selected.source_name && (
                <div>
                  <p className={`${labelClass} mb-0.5`}>Source</p>
                  {selected.source_org_id ? (
                    <p
                      className="text-[13px] text-text cursor-pointer hover:text-accent transition-colors"
                      onClick={() =>
                        navigateTo(`/ecosystem-map?open=${selected.source_org_id}`)
                      }
                    >
                      {selected.source_name}
                    </p>
                  ) : (
                    <p className="text-[13px] text-text">{selected.source_name}</p>
                  )}
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
              {(amountRange || selected.amount_description) && (
                <div>
                  <p className={`${labelClass} mb-0.5`}>Amount</p>
                  {amountRange && (
                    <p className="text-[13px] text-text font-mono">{amountRange}</p>
                  )}
                  {selected.amount_description && (
                    <p className="text-[12px] text-muted mt-0.5">
                      {selected.amount_description}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Priority 4: Application — only if content exists */}
            {hasApplicationInfo && (
              <DetailSection title="Application">
                <div className="space-y-3">
                  {selected.application_url && (
                    <a
                      href={selected.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[13px] text-accent hover:underline break-all"
                    >
                      Apply here &rarr;
                    </a>
                  )}
                  {selected.contact_email && (
                    <div>
                      <p className={`${labelClass} mb-0.5`}>Contact</p>
                      <a
                        href={`mailto:${selected.contact_email}`}
                        className="text-[13px] text-accent hover:underline"
                      >
                        {selected.contact_email}
                      </a>
                    </div>
                  )}
                </div>
              </DetailSection>
            )}

            {/* Award */}
            {(selected.awarded_to || selected.awarded_investment_id) && (
              <DetailSection title="Award">
                <div className="space-y-3">
                  {selected.awarded_to && (
                    <div>
                      <p className={`${labelClass} mb-0.5`}>Awarded To</p>
                      <p className="text-[13px] text-text">{selected.awarded_to}</p>
                    </div>
                  )}
                  {selected.awarded_investment_id &&
                    investmentMap[selected.awarded_investment_id] && (
                      <div>
                        <p className={`${labelClass} mb-0.5`}>
                          This opportunity became
                        </p>
                        <InlineRefCard
                          title={
                            investmentMap[selected.awarded_investment_id]
                              .initiative_name
                          }
                          subtitle={`${investmentMap[selected.awarded_investment_id].source_name || "\u2014"} \u00b7 ${formatAmountShort(investmentMap[selected.awarded_investment_id].amount)} \u00b7 ${investmentMap[selected.awarded_investment_id].status}`}
                          accentColor="gold"
                          onClick={() =>
                            navigateTo(
                              `/investments?open=${selected.awarded_investment_id}`
                            )
                          }
                        />
                      </div>
                    )}
                </div>
              </DetailSection>
            )}

            {/* Engagement — Interest Tracking */}
            {(() => {
              const interests = interestsByOpp[selected.id] || [];
              if (interests.length === 0) return null;

              const applied = interests.filter(
                (i) => i.status === "applied" || i.status === "awarded" || i.status === "not_awarded"
              ).length;
              const awarded = interests.filter((i) => i.status === "awarded").length;
              const notSelected = interests.filter((i) => i.status === "not_awarded").length;
              const pending = interests.filter((i) => i.status === "expressed").length;

              return (
                <DetailSection title="Engagement">
                  <div className="space-y-4">
                    {/* Summary stats */}
                    <div className="text-[13px] text-text leading-relaxed">
                      <span className="font-mono font-semibold">{interests.length}</span>{" "}
                      practitioner{interests.length !== 1 ? "s" : ""} expressed interest
                      {applied > 0 && (
                        <>
                          {" \u00b7 "}
                          <span className="font-mono">{applied}</span> applied
                        </>
                      )}
                      {awarded > 0 && (
                        <>
                          {" \u00b7 "}
                          <span className="font-mono text-status-green">{awarded}</span> awarded
                        </>
                      )}
                      {notSelected > 0 && (
                        <>
                          {" \u00b7 "}
                          <span className="font-mono">{notSelected}</span> not selected
                        </>
                      )}
                      {pending > 0 && (
                        <>
                          {" \u00b7 "}
                          <span className="font-mono">{pending}</span> pending
                        </>
                      )}
                    </div>

                    {/* Individual interest records */}
                    <div className="space-y-2">
                      {interests.map((interest) => (
                        <div
                          key={interest.id}
                          className="bg-surface-inset rounded-md px-3 py-2.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[13px] text-text font-medium truncate">
                              {interest.practitioner_name || "Anonymous"}
                            </span>
                            <span
                              className={`text-[11px] font-mono ${
                                INTEREST_STATUS_COLORS[interest.status] || "text-dim"
                              }`}
                            >
                              {INTEREST_STATUS_LABELS[interest.status] || interest.status}
                            </span>
                          </div>
                          {interest.practitioner_discipline && (
                            <p className="text-[12px] text-muted mt-0.5">
                              {interest.practitioner_discipline}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] text-dim font-mono">
                              {new Date(interest.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          {interest.notes && (
                            <p className="text-[12px] text-muted mt-1.5 italic leading-relaxed">
                              &ldquo;{interest.notes}&rdquo;
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </DetailSection>
              );
            })()}

            {/* Priority 6: Enriched Across the Toolkit */}
            {(() => {
              const orgId = selected.source_org_id;
              const orgName = selected.source_name;
              const orgInvs = orgId
                ? (investmentsByOrg[orgId] || []).slice(0, 5)
                : [];
              const otherOpps = orgId
                ? (oppsByOrg[orgId] || []).filter(
                    (o) =>
                      o.id !== selected.id &&
                      (o.status === "open" || o.status === "closing_soon")
                  )
                : [];
              const awardedInv = selected.awarded_investment_id
                ? investmentMap[selected.awarded_investment_id]
                : null;

              const hasContent =
                orgName || otherOpps.length > 0 || orgInvs.length > 0 || awardedInv;
              if (!hasContent) return null;

              return (
                <DetailSection
                  title="Across the Toolkit"
                  subtitle="Connected data from other tools"
                >
                  <div className="space-y-5">
                    {orgName && (
                      <div>
                        <p className={`${labelClass} mb-2`}>Source Organization</p>
                        <InlineRefCard
                          title={orgName}
                          subtitle="Organization"
                          accentColor="gold"
                          onClick={
                            orgId
                              ? () => navigateTo(`/ecosystem-map?open=${orgId}`)
                              : undefined
                          }
                        />
                      </div>
                    )}

                    {otherOpps.length > 0 && (
                      <div>
                        <p className={`${labelClass} mb-2`}>Also from {orgName}</p>
                        <div className="space-y-2">
                          {otherOpps.map((o) => (
                            <InlineRefCard
                              key={o.id}
                              title={o.title}
                              subtitle={`${OPPORTUNITY_STATUS_LABELS[o.status] || o.status}${
                                o.deadline
                                  ? ` \u00b7 Due ${new Date(o.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                                  : ""
                              }`}
                              accentColor="green"
                              onClick={() => setSelectedId(o.id)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {orgInvs.length > 0 && (
                      <div>
                        <p className={`${labelClass} mb-2`}>
                          What {orgName} has invested
                        </p>
                        <div className="space-y-2">
                          {orgInvs.map((inv) => (
                            <InlineRefCard
                              key={inv.id}
                              title={inv.initiative_name}
                              subtitle={`${formatAmountShort(inv.amount)} \u00b7 ${COMPOUNDING_LABELS[inv.compounding] || inv.compounding}`}
                              accentColor="gold"
                              onClick={() =>
                                navigateTo(`/investments?open=${inv.id}`)
                              }
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {awardedInv && (
                      <div>
                        <p className={`${labelClass} mb-2`}>
                          This opportunity became
                        </p>
                        <InlineRefCard
                          title={awardedInv.initiative_name}
                          subtitle={`${awardedInv.source_name || "\u2014"} \u00b7 ${formatAmountShort(awardedInv.amount)} \u00b7 ${awardedInv.status}`}
                          accentColor="gold"
                          onClick={() =>
                            navigateTo(`/investments?open=${awardedInv.id}`)
                          }
                        />
                      </div>
                    )}
                  </div>
                </DetailSection>
              );
            })()}

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
                {selected.submitted_externally && (
                  <p>Submitted externally: Yes</p>
                )}
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
  onOrgClick,
}: {
  opportunity: Opportunity;
  selected: boolean;
  onClick: () => void;
  onOrgClick?: () => void;
}) {
  const amount = formatAmountRange(opportunity.amount_min, opportunity.amount_max);

  return (
    <ListCard onClick={onClick} selected={selected}>
      {/* Row 1: Type + Status (left) | Amount (right) */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={`text-[11px] uppercase px-2 py-0.5 rounded border ${typeBadgeClasses(
              opportunity.opportunity_type
            )}`}
          >
            {OPPORTUNITY_TYPE_LABELS[opportunity.opportunity_type] ||
              opportunity.opportunity_type}
          </span>
          <StatusBadge
            label={OPPORTUNITY_STATUS_LABELS[opportunity.status] || opportunity.status}
            color={statusColor(opportunity.status)}
          />
        </div>
        {amount ? (
          <span className="font-mono text-[16px] font-semibold text-text shrink-0">
            {amount}
          </span>
        ) : opportunity.amount_description ? (
          <span className="text-[13px] text-muted shrink-0">
            {opportunity.amount_description}
          </span>
        ) : null}
      </div>

      {/* Row 2: Deadline */}
      {opportunity.deadline && (
        <div className="flex justify-end mt-1">
          <DeadlineCompact deadline={opportunity.deadline} />
        </div>
      )}

      {/* Title */}
      <h3 className="font-display text-[16px] font-semibold text-text leading-snug mt-2">
        {opportunity.title}
      </h3>

      {/* Priority 2: Source org — clickable if org link exists */}
      {opportunity.source_name && (
        <p
          className={`text-[13px] text-muted mt-0.5${
            onOrgClick ? " cursor-pointer hover:text-accent transition-colors" : ""
          }`}
          onClick={
            onOrgClick
              ? (e) => {
                  e.stopPropagation();
                  onOrgClick();
                }
              : undefined
          }
        >
          {opportunity.source_name}
        </p>
      )}

      {/* Description — 2-line max */}
      {opportunity.description && (
        <p className="text-[13px] text-muted mt-1.5 leading-relaxed line-clamp-2">
          {opportunity.description}
        </p>
      )}

      {/* Priority 8: Eligibility — border-top separator */}
      {opportunity.eligibility && (
        <div className="mt-3 pt-2 border-t border-border">
          <p className="text-[12px] text-dim">
            <span className="font-semibold text-muted">Eligibility:</span>{" "}
            {opportunity.eligibility}
          </p>
        </div>
      )}
    </ListCard>
  );
}
