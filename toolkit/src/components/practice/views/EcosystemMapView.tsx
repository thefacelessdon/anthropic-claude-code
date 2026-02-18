"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CardList, ListCard } from "@/components/ui/CardGrid";
import { DetailPanel, DetailSection, InlineRefCard } from "@/components/ui/DetailPanel";
import { StatusBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils/formatting";
import { ORG_TYPE_LABELS } from "@/lib/utils/constants";
import type { Organization, Practitioner } from "@/lib/supabase/types";

interface OrgConnectionCounts {
  investments: number;
  decisions: number;
  opportunities: number;
}

interface EcosystemMapViewProps {
  organizations: Organization[];
  practitioners: Practitioner[];
  orgConnectionCounts: Record<string, OrgConnectionCounts>;
}

export function EcosystemMapView({
  organizations,
  practitioners,
  orgConnectionCounts,
}: EcosystemMapViewProps) {
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [selectedPractitioner, setSelectedPractitioner] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"orgs" | "practitioners">("orgs");
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

  const org = selectedOrg ? organizations.find((o) => o.id === selectedOrg) : null;
  const practitioner = selectedPractitioner
    ? practitioners.find((p) => p.id === selectedPractitioner)
    : null;

  return (
    <>
      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-border mb-6">
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

      {/* ── Organizations ────────────────────────────────── */}
      {activeTab === "orgs" && (
        <CardList>
          {organizations.map((o) => {
            const counts = orgConnectionCounts[o.id] || { investments: 0, decisions: 0, opportunities: 0 };
            const totalConnections = counts.investments + counts.decisions + counts.opportunities;

            return (
              <ListCard
                key={o.id}
                onClick={() => { setSelectedOrg(o.id); setSelectedPractitioner(null); }}
                selected={selectedOrg === o.id}
              >
                {/* Row 1: Name left, type badge right */}
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

                {/* Controls */}
                {o.controls && (
                  <p className="text-[12px] text-dim mt-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.06em]">Controls:</span>{" "}
                    {o.controls}
                  </p>
                )}

                {/* Connection counts — the key differentiator */}
                {totalConnections > 0 && (
                  <p className="text-[12px] text-muted mt-2">
                    {[
                      counts.investments > 0 ? `${counts.investments} investment${counts.investments !== 1 ? "s" : ""}` : null,
                      counts.decisions > 0 ? `${counts.decisions} decision${counts.decisions !== 1 ? "s" : ""}` : null,
                      counts.opportunities > 0 ? `${counts.opportunities} opportunit${counts.opportunities !== 1 ? "ies" : "y"}` : null,
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
          {practitioners.map((p) => (
            <ListCard
              key={p.id}
              onClick={() => { setSelectedPractitioner(p.id); setSelectedOrg(null); }}
              selected={selectedPractitioner === p.id}
            >
              {/* Row 1: Name left, discipline right */}
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

              {/* Income */}
              {p.income_sources && (
                <p className="text-[12px] text-muted mt-1.5">
                  <span className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em]">Income:</span>{" "}
                  {p.income_sources}
                </p>
              )}

              {/* Retention + Risk — single line each */}
              <div className="mt-2 space-y-1">
                {p.retention_factors && (
                  <p className="text-[12px] truncate">
                    <span className="text-status-green">●</span>{" "}
                    <span className="text-muted">{p.retention_factors}</span>
                  </p>
                )}
                {p.risk_factors && (
                  <p className="text-[12px] truncate">
                    <span className="text-status-orange">▲</span>{" "}
                    <span className="text-muted">{p.risk_factors}</span>
                  </p>
                )}
              </div>
            </ListCard>
          ))}
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
        {org && (
          <>
            {/* Section 1: Entity Details */}
            <DetailSection title="About">
              <div className="space-y-3">
                {org.mandate && (
                  <div>
                    <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] mb-0.5">Mandate</p>
                    <p className="text-[13px] text-text leading-relaxed">{org.mandate}</p>
                  </div>
                )}
                {org.controls && (
                  <div>
                    <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] mb-0.5">Controls</p>
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
                {org.notes && (
                  <div>
                    <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] mb-0.5">Notes</p>
                    <p className="text-[13px] text-text leading-relaxed">{org.notes}</p>
                  </div>
                )}
              </div>
            </DetailSection>

            {/* Section 2: Across the Toolkit */}
            {(() => {
              const counts = orgConnectionCounts[org.id] || { investments: 0, decisions: 0, opportunities: 0 };
              const hasConnections = counts.investments > 0 || counts.decisions > 0 || counts.opportunities > 0;
              if (!hasConnections) return null;
              return (
                <DetailSection title="Across the Toolkit" subtitle="How this organization appears elsewhere">
                  <div className="space-y-2">
                    {counts.investments > 0 && (
                      <InlineRefCard
                        title={`${counts.investments} investment${counts.investments !== 1 ? "s" : ""}`}
                        subtitle="Sourced from this organization"
                        accentColor="gold"
                      />
                    )}
                    {counts.decisions > 0 && (
                      <InlineRefCard
                        title={`${counts.decisions} decision${counts.decisions !== 1 ? "s" : ""}`}
                        subtitle="Where this organization is a stakeholder"
                        accentColor="blue"
                      />
                    )}
                    {counts.opportunities > 0 && (
                      <InlineRefCard
                        title={`${counts.opportunities} opportunit${counts.opportunities !== 1 ? "ies" : "y"}`}
                        subtitle="From this organization"
                        accentColor="green"
                      />
                    )}
                  </div>
                </DetailSection>
              );
            })()}

            {/* Section 3: Record */}
            <DetailSection title="Record">
              <div className="space-y-1 text-[12px] text-dim">
                <p>Created: {formatDate(org.created_at)}</p>
                <p>Last reviewed: {org.last_reviewed_at ? formatDate(org.last_reviewed_at) : "Never"}</p>
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
          practitioner?.discipline && (
            <span className="text-[13px] text-muted">{practitioner.discipline}</span>
          )
        }
        backLabel="Back to ecosystem map"
      >
        {practitioner && (
          <>
            {/* Section 1: Profile */}
            <DetailSection title="Profile">
              <div className="space-y-3">
                {practitioner.tenure && (
                  <div>
                    <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] mb-0.5">Tenure</p>
                    <p className="text-[13px] text-text">{practitioner.tenure} in NWA</p>
                  </div>
                )}
                {practitioner.income_sources && (
                  <div>
                    <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] mb-0.5">Income Sources</p>
                    <p className="text-[13px] text-text leading-relaxed">{practitioner.income_sources}</p>
                  </div>
                )}
                {practitioner.institutional_affiliations && (
                  <div>
                    <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] mb-0.5">Affiliations</p>
                    <p className="text-[13px] text-text leading-relaxed">{practitioner.institutional_affiliations}</p>
                  </div>
                )}
              </div>
            </DetailSection>

            {/* Retention & Risk */}
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
              </div>
            </DetailSection>

            {practitioner.notes && (
              <DetailSection title="Notes">
                <p className="text-[13px] text-text leading-relaxed">{practitioner.notes}</p>
              </DetailSection>
            )}

            {/* Section 3: Record */}
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
