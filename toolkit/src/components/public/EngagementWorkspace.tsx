"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils/formatting";
import {
  completeMilestone,
  submitDeliverable,
  confirmComplete,
} from "@/app/engagements/[id]/actions";

interface Engagement {
  id: string;
  title: string;
  scope: string | null;
  total_amount: number | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  payment_terms: Record<string, unknown>[];
  practitioner_confirmed_complete: boolean;
  funder_confirmed_complete: boolean;
  completed_at: string | null;
}

interface Milestone {
  id: string;
  title: string;
  due_date: string | null;
  completed_at: string | null;
  sort_order: number;
}

interface Deliverable {
  id: string;
  title: string;
  file_url: string | null;
  submitted_at: string | null;
  accepted_at: string | null;
  sort_order: number;
}

interface Activity {
  id: string;
  actor: string;
  action: string;
  detail: string | null;
  created_at: string;
}

interface Props {
  engagement: Engagement;
  practitioner: { id: string; name: string; primary_skill: string };
  funderName: string | null;
  milestones: Milestone[];
  deliverables: Deliverable[];
  activity: Activity[];
  isPractitioner: boolean;
}

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  paid: "var(--pub-grant)",
  processing: "var(--pub-commission)",
  invoiced: "var(--pub-text-secondary)",
  pending: "var(--pub-text-tertiary)",
};

