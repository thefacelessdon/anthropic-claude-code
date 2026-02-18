import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatDate } from "@/lib/utils/formatting";
import { GAP_LABELS, NARRATIVE_SOURCE_LABELS } from "@/lib/utils/constants";
import type { Narrative } from "@/lib/supabase/types";

const NWA_ECOSYSTEM_ID = "a0000000-0000-0000-0000-000000000001";

function gapColor(gap: string): "green" | "red" | "blue" | "orange" | "dim" {
  const map: Record<string, "green" | "red" | "blue" | "orange" | "dim"> = {
    high: "red",
    medium: "orange",
    low: "blue",
    aligned: "green",
  };
  return map[gap] || "dim";
}

function gapBarColor(gap: string): string {
  const map: Record<string, string> = {
    high: "bg-status-red",
    medium: "bg-status-orange",
    low: "bg-status-blue",
    aligned: "bg-status-green",
  };
  return map[gap] || "bg-dim";
}

export const metadata = {
  title: "Narratives — Cultural Architecture Toolkit",
};

export default async function NarrativesPage() {
  const supabase = createClient();

  const { data } = await supabase
    .from("narratives")
    .select("*")
    .eq("ecosystem_id", NWA_ECOSYSTEM_ID)
    .order("date", { ascending: false });

  const narratives = (data as Narrative[]) || [];

  const highGap = narratives.filter((n) => n.gap === "high").length;
  const mediumGap = narratives.filter((n) => n.gap === "medium").length;
  const aligned = narratives.filter((n) => n.gap === "aligned").length;

  return (
    <div className="space-y-section">
      <PageHeader
        title="Narratives"
        subtitle="What's being said about this ecosystem versus what's actually happening."
      />

      {/* Summary stats */}
      <div className="bg-surface-card border border-border rounded-card p-6">
        <div className="flex items-center gap-8">
          <div>
            <span className="font-display text-[28px] font-bold text-text leading-none">
              {narratives.length}
            </span>
            <span className="block text-[11px] text-dim uppercase tracking-[0.08em] mt-1">narratives tracked</span>
          </div>
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-sm">
              <span className="inline-block w-3 h-3 rounded-sm bg-status-red" />
              <span className="font-mono font-medium text-text">{highGap}</span>
              <span className="text-[11px] text-dim">high gap</span>
            </span>
            <span className="flex items-center gap-1.5 text-sm">
              <span className="inline-block w-3 h-3 rounded-sm bg-status-orange" />
              <span className="font-mono font-medium text-text">{mediumGap}</span>
              <span className="text-[11px] text-dim">medium</span>
            </span>
            <span className="flex items-center gap-1.5 text-sm">
              <span className="inline-block w-3 h-3 rounded-sm bg-status-green" />
              <span className="font-mono font-medium text-text">{aligned}</span>
              <span className="text-[11px] text-dim">aligned</span>
            </span>
          </div>
        </div>
      </div>

      {/* Narrative cards with thick gap bar */}
      {narratives.length === 0 ? (
        <EmptyState
          title="No narratives yet"
          description="Narratives will appear here once documented."
        />
      ) : (
        <div className="space-y-3">
          {narratives.map((n) => (
            <div
              key={n.id}
              className="bg-surface-card border border-border rounded-card overflow-hidden hover:border-border-medium transition-all duration-card cursor-pointer group flex"
            >
              {/* Thick gap indicator bar — left edge */}
              <div className={`w-1.5 shrink-0 ${gapBarColor(n.gap)}`} />

              <div className="flex-1 p-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <StatusBadge
                        label={GAP_LABELS[n.gap] || n.gap}
                        color={gapColor(n.gap)}
                      />
                      {n.date && (
                        <span className="text-[12px] text-dim">{formatDate(n.date)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {n.source_name && (
                        <span className="text-[15px] font-medium text-text">{n.source_name}</span>
                      )}
                      <span className="text-[11px] text-dim uppercase tracking-wider">
                        {NARRATIVE_SOURCE_LABELS[n.source_type] || n.source_type}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Narrative vs Reality */}
                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-[11px] text-dim uppercase tracking-[0.08em] font-semibold mb-1">
                      The Narrative
                    </p>
                    <p className="text-[13px] text-text leading-relaxed">
                      {n.narrative_text}
                    </p>
                  </div>
                  {n.reality_text && (
                    <div>
                      <p className="text-[11px] text-dim uppercase tracking-[0.08em] font-semibold mb-1">
                        The Reality
                      </p>
                      <p className="text-[13px] text-muted leading-relaxed">
                        {n.reality_text}
                      </p>
                    </div>
                  )}
                </div>

                {/* Evidence links */}
                {n.evidence_notes && (
                  <p className="text-[12px] text-dim mt-3">
                    Evidence: <span className="text-muted">{n.evidence_notes}</span>
                  </p>
                )}

                {/* View indicator */}
                <div className="mt-3 text-[12px] text-dim group-hover:text-accent transition-colors text-right">
                  View details →
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
