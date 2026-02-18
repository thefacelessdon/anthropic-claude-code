import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { ORG_TYPE_LABELS } from "@/lib/utils/constants";
import type { Organization, Practitioner, Investment, Decision, Opportunity } from "@/lib/supabase/types";

const NWA_ECOSYSTEM_ID = "a0000000-0000-0000-0000-000000000001";

export const metadata = {
  title: "Ecosystem Map — Cultural Architecture Toolkit",
};

export default async function EcosystemMapPage() {
  const supabase = createClient();

  const [
    { data: orgs },
    { data: practitioners },
    { data: investments },
    { data: decisions },
    { data: opportunities },
  ] = await Promise.all([
    supabase.from("organizations").select("*").eq("ecosystem_id", NWA_ECOSYSTEM_ID).order("name"),
    supabase.from("practitioners").select("*").eq("ecosystem_id", NWA_ECOSYSTEM_ID).order("name"),
    supabase.from("investments").select("id, source_org_id, status").eq("ecosystem_id", NWA_ECOSYSTEM_ID),
    supabase.from("decisions").select("id, stakeholder_org_id, status").eq("ecosystem_id", NWA_ECOSYSTEM_ID),
    supabase.from("opportunities").select("id, source_org_id, status").eq("ecosystem_id", NWA_ECOSYSTEM_ID),
  ]);

  const organizations = (orgs as Organization[]) || [];
  const practitionerList = (practitioners as Practitioner[]) || [];
  const investmentList = (investments as Pick<Investment, "id" | "source_org_id" | "status">[]) || [];
  const decisionList = (decisions as Pick<Decision, "id" | "stakeholder_org_id" | "status">[]) || [];
  const opportunityList = (opportunities as Pick<Opportunity, "id" | "source_org_id" | "status">[]) || [];

  // Build connection counts per org
  const orgConnectionCounts = new Map<string, { investments: number; decisions: number; opportunities: number }>();
  organizations.forEach((org) => {
    orgConnectionCounts.set(org.id, { investments: 0, decisions: 0, opportunities: 0 });
  });
  investmentList.forEach((inv) => {
    if (inv.source_org_id) {
      const counts = orgConnectionCounts.get(inv.source_org_id);
      if (counts) counts.investments++;
    }
  });
  decisionList.forEach((dec) => {
    if (dec.stakeholder_org_id) {
      const counts = orgConnectionCounts.get(dec.stakeholder_org_id);
      if (counts) counts.decisions++;
    }
  });
  opportunityList.forEach((opp) => {
    if (opp.source_org_id) {
      const counts = orgConnectionCounts.get(opp.source_org_id);
      if (counts) counts.opportunities++;
    }
  });

  return (
    <div className="space-y-section">
      <PageHeader
        title="Ecosystem Map"
        subtitle="Every institution, funder, and practitioner in the system — and how they connect."
      />

      {/* Tab-style section headers */}
      <div className="flex items-center gap-1 border-b border-border">
        <span className="px-4 py-2.5 text-sm font-medium text-text border-b-2 border-accent">
          Organizations
          <span className="ml-1.5 text-[11px] text-dim font-mono">{organizations.length}</span>
        </span>
        <a href="#practitioners" className="px-4 py-2.5 text-sm font-medium text-muted hover:text-text transition-colors">
          Practitioners
          <span className="ml-1.5 text-[11px] text-dim font-mono">{practitionerList.length}</span>
        </a>
      </div>

      {/* Organizations */}
      {organizations.length === 0 ? (
        <EmptyState
          title="No organizations yet"
          description="Organizations will appear here once added to the ecosystem."
        />
      ) : (
        <div className="space-y-3">
          {organizations.map((org) => {
            const counts = orgConnectionCounts.get(org.id) || { investments: 0, decisions: 0, opportunities: 0 };
            const hasConnections = counts.investments > 0 || counts.decisions > 0 || counts.opportunities > 0;

            return (
              <div
                key={org.id}
                className="bg-surface-card border border-border rounded-card p-6 hover:border-border-medium transition-all duration-card cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[15px] font-medium text-text">
                        {org.name}
                      </span>
                      <StatusBadge
                        label={ORG_TYPE_LABELS[org.org_type] || org.org_type}
                        color="dim"
                      />
                    </div>
                    {org.mandate && (
                      <p className="text-[13px] text-muted mt-1.5 leading-relaxed">
                        {org.mandate}
                      </p>
                    )}
                    {org.controls && (
                      <p className="text-[12px] text-dim mt-1.5">
                        Controls: {org.controls}
                      </p>
                    )}
                  </div>
                </div>

                {/* Inline connection counts */}
                {hasConnections && (
                  <div className="mt-4 flex gap-3">
                    {counts.investments > 0 && (
                      <span className="bg-surface-inset rounded-md px-3 py-1.5 text-[12px]">
                        <span className="font-mono font-medium text-text">{counts.investments}</span>{" "}
                        <span className="text-dim">{counts.investments === 1 ? "investment" : "investments"}</span>
                      </span>
                    )}
                    {counts.decisions > 0 && (
                      <span className="bg-surface-inset rounded-md px-3 py-1.5 text-[12px]">
                        <span className="font-mono font-medium text-text">{counts.decisions}</span>{" "}
                        <span className="text-dim">{counts.decisions === 1 ? "decision" : "decisions"}</span>
                      </span>
                    )}
                    {counts.opportunities > 0 && (
                      <span className="bg-surface-inset rounded-md px-3 py-1.5 text-[12px]">
                        <span className="font-mono font-medium text-text">{counts.opportunities}</span>{" "}
                        <span className="text-dim">{counts.opportunities === 1 ? "opportunity" : "opportunities"}</span>
                      </span>
                    )}
                  </div>
                )}

                {/* View indicator */}
                <div className="mt-3 text-[12px] text-dim group-hover:text-accent transition-colors text-right">
                  View details →
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Practitioners */}
      <div id="practitioners" className="pt-2">
        <div className="flex items-center gap-1 border-b border-border mb-6">
          <a href="#" className="px-4 py-2.5 text-sm font-medium text-muted hover:text-text transition-colors">
            Organizations
            <span className="ml-1.5 text-[11px] text-dim font-mono">{organizations.length}</span>
          </a>
          <span className="px-4 py-2.5 text-sm font-medium text-text border-b-2 border-accent">
            Practitioners
            <span className="ml-1.5 text-[11px] text-dim font-mono">{practitionerList.length}</span>
          </span>
        </div>

        {practitionerList.length === 0 ? (
          <EmptyState
            title="No practitioners yet"
            description="Practitioners will appear here once added to the ecosystem."
          />
        ) : (
          <div className="space-y-3">
            {practitionerList.map((p) => (
              <div
                key={p.id}
                className="bg-surface-card border border-border rounded-card p-6 hover:border-border-medium transition-all duration-card cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[15px] font-medium text-text">
                        {p.name}
                      </span>
                      {p.discipline && (
                        <span className="text-[13px] text-muted">{p.discipline}</span>
                      )}
                    </div>
                    {p.tenure && (
                      <p className="text-[13px] text-dim mt-1">{p.tenure} in NWA</p>
                    )}
                  </div>
                </div>

                {p.income_sources && (
                  <p className="text-[13px] text-muted mt-3">
                    <span className="text-dim">Income:</span> {p.income_sources}
                  </p>
                )}

                {/* Retention / Risk framing */}
                <div className="mt-3 space-y-1.5">
                  {p.retention_factors && (
                    <div className="flex items-start gap-2 text-[12px]">
                      <span className="text-status-green font-medium shrink-0 mt-px">●</span>
                      <span className="text-muted">
                        <span className="text-dim">Keeps them here:</span> {p.retention_factors}
                      </span>
                    </div>
                  )}
                  {p.risk_factors && (
                    <div className="flex items-start gap-2 text-[12px]">
                      <span className="text-status-orange font-medium shrink-0 mt-px">▲</span>
                      <span className="text-muted">
                        <span className="text-dim">Risk:</span> {p.risk_factors}
                      </span>
                    </div>
                  )}
                </div>

                {/* View indicator */}
                <div className="mt-3 text-[12px] text-dim group-hover:text-accent transition-colors text-right">
                  View details →
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