export function EngagementWorkspace({
  engagement,
  practitioner,
  funderName,
  milestones: initialMilestones,
  deliverables: initialDeliverables,
  activity: initialActivity,
  isPractitioner,
}: Props) {
  const [milestones, setMilestones] = useState(initialMilestones);
  const [deliverables, setDeliverables] = useState(initialDeliverables);
  const [activity, setActivity] = useState(initialActivity);
  const [eng, setEng] = useState(engagement);
  const [loading, setLoading] = useState<string | null>(null);

  const dateRange = [
    eng.start_date
      ? new Date(eng.start_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })
      : null,
    eng.end_date
      ? new Date(eng.end_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })
      : null,
  ]
    .filter(Boolean)
    .join(" \u2013 ");

  const allDelivSubmitted = deliverables.length > 0 && deliverables.every((d) => d.submitted_at);
  const canPractitionerConfirm = allDelivSubmitted && !eng.practitioner_confirmed_complete && eng.status === "active";

  async function handleMilestoneComplete(id: string) {
    setLoading(id);
    const result = await completeMilestone(id, eng.id);
    if (result.success) {
      setMilestones((prev) =>
        prev.map((m) => (m.id === id ? { ...m, completed_at: new Date().toISOString() } : m))
      );
      const milestone = milestones.find((m) => m.id === id);
      setActivity((prev) => [
        { id: `temp-${Date.now()}`, actor: "practitioner", action: "Completed milestone", detail: milestone?.title || "", created_at: new Date().toISOString() },
        ...prev,
      ]);
    }
    setLoading(null);
  }

  async function handleDeliverableSubmit(id: string) {
    setLoading(id);
    const result = await submitDeliverable(id, eng.id);
    if (result.success) {
      setDeliverables((prev) =>
        prev.map((d) => (d.id === id ? { ...d, submitted_at: new Date().toISOString() } : d))
      );
      const deliverable = deliverables.find((d) => d.id === id);
      setActivity((prev) => [
        { id: `temp-${Date.now()}`, actor: "practitioner", action: "Submitted deliverable", detail: deliverable?.title || "", created_at: new Date().toISOString() },
        ...prev,
      ]);
    }
    setLoading(null);
  }

  async function handleConfirmComplete(role: "practitioner" | "funder") {
    setLoading("confirm");
    const result = await confirmComplete(eng.id, role);
    if (result.success) {
      if (role === "practitioner") {
        setEng((prev) => ({ ...prev, practitioner_confirmed_complete: true }));
      } else {
        setEng((prev) => ({ ...prev, funder_confirmed_complete: true, status: "complete", completed_at: new Date().toISOString() }));
      }
      setActivity((prev) => [
        { id: `temp-${Date.now()}`, actor: role, action: "Confirmed completion", detail: null, created_at: new Date().toISOString() },
        ...prev,
      ]);
    }
    setLoading(null);
  }

  const isOverdue = (dueDate: string | null, completedAt: string | null) => {
    if (!dueDate || completedAt) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="pub-page" style={{ paddingBottom: 64 }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* Back */}
        <div style={{ padding: "24px 0" }}>
          <Link href="/profile" className="pub-link" style={{ fontSize: 14 }}>
            &larr; Back to profile
          </Link>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: eng.status === "complete" ? "var(--pub-grant)" : eng.status === "active" ? "var(--pub-rfp)" : "var(--pub-text-tertiary)",
          }}>
            {eng.status === "complete" ? "Completed" : eng.status === "active" ? "In Progress" : eng.status}
          </span>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 500, marginTop: 8 }}>
            {eng.title}
          </h1>
          <p style={{ fontSize: 15, color: "var(--pub-text-secondary)", marginTop: 4 }}>
            <Link href={`/profile/${practitioner.id}`} className="pub-link" style={{ fontWeight: 400 }}>
              {practitioner.name}
            </Link>
            {funderName && <> &harr; {funderName}</>}
          </p>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 14, marginTop: 8, color: "var(--pub-text-secondary)" }}>
            {eng.total_amount ? formatCurrency(Number(eng.total_amount)) : ""}
            {dateRange && <> &middot; {dateRange}</>}
          </p>
        </div>

        {/* Scope */}
        {eng.scope && (
          <section style={{ marginBottom: 32 }}>
            <h2 className="pub-detail-label" style={{ marginBottom: 8, fontSize: 12 }}>Scope</h2>
            <p style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{eng.scope}</p>
          </section>
        )}

        {/* Milestones */}
        <section style={{ marginBottom: 32, background: "var(--pub-bg-card)", border: "1px solid var(--pub-border)", borderRadius: 8, padding: "20px 24px" }}>
          <h2 className="pub-detail-label" style={{ marginBottom: 12, fontSize: 12 }}>Milestones</h2>
          {milestones.map((m) => (
            <div
              key={m.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "8px 0",
                borderBottom: "1px solid var(--pub-border)",
                opacity: m.completed_at ? 0.6 : 1,
              }}
            >
              {isPractitioner && eng.status === "active" && !m.completed_at ? (
                <button
                  onClick={() => handleMilestoneComplete(m.id)}
                  disabled={loading === m.id}
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    border: `2px solid ${isOverdue(m.due_date, m.completed_at) ? "var(--pub-urgent)" : "var(--pub-border)"}`,
                    background: "none",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                />
              ) : (
                <span style={{
                  width: 18,
                  height: 18,
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  flexShrink: 0,
                  background: m.completed_at ? "var(--pub-grant)" : "none",
                  border: m.completed_at ? "none" : `2px solid ${isOverdue(m.due_date, m.completed_at) ? "var(--pub-urgent)" : "var(--pub-border)"}`,
                  color: "#fff",
                }}>
                  {m.completed_at ? "\u2713" : ""}
                </span>
              )}
              <span style={{ flex: 1, fontSize: 14, textDecoration: m.completed_at ? "line-through" : "none" }}>
                {m.title}
              </span>
              {m.due_date && (
                <span style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: isOverdue(m.due_date, m.completed_at) ? "var(--pub-urgent)" : "var(--pub-text-tertiary)",
                  fontWeight: isOverdue(m.due_date, m.completed_at) ? 600 : 400,
                }}>
                  {new Date(m.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              )}
            </div>
          ))}
        </section>

        {/* Deliverables */}
        <section style={{ marginBottom: 32, background: "var(--pub-bg-card)", border: "1px solid var(--pub-border)", borderRadius: 8, padding: "20px 24px" }}>
          <h2 className="pub-detail-label" style={{ marginBottom: 12, fontSize: 12 }}>Deliverables</h2>
          {deliverables.map((d) => (
            <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid var(--pub-border)" }}>
              <span style={{
                width: 18,
                height: 18,
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                flexShrink: 0,
                background: d.accepted_at ? "var(--pub-grant)" : d.submitted_at ? "var(--pub-commission)" : "none",
                border: d.accepted_at || d.submitted_at ? "none" : "2px solid var(--pub-border)",
                color: "#fff",
              }}>
                {d.accepted_at ? "\u2713" : d.submitted_at ? "\u2192" : ""}
              </span>
              <span style={{ flex: 1, fontSize: 14 }}>{d.title}</span>
              {isPractitioner && eng.status === "active" && !d.submitted_at && (
                <button
                  onClick={() => handleDeliverableSubmit(d.id)}
                  disabled={loading === d.id}
                  className="pub-link"
                  style={{ fontSize: 12 }}
                >
                  Mark submitted
                </button>
              )}
              {d.submitted_at && !d.accepted_at && (
                <span style={{ fontSize: 11, color: "var(--pub-commission)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Submitted
                </span>
              )}
              {d.accepted_at && (
                <span style={{ fontSize: 11, color: "var(--pub-grant)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Accepted
                </span>
              )}
            </div>
          ))}
        </section>

        {/* Payment Terms */}
        {eng.payment_terms && Array.isArray(eng.payment_terms) && eng.payment_terms.length > 0 && (
          <section style={{ marginBottom: 32, background: "var(--pub-bg-card)", border: "1px solid var(--pub-border)", borderRadius: 8, padding: "20px 24px" }}>
            <h2 className="pub-detail-label" style={{ marginBottom: 12, fontSize: 12 }}>Payment</h2>
            {(eng.payment_terms as { amount?: number; trigger?: string; status?: string; paid_date?: string }[]).map((pt, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--pub-border)" }}>
                <div>
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 14 }}>
                    {pt.amount ? formatCurrency(pt.amount) : ""}
                  </span>
                  {pt.trigger && (
                    <span style={{ fontSize: 13, color: "var(--pub-text-secondary)", marginLeft: 8 }}>
                      {pt.trigger}
                    </span>
                  )}
                </div>
                <span style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: PAYMENT_STATUS_COLORS[pt.status || "pending"] || "var(--pub-text-tertiary)",
                }}>
                  {pt.status || "pending"}
                  {pt.paid_date && (
                    <span style={{ fontWeight: 400, marginLeft: 4, textTransform: "none", fontFamily: "var(--font-mono)", fontSize: 11 }}>
                      {formatDate(pt.paid_date)}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </section>
        )}

        {/* Completion */}
        {eng.status === "active" && (
          <section style={{ marginBottom: 32, background: "var(--pub-bg-card)", border: "1px solid var(--pub-border)", borderRadius: 8, padding: "20px 24px" }}>
            {canPractitionerConfirm && isPractitioner && (
              <div>
                <p style={{ fontSize: 14, marginBottom: 12 }}>
                  All deliverables submitted. Ready to mark this engagement as complete?
                </p>
                <button
                  onClick={() => handleConfirmComplete("practitioner")}
                  disabled={loading === "confirm"}
                  className="pub-form-submit"
                >
                  {loading === "confirm" ? "Confirming..." : "Mark as complete"}
                </button>
              </div>
            )}
            {eng.practitioner_confirmed_complete && !eng.funder_confirmed_complete && (
              <div>
                <p style={{ fontSize: 14, marginBottom: 12 }}>
                  Practitioner has confirmed completion.
                  {!isPractitioner ? " Confirm to finalize." : " Waiting for funder confirmation."}
                </p>
                {!isPractitioner && (
                  <button
                    onClick={() => handleConfirmComplete("funder")}
                    disabled={loading === "confirm"}
                    className="pub-form-submit"
                  >
                    {loading === "confirm" ? "Confirming..." : "Confirm completion"}
                  </button>
                )}
              </div>
            )}
            {!canPractitionerConfirm && !eng.practitioner_confirmed_complete && (
              <p style={{ fontSize: 13, color: "var(--pub-text-tertiary)" }}>
                Submit all deliverables to enable completion.
              </p>
            )}
          </section>
        )}

        {/* Completed banner */}
        {eng.status === "complete" && (
          <div style={{
            background: "rgba(45, 125, 70, 0.08)",
            borderLeft: "3px solid var(--pub-grant)",
            padding: "16px 20px",
            borderRadius: "0 8px 8px 0",
            marginBottom: 32,
            fontSize: 14,
          }}>
            Engagement completed {eng.completed_at ? formatDate(eng.completed_at) : ""}.
            This work has been recorded in the investment ledger.
          </div>
        )}

        {/* Activity Log */}
        <section style={{ marginBottom: 32 }}>
          <h2 className="pub-detail-label" style={{ marginBottom: 12, fontSize: 12 }}>Activity</h2>
          {activity.map((a) => (
            <div key={a.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--pub-border)", display: "flex", gap: 12, fontSize: 13 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--pub-text-tertiary)", whiteSpace: "nowrap", minWidth: 60 }}>
                {new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
              <span style={{ color: "var(--pub-text-secondary)" }}>
                <strong style={{ fontWeight: 600, color: "var(--pub-text-primary)" }}>{a.actor}</strong>{" "}
                {a.action}
                {a.detail && <span style={{ color: "var(--pub-text-tertiary)" }}> — {a.detail}</span>}
              </span>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
