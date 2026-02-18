import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { formatDate, formatCurrency } from "@/lib/utils/formatting";
import type { Submission } from "@/lib/supabase/types";

const NWA_ECOSYSTEM_ID = "a0000000-0000-0000-0000-000000000001";

function statusColor(status: string): "green" | "red" | "blue" | "orange" | "dim" {
  const map: Record<string, "green" | "red" | "blue" | "orange" | "dim"> = {
    pending: "orange",
    approved: "green",
    rejected: "red",
  };
  return map[status] || "dim";
}

const SUBMISSION_TYPE_LABELS: Record<string, string> = {
  opportunity: "Opportunity Submission",
  decision_flag: "Decision Flag",
  investment_verification: "Investment Verification",
};

export const metadata = {
  title: "Submissions — Cultural Architecture Toolkit",
};

export default async function SubmissionsPage() {
  const supabase = createClient();

  const { data } = await supabase
    .from("submissions")
    .select("*")
    .eq("ecosystem_id", NWA_ECOSYSTEM_ID)
    .order("created_at", { ascending: false });

  const submissions = (data as Submission[]) || [];

  const pending = submissions.filter((s) => s.status === "pending");
  const reviewed = submissions.filter((s) => s.status !== "pending");

  return (
    <div className="space-y-section">
      <PageHeader
        title="Submissions"
        subtitle="External contributions waiting for review."
      />

      {/* Pending */}
      {pending.length === 0 ? (
        <EmptyState
          title="No pending submissions"
          description="New submissions will appear here for review."
        />
      ) : (
        <div className="space-y-3">
          {pending.map((s) => (
            <SubmissionCard key={s.id} submission={s} />
          ))}
        </div>
      )}

      {/* Reviewed */}
      {reviewed.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-display text-base font-semibold text-text">Reviewed</h2>
            <span className="text-[11px] font-mono text-dim bg-surface-inset px-1.5 py-0.5 rounded">
              {reviewed.length}
            </span>
          </div>
          <div className="space-y-2">
            {reviewed.map((s) => {
              const d = s.data as Record<string, unknown>;
              const title = (d?.title as string) || (d?.name as string) || s.submission_type;

              return (
                <div
                  key={s.id}
                  className="bg-surface-card border border-border rounded-card px-5 py-3 flex items-center justify-between hover:border-border-medium transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-sm text-text truncate font-medium">{title}</span>
                    <StatusBadge
                      label={s.status === "approved" ? "Approved" : "Rejected"}
                      color={statusColor(s.status)}
                    />
                    <span className="text-[10px] text-dim uppercase tracking-wider">
                      {s.submission_type}
                    </span>
                  </div>
                  <span className="text-[12px] text-dim shrink-0 ml-2">
                    {formatDate(s.reviewed_at || s.created_at)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function SubmissionCard({ submission: s }: { submission: Submission }) {
  const d = s.data as Record<string, unknown>;
  const typeLabel = SUBMISSION_TYPE_LABELS[s.submission_type] || s.submission_type;

  if (s.submission_type === "opportunity") {
    const title = (d?.title as string) || "Untitled Opportunity";
    const oppType = (d?.opportunity_type as string) || "";
    const amountMin = d?.amount_min as number | undefined;
    const amountMax = d?.amount_max as number | undefined;
    const deadline = d?.deadline as string | undefined;
    const eligibility = d?.eligibility as string | undefined;

    return (
      <div className="bg-surface-card border border-border rounded-card p-6">
        <div className="flex items-center gap-2.5 mb-3">
          <StatusBadge label={typeLabel} color="blue" />
          <StatusBadge label="Pending" color="orange" />
          <span className="text-[12px] text-dim">{formatDate(s.created_at)}</span>
        </div>

        <p className="text-[15px] font-medium text-text">{title}</p>
        {s.submitter_name && (
          <p className="text-[13px] text-muted mt-1">
            From: {s.submitter_name}
            {s.submitter_org && ` (${s.submitter_org})`}
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-dim">
          {oppType && <span className="uppercase">{oppType}</span>}
          {(amountMin || amountMax) && (
            <span>
              {amountMin && amountMax
                ? `${formatCurrency(amountMin)} – ${formatCurrency(amountMax)}`
                : formatCurrency(amountMin ?? amountMax ?? 0)}
            </span>
          )}
          {deadline && <span>Due {formatDate(deadline)}</span>}
          {eligibility && <span>{eligibility}</span>}
        </div>

        <div className="mt-4 flex gap-2">
          <Button size="sm">Approve & Create</Button>
          <Button size="sm" variant="ghost" className="text-status-red">Reject</Button>
          <Button size="sm" variant="ghost">View Details</Button>
        </div>
      </div>
    );
  }

  if (s.submission_type === "decision_flag") {
    const description = (d?.description as string) || (d?.title as string) || "";
    const expected = d?.expected_date as string | undefined;

    return (
      <div className="bg-surface-card border border-border rounded-card p-6">
        <div className="flex items-center gap-2.5 mb-3">
          <StatusBadge label={typeLabel} color="orange" />
          <StatusBadge label="Pending" color="orange" />
          <span className="text-[12px] text-dim">{formatDate(s.created_at)}</span>
        </div>

        {description && (
          <p className="text-[13px] text-text leading-relaxed">&ldquo;{description}&rdquo;</p>
        )}
        {s.submitter_name && (
          <p className="text-[13px] text-muted mt-1.5">
            From: {s.submitter_name}
            {s.submitter_org && ` (${s.submitter_org})`}
          </p>
        )}
        {expected && (
          <p className="text-[12px] text-dim mt-1">Expected: {formatDate(expected)}</p>
        )}

        <div className="mt-4 flex gap-2">
          <Button size="sm">Create Decision Entry</Button>
          <Button size="sm" variant="ghost">Dismiss</Button>
          <Button size="sm" variant="ghost">View Details</Button>
        </div>
      </div>
    );
  }

  if (s.submission_type === "investment_verification") {
    const investmentName = (d?.investment_name as string) || (d?.title as string) || "";
    const correction = d?.correction as string | undefined;
    const additional = d?.additional_info as string | undefined;

    return (
      <div className="bg-surface-card border border-border rounded-card p-6">
        <div className="flex items-center gap-2.5 mb-3">
          <StatusBadge label={typeLabel} color="green" />
          <StatusBadge label="Pending" color="orange" />
          <span className="text-[12px] text-dim">{formatDate(s.created_at)}</span>
        </div>

        {investmentName && (
          <p className="text-[15px] font-medium text-text">{investmentName}</p>
        )}
        {s.submitter_name && (
          <p className="text-[13px] text-muted mt-1">
            From: {s.submitter_name}
            {s.submitter_org && ` (${s.submitter_org})`}
          </p>
        )}

        {correction && (
          <p className="text-[13px] text-muted mt-3">
            <span className="text-dim">Correction:</span> {correction}
          </p>
        )}
        {additional && (
          <p className="text-[13px] text-muted mt-1">
            <span className="text-dim">Additional:</span> {additional}
          </p>
        )}

        <div className="mt-4 flex gap-2">
          <Button size="sm">Apply Correction</Button>
          <Button size="sm" variant="ghost">Dismiss</Button>
          <Button size="sm" variant="ghost">View Current Entry</Button>
        </div>
      </div>
    );
  }

  // Generic fallback
  const title = (d?.title as string) || (d?.name as string) || s.submission_type;
  return (
    <div className="bg-surface-card border border-border rounded-card p-6">
      <div className="flex items-center gap-2.5 mb-3">
        <StatusBadge label={typeLabel} color="dim" />
        <StatusBadge label="Pending" color="orange" />
        <span className="text-[12px] text-dim">{formatDate(s.created_at)}</span>
      </div>
      <p className="text-[15px] font-medium text-text">{title}</p>
      {s.submitter_name && (
        <p className="text-[13px] text-muted mt-1">
          From: {s.submitter_name}
          {s.submitter_org && ` (${s.submitter_org})`}
        </p>
      )}
      <div className="mt-4 flex gap-2">
        <Button size="sm">Review</Button>
        <Button size="sm" variant="ghost">Dismiss</Button>
      </div>
    </div>
  );
}
