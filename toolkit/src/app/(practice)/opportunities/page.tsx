import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatCurrency, formatDate, daysUntil } from "@/lib/utils/formatting";
import { OPPORTUNITY_STATUS_LABELS, OPPORTUNITY_TYPE_LABELS } from "@/lib/utils/constants";
import type { Opportunity, Investment } from "@/lib/supabase/types";

const NWA_ECOSYSTEM_ID = "a0000000-0000-0000-0000-000000000001";

function statusColor(status: string): "green" | "red" | "blue" | "orange" | "dim" {
  const map: Record<string, "green" | "red" | "blue" | "orange" | "dim"> = {
    open: "green",
    closing_soon: "orange",
    closed: "dim",
    awarded: "blue",
  };
  return map[status] || "dim";
}

export const metadata = {
  title: "Opportunities — Cultural Architecture Toolkit",
};

export default async function OpportunitiesPage() {
  const supabase = createClient();

  const [{ data: oppData }, { data: investmentData }] = await Promise.all([
    supabase
      .from("opportunities")
      .select("*")
      .eq("ecosystem_id", NWA_ECOSYSTEM_ID)
      .order("deadline", { ascending: true }),
    supabase
      .from("investments")
      .select("id, initiative_name")
      .eq("ecosystem_id", NWA_ECOSYSTEM_ID),
  ]);

  const opportunities = (oppData as Opportunity[]) || [];
  const investments = (investmentData as Pick<Investment, "id" | "initiative_name">[]) || [];
  const investmentMap = new Map(investments.map((i) => [i.id, i]));

  const openOpps = opportunities.filter((o) => o.status === "open");
  const closingSoon = opportunities.filter((o) => o.status === "closing_soon");
  const closedOpps = opportunities.filter((o) => o.status === "closed" || o.status === "awarded");

  return (
    <div className="space-y-section">
      <PageHeader
        title="Opportunities"
        subtitle="Every open grant, commission, RFP, and residency flowing through the ecosystem."
      />

      {/* Tab-style counts */}
      <div className="flex items-center gap-6 border-b border-border">
        <span className="px-1 py-2.5 text-sm font-medium text-text border-b-2 border-accent">
          Open
          <span className="ml-1.5 text-[11px] text-dim font-mono">{openOpps.length}</span>
        </span>
        <span className="px-1 py-2.5 text-sm font-medium text-muted">
          Closing Soon
          <span className="ml-1.5 text-[11px] text-status-orange font-mono">{closingSoon.length}</span>
        </span>
        <span className="px-1 py-2.5 text-sm font-medium text-muted">
          Closed / Awarded
          <span className="ml-1.5 text-[11px] text-dim font-mono">{closedOpps.length}</span>
        </span>
      </div>

      {/* Closing Soon — show first if there are urgent ones */}
      {closingSoon.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-display text-base font-semibold text-status-orange">
              Closing Soon
            </h2>
          </div>
          <div className="space-y-3">
            {closingSoon.map((opp) => (
              <OpportunityCard key={opp.id} opp={opp} />
            ))}
          </div>
        </div>
      )}

      {/* Open */}
      <div>
        {openOpps.length === 0 && closingSoon.length === 0 ? (
          <EmptyState
            title="No open opportunities"
            description="Open opportunities will appear here."
          />
        ) : openOpps.length > 0 ? (
          <>
            {closingSoon.length > 0 && (
              <div className="flex items-center gap-3 mb-4">
                <h2 className="font-display text-base font-semibold text-text">Open</h2>
              </div>
            )}
            <div className="space-y-3">
              {openOpps.map((opp) => (
                <OpportunityCard key={opp.id} opp={opp} />
              ))}
            </div>
          </>
        ) : null}
      </div>

      {/* Closed / Awarded */}
      {closedOpps.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-display text-base font-semibold text-text">
              Closed & Awarded
            </h2>
          </div>
          <div className="space-y-2">
            {closedOpps.map((opp) => {
              const awardedInvestment = opp.awarded_investment_id
                ? investmentMap.get(opp.awarded_investment_id)
                : null;

              return (
                <div
                  key={opp.id}
                  className="bg-surface-card border border-border rounded-card px-5 py-4 hover:border-border-medium transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.03em] text-dim bg-surface-inset px-2 py-0.5 rounded">
                          {OPPORTUNITY_TYPE_LABELS[opp.opportunity_type] || opp.opportunity_type}
                        </span>
                        <span className="text-sm font-medium text-text">{opp.title}</span>
                        <StatusBadge
                          label={OPPORTUNITY_STATUS_LABELS[opp.status] || opp.status}
                          color={statusColor(opp.status)}
                        />
                      </div>
                      {(opp.amount_min !== null || opp.amount_max !== null) && (
                        <p className="text-[12px] text-dim mt-1">
                          {opp.amount_min !== null && opp.amount_max !== null
                            ? `${formatCurrency(opp.amount_min)} – ${formatCurrency(opp.amount_max)}`
                            : formatCurrency(opp.amount_min ?? opp.amount_max)}
                          {opp.deadline && <span className="ml-2">Closed {formatDate(opp.deadline)}</span>}
                        </p>
                      )}
                      {opp.awarded_to && (
                        <p className="text-[12px] text-muted mt-1">
                          Awarded to: <span className="font-medium">{opp.awarded_to}</span>
                        </p>
                      )}
                      {awardedInvestment && (
                        <p className="text-[12px] text-dim mt-1">
                          → Became: <span className="text-accent font-medium">{awardedInvestment.initiative_name}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function OpportunityCard({
  opp,
}: {
  opp: Opportunity;
}) {
  const days = daysUntil(opp.deadline);

  return (
    <div className="bg-surface-card border border-border rounded-card p-6 hover:border-border-medium transition-all duration-card cursor-pointer group">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Type badge — prominent */}
            <span className="text-[11px] font-semibold uppercase tracking-[0.03em] text-accent bg-accent-glow border border-border-accent px-2 py-0.5 rounded">
              {OPPORTUNITY_TYPE_LABELS[opp.opportunity_type] || opp.opportunity_type}
            </span>
            <span className="text-[15px] font-medium text-text">
              {opp.title}
            </span>
          </div>
          {opp.source_name && (
            <p className="text-[13px] text-muted mt-1.5">{opp.source_name}</p>
          )}
        </div>
        <div className="text-right shrink-0">
          {(opp.amount_min !== null || opp.amount_max !== null) && (
            <p className="font-mono text-[14px] font-medium text-text">
              {opp.amount_min !== null && opp.amount_max !== null
                ? `${formatCurrency(opp.amount_min)} – ${formatCurrency(opp.amount_max)}`
                : formatCurrency(opp.amount_min ?? opp.amount_max)}
            </p>
          )}
          {opp.deadline && (
            <p className="text-[12px] text-muted mt-1">
              Due {formatDate(opp.deadline)}
              {days !== null && (
                <span className={`ml-1 font-mono font-medium ${
                  days <= 14 ? "text-status-red" :
                  days <= 30 ? "text-status-orange" :
                  "text-muted"
                }`}>
                  [{days}d remaining]
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Description */}
      {opp.description && (
        <p className="text-[13px] text-muted mt-3 leading-relaxed line-clamp-2">
          {opp.description}
        </p>
      )}

      {/* Eligibility — always visible per spec */}
      {opp.eligibility && (
        <p className="text-[12px] text-dim mt-2">
          Eligibility: <span className="text-muted">{opp.eligibility}</span>
        </p>
      )}

      {/* View indicator */}
      <div className="mt-3 text-[12px] text-dim group-hover:text-accent transition-colors text-right">
        View details →
      </div>
    </div>
  );
}
