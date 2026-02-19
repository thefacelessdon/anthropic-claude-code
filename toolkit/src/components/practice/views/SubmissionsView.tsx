"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DetailPanel, DetailSection, InlineRefCard } from "@/components/ui/DetailPanel";
import { StatusBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils/formatting";
import type { Submission, SubmissionStatus } from "@/lib/supabase/types";
import {
  approveOpportunity,
  approveDecisionFlag,
  approvePractitionerTip,
  rejectSubmission,
} from "@/app/(practice)/submissions/actions";

// ─── Constants ──────────────────────────────────────

const SUBMISSION_TYPE_LABELS: Record<string, string> = {
  opportunity: "Opportunity Submission",
  decision_flag: "Decision Flag",
  investment_verification: "Investment Verification",
  practitioner_tip: "Practitioner Tip",
  interest_signal: "Interest Signal",
};

const STATUS_COLORS: Record<SubmissionStatus, "orange" | "green" | "red"> = {
  pending: "orange",
  approved: "green",
  rejected: "red",
};

const TYPE_BADGE_COLORS: Record<string, "blue" | "purple" | "green" | "orange" | "dim"> = {
  opportunity: "blue",
  decision_flag: "purple",
  investment_verification: "green",
  practitioner_tip: "orange",
  interest_signal: "dim",
};

// ─── Types ──────────────────────────────────────────

type PractitionerRef = { id: string; name: string; discipline: string | null };
type OrgRef = { id: string; name: string };
type OppRef = { id: string; title: string; source_name: string | null };

interface SubmissionsViewProps {
  submissions: Submission[];
  orgNames: string[];
  practitionerList: PractitionerRef[];
  existingOpportunities: OppRef[];
  allOrgs: OrgRef[];
}

// ─── Helpers ────────────────────────────────────────

function extractTitle(s: Submission): string {
  const { data } = s;
  if (typeof data.title === "string" && data.title) return data.title;
  if (typeof data.name === "string" && data.name) return data.name;
  if (typeof data.decision === "string") return (data.decision as string).slice(0, 80) + ((data.decision as string).length > 80 ? "…" : "");
  if (typeof data.what_being_decided === "string") return (data.what_being_decided as string).slice(0, 80);
  if (typeof data.organization === "string") return `${data.organization} — Verification`;
  if (s.submission_type === "interest_signal" && typeof data.opportunity_title === "string") return `Interest in ${data.opportunity_title}`;
  return SUBMISSION_TYPE_LABELS[s.submission_type] || "Submission";
}

function matchOrg(name: string | undefined, orgNames: string[]): boolean {
  if (!name) return false;
  const lower = name.toLowerCase();
  return orgNames.some((n) => n.includes(lower) || lower.includes(n));
}

function matchPractitioner(name: string | undefined, practitioners: PractitionerRef[]): PractitionerRef | null {
  if (!name) return null;
  const lowerName = name.toLowerCase();
  return practitioners.find((p) => p.name.toLowerCase() === lowerName) || null;
}

function findSimilarOpportunities(title: string | undefined, opps: OppRef[]): OppRef[] {
  if (!title) return [];
  const words = title.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  return opps.filter((o) => {
    const lower = o.title.toLowerCase();
    return words.some((w) => lower.includes(w));
  }).slice(0, 3);
}

function navigateTo(path: string) {
  window.location.href = path;
}

// ─── Component ──────────────────────────────────────

export function SubmissionsView({
  submissions,
  orgNames,
  practitionerList,
  existingOpportunities,
}: SubmissionsViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "signals" | "reviewed">("pending");
  const [saving, setSaving] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Editable fields for approval
  const [editFields, setEditFields] = useState<Record<string, string>>({});

  useEffect(() => {
    const openId = searchParams.get("open");
    if (openId) setSelectedId(openId);
  }, [searchParams]);

  const submissionMap = new Map(submissions.map((s) => [s.id, s]));
  const selected = selectedId ? submissionMap.get(selectedId) : null;

  const pending = submissions.filter((s) => s.status === "pending" && s.submission_type !== "interest_signal");
  const signals = submissions.filter((s) => s.submission_type === "interest_signal");
  const reviewed = submissions.filter((s) => s.status === "approved" || s.status === "rejected");

  // When selecting a submission, populate edit fields
  useEffect(() => {
    if (selected && selected.status === "pending") {
      const fields: Record<string, string> = {};
      Object.entries(selected.data).forEach(([key, value]) => {
        fields[key] = value !== null && value !== undefined ? String(value) : "";
      });
      setEditFields(fields);
      setShowRejectForm(false);
      setRejectReason("");
    }
  }, [selected]);

  // ─── Approval Handlers ────────────────────────────

  const handleApproveOpportunity = useCallback(async () => {
    if (!selected) return;
    setSaving(true);
    const result = await approveOpportunity(selected.id, {
      title: editFields.title || "",
      opportunity_type: editFields.opportunity_type || editFields.type || "grant",
      source_name: editFields.source_name || editFields.source || undefined,
      amount_min: editFields.amount_min ? Number(editFields.amount_min) : undefined,
      amount_max: editFields.amount_max ? Number(editFields.amount_max) : undefined,
      deadline: editFields.deadline || undefined,
      description: editFields.description || undefined,
      eligibility: editFields.eligibility || undefined,
      application_url: editFields.application_url || undefined,
    });
    setSaving(false);
    if (result.success) {
      setSelectedId(null);
      router.refresh();
    }
  }, [selected, editFields, router]);

  const handleApproveDecisionFlag = useCallback(async () => {
    if (!selected) return;
    setSaving(true);
    const result = await approveDecisionFlag(selected.id, {
      decision_title: editFields.decision_title || editFields.decision || editFields.what_being_decided || "",
      stakeholder_name: editFields.stakeholder || editFields.organization || undefined,
      description: editFields.description || editFields.what_being_decided || editFields.decision || undefined,
      locks_date: editFields.locks_date || editFields.approximate_lock_date || undefined,
      intervention_needed: editFields.intervention_needed || undefined,
    });
    setSaving(false);
    if (result.success) {
      setSelectedId(null);
      router.refresh();
    }
  }, [selected, editFields, router]);

  const handleApprovePractitionerTip = useCallback(async () => {
    if (!selected) return;
    setSaving(true);
    const result = await approvePractitionerTip(selected.id, {
      name: editFields.name || "",
      discipline: editFields.discipline || "",
      tenure: editFields.tenure || undefined,
      notes: editFields.context || undefined,
      website: editFields.website || undefined,
    });
    setSaving(false);
    if (result.success) {
      setSelectedId(null);
      router.refresh();
    }
  }, [selected, editFields, router]);

  const handleReject = useCallback(async () => {
    if (!selected) return;
    setSaving(true);
    await rejectSubmission(selected.id, rejectReason.trim() || undefined);
    setSaving(false);
    setSelectedId(null);
    setShowRejectForm(false);
    router.refresh();
  }, [selected, rejectReason, router]);

  // ─── Render ───────────────────────────────────────

  return (
    <>
      {/* Tab header */}
      <div className="flex items-center gap-1 mb-6 border-b border-border">
        {([
          { key: "pending" as const, label: "Pending", count: pending.length },
          { key: "signals" as const, label: "Interest Signals", count: signals.length },
          { key: "reviewed" as const, label: "Reviewed", count: reviewed.length },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-[13px] font-medium transition-colors relative ${
              activeTab === tab.key ? "text-text" : "text-muted hover:text-text"
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-[11px] text-dim bg-surface-inset px-1.5 py-0.5 rounded font-mono">
              {tab.count}
            </span>
            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-text rounded-t" />
            )}
          </button>
        ))}
      </div>

      {/* ── Pending Tab ──────────────────────────────── */}
      {activeTab === "pending" && (
        <>
          {pending.length === 0 ? (
            <p className="text-[13px] text-muted py-8 text-center">No submissions pending review.</p>
          ) : (
            <div className="space-y-3">
              {pending.map((s) => (
                <PendingCard
                  key={s.id}
                  submission={s}
                  orgNames={orgNames}
                  existingOpportunities={existingOpportunities}
                  practitionerList={practitionerList}
                  selected={selectedId === s.id}
                  onClick={() => setSelectedId(s.id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Interest Signals Tab ─────────────────────── */}
      {activeTab === "signals" && (
        <>
          {signals.length === 0 ? (
            <p className="text-[13px] text-muted py-8 text-center">No interest signals yet.</p>
          ) : (
            <div className="space-y-3">
              {signals.map((s) => (
                <InterestSignalCard
                  key={s.id}
                  submission={s}
                  practitionerList={practitionerList}
                  selected={selectedId === s.id}
                  onClick={() => setSelectedId(s.id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Reviewed Tab ─────────────────────────────── */}
      {activeTab === "reviewed" && (
        <>
          {reviewed.length === 0 ? (
            <p className="text-[13px] text-muted py-8 text-center">No reviewed submissions yet.</p>
          ) : (
            <div className="space-y-1">
              {reviewed.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setSelectedId(s.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md cursor-pointer transition-colors ${
                    selectedId === s.id ? "bg-surface-inset ring-1 ring-accent" : "hover:bg-surface-inset"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-text truncate">{extractTitle(s)}</p>
                    <p className="text-[11px] text-dim truncate">
                      {SUBMISSION_TYPE_LABELS[s.submission_type] || s.submission_type}
                      {s.created_entity_id && " → Created entry"}
                    </p>
                  </div>
                  <StatusBadge label={s.status === "approved" ? "Approved ✓" : "Rejected"} color={STATUS_COLORS[s.status]} />
                  <span className="text-[11px] text-dim shrink-0">{formatDate(s.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Detail Panel ─────────────────────────────── */}
      <DetailPanel
        isOpen={!!selected}
        onClose={() => { setSelectedId(null); setShowRejectForm(false); }}
        title={selected ? extractTitle(selected) : undefined}
        backLabel="Back to submissions"
        subtitle={
          selected ? (
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <StatusBadge
                label={SUBMISSION_TYPE_LABELS[selected.submission_type] || selected.submission_type}
                color={TYPE_BADGE_COLORS[selected.submission_type] || "blue"}
              />
              <StatusBadge label={selected.status} color={STATUS_COLORS[selected.status]} />
              <span className="text-[12px] text-dim font-mono">{formatDate(selected.created_at)}</span>
            </div>
          ) : undefined
        }
      >
        {selected && (
          <>
            {/* ── Review Checks ─────────────────────── */}
            {selected.status === "pending" && selected.submission_type !== "interest_signal" && (
              <DetailSection title="Review">
                <div className="space-y-2 text-[13px]">
                  {/* Org match check */}
                  {((): React.ReactNode => {
                    const orgName = (selected.data.source as string) || (selected.data.source_name as string) || (selected.data.organization as string) || (selected.data.stakeholder as string);
                    if (!orgName) return null;
                    const found = matchOrg(orgName, orgNames);
                    return (
                      <p className={found ? "text-status-green" : "text-status-orange"}>
                        {found ? "✓" : "⚠"} {found
                          ? `"${orgName}" is in the ecosystem map`
                          : `Source org "${orgName}" not in ecosystem map`
                        }
                      </p>
                    );
                  })()}

                  {/* Deduplication check for opportunities */}
                  {selected.submission_type === "opportunity" && ((): React.ReactNode => {
                    const title = selected.data.title as string;
                    const similar = findSimilarOpportunities(title, existingOpportunities);
                    if (similar.length === 0) {
                      return <p className="text-status-green">✓ No similar opportunities found (deduplication check passed)</p>;
                    }
                    return (
                      <div>
                        <p className="text-status-orange">⚠ Similar opportunities found:</p>
                        {similar.map((o) => (
                          <p key={o.id} className="text-dim ml-4 text-[12px]">
                            &ldquo;{o.title}&rdquo; {o.source_name ? `(${o.source_name})` : ""}
                          </p>
                        ))}
                      </div>
                    );
                  })()}

                  {/* Practitioner match for tips */}
                  {selected.submission_type === "practitioner_tip" && ((): React.ReactNode => {
                    const name = selected.data.name as string;
                    const match = matchPractitioner(name, practitionerList);
                    if (match) {
                      return <p className="text-status-orange">⚠ &ldquo;{name}&rdquo; may already exist in ecosystem map: {match.name} ({match.discipline || "—"})</p>;
                    }
                    return <p className="text-status-green">✓ No existing practitioner match found</p>;
                  })()}
                </div>
              </DetailSection>
            )}

            {/* ── Interest Signal Detail ──────────── */}
            {selected.submission_type === "interest_signal" && (
              <DetailSection title="Signal Details">
                <div className="space-y-3">
                  <div className="space-y-1.5 text-[13px]">
                    <p><span className="text-dim">Name:</span> {selected.submitter_name || "—"}</p>
                    <p><span className="text-dim">Email:</span> <span className="font-mono">{selected.submitter_email || "—"}</span></p>
                    <p><span className="text-dim">Discipline:</span> {(selected.data.discipline as string) || "—"}</p>
                    <p><span className="text-dim">Opportunity:</span> {(selected.data.opportunity_title as string) || "—"}</p>
                    {typeof selected.data.note === "string" && (selected.data.note as string).length > 0 ? (
                      <p className="text-text bg-surface-inset rounded-md px-4 py-3 border-l-2 border-accent italic mt-2">
                        &ldquo;{selected.data.note as string}&rdquo;
                      </p>
                    ) : null}
                  </div>

                  {/* Practitioner matching */}
                  {((): React.ReactNode => {
                    const match = matchPractitioner(selected.submitter_name || undefined, practitionerList);
                    if (match) {
                      return (
                        <div className="mt-2">
                          <p className="text-[12px] text-status-green mb-2">✓ Matches ecosystem map practitioner:</p>
                          <InlineRefCard
                            title={match.name}
                            subtitle={match.discipline || "—"}
                            accentColor="gold"
                            onClick={() => navigateTo(`/ecosystem-map?open=${match.id}`)}
                          />
                        </div>
                      );
                    }
                    return (
                      <p className="text-[12px] text-status-orange mt-2">⚠ No match in ecosystem map</p>
                    );
                  })()}

                  {/* Actions */}
                  {typeof selected.data.opportunity_id === "string" && selected.data.opportunity_id ? (
                    <button
                      onClick={() => navigateTo(`/opportunities/${selected.data.opportunity_id as string}`)}
                      className="text-[12px] text-accent hover:underline mt-2"
                    >
                      View opportunity →
                    </button>
                  ) : null}
                </div>
              </DetailSection>
            )}

            {/* ── Editable Fields (pending non-signals) ── */}
            {selected.status === "pending" && selected.submission_type !== "interest_signal" && (
              <DetailSection title="Edit Before Approving" subtitle="Modify fields before the entity enters the system">
                <div className="space-y-3">
                  {Object.entries(editFields).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-[11px] text-dim uppercase tracking-[0.06em] mb-1">
                        {key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </label>
                      {value.length > 80 || key === "description" || key === "context" || key === "what_being_decided" || key === "decision" || key === "additional_info" ? (
                        <textarea
                          value={value}
                          onChange={(e) => setEditFields((f) => ({ ...f, [key]: e.target.value }))}
                          rows={3}
                          className="w-full text-[13px] text-text bg-surface border border-border rounded px-2 py-1.5 resize-y focus:outline-none focus:border-accent"
                        />
                      ) : (
                        <input
                          type={key.includes("date") || key === "deadline" ? "date" : key.includes("amount") || key === "reported_amount" ? "number" : key.includes("url") || key.includes("link") || key === "website" ? "url" : "text"}
                          value={value}
                          onChange={(e) => setEditFields((f) => ({ ...f, [key]: e.target.value }))}
                          className="w-full text-[13px] text-text bg-surface border border-border rounded px-2 py-1.5 focus:outline-none focus:border-accent"
                        />
                      )}
                    </div>
                  ))}

                  {/* Contextual action buttons */}
                  <div className="flex items-center gap-2 pt-2 flex-wrap">
                    {selected.submission_type === "opportunity" && (
                      <button
                        onClick={handleApproveOpportunity}
                        disabled={saving}
                        className="px-4 py-2 text-[13px] font-medium text-bg bg-text rounded hover:opacity-90 disabled:opacity-50"
                      >
                        {saving ? "Creating..." : "Approve & Create Opportunity"}
                      </button>
                    )}
                    {selected.submission_type === "decision_flag" && (
                      <button
                        onClick={handleApproveDecisionFlag}
                        disabled={saving}
                        className="px-4 py-2 text-[13px] font-medium text-bg bg-text rounded hover:opacity-90 disabled:opacity-50"
                      >
                        {saving ? "Creating..." : "Create Decision Entry"}
                      </button>
                    )}
                    {selected.submission_type === "practitioner_tip" && (
                      <button
                        onClick={handleApprovePractitionerTip}
                        disabled={saving}
                        className="px-4 py-2 text-[13px] font-medium text-bg bg-text rounded hover:opacity-90 disabled:opacity-50"
                      >
                        {saving ? "Creating..." : "Add to Ecosystem Map"}
                      </button>
                    )}
                    {selected.submission_type === "investment_verification" && (
                      <button disabled className="px-4 py-2 text-[13px] font-medium text-bg bg-text rounded opacity-50 cursor-not-allowed">
                        Apply Correction
                      </button>
                    )}

                    {!showRejectForm ? (
                      <button
                        onClick={() => setShowRejectForm(true)}
                        className="px-4 py-2 text-[13px] text-muted hover:text-text transition-colors"
                      >
                        {selected.submission_type === "decision_flag" || selected.submission_type === "investment_verification" ? "Dismiss" : "Reject"}
                      </button>
                    ) : (
                      <div className="w-full space-y-2 mt-2">
                        <input
                          type="text"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Reason for rejection..."
                          className="w-full text-[13px] text-text bg-surface border border-border rounded px-2 py-1.5 placeholder:text-dim focus:outline-none focus:border-accent"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleReject}
                            disabled={saving}
                            className="px-3 py-1 text-[12px] text-status-red hover:underline disabled:opacity-50"
                          >
                            {saving ? "..." : "Confirm rejection"}
                          </button>
                          <button
                            onClick={() => setShowRejectForm(false)}
                            className="px-3 py-1 text-[12px] text-muted hover:text-text"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </DetailSection>
            )}

            {/* ── Submitter ──────────────────────── */}
            {(selected.submitter_name || selected.submitter_email || selected.submitter_org) && selected.submission_type !== "interest_signal" && (
              <DetailSection title="Submitter">
                <div className="space-y-1.5 text-[13px]">
                  {selected.submitter_name && <p><span className="text-dim">Name:</span> {selected.submitter_name}</p>}
                  {selected.submitter_email && <p><span className="text-dim">Email:</span> <span className="font-mono">{selected.submitter_email}</span></p>}
                  {selected.submitter_org && <p><span className="text-dim">Organization:</span> {selected.submitter_org}</p>}
                </div>
              </DetailSection>
            )}

            {/* ── Review Info (reviewed submissions) ── */}
            {selected.status !== "pending" && (
              <DetailSection title="Review Outcome">
                <div className="space-y-1.5 text-[13px]">
                  {selected.reviewed_at && <p><span className="text-dim">Reviewed:</span> {formatDate(selected.reviewed_at)}</p>}
                  {selected.review_notes && (
                    <p className="text-text bg-surface-inset rounded-md px-4 py-3 mt-2">
                      {selected.review_notes}
                    </p>
                  )}
                  {selected.created_entity_id && (
                    <p className="text-[12px] text-accent mt-2">
                      Created entity: <span className="font-mono">{selected.created_entity_id.slice(0, 8)}…</span>
                    </p>
                  )}
                </div>
              </DetailSection>
            )}

            {/* ── Record ──────────────────────────── */}
            <DetailSection title="Record">
              <div className="space-y-1 text-[12px] text-dim">
                <p>Submitted: {formatDate(selected.created_at)}</p>
                {selected.reviewed_at && <p>Reviewed: {formatDate(selected.reviewed_at)}</p>}
              </div>
            </DetailSection>
          </>
        )}
      </DetailPanel>
    </>
  );
}

// ─── Pending Card ───────────────────────────────────

function PendingCard({
  submission,
  orgNames,
  existingOpportunities,
  practitionerList,
  selected,
  onClick,
}: {
  submission: Submission;
  orgNames: string[];
  existingOpportunities: OppRef[];
  practitionerList: PractitionerRef[];
  selected: boolean;
  onClick: () => void;
}) {
  const { data, submission_type } = submission;
  const title = extractTitle(submission);
  const orgName = (data.source as string) || (data.source_name as string) || (data.organization as string) || (data.stakeholder as string);
  const orgFound = matchOrg(orgName, orgNames);

  const similar = submission_type === "opportunity" ? findSimilarOpportunities(data.title as string, existingOpportunities) : [];
  const pracMatch = submission_type === "practitioner_tip" ? matchPractitioner(data.name as string, practitionerList) : null;

  return (
    <div
      onClick={onClick}
      className={`bg-surface border border-border rounded-lg px-5 py-4 cursor-pointer transition-colors ${
        selected ? "border-accent ring-1 ring-accent" : "hover:border-border-medium"
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <StatusBadge label={SUBMISSION_TYPE_LABELS[submission_type] || submission_type} color={TYPE_BADGE_COLORS[submission_type] || "blue"} />
        <StatusBadge label="Pending" color="orange" />
        <span className="text-[12px] text-dim font-mono ml-auto">{formatDate(submission.created_at)}</span>
      </div>

      {/* Title */}
      <h3 className="text-[15px] font-medium text-text leading-snug">{title}</h3>

      {/* Submitter */}
      {submission.submitter_name && (
        <p className="text-[12px] text-muted mt-1">
          {submission_type === "decision_flag" ? "Flagged" : "Submitted"} by {submission.submitter_name}
          {submission.submitter_org ? ` (${submission.submitter_org})` : ""}
        </p>
      )}

      {/* Type-specific details */}
      {submission_type === "opportunity" ? (
        <div className="flex items-center gap-3 mt-2 text-[12px] text-muted flex-wrap">
          {typeof data.type === "string" ? <span className="capitalize">{data.type}</span> : null}
          {typeof data.amount === "string" ? <><span className="text-dim">·</span><span className="font-mono text-accent">{data.amount}</span></> : null}
          {typeof data.deadline === "string" ? <><span className="text-dim">·</span><span>Deadline: {formatDate(data.deadline)}</span></> : null}
        </div>
      ) : null}

      {submission_type === "decision_flag" && (typeof data.decision === "string" || typeof data.what_being_decided === "string") ? (
        <p className="text-[13px] text-text bg-surface-inset rounded-md px-4 py-3 border-l-2 border-status-purple italic mt-2 line-clamp-2">
          &ldquo;{(data.decision as string) || (data.what_being_decided as string)}&rdquo;
        </p>
      ) : null}

      {submission_type === "practitioner_tip" ? (
        <p className="text-[12px] text-muted mt-2">
          {data.discipline as string}{typeof data.tenure === "string" ? ` · ${data.tenure}` : ""}
        </p>
      ) : null}

      {submission_type === "investment_verification" && typeof data.correction === "string" ? (
        <p className="text-[12px] text-muted mt-2 line-clamp-2">
          {data.correction}
        </p>
      ) : null}

      {/* Ecosystem match indicators */}
      <div className="mt-3 space-y-1">
        {orgName && (
          <p className={`text-[11px] ${orgFound ? "text-status-green" : "text-status-orange"}`}>
            {orgFound ? "✓" : "⚠"} {orgFound ? `${orgName} is in ecosystem map` : `"${orgName}" not in ecosystem map`}
          </p>
        )}
        {similar.length > 0 && (
          <p className="text-[11px] text-status-orange">⚠ Similar: &ldquo;{similar[0].title}&rdquo; already listed</p>
        )}
        {pracMatch && (
          <p className="text-[11px] text-status-orange">⚠ &ldquo;{data.name as string}&rdquo; may already exist in ecosystem map</p>
        )}
      </div>
    </div>
  );
}

// ─── Interest Signal Card ───────────────────────────

function InterestSignalCard({
  submission,
  practitionerList,
  selected,
  onClick,
}: {
  submission: Submission;
  practitionerList: PractitionerRef[];
  selected: boolean;
  onClick: () => void;
}) {
  const { data } = submission;
  const match = matchPractitioner(submission.submitter_name || undefined, practitionerList);

  return (
    <div
      onClick={onClick}
      className={`bg-surface border border-border rounded-lg px-5 py-4 cursor-pointer transition-colors ${
        selected ? "border-accent ring-1 ring-accent" : "hover:border-border-medium"
      }`}
    >
      {/* Name + discipline */}
      <p className="text-[15px] font-medium text-text">
        {submission.submitter_name || "Anonymous"} · {(data.discipline as string) || "—"}
      </p>

      {/* Opportunity */}
      <p className="text-[12px] text-muted mt-1">
        Interested in: {(data.opportunity_title as string) || "—"}
      </p>

      {/* Note */}
      {typeof data.note === "string" && data.note.length > 0 ? (
        <p className="text-[13px] text-text bg-surface-inset rounded-md px-4 py-3 border-l-2 border-accent italic mt-2 line-clamp-2">
          &ldquo;{data.note}&rdquo;
        </p>
      ) : (
        <p className="text-[12px] text-dim mt-1 italic">No note</p>
      )}

      {/* Practitioner match */}
      <p className={`text-[11px] mt-2 ${match ? "text-status-green" : "text-status-orange"}`}>
        {match
          ? `✓ Matches ecosystem map: ${match.name} (${match.discipline || "—"})`
          : "⚠ No match in ecosystem map"
        }
      </p>
    </div>
  );
}
