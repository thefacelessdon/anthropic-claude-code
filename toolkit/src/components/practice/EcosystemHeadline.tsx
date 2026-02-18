import { formatCurrencyShort } from "@/lib/utils/formatting";
import type { EcosystemStats } from "@/lib/supabase/types";

interface EcosystemHeadlineProps {
  stats: EcosystemStats | null;
}

export function EcosystemHeadline({ stats }: EcosystemHeadlineProps) {
  if (!stats) return null;

  const investmentCount =
    stats.compounding_count + stats.not_compounding_count;

  return (
    <div className="bg-surface-card border border-border rounded-card p-8">
      {/* Line 1 — headline finding */}
      <p className="font-display text-[26px] font-medium text-text leading-[1.35] tracking-[-0.01em]">
        <span className="font-mono font-bold">
          {formatCurrencyShort(stats.total_investment)}
        </span>{" "}
        invested across {investmentCount} initiatives.
      </p>

      {/* Line 2 — compounding verdict */}
      <p className="font-display text-[22px] font-normal text-text leading-[1.35] mt-1">
        <span className="text-status-green">{stats.compounding_count}</span> are
        compounding.{" "}
        <span className="text-status-red">{stats.not_compounding_count}</span>{" "}
        are not.
      </p>

      {/* Line 3 — supporting context */}
      <p className="font-body text-[14px] text-muted mt-3">
        {stats.org_count} organizations{" "}
        <span className="text-dim mx-0.5">&middot;</span>{" "}
        {stats.practitioner_count} practitioners{" "}
        <span className="text-dim mx-0.5">&middot;</span>{" "}
        {stats.active_decisions} active decisions{" "}
        <span className="text-dim mx-0.5">&middot;</span>{" "}
        <span>
          <span className={stats.high_gap_narratives > 0 ? "text-status-red" : ""}>
            {stats.high_gap_narratives}
          </span>{" "}
          high-gap narratives
        </span>
      </p>
    </div>
  );
}
