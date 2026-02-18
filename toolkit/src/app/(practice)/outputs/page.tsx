import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatDate } from "@/lib/utils/formatting";
import { OUTPUT_TYPE_LABELS } from "@/lib/utils/constants";
import type { Output, Decision, Organization } from "@/lib/supabase/types";

const NWA_ECOSYSTEM_ID = "a0000000-0000-0000-0000-000000000001";

export const metadata = {
  title: "Outputs — Cultural Architecture Toolkit",
};

export default async function OutputsPage() {
  const supabase = createClient();

  const [{ data: outputData }, { data: decisionData }, { data: orgData }] = await Promise.all([
    supabase
      .from("outputs")
      .select("*")
      .eq("ecosystem_id", NWA_ECOSYSTEM_ID)
      .order("created_at", { ascending: false }),
    supabase
      .from("decisions")
      .select("id, decision_title")
      .eq("ecosystem_id", NWA_ECOSYSTEM_ID),
    supabase
      .from("organizations")
      .select("id, name")
      .eq("ecosystem_id", NWA_ECOSYSTEM_ID),
  ]);

  const outputs = (outputData as Output[]) || [];
  const decisions = (decisionData as Pick<Decision, "id" | "decision_title">[]) || [];
  const orgs = (orgData as Pick<Organization, "id" | "name">[]) || [];

  const decisionMap = new Map(decisions.map((d) => [d.id, d]));
  const orgMap = new Map(orgs.map((o) => [o.id, o]));

  const published = outputs.filter((o) => o.is_published);
  const drafts = outputs.filter((o) => !o.is_published);

  return (
    <div className="space-y-section">
      <PageHeader
        title="Outputs"
        subtitle="Briefs, analyses, and frameworks we've produced from the intelligence."
      />

      {/* Tab-style sections */}
      <div className="flex items-center gap-6 border-b border-border">
        <span className="px-1 py-2.5 text-sm font-medium text-text border-b-2 border-accent">
          Published
          <span className="ml-1.5 text-[11px] text-dim font-mono">{published.length}</span>
        </span>
        <span className="px-1 py-2.5 text-sm font-medium text-muted">
          Drafts
          <span className="ml-1.5 text-[11px] text-dim font-mono">{drafts.length}</span>
        </span>
      </div>

      {/* Published outputs */}
      {published.length === 0 ? (
        <EmptyState
          title="No published outputs"
          description="Published intelligence will appear here."
        />
      ) : (
        <div className="space-y-3">
          {published.map((o) => {
            const triggeredBy = o.triggered_by_decision_id
              ? decisionMap.get(o.triggered_by_decision_id)
              : null;
            const targetOrg = o.target_stakeholder_id
              ? orgMap.get(o.target_stakeholder_id)
              : null;

            return (
              <div
                key={o.id}
                className="bg-surface-card border border-border rounded-card p-6 hover:border-border-medium transition-all duration-card cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <StatusBadge
                        label={OUTPUT_TYPE_LABELS[o.output_type] || o.output_type}
                        color="purple"
                      />
                      <StatusBadge label="Published" color="green" />
                      {o.published_at && (
                        <span className="text-[12px] text-dim">
                          {formatDate(o.published_at)}
                        </span>
                      )}
                    </div>
                    <p className="text-[15px] font-medium text-text mt-2">
                      {o.title}
                    </p>
                    {o.summary && (
                      <p className="text-[13px] text-muted mt-1.5 leading-relaxed line-clamp-2">
                        {o.summary}
                      </p>
                    )}
                  </div>
                </div>

                {/* Connection metadata */}
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[12px]">
                  {triggeredBy && (
                    <span className="text-dim">
                      Triggered by: <span className="text-muted font-medium">{triggeredBy.decision_title}</span>
                    </span>
                  )}
                  {targetOrg && (
                    <span className="text-dim">
                      Delivered to: <span className="text-muted font-medium">{targetOrg.name}</span>
                    </span>
                  )}
                </div>

                {/* Read indicator */}
                <div className="mt-3 text-[12px] text-dim group-hover:text-accent transition-colors text-right">
                  Read →
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Drafts */}
      {drafts.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4 mt-2">
            <h2 className="font-display text-base font-semibold text-text">Drafts</h2>
          </div>
          <div className="space-y-2">
            {drafts.map((o) => (
              <div
                key={o.id}
                className="bg-surface-card border border-border rounded-card px-5 py-4 hover:border-border-medium transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5">
                      <StatusBadge
                        label={OUTPUT_TYPE_LABELS[o.output_type] || o.output_type}
                        color="purple"
                      />
                      <StatusBadge label="Draft" color="dim" />
                      <span className="text-sm font-medium text-text">{o.title}</span>
                    </div>
                    {o.summary && (
                      <p className="text-[12px] text-dim mt-1 line-clamp-1">{o.summary}</p>
                    )}
                  </div>
                  <span className="text-[12px] text-dim shrink-0">
                    {formatDate(o.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
