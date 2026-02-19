"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { DetailPanel, DetailSection } from "@/components/ui/DetailPanel";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate, formatCurrency } from "@/lib/utils/formatting";
import type { Submission, SubmissionStatus } from "@/lib/supabase/types";

/* ── Constants ─────────────────────────────────────── */

const SUBMISSION_TYPE_LABELS: Record<string, string> = {
  opportunity: "Opportunity Submission",
  decision_flag: "Decision Flag",
  investment_verification: "Investment Verification",
};

const STATUS_COLORS: Record<SubmissionStatus, "orange" | "green" | "red"> = {
  pending: "orange",
  approved: "green",
  rejected: "red",
};

/* ── Helpers ───────────────────────────────────────── */

function extractTitle(submission: Submission): string {
  const { data } = submission;
  if (typeof data.title === "string" && data.title) return data.title;
  if (typeof data.name === "string" && data.name) return data.name;
  return SUBMISSION_TYPE_LABELS[submission.submission_type] || "Submission";
}

function formatDataKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function renderDataValue(value: unknown): string {
  if (value === null || value === undefined) return "\u2014";
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

/* ── Props ─────────────────────────────────────────── */

interface SubmissionsViewProps {
  submissions: Submission[];
}

/* ── Component ─────────────────────────────────────── */

export function SubmissionsView({ submissions }: SubmissionsViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const openId = searchParams.get("open");
    if (openId) setSelectedId(openId);
  }, [searchParams]);

  const submissionMap = new Map(submissions.map((s) => [s.id, s]));
  const selected = selectedId ? submissionMap.get(selectedId) : null;

  const pending = submissions.filter((s) => s.status === "pending");
  const reviewed = submissions.filter((s) => s.status !== "pending");

  return (
    <>
      {/* ── Pending Submissions ──────────────────────── */}
      {pending.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
            <h3 className="font-display text-base font-semibold text-text">
              Pending Review
            </h3>
            <span className="text-[11px] text-dim bg-surface-inset px-1.5 py-0.5 rounded font-mono">
              {pending.length}
            </span>
          </div>

          <div className="space-y-3">
            {pending.map((s) => (
              <PendingCard
                key={s.id}
                submission={s}
                isSelected={selectedId === s.id}
                onSelect={() => setSelectedId(s.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Reviewed Submissions ─────────────────────── */}
      {reviewed.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
            <h3 className="font-display text-base font-semibold text-text">
              Reviewed
            </h3>
            <span className="text-[11px] text-dim bg-surface-inset px-1.5 py-0.5 rounded font-mono">
              {reviewed.length}
            </span>
          </div>

          <div className="space-y-1">
            {reviewed.map((s) => (
              <div
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-md cursor-pointer transition-colors ${
                  selectedId === s.id
                    ? "bg-surface-inset ring-1 ring-accent"
                    : "hover:bg-surface-inset"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-text truncate">
                    {extractTitle(s)}
                  </p>
                  <p className="text-[11px] text-dim truncate">
                    {SUBMISSION_TYPE_LABELS[s.submission_type] || s.submission_type}
                  </p>
                </div>
                <StatusBadge
                  label={s.status}
                  color={STATUS_COLORS[s.status]}
                />
                <span className="text-[11px] text-dim shrink-0">
                  {formatDate(s.created_at)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Empty State ──────────────────────────────── */}
      {submissions.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[14px] text-muted">No submissions yet.</p>
        </div>
      )}

      {/* ── Detail Panel ─────────────────────────────── */}
      <DetailPanel
        isOpen={!!selected}
        onClose={() => setSelectedId(null)}
        title={selected ? extractTitle(selected) : undefined}
        subtitle={
          selected && (
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge
                label={SUBMISSION_TYPE_LABELS[selected.submission_type] || selected.submission_type}
                color="blue"
              />
              <StatusBadge
                label={selected.status}
                color={STATUS_COLORS[selected.status]}
              />
            </div>
          )
        }
        backLabel="Back to submissions"
      >
        {selected && (
          <>
            {/* Submission Details — all data fields */}
            <DetailSection title="Submission Details">
              <div className="space-y-3">
                {Object.entries(selected.data).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-[11px] text-dim uppercase tracking-wider mb-0.5">
                      {formatDataKey(key)}
                    </p>
                    <p className="text-[13px] text-text leading-relaxed">
                      {renderDataValue(value)}
                    </p>
                  </div>
                ))}
                {Object.keys(selected.data).length === 0 && (
                  <p className="text-[13px] text-muted">No additional data.</p>
                )}
              </div>
            </DetailSection>

            {/* Submitter */}
            <DetailSection title="Submitter">
              <div className="space-y-3">
                {selected.submitter_name && (
                  <div>
                    <p className="text-[11px] text-dim uppercase tracking-wider mb-0.5">Name</p>
                    <p className="text-[13px] text-text">{selected.submitter_name}</p>
                  </div>
                )}
                {selected.submitter_email && (
                  <div>
                    <p className="text-[11px] text-dim uppercase tracking-wider mb-0.5">Email</p>
                    <p className="text-[13px] text-text font-mono">{selected.submitter_email}</p>
                  </div>
                )}
                {selected.submitter_org && (
                  <div>
                    <p className="text-[11px] text-dim uppercase tracking-wider mb-0.5">Organization</p>
                    <p className="text-[13px] text-text">{selected.submitter_org}</p>
                  </div>
                )}
              </div>
            </DetailSection>

            {/* Review (only if reviewed) */}
            {selected.status !== "pending" && (
              <DetailSection title="Review">
                <div className="space-y-3">
                  {selected.reviewed_by && (
                    <div>
                      <p className="text-[11px] text-dim uppercase tracking-wider mb-0.5">Reviewed By</p>
                      <p className="text-[13px] text-text">{selected.reviewed_by}</p>
                    </div>
                  )}
                  {selected.reviewed_at && (
                    <div>
                      <p className="text-[11px] text-dim uppercase tracking-wider mb-0.5">Reviewed At</p>
                      <p className="text-[13px] text-text">{formatDate(selected.reviewed_at)}</p>
                    </div>
                  )}
                  {selected.review_notes && (
                    <div>
                      <p className="text-[11px] text-dim uppercase tracking-wider mb-0.5">Notes</p>
                      <p className="text-[13px] text-text leading-relaxed bg-surface-inset rounded-md px-4 py-3">
                        {selected.review_notes}
                      </p>
                    </div>
                  )}
                </div>
              </DetailSection>
            )}

            {/* Record Metadata */}
            <DetailSection title="Record">
              <div className="space-y-1 text-[12px] text-dim">
                <p>Created: {formatDate(selected.created_at)}</p>
                {selected.created_entity_id && (
                  <p>Created Entity: <span className="font-mono">{selected.created_entity_id}</span></p>
                )}
              </div>
            </DetailSection>
          </>
        )}
      </DetailPanel>
    </>
  );
}

/* ── Pending Card Sub-components ───────────────────── */

interface PendingCardProps {
  submission: Submission;
  isSelected: boolean;
  onSelect: () => void;
}

function PendingCard({ submission, isSelected, onSelect }: PendingCardProps) {
  const { submission_type } = submission;

  return (
    <div
      onClick={onSelect}
      className={`bg-surface-card border rounded-lg px-5 py-4 cursor-pointer transition-colors ${
        isSelected
          ? "border-accent ring-1 ring-accent"
          : "border-border hover:border-border-medium"
      }`}
    >
      {submission_type === "opportunity" && (
        <OpportunityCard submission={submission} />
      )}
      {submission_type === "decision_flag" && (
        <DecisionFlagCard submission={submission} />
      )}
      {submission_type === "investment_verification" && (
        <InvestmentVerificationCard submission={submission} />
      )}
      {!["opportunity", "decision_flag", "investment_verification"].includes(submission_type) && (
        <GenericCard submission={submission} />
      )}
    </div>
  );
}

function OpportunityCard({ submission }: { submission: Submission }) {
  const { data } = submission;
  const title = typeof data.title === "string" ? data.title : "Untitled Opportunity";
  const oppType = typeof data.opportunity_type === "string" ? data.opportunity_type : null;
  const amount = typeof data.amount === "number" ? data.amount : null;
  const deadline = typeof data.deadline === "string" ? data.deadline : null;
  const eligibility = typeof data.eligibility === "string" ? data.eligibility : null;

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <StatusBadge label="Opportunity Submission" color="blue" />
        <StatusBadge label="Pending" color="orange" />
      </div>

      <h3 className="text-[15px] font-medium text-text leading-snug">{title}</h3>

      {submission.submitter_name && (
        <p className="text-[12px] text-muted mt-1">
          Submitted by {submission.submitter_name}
          {submission.submitter_org ? ` (${submission.submitter_org})` : ""}
        </p>
      )}

      <div className="flex items-center gap-3 mt-3 text-[12px] text-muted flex-wrap">
        {oppType && <span className="capitalize">{oppType}</span>}
        {oppType && amount !== null && <span className="text-dim">&middot;</span>}
        {amount !== null && (
          <span className="font-mono font-medium text-accent">{formatCurrency(amount)}</span>
        )}
        {deadline && (
          <>
            <span className="text-dim">&middot;</span>
            <span>Deadline: {formatDate(deadline)}</span>
          </>
        )}
      </div>

      {eligibility && (
        <p className="text-[12px] text-muted mt-2 leading-relaxed line-clamp-2">
          Eligibility: {eligibility}
        </p>
      )}

      <div className="flex items-center gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
        <Button size="sm" variant="primary">Approve & Create</Button>
        <Button size="sm" variant="ghost">Reject</Button>
        <Button size="sm" variant="ghost">View Details</Button>
      </div>
    </>
  );
}

function DecisionFlagCard({ submission }: { submission: Submission }) {
  const { data } = submission;
  const description = typeof data.description === "string" ? data.description : null;
  const expectedDate = typeof data.expected_date === "string" ? data.expected_date : null;

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <StatusBadge label="Decision Flag" color="purple" />
        <StatusBadge label="Pending" color="orange" />
      </div>

      {description && (
        <p className="text-[13px] text-text leading-relaxed bg-surface-inset rounded-md px-4 py-3 border-l-2 border-status-purple italic">
          &ldquo;{description}&rdquo;
        </p>
      )}

      {submission.submitter_name && (
        <p className="text-[12px] text-muted mt-2">
          Flagged by {submission.submitter_name}
          {submission.submitter_org ? ` (${submission.submitter_org})` : ""}
        </p>
      )}

      {expectedDate && (
        <p className="text-[12px] text-muted mt-1">
          Expected date: <span className="font-mono">{formatDate(expectedDate)}</span>
        </p>
      )}

      <div className="flex items-center gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
        <Button size="sm" variant="primary">Create Decision Entry</Button>
        <Button size="sm" variant="ghost">Dismiss</Button>
      </div>
    </>
  );
}

function InvestmentVerificationCard({ submission }: { submission: Submission }) {
  const { data } = submission;
  const investmentName = typeof data.investment_name === "string" ? data.investment_name : (typeof data.name === "string" ? data.name : "Unknown Investment");
  const correction = typeof data.correction === "string" ? data.correction : null;
  const additionalInfo = typeof data.additional_info === "string" ? data.additional_info : null;

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <StatusBadge label="Investment Verification" color="green" />
        <StatusBadge label="Pending" color="orange" />
      </div>

      <h3 className="text-[15px] font-medium text-text leading-snug">{investmentName}</h3>

      {submission.submitter_name && (
        <p className="text-[12px] text-muted mt-1">
          Submitted by {submission.submitter_name}
          {submission.submitter_org ? ` (${submission.submitter_org})` : ""}
        </p>
      )}

      {correction && (
        <div className="mt-3">
          <p className="text-[11px] text-dim uppercase tracking-wider mb-0.5">Correction</p>
          <p className="text-[13px] text-text leading-relaxed">{correction}</p>
        </div>
      )}

      {additionalInfo && (
        <div className="mt-2">
          <p className="text-[11px] text-dim uppercase tracking-wider mb-0.5">Additional Info</p>
          <p className="text-[12px] text-muted leading-relaxed line-clamp-3">{additionalInfo}</p>
        </div>
      )}

      <div className="flex items-center gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
        <Button size="sm" variant="primary">Apply Correction</Button>
        <Button size="sm" variant="ghost">Dismiss</Button>
      </div>
    </>
  );
}

function GenericCard({ submission }: { submission: Submission }) {
  const title = extractTitle(submission);

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <StatusBadge
          label={SUBMISSION_TYPE_LABELS[submission.submission_type] || submission.submission_type}
          color="dim"
        />
        <StatusBadge label="Pending" color="orange" />
      </div>

      <h3 className="text-[15px] font-medium text-text leading-snug">{title}</h3>

      {submission.submitter_name && (
        <p className="text-[12px] text-muted mt-1">
          Submitted by {submission.submitter_name}
          {submission.submitter_org ? ` (${submission.submitter_org})` : ""}
        </p>
      )}

      {Object.entries(submission.data).length > 0 && (
        <div className="mt-3 space-y-1">
          {Object.entries(submission.data).slice(0, 3).map(([key, value]) => (
            <p key={key} className="text-[12px] text-muted truncate">
              <span className="text-dim">{formatDataKey(key)}:</span> {renderDataValue(value)}
            </p>
          ))}
          {Object.entries(submission.data).length > 3 && (
            <p className="text-[11px] text-dim">
              +{Object.entries(submission.data).length - 3} more fields
            </p>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
        <Button size="sm" variant="primary">Review</Button>
        <Button size="sm" variant="ghost">Dismiss</Button>
      </div>
    </>
  );
}
