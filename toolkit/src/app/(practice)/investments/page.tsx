import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusDot } from "@/components/ui/StatusDot";
import { formatCurrency } from "@/lib/utils/formatting";
import {
  INVESTMENT_STATUS_LABELS,
  COMPOUNDING_LABELS,
  INVESTMENT_CATEGORY_LABELS,
} from "@/lib/utils/constants";
import type { Investment } from "@/lib/supabase/types";

const NWA_ECOSYSTEM_ID = "a0000000-0000-0000-0000-000000000001";

function statusColor(status: string): "green" | "red" | "blue" | "orange" | "dim" {
  const map: Record<string, "green" | "red" | "blue" | "orange" | "dim"> = {
    active: "green",
    planned: "blue",
    completed: "dim",
    cancelled: "red",
  };
  return map[status] || "dim";
}

function compoundingColor(status: string): "green" | "red" | "blue" | "orange" | "dim" {
  const map: Record<string, "green" | "red" | "blue" | "orange" | "dim"> = {
    compounding: "green",
    not_compounding: "red",
    too_early: "blue",
    unknown: "dim",
  };
  return map[status] || "dim";
}

export const metadata = {
  title: "Investments — Cultural Architecture Toolkit",
};

export default async function InvestmentsPage() {
  const supabase = createClient();

  const { data } = await supabase
    .from("investments")
    .select("*")
    .eq("ecosystem_id", NWA_ECOSYSTEM_ID)
    .order("created_at", { ascending: false });

  const investments = (data as Investment[]) || [];

  const totalAmount = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const compounding = investments.filter((i) => i.compounding === "compounding");
  const notCompounding = investments.filter((i) => i.compounding === "not_compounding");
  const tooEarly = investments.filter((i) => i.compounding === "too_early");

  const total = investments.length;
  const compoundingPct = total > 0 ? (compounding.length / total) * 100 : 0;
  const notCompoundingPct = total > 0 ? (notCompounding.length / total) * 100 : 0;
  const tooEarlyPct = total > 0 ? (tooEarly.length / total) * 100 : 0;

  // Build a lookup for chain names
  const investmentMap = new Map(investments.map((i) => [i.id, i]));

  // Find largest source
  const sourceTotals = new Map<string, number>();
  investments.forEach((inv) => {
    const name = inv.source_name || "Unknown";
    sourceTotals.set(name, (sourceTotals.get(name) || 0) + (inv.amount || 0));
  });
  const largestSource = Array.from(sourceTotals.entries()).sort((a, b) => b[1] - a[1])[0];

  // Category counts
  const categoryCounts = new Map<string, number>();
  investments.forEach((inv) => {
    if (inv.category) {
      categoryCounts.set(inv.category, (categoryCounts.get(inv.category) || 0) + 1);
    }
  });
  const topCategory = Array.from(categoryCounts.entries()).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="space-y-section">
      <PageHeader title="Investments" subtitle="Where money is going, what it's producing, and whether it's compounding." />

      {/* Story-first stats */}
      <div className="bg-surface-card border border-border rounded-card p-6">
        <div className="flex flex-col gap-6">
          {/* Headline row */}
          <div className="flex flex-col lg:flex-row lg:items-end gap-6 lg:gap-12">
            {/* Total */}
            <div>
              <span className="font-display text-[28px] font-bold text-text leading-none">
                {formatCurrency(totalAmount)}
              </span>
              <span className="block text-[11px] text-dim uppercase tracking-[0.08em] mt-1.5 font-body">
                tracked across {investments.length} initiatives
              </span>
            </div>

            {/* Compounding breakdown */}
            <div className="flex-1 max-w-md">
              <div className="flex items-center gap-5 text-sm">
                <span className="flex items-center gap-1.5">
                  <StatusDot color="green" />
                  <span className="font-mono text-sm font-medium text-text">{compounding.length}</span>
                  <span className="text-[11px] text-muted">compounding</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <StatusDot color="red" />
                  <span className="font-mono text-sm font-medium text-text">{notCompounding.length}</span>
                  <span className="text-[11px] text-muted">not compounding</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <StatusDot color="blue" />
                  <span className="font-mono text-sm font-medium text-text">{tooEarly.length}</span>
                  <span className="text-[11px] text-muted">too early to tell</span>
                </span>
              </div>
              {/* Ratio bar */}
              <div className="mt-2.5 h-2 bg-surface-inset rounded-full overflow-hidden flex gap-px">
                {compoundingPct > 0 && (
                  <div
                    className="bg-status-green rounded-full transition-all"
                    style={{ width: `${compoundingPct}%` }}
                  />
                )}
                {notCompoundingPct > 0 && (
                  <div
                    className="bg-status-red rounded-full transition-all"
                    style={{ width: `${notCompoundingPct}%` }}
                  />
                )}
                {tooEarlyPct > 0 && (
                  <div
                    className="bg-status-blue rounded-full transition-all"
                    style={{ width: `${tooEarlyPct}%` }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Secondary insight line */}
          <div className="flex gap-8 text-[13px] text-muted border-t border-border pt-4">
            {largestSource && (
              <span>
                Largest source: <span className="text-text font-medium">{largestSource[0]}</span>{" "}
                <span className="text-dim">({formatCurrency(largestSource[1])})</span>
              </span>
            )}
            {topCategory && (
              <span>
                Most active category:{" "}
                <span className="text-text font-medium">
                  {INVESTMENT_CATEGORY_LABELS[topCategory[0]] || topCategory[0]}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* What does compounding mean? */}
      <div className="bg-surface-inset border border-border rounded-card px-5 py-4">
        <p className="text-[13px] text-muted leading-relaxed">
          <span className="text-text font-medium">What does &ldquo;compounding&rdquo; mean?</span>{" "}
          An investment is compounding when it creates conditions that make the next investment more effective &mdash;
          building institutional knowledge, strengthening networks, or creating infrastructure others can build on.
          <span className="text-status-green font-medium"> Compounding</span> means downstream value is accumulating.
          <span className="text-status-red font-medium"> Not compounding</span> means the investment is isolated &mdash;
          it didn&rsquo;t connect to or enable anything else. This is the central question for ecosystem health:
          is money building on itself, or starting over each cycle?
        </p>
      </div>

      {/* Investment cards */}
      {investments.length === 0 ? (
        <EmptyState
          title="No investments yet"
          description="Investments will appear here once added to the ecosystem."
        />
      ) : (
        <div className="space-y-3">
          {investments.map((inv) => {
            const buildsOn = inv.builds_on_id ? investmentMap.get(inv.builds_on_id) : null;
            const ledTo = inv.led_to_id ? investmentMap.get(inv.led_to_id) : null;

            return (
              <div
                key={inv.id}
                className="bg-surface-card border border-border rounded-card p-6 hover:border-border-medium transition-all duration-card cursor-pointer group"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-[15px] font-medium text-text">
                        {inv.initiative_name}
                      </span>
                      {inv.amount !== null && (
                        <span className="font-mono text-[15px] font-medium text-text">
                          {formatCurrency(inv.amount)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-[13px] text-muted">
                      {inv.source_name && <span>{inv.source_name}</span>}
                      {inv.source_name && inv.period && <span className="text-dim">&middot;</span>}
                      {inv.period && <span>{inv.period}</span>}
                      {inv.period && inv.status && <span className="text-dim">&middot;</span>}
                      <StatusBadge
                        label={INVESTMENT_STATUS_LABELS[inv.status] || inv.status}
                        color={statusColor(inv.status)}
                      />
                    </div>
                  </div>
                </div>

                {/* Outcome text — visible on card per spec */}
                {inv.outcome && (
                  <p className="text-[13px] text-muted mt-3 leading-relaxed">
                    {inv.outcome}
                  </p>
                )}

                {/* Compounding status with explanation */}
                <div className="mt-4 flex items-start gap-3">
                  <StatusBadge
                    label={COMPOUNDING_LABELS[inv.compounding] || inv.compounding}
                    color={compoundingColor(inv.compounding)}
                  />
                  {inv.compounding_notes && (
                    <p className="text-[12px] text-dim leading-relaxed flex-1">
                      {inv.compounding_notes}
                    </p>
                  )}
                </div>

                {/* Compounding chain — Builds on / Led to */}
                {(buildsOn || ledTo) && (
                  <div className="mt-3 pt-3 border-t border-border flex flex-wrap gap-x-6 gap-y-1 text-[12px]">
                    {buildsOn && (
                      <span className="text-dim">
                        Builds on: <span className="text-muted font-medium">{buildsOn.initiative_name}</span>
                      </span>
                    )}
                    {ledTo && (
                      <span className="text-dim">
                        Led to: <span className="text-muted font-medium">{ledTo.initiative_name}</span>
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
    </div>
  );
}
