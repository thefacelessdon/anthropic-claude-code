import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import type { Precedent } from "@/lib/supabase/types";

const NWA_ECOSYSTEM_ID = "a0000000-0000-0000-0000-000000000001";

export const metadata = {
  title: "Precedents — Cultural Architecture Toolkit",
};

export default async function PrecedentsPage() {
  const supabase = createClient();

  const { data } = await supabase
    .from("precedents")
    .select("*")
    .eq("ecosystem_id", NWA_ECOSYSTEM_ID)
    .order("created_at", { ascending: false });

  const precedents = (data as Precedent[]) || [];

  return (
    <div className="space-y-section">
      <PageHeader
        title="Precedents"
        subtitle="What's been tried before. The institutional memory that prevents starting from scratch."
      />

      {precedents.length === 0 ? (
        <EmptyState
          title="No precedents yet"
          description="Start documenting what's been tried."
        />
      ) : (
        <div className="space-y-3">
          {precedents.map((p) => (
            <div
              key={p.id}
              className="bg-surface-card border border-border rounded-card p-6 hover:border-border-medium transition-all duration-card cursor-pointer group"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <span className="text-[15px] font-medium text-text">
                    {p.name}
                  </span>
                  {p.period && (
                    <span className="ml-2.5 text-[13px] text-dim">{p.period}</span>
                  )}
                </div>
              </div>
              {p.involved && (
                <p className="text-[13px] text-muted mt-1">
                  {p.involved}
                </p>
              )}

              {/* Takeaway — the most important part, shown prominently */}
              {p.takeaway && (
                <div className="mt-4 bg-surface-inset rounded-md px-4 py-3 border-l-2 border-accent">
                  <p className="text-[11px] text-dim uppercase tracking-[0.08em] font-semibold mb-1">
                    Takeaway
                  </p>
                  <p className="text-[13px] text-muted leading-relaxed">
                    {p.takeaway}
                  </p>
                </div>
              )}

              {/* Connects to */}
              {p.connects_to && (
                <p className="text-[12px] text-dim mt-3">
                  Connected to: <span className="text-muted font-medium">{p.connects_to}</span>
                </p>
              )}

              {/* View indicator */}
              <div className="mt-3 text-[12px] text-dim group-hover:text-accent transition-colors text-right">
                View details →
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
