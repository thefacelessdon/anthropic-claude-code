import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusDot } from "@/components/ui/StatusDot";
import { formatCurrency } from "@/lib/utils/formatting";
import {
  INVESTMENT_CATEGORY_LABELS,
} from "@/lib/utils/constants";
import { InvestmentsView } from "@/components/practice/views/InvestmentsView";
import type { Investment, Practitioner, Organization } from "@/lib/supabase/types";

const NWA_ECOSYSTEM_ID = "a0000000-0000-0000-0000-000000000001";

export const metadata = {
  title: "Investments — Cultural Architecture Toolkit",
};

export default async function InvestmentsPage() {
  const supabase = createClient();

  const [{ data }, { data: practData }, { data: orgData }] = await Promise.all([
    supabase
      .from("investments")
      .select("*")
      .eq("ecosystem_id", NWA_ECOSYSTEM_ID)
      .order("created_at", { ascending: false }),
    supabase
      .from("practitioners")
      .select("*")
      .eq("ecosystem_id", NWA_ECOSYSTEM_ID),
    supabase
      .from("organizations")
      .select("id, name")
      .eq("ecosystem_id", NWA_ECOSYSTEM_ID),
  ]);

  const practitioners = (practData as Practitioner[]) || [];

  // Resolve source_name from source_org_id when source_name is null
  const orgNameMap = new Map(
    ((orgData as Pick<Organization, "id" | "name">[]) || []).map((o) => [o.id, o.name])
  );
  const investments: Investment[] = ((data as Investment[]) || []).map((inv) => ({
    ...inv,
    source_name: inv.source_name || (inv.source_org_id ? orgNameMap.get(inv.source_org_id) : null) || null,
  }));

  const totalAmount = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const compounding = investments.filter((i) => i.compounding === "compounding");
  const notCompounding = investments.filter((i) => i.compounding === "not_compounding");
  const tooEarly = investments.filter((i) => i.compounding === "too_early");

  const total = investments.length;
  const compoundingPct = total > 0 ? (compounding.length / total) * 100 : 0;
  const notCompoundingPct = total > 0 ? (notCompounding.length / total) * 100 : 0;
  const tooEarlyPct = total > 0 ? (tooEarly.length / total) * 100 : 0;

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
          <div className="flex flex-col lg:flex-row lg:items-end gap-6 lg:gap-12">
            <div>
              <span className="font-display text-[28px] font-bold text-text leading-none">
                {formatCurrency(totalAmount)}
              </span>
              <span className="block text-[11px] text-dim uppercase tracking-[0.08em] mt-1.5 font-body">
                tracked across {investments.length} initiatives
              </span>
            </div>

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
              <div className="mt-2.5 h-2 bg-surface-inset rounded-full overflow-hidden flex gap-px">
                {compoundingPct > 0 && (
                  <div className="bg-status-green rounded-full transition-all" style={{ width: `${compoundingPct}%` }} />
                )}
                {notCompoundingPct > 0 && (
                  <div className="bg-status-red rounded-full transition-all" style={{ width: `${notCompoundingPct}%` }} />
                )}
                {tooEarlyPct > 0 && (
                  <div className="bg-status-blue rounded-full transition-all" style={{ width: `${tooEarlyPct}%` }} />
                )}
              </div>
            </div>
          </div>

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

      {/* Compounding explainer */}
      <div className="bg-surface-inset border border-border rounded-card px-5 py-4">
        <p className="text-[13px] text-muted leading-relaxed">
          <span className="text-text font-medium">What does &ldquo;compounding&rdquo; mean?</span>{" "}
          An investment is compounding when it creates conditions that make the next investment more effective &mdash;
          building institutional knowledge, strengthening networks, or creating infrastructure others can build on.
          <span className="text-status-green font-medium"> Compounding</span> means downstream value is accumulating.
          <span className="text-status-red font-medium"> Not compounding</span> means the investment is isolated &mdash;
          it didn&rsquo;t connect to or enable anything else.
        </p>
      </div>

      {/* Investment cards — client component with grid + detail panel */}
      {investments.length === 0 ? (
        <EmptyState
          title="No investments yet"
          description="Investments will appear here once added to the ecosystem."
        />
      ) : (
        <InvestmentsView investments={investments} practitioners={practitioners} />
      )}
    </div>
  );
}
