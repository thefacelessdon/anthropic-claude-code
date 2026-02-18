import { StatusDot } from "@/components/ui/StatusDot";
import { formatCurrency } from "@/lib/utils/formatting";
import type { EcosystemStats } from "@/lib/supabase/types";

interface StatsBarProps {
  stats: EcosystemStats | null;
}

export function StatsBar({ stats }: StatsBarProps) {
  if (!stats) return null;

  const items = [
    { label: "Organizations", value: stats.org_count },
    { label: "Practitioners", value: stats.practitioner_count },
    { label: "Total Investment", value: formatCurrency(stats.total_investment) },
    {
      label: "Compounding",
      value: stats.compounding_count,
      dot: "green" as const,
    },
    {
      label: "Not Compounding",
      value: stats.not_compounding_count,
      dot: "red" as const,
    },
    {
      label: "Open Opps",
      value: stats.open_opportunities,
      dot: "green" as const,
    },
    {
      label: "Active Decisions",
      value: stats.active_decisions,
      dot: "orange" as const,
    },
    {
      label: "High-Gap Narratives",
      value: stats.high_gap_narratives,
      dot: "red" as const,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-px bg-border rounded-lg overflow-hidden">
      {items.map((item) => (
        <div key={item.label} className="bg-card px-3 py-3">
          <div className="flex items-center gap-1.5">
            {item.dot && <StatusDot color={item.dot} />}
            <span className="text-lg font-semibold text-text">
              {item.value}
            </span>
          </div>
          <span className="text-[10px] text-dim uppercase tracking-wider">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
