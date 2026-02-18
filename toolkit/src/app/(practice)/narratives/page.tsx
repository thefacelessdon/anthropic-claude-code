import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { NarrativesView } from "@/components/practice/views/NarrativesView";
import type { Narrative } from "@/lib/supabase/types";

const NWA_ECOSYSTEM_ID = "a0000000-0000-0000-0000-000000000001";

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
        <div className="flex items-center gap-8 flex-wrap">
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

      {/* Narrative cards — client component with grid + detail panel */}
      {narratives.length === 0 ? (
        <EmptyState
          title="No narratives yet"
          description="Narratives will appear here once documented."
        />
      ) : (
        <NarrativesView narratives={narratives} />
      )}
    </div>
  );
}
