"use client";

import { useState } from "react";
import { CardGrid, GridCard } from "@/components/ui/CardGrid";
import { DetailPanel, DetailSection } from "@/components/ui/DetailPanel";
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

  const org = selectedOrg ? organizations.find((o) => o.id === selectedOrg) : null;
  const practitioner = selectedPractitioner
    ? practitioners.find((p) => p.id === selectedPractitioner)
    : null;

  return (
    <>
      {/* Tab-style section headers */}
      <div className="flex items-center gap-1 border-b border-border">
        <a href="#orgs" className="px-4 py-2.5 text-sm font-medium text-text border-b-2 border-accent">
          Organizations
          <span className="ml-1.5 text-[11px] text-dim font-mono">{organizations.length}</span>
        </a>
        <a href="#practitioners" className="px-4 py-2.5 text-sm font-medium text-muted hover:text-text transition-colors">
          Practitioners
          <span className="ml-1.5 text-[11px] text-dim font-mono">{practitioners.length}</span>
        </a>
      </div>

      {/* Organizations Grid */}
      <div id="orgs">
        <CardGrid columns={3}>
          {organizations.map((o) => {
            const counts = orgConnectionCounts[o.id] || { investments: 0, decisions: 0, opportunities: 0 };
            const hasConnections = counts.investments > 0 || counts.decisions > 0 || counts.opportunities > 0;

            return (
              <GridCard
                key={o.id}
                onClick={() => { setSelectedOrg(o.id); setSelectedPractitioner(null); }}
                selected={selectedOrg === o.id}
              >
                {/* Type badge */}
                <div className="mb-3">
                  <StatusBadge
                    label={ORG_TYPE_LABELS[o.org_type] || o.org_type}
                    color="dim"
                  />
                </div>

                {/* Name */}
                <h3 className="text-[15px] font-medium text-text leading-snug">
                  {o.name}
                </h3>

                {/* Mandate */}
                {o.mandate && (
                  <p className="text-[12px] text-muted mt-2 leading-relaxed line-clamp-3">
                    {o.mandate}
                  </p>
                )}

                {/* Controls */}
                {o.controls && (
                  <p className="text-[11px] text-dim mt-2 line-clamp-2">
                    Controls: {o.controls}
                  </p>
                )}

                {/* Connection counts */}
                {hasConnections && (
                  <div className="mt-auto pt-3 flex gap-2 flex-wrap">
                    {counts.investments > 0 && (
                      <span className="bg-surface-inset rounded px-2 py-0.5 text-[11px]">
                        <span className="font-mono font-medium text-text">{counts.investments}</span>{" "}
                        <span className="text-dim">inv</span>
                      </span>
                    )}
                    {counts.decisions > 0 && (
                      <span className="bg-surface-inset rounded px-2 py-0.5 text-[11px]">
                        <span className="font-mono font-medium text-text">{counts.decisions}</span>{" "}
                        <span className="text-dim">dec</span>
                      </span>
                    )}
                    {counts.opportunities > 0 && (
                      <span className="bg-surface-inset rounded px-2 py-0.5 text-[11px]">
                        <span className="font-mono font-medium text-text">{counts.opportunities}</span>{" "}
                        <span className="text-dim">opp</span>
                      </span>
                    )}
                  </div>
                )}
              </GridCard>
            );
          })}
        </CardGrid>
      </div>

      {/* Practitioners */}
      <div id="practitioners" className="pt-2">
        <div className="flex items-center gap-1 border-b border-border mb-6">
          <a href="#orgs" className="px-4 py-2.5 text-sm font-medium text-muted hover:text-text transition-colors">
            Organizations
            <span className="ml-1.5 text-[11px] text-dim font-mono">{organizations.length}</span>
          </a>
          <span className="px-4 py-2.5 text-sm font-medium text-text border-b-2 border-accent">
            Practitioners
            <span className="ml-1.5 text-[11px] text-dim font-mono">{practitioners.length}</span>
          </span>
        </div>

        <CardGrid columns={3}>
          {practitioners.map((p) => (
            <GridCard
              key={p.id}
              onClick={() => { setSelectedPractitioner(p.id); setSelectedOrg(null); }}
              selected={selectedPractitioner === p.id}
              aspect="square"
            >
              {/* Discipline badge */}
              {p.discipline && (
                <div className="mb-3">
                  <StatusBadge label={p.discipline} color="dim" />
                </div>
              )}

              {/* Name */}
              <h3 className="text-[15px] font-medium text-text leading-snug">
                {p.name}
              </h3>
              {p.tenure && (
                <p className="text-[12px] text-dim mt-1">{p.tenure} in NWA</p>
              )}

              {/* Retention / Risk */}
              <div className="mt-3 space-y-1.5">
                {p.retention_factors && (
                  <div className="flex items-start gap-1.5 text-[11px]">
                    <span className="text-status-green shrink-0">●</span>
                    <span className="text-muted line-clamp-2">{p.retention_factors}</span>
                  </div>
                )}
                {p.risk_factors && (
                  <div className="flex items-start gap-1.5 text-[11px]">
                    <span className="text-status-orange shrink-0">▲</span>
                    <span className="text-muted line-clamp-2">{p.risk_factors}</span>
                  </div>
                )}
              </div>
            </GridCard>
          ))}
        </CardGrid>
      </div>

      {/* Organization Detail Panel */}
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
            <DetailSection title="About">
              <div className="space-y-3">
                {org.mandate && (
                  <div>
                    <p className="text-[11px] text-dim uppercase tracking-wider mb-0.5">Mandate</p>
                    <p className="text-[13px] text-text leading-relaxed">{org.mandate}</p>
                  </div>
                )}
                {org.controls && (
                  <div>
                    <p className="text-[11px] text-dim uppercase tracking-wider mb-0.5">Controls</p>
                    <p className="text-[13px] text-text leading-relaxed">{org.controls}</p>
                  </div>
                )}
                {org.constraints && (
                  <div>
                    <p className="text-[11px] text-dim uppercase tracking-wider mb-0.5">Constraints</p>
                    <p className="text-[13px] text-text leading-relaxed">{org.constraints}</p>
                  </div>
                )}
                {org.decision_cycle && (
                  <div>
                    <p className="text-[11px] text-dim uppercase tracking-wider mb-0.5">Decision Cycle</p>
                    <p className="text-[13px] text-text">{org.decision_cycle}</p>
                  </div>
                )}
                {org.website && (
                  <div>
                    <p className="text-[11px] text-dim uppercase tracking-wider mb-0.5">Website</p>
                    <p className="text-[13px] text-accent">{org.website}</p>
                  </div>
                )}
                {org.notes && (
                  <div>
                    <p className="text-[11px] text-dim uppercase tracking-wider mb-0.5">Notes</p>
                    <p className="text-[13px] text-text leading-relaxed">{org.notes}</p>
                  </div>
                )}
              </div>
            </DetailSection>

            {/* Across the Toolkit */}
            {(() => {
              const counts = orgConnectionCounts[org.id] || { investments: 0, decisions: 0, opportunities: 0 };
              const hasConnections = counts.investments > 0 || counts.decisions > 0 || counts.opportunities > 0;
              if (!hasConnections) return null;
              return (
                <DetailSection title="Across the Toolkit" subtitle="How this organization appears elsewhere">
                  <div className="space-y-2 text-[13px] text-muted">
                    {counts.investments > 0 && (
                      <p>{counts.investments} investment{counts.investments !== 1 ? "s" : ""} sourced from this organization</p>
                    )}
                    {counts.decisions > 0 && (
                      <p>{counts.decisions} decision{counts.decisions !== 1 ? "s" : ""} where this organization is a stakeholder</p>
                    )}
                    {counts.opportunities > 0 && (
                      <p>{counts.opportunities} opportunit{counts.opportunities !== 1 ? "ies" : "y"} from this organization</p>
                    )}
                  </div>
                </DetailSection>
              );
            })()}

            <DetailSection title="Record">
              <div className="space-y-1 text-[12px] text-dim">
                <p>Created: {formatDate(org.created_at)}</p>
                <p>Last reviewed: {org.last_reviewed_at ? formatDate(org.last_reviewed_at) : "Never"}</p>
              </div>
            </DetailSection>
          </>
        )}
      </DetailPanel>

      {/* Practitioner Detail Panel */}
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
            <DetailSection title="Profile">
              <div className="space-y-3">
                {practitioner.tenure && (
                  <div>
                    <p className="text-[11px] text-dim uppercase tracking-wider mb-0.5">Tenure</p>
                    <p className="text-[13px] text-text">{practitioner.tenure} in NWA</p>
                  </div>
                )}
                {practitioner.income_sources && (
                  <div>
                    <p className="text-[11px] text-dim uppercase tracking-wider mb-0.5">Income Sources</p>
                    <p className="text-[13px] text-text leading-relaxed">{practitioner.income_sources}</p>
                  </div>
                )}
                {practitioner.institutional_affiliations && (
                  <div>
                    <p className="text-[11px] text-dim uppercase tracking-wider mb-0.5">Affiliations</p>
                    <p className="text-[13px] text-text leading-relaxed">{practitioner.institutional_affiliations}</p>
                  </div>
                )}
              </div>
            </DetailSection>

            <DetailSection title="Retention & Risk">
              <div className="space-y-3">
                {practitioner.retention_factors && (
                  <div className="bg-surface-inset rounded-md px-4 py-3 border-l-2 border-status-green">
                    <p className="text-[11px] text-dim uppercase tracking-wider mb-1">What keeps them here</p>
                    <p className="text-[13px] text-text leading-relaxed">{practitioner.retention_factors}</p>
                  </div>
                )}
                {practitioner.risk_factors && (
                  <div className="bg-surface-inset rounded-md px-4 py-3 border-l-2 border-status-orange">
                    <p className="text-[11px] text-dim uppercase tracking-wider mb-1">Risk factors</p>
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
