"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Practitioner } from "@/lib/supabase/types";

type PractitionerFields = Pick<Practitioner, "id" | "name" | "discipline" | "tenure" | "income_sources" | "retention_factors" | "risk_factors">;

interface PractitionerCheckInFormProps {
  practitioner: PractitionerFields;
}

type FieldStatus = "accurate" | "changed";

export function PractitionerCheckInForm({ practitioner }: PractitionerCheckInFormProps) {
  const [incomeStatus, setIncomeStatus] = useState<FieldStatus>("accurate");
  const [incomeUpdate, setIncomeUpdate] = useState("");
  const [retentionStatus, setRetentionStatus] = useState<FieldStatus>("accurate");
  const [retentionUpdate, setRetentionUpdate] = useState("");
  const [riskStatus, setRiskStatus] = useState<FieldStatus>("accurate");
  const [riskUpdate, setRiskUpdate] = useState("");
  const [anythingElse, setAnythingElse] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- generic mismatch with Supabase types
    await (supabase.from("submissions") as any).insert({
      ecosystem_id: "a0000000-0000-0000-0000-000000000001",
      submission_type: "practitioner_verification",
      data: {
        practitioner_id: practitioner.id,
        practitioner_name: practitioner.name,
        income: { status: incomeStatus, update: incomeStatus === "changed" ? incomeUpdate : null },
        retention: { status: retentionStatus, update: retentionStatus === "changed" ? retentionUpdate : null },
        risk: { status: riskStatus, update: riskStatus === "changed" ? riskUpdate : null },
        anything_else: anythingElse || null,
      } as Record<string, unknown>,
      submitter_name: practitioner.name,
      submitter_email: null,
      submitter_org: null,
      status: "pending" as const,
    });

    setSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="text-center py-16">
        <h1 className="font-display text-2xl font-semibold text-text mb-3">
          Thank you
        </h1>
        <p className="text-[14px] text-muted max-w-md mx-auto leading-relaxed">
          Your check-in has been received. We appreciate you taking the time to help us keep this picture current.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Header */}
      <div className="mb-10">
        <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.08em] mb-4">
          Cultural Architecture &middot; Practitioner Check-In
        </p>
        <p className="text-[14px] text-muted leading-relaxed max-w-xl">
          Hey <span className="text-text font-medium">{practitioner.name}</span> — we&rsquo;re keeping track of what&rsquo;s
          happening for creative practitioners in NWA. Last time we talked, here&rsquo;s what we had:
        </p>
      </div>

      <hr className="border-border mb-8" />

      {/* Your work */}
      <div className="mb-8">
        <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] mb-1">Your Work</p>
        <p className="text-[15px] font-display font-semibold text-text">
          {[practitioner.discipline, practitioner.tenure ? `${practitioner.tenure} in NWA` : null].filter(Boolean).join(" · ")}
        </p>
      </div>

      {/* Income */}
      {practitioner.income_sources && (
        <CheckInField
          label="Your Income Sources"
          currentValue={practitioner.income_sources}
          status={incomeStatus}
          onStatusChange={setIncomeStatus}
          update={incomeUpdate}
          onUpdateChange={setIncomeUpdate}
        />
      )}

      {/* Retention */}
      {practitioner.retention_factors && (
        <CheckInField
          label="What Keeps You Here"
          currentValue={practitioner.retention_factors}
          status={retentionStatus}
          onStatusChange={setRetentionStatus}
          update={retentionUpdate}
          onUpdateChange={setRetentionUpdate}
        />
      )}

      {/* Risk */}
      {practitioner.risk_factors && (
        <CheckInField
          label="What Concerns You"
          currentValue={practitioner.risk_factors}
          status={riskStatus}
          onStatusChange={setRiskStatus}
          update={riskUpdate}
          onUpdateChange={setRiskUpdate}
        />
      )}

      {/* Anything else */}
      <div className="mb-8">
        <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] mb-2">
          Anything Else We Should Know?
        </p>
        <textarea
          value={anythingElse}
          onChange={(e) => setAnythingElse(e.target.value)}
          rows={3}
          className="w-full bg-surface-inset border border-border rounded-md px-4 py-3 text-[13px] text-text placeholder:text-dim resize-none focus:outline-none focus:border-accent"
          placeholder="Optional"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-accent text-surface font-medium text-[14px] py-3 rounded-md hover:bg-accent-warm transition-colors disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit check-in"}
      </button>

      <p className="text-[12px] text-dim mt-4 text-center">
        Your response will be reviewed by our team. Thank you for helping us keep this picture current.
      </p>
    </form>
  );
}

/* ── Reusable check-in field ─────────────────────── */

function CheckInField({
  label,
  currentValue,
  status,
  onStatusChange,
  update,
  onUpdateChange,
}: {
  label: string;
  currentValue: string;
  status: FieldStatus;
  onStatusChange: (s: FieldStatus) => void;
  update: string;
  onUpdateChange: (v: string) => void;
}) {
  return (
    <div className="mb-8">
      <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] mb-2">{label}</p>
      <div className="bg-surface-inset border border-border rounded-md px-4 py-3 mb-3">
        <p className="text-[13px] text-text leading-relaxed">{currentValue}</p>
      </div>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-[13px] text-muted cursor-pointer">
          <input
            type="radio"
            name={label}
            checked={status === "accurate"}
            onChange={() => onStatusChange("accurate")}
            className="accent-accent"
          />
          Still roughly accurate
        </label>
        <label className="flex items-center gap-2 text-[13px] text-muted cursor-pointer">
          <input
            type="radio"
            name={label}
            checked={status === "changed"}
            onChange={() => onStatusChange("changed")}
            className="accent-accent"
          />
          Things have changed
        </label>
      </div>
      {status === "changed" && (
        <textarea
          value={update}
          onChange={(e) => onUpdateChange(e.target.value)}
          rows={2}
          className="w-full mt-2 bg-surface-inset border border-border rounded-md px-4 py-3 text-[13px] text-text placeholder:text-dim resize-none focus:outline-none focus:border-accent"
          placeholder="What's changed?"
        />
      )}
    </div>
  );
}
