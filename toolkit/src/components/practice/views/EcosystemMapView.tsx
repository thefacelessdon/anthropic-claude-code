"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CardList, ListCard } from "@/components/ui/CardGrid";
import { DetailPanel, DetailSection, InlineRefCard } from "@/components/ui/DetailPanel";
import { StatusBadge } from "@/components/ui/Badge";
import { formatDate, formatCurrency, daysUntil } from "@/lib/utils/formatting";
import { ORG_TYPE_LABELS, COMPOUNDING_LABELS, GAP_LABELS, DECISION_STATUS_LABELS } from "@/lib/utils/constants";
import type {
  Organization,
  Practitioner,
  Contact,
  Investment,
  Decision,
  Opportunity,
  Narrative,
  GapLevel,
  CompoundingStatus,
  DecisionStatus,
} from "@/lib/supabase/types";

// ─── Income bar colors ──────────────────────────────
const INCOME_COLORS = [
  "#8B7E6A", // warm brown (earned/sales)
  "#A68B5B", // gold (grants)
  "#6B8E9E", // muted teal (teaching)
  "#7E8B6A", // olive (freelance)
  "#8B6A8E", // muted purple (other)
  "#6A7E8B", // slate
];

interface IncomeSegment {
  label: string;
  pct: number;
}

/** Parse "Gallery sales 30%, CACHE grants 20%, UA teaching 40%, Commissions 10%" */
function parseIncome(raw: string): IncomeSegment[] {
  const segments: IncomeSegment[] = [];
  // Try "Label XX%" pattern
  const re = /([^,]+?)\s+(\d+)%/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw)) !== null) {
    segments.push({ label: m[1].trim(), pct: parseInt(m[2], 10) });
  }
  if (segments.length > 0) return segments;
  // Fallback: comma-separated labels with no percentages — distribute evenly
  const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length > 0) {
    const even = Math.round(100 / parts.length);
    return parts.map((label) => ({ label, pct: even }));
  }
  return [];
}

function firstLine(text: string): string {
  // Split on comma or period to get the first factor
  const parts = text.split(/[,.]/).map((s) => s.trim()).filter(Boolean);
  return parts[0] || text;
}

// ─── Sort helpers ───────────────────────────────────
type OrgSort = "connected" | "alpha" | "type";
type PractitionerSort = "tenure" | "discipline" | "alpha";

function parseTenureYears(tenure: string | null): number {
  if (!tenure) return 0;
  const m = tenure.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

// ─── Types ──────────────────────────────────────────

interface OrgConnectedData {
  investments: Pick<Investment, "id" | "source_org_id" | "initiative_name" | "amount" | "compounding" | "status">[];
  decisions: Pick<Decision, "id" | "stakeholder_org_id" | "decision_title" | "status" | "locks_date">[];
  opportunities: Pick<Opportunity, "id" | "source_org_id" | "title" | "amount_min" | "amount_max" | "deadline" | "status">[];
  narratives: Pick<Narrative, "id" | "source_org_id" | "source_name" | "gap">[];
  contacts: Contact[];
}

interface EcosystemMapViewProps {
  organizations: Organization[];
  practitioners: Practitioner[];
  orgData: Record<string, OrgConnectedData>;
}

export function EcosystemMapView({
  organizations,
  practitioners,
  orgData,
}: EcosystemMapViewProps) {
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [selectedPractitioner, setSelectedPractitioner] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"orgs" | "practitioners">("orgs");
  const [orgSort, setOrgSort] = useState<OrgSort>("connected");
  const [practitionerSort, setPractitionerSort] = useState<PractitionerSort>("tenure");
  const searchParams = useSearchParams();

  useEffect(() => {
    const openId = searchParams.get("open");
    if (!openId) return;
    if (organizations.some((o) => o.id === openId)) {
      setActiveTab("orgs");
      setSelectedOrg(openId);
    } else if (practitioners.some((p) => p.id === openId)) {
      setActiveTab("practitioners");
      setSelectedPractitioner(openId);
    }
  }, [searchParams, organizations, practitioners]);

  // Connection count helper
  function totalConnections(orgId: string): number {
    const d = orgData[orgId];
    if (!d) return 0;
    return d.investments.length + d.decisions.length + d.opportunities.length + d.narratives.length;
  }

  // Sorted orgs
  const sortedOrgs = useMemo(() => {
    const copy = [...organizations];
    switch (orgSort) {
      case "connected":
        return copy.sort((a, b) => totalConnections(b.id) - totalConnections(a.id));
      case "alpha":
        return copy.sort((a, b) => a.name.localeCompare(b.name));
      case "type":
        return copy.sort((a, b) => a.org_type.localeCompare(b.org_type) || a.name.localeCompare(b.name));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizations, orgSort, orgData]);

  // Sorted practitioners
  const sortedPractitioners = useMemo(() => {
    const copy = [...practitioners];
    switch (practitionerSort) {
      case "tenure":
        return copy.sort((a, b) => parseTenureYears(b.tenure) - parseTenureYears(a.tenure));
      case "discipline":
        return copy.sort((a, b) => (a.discipline || "").localeCompare(b.discipline || "") || a.name.localeCompare(b.name));
      case "alpha":
        return copy.sort((a, b) => a.name.localeCompare(b.name));
    }
  }, [practitioners, practitionerSort]);

  const org = selectedOrg ? organizations.find((o) => o.id === selectedOrg) : null;
  const orgDetails = org ? orgData[org.id] : null;
  const practitioner = selectedPractitioner
    ? practitioners.find((p) => p.id === selectedPractitioner)
    : null;

  return (
    <>
      {/* Tab bar */}
      <div className="flex items-center justify-between border-b border-border mb-6">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("orgs")}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === "orgs"
                ? "text-text border-b-2 border-accent"
                : "text-muted hover:text-text"
            }`}
          >
            Organizations
            <span className="ml-1.5 text-[11px] text-dim font-mono">{organizations.length}</span>
          </button>
          <button
            onClick={() => setActiveTab("practitioners")}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === "practitioners"
                ? "text-text border-b-2 border-accent"
                : "text-muted hover:text-text"
            }`}
          >
            Practitioners
            <span className="ml-1.5 text-[11px] text-dim font-mono">{practitioners.length}</span>
          </button>
        </div>

        {/* Sort control */}
        <div className="flex items-center gap-2 text-[12px] text-dim pb-1">
          <span className="text-[11px] uppercase tracking-[0.04em]">Sort:</span>
          {activeTab === "orgs" ? (
            <select
              value={orgSort}
              onChange={(e) => setOrgSort(e.target.value as OrgSort)}
              className="bg-transparent text-[12px] text-muted border border-border rounded px-2 py-1 cursor-pointer"
            >
              <option value="connected">Most connected</option>
              <option value="alpha">Alphabetical</option>
              <option value="type">By type</option>
            </select>
          ) : (
            <select
              value={practitionerSort}
              onChange={(e) => setPractitionerSort(e.target.value as PractitionerSort)}
              className="bg-transparent text-[12px] text-muted border border-border rounded px-2 py-1 cursor-pointer"
            >
              <option value="tenure">By tenure</option>
              <option value="discipline">By discipline</option>
              <option value="alpha">Alphabetical</option>
            </select>
          )}
        </div>
      </div>

      {/* ── Organizations ────────────────────────────────── */}
      {activeTab === "orgs" && (
        <CardList>
          {sortedOrgs.map((o) => {
            const d = orgData[o.id] || { investments: [], decisions: [], opportunities: [], narratives: [], contacts: [] };
            const total = d.investments.length + d.decisions.length + d.opportunities.length + d.narratives.length;

            return (
              <ListCard
                key={o.id}
                onClick={() => { setSelectedOrg(o.id); setSelectedPractitioner(null); }}
                selected={selectedOrg === o.id}
              >
                {/* Row 1: Name + type badge */}
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-display text-[16px] font-semibold text-text leading-snug">
                    {o.name}
                  </h3>
                  <StatusBadge
                    label={ORG_TYPE_LABELS[o.org_type] || o.org_type}
                    color="dim"
                  />
                </div>

                {/* Mandate */}
                {o.mandate && (
                  <p className="text-[13px] text-muted mt-1 leading-relaxed line-clamp-2">
                    {o.mandate}
                  </p>
                )}

                {/* Shapes (renamed from Controls) */}
                {o.controls && (
                  <p className="text-[12px] text-dim mt-1.5 line-clamp-1">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.04em]">Shapes:</span>{" "}
                    {o.controls}
                  </p>
                )}

                {/* Connection counts */}
                {total > 0 && (
                  <p className="text-[12px] text-muted mt-2">
                    {[
                      d.investments.length > 0 ? `${d.investments.length} investment${d.investments.length !== 1 ? "s" : ""}` : null,
                      d.decisions.length > 0 ? `${d.decisions.length} decision${d.decisions.length !== 1 ? "s" : ""}` : null,
                      d.opportunities.length > 0 ? `${d.opportunities.length} opportunit${d.opportunities.length !== 1 ? "ies" : "y"}` : null,
                      d.narratives.length > 0 ? `${d.narratives.length} narrative${d.narratives.length !== 1 ? "s" : ""}` : null,
                    ].filter(Boolean).join(" · ")}
                  </p>
                )}
              </ListCard>
            );
          })}
        </CardList>
      )}

      {/* ── Practitioners ────────────────────────────────── */}
      {activeTab === "practitioners" && (
        <CardList>
          {sortedPractitioners.map((p) => {
            const segments = p.income_sources ? parseIncome(p.income_sources) : [];
            const hasBar = segments.length > 0 && segments.some((s) => s.pct > 0);

            return (
              <ListCard
                key={p.id}
                onClick={() => { setSelectedPractitioner(p.id); setSelectedOrg(null); }}
                selected={selectedPractitioner === p.id}
              >
                {/* Row 1: Name + discipline */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-[16px] font-semibold text-text leading-snug">
                      {p.name}
                    </h3>
                    {p.tenure && (
                      <p className="text-[13px] text-dim">{p.tenure} in NWA</p>
                    )}
                  </div>
                  {p.discipline && (
                    <span className="text-[13px] text-muted shrink-0">{p.discipline}</span>
                  )}
                </div>

                {/* Income bar */}
                {hasBar && (
                  <div className="mt-2">
                    <div className="flex h-[6px] rounded-[3px] overflow-hidden">
                      {segments.map((seg, i) => (
                        <div
                          key={i}
                          style={{
                            width: `${seg.pct}%`,
                            backgroundColor: INCOME_COLORS[i % INCOME_COLORS.length],
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex gap-3 mt-1 flex-wrap">
                      {segments.map((seg, i) => (
                        <span key={i} className="text-[11px] text-dim flex items-center gap-1">
                          <span
                            className="inline-block w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: INCOME_COLORS[i % INCOME_COLORS.length] }}
                          />
                          {seg.label} {seg.pct}%
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* If no parseable bar, show raw income text */}
                {!hasBar && p.income_sources && (
                  <p className="text-[12px] text-muted mt-1.5">
                    <span className="text-[11px] font-semibold text-dim uppercase tracking-[0.04em]">Income:</span>{" "}
                    {p.income_sources}
                  </p>
                )}

                {/* Retention + Risk — one line each */}
                <div className="mt-2 space-y-1">
                  {p.retention_factors && (
                    <p className="text-[12px] truncate">
                      <span className="text-status-green">●</span>{" "}
                      <span className="text-muted">{firstLine(p.retention_factors)}</span>
                    </p>
                  )}
                  {p.risk_factors && (
                    <p className="text-[12px] truncate">
                      <span className="text-status-orange">▲</span>{" "}
                      <span className="text-muted">{firstLine(p.risk_factors)}</span>
                    </p>
                  )}
                </div>

                {/* Institutional affiliations */}
                {p.institutional_affiliations && (
                  <p className="text-[11px] text-dim mt-2 truncate">
                    {p.institutional_affiliations}
                  </p>
                )}
              </ListCard>
            );
          })}
        </CardList>
      )}

      {/* ── Organization Detail Panel ────────────────────── */}
      <DetailPanel
        isOpen={!!org}
        onClose={() => setSelectedOrg(null)}
        title={org?.name}
        subtitle={
          org && (
            <StatusBadge
              label={ORG_TYPE_LABELS[org.org_type] || org.org_type}
              color="dim"
            />
          )
        }
        backLabel="Back to ecosystem map"
      >
        {org && orgDetails && (
          <>
            {/* Section 1: Profile */}
            <DetailSection title="Profile">
              <div className="space-y-3">
                {org.mandate && (
                  <div>
                    <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] mb-0.5">Mandate</p>
                    <p className="text-[13px] text-text leading-relaxed">{org.mandate}</p>
                  </div>
                )}
                {org.controls && (
                  <div>
                    <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] mb-0.5">What They Shape</p>
                    <p className="text-[13px] text-text leading-relaxed">{org.controls}</p>
                  </div>
                )}
                {org.constraints && (
                  <div>
                    <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] mb-0.5">Constraints</p>
                    <p className="text-[13px] text-text leading-relaxed">{org.constraints}</p>
                  </div>
                )}
                {org.decision_cycle && (
                  <div>
                    <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] mb-0.5">Decision Cycle</p>
                    <p className="text-[13px] text-text">{org.decision_cycle}</p>
                  </div>
                )}
                {org.website && (
                  <div>
                    <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] mb-0.5">Website</p>
                    <a href={org.website} target="_blank" rel="noopener noreferrer" className="text-[13px] text-accent hover:underline break-all">
                      {org.website}
                    </a>
                  </div>
                )}
              </div>
            </DetailSection>

            {/* Contacts */}
            {orgDetails.contacts.length > 0 && (
              <DetailSection title="Contacts" count={orgDetails.contacts.length}>
                <div className="space-y-3">
                  {orgDetails.contacts.map((c) => (
                    <div key={c.id} className="flex items-start justify-between">
                      <div>
                        <p className="text-[13px] font-semibold text-text">{c.name}</p>
                        {c.title && <p className="text-[12px] text-muted">{c.title}</p>}
                        {c.role_description && <p className="text-[12px] text-dim">{c.role_description}</p>}
                      </div>
                      {c.is_decision_maker && (
                        <StatusBadge label="Decision Maker" color="orange" />
                      )}
                    </div>
                  ))}
                </div>
              </DetailSection>
            )}

            {/* Section 2: Across the Toolkit */}
            <DetailSection title="Across the Toolkit" subtitle="Connected data from other tools">
              <div className="space-y-4">
                {/* Investments */}
                {orgDetails.investments.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] mb-2">
                      Investments ({orgDetails.investments.length})
                    </p>
                    <div className="space-y-1.5">
                      {orgDetails.investments.map((inv) => (
                        <Link key={inv.id} href={`/investments?open=${inv.id}`}>
                          <InlineRefCard
                            title={inv.initiative_name}
                            subtitle={[
                              inv.amount ? formatCurrency(inv.amount) : null,
                              COMPOUNDING_LABELS[inv.compounding as CompoundingStatus] || inv.compounding,
                            ].filter(Boolean).join(" · ")}
                            accentColor="gold"
                          />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Decisions */}
                {orgDetails.decisions.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] mb-2">
                      Decisions ({orgDetails.decisions.length})
                    </p>
                    <div className="space-y-1.5">
                      {orgDetails.decisions.map((dec) => {
                        const days = daysUntil(dec.locks_date);
                        return (
                          <Link key={dec.id} href={`/decisions?open=${dec.id}`}>
                            <InlineRefCard
                              title={dec.decision_title}
                              subtitle={[
                                DECISION_STATUS_LABELS[dec.status as DecisionStatus] || dec.status,
                                days !== null ? `Locks in ${days}d` : null,
                              ].filter(Boolean).join(" · ")}
                              accentColor="blue"
                            />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Opportunities */}
                {orgDetails.opportunities.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] mb-2">
                      Opportunities ({orgDetails.opportunities.length})
                    </p>
                    <div className="space-y-1.5">
                      {orgDetails.opportunities.map((opp) => (
                        <Link key={opp.id} href={`/opportunities?open=${opp.id}`}>
                          <InlineRefCard
                            title={opp.title}
                            subtitle={[
                              opp.amount_min && opp.amount_max
                                ? `${formatCurrency(opp.amount_min)}–${formatCurrency(opp.amount_max)}`
                                : null,
                              opp.deadline ? `Due ${formatDate(opp.deadline)}` : null,
                            ].filter(Boolean).join(" · ")}
                            accentColor="green"
                          />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Narratives */}
                {orgDetails.narratives.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] mb-2">
                      Narratives ({orgDetails.narratives.length})
                    </p>
                    <div className="space-y-1.5">
                      {orgDetails.narratives.map((n) => (
                        <Link key={n.id} href={`/narratives?open=${n.id}`}>
                          <InlineRefCard
                            title={n.source_name || "Narrative"}
                            subtitle={GAP_LABELS[n.gap as GapLevel] || n.gap}
                            accentColor={n.gap === "high" ? "red" : n.gap === "medium" ? "orange" : "green"}
                          />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {orgDetails.investments.length === 0 &&
                 orgDetails.decisions.length === 0 &&
                 orgDetails.opportunities.length === 0 &&
                 orgDetails.narratives.length === 0 && (
                  <p className="text-[13px] text-dim">No cross-toolkit connections yet.</p>
                )}
              </div>
            </DetailSection>

            {/* Section 3: Record */}
            <DetailSection title="Record">
              <div className="space-y-2">
                {org.notes && (
                  <div className="mb-3">
                    <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] mb-0.5">Notes</p>
                    <p className="text-[13px] text-text leading-relaxed">{org.notes}</p>
                  </div>
                )}
                <div className="space-y-1 text-[12px] text-dim">
                  <p>Created: {formatDate(org.created_at)}</p>
                  <p>Last reviewed: {org.last_reviewed_at ? formatDate(org.last_reviewed_at) : "Never"}</p>
                </div>
              </div>
            </DetailSection>
          </>
        )}
      </DetailPanel>

      {/* ── Practitioner Detail Panel ────────────────────── */}
      <DetailPanel
        isOpen={!!practitioner}
        onClose={() => setSelectedPractitioner(null)}
        title={practitioner?.name}
        subtitle={
          practitioner && (
            <span className="text-[13px] text-muted">
              {[practitioner.discipline, practitioner.tenure ? `${practitioner.tenure} in NWA` : null].filter(Boolean).join(" · ")}
            </span>
          )
        }
        backLabel="Back to ecosystem map"
      >
        {practitioner && (
          <>
            {/* Income Breakdown */}
            <DetailSection title="Income Breakdown">
              {(() => {
                const segments = practitioner.income_sources ? parseIncome(practitioner.income_sources) : [];
                if (segments.length === 0) {
                  return <p className="text-[13px] text-dim">No income data documented.</p>;
                }
                return (
                  <div>
                    {/* Larger bar */}
                    <div className="flex h-2 rounded overflow-hidden mb-3">
                      {segments.map((seg, i) => (
                        <div
                          key={i}
                          style={{
                            width: `${seg.pct}%`,
                            backgroundColor: INCOME_COLORS[i % INCOME_COLORS.length],
                          }}
                        />
                      ))}
                    </div>
                    {/* Labeled list */}
                    <div className="space-y-1.5">
                      {segments.map((seg, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-[13px] text-text flex items-center gap-2">
                            <span
                              className="inline-block w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: INCOME_COLORS[i % INCOME_COLORS.length] }}
                            />
                            {seg.label}
                          </span>
                          <span className="text-[13px] font-mono text-muted">{seg.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </DetailSection>

            {/* Retention & Risk — full lists */}
            <DetailSection title="Retention & Risk">
              <div className="space-y-3">
                {practitioner.retention_factors && (
                  <div className="bg-surface-inset rounded-md px-4 py-3 border-l-2 border-status-green">
                    <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] mb-1">What keeps them here</p>
                    <p className="text-[13px] text-text leading-relaxed">{practitioner.retention_factors}</p>
                  </div>
                )}
                {practitioner.risk_factors && (
                  <div className="bg-surface-inset rounded-md px-4 py-3 border-l-2 border-status-orange">
                    <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] mb-1">Risk factors</p>
                    <p className="text-[13px] text-text leading-relaxed">{practitioner.risk_factors}</p>
                  </div>
                )}
                {!practitioner.retention_factors && !practitioner.risk_factors && (
                  <p className="text-[13px] text-dim">No retention or risk data documented.</p>
                )}
              </div>
            </DetailSection>

            {/* Institutional Affiliations */}
            {practitioner.institutional_affiliations && (
              <DetailSection title="Institutional Affiliations">
                <p className="text-[13px] text-text leading-relaxed">{practitioner.institutional_affiliations}</p>
              </DetailSection>
            )}

            {/* Notes */}
            {practitioner.notes && (
              <DetailSection title="Notes">
                <p className="text-[13px] text-text leading-relaxed">{practitioner.notes}</p>
              </DetailSection>
            )}

            {/* Record */}
            <DetailSection title="Record">
              <div className="space-y-1 text-[12px] text-dim">
                <p>Created: {formatDate(practitioner.created_at)}</p>
                <p>Last reviewed: {practitioner.last_reviewed_at ? formatDate(practitioner.last_reviewed_at) : "Never"}</p>
              </div>
            </DetailSection>
          </>
        )}
      </DetailPanel>
    </>
  );
}
