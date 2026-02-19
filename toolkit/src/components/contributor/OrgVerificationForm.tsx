"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ORG_TYPE_LABELS } from "@/lib/utils/constants";
import type { Organization } from "@/lib/supabase/types";

type OrgFields = Pick<Organization, "id" | "name" | "org_type" | "mandate" | "controls" | "decision_cycle">;

interface OrgVerificationFormProps {
  org: OrgFields;
}

type FieldStatus = "accurate" | "correction";

export function OrgVerificationForm({ org }: OrgVerificationFormProps) {
  const [mandateStatus, setMandateStatus] = useState<FieldStatus>("accurate");
  const [mandateCorrection, setMandateCorrection] = useState("");
  const [shapesStatus, setShapesStatus] = useState<FieldStatus>("accurate");
  const [shapesCorrection, setShapesCorrection] = useState("");
  const [cycleStatus, setCycleStatus] = useState<FieldStatus>("accurate");
  const [cycleCorrection, setCycleCorrection] = useState("");
  const [additions, setAdditions] = useState("");
  const [submitterName, setSubmitterName] = useState("");
  const [submitterRole, setSubmitterRole] = useState("");
  const [submitterEmail, setSubmitterEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- generic mismatch with Supabase types
    await (supabase.from("submissions") as any).insert({
      ecosystem_id: "a0000000-0000-0000-0000-000000000001",
      submission_type: "organization_verification",
      data: {
        org_id: org.id,
        org_name: org.name,
        mandate: { status: mandateStatus, correction: mandateStatus === "correction" ? mandateCorrection : null },
        shapes: { status: shapesStatus, correction: shapesStatus === "correction" ? shapesCorrection : null },
        decision_cycle: { status: cycleStatus, correction: cycleStatus === "correction" ? cycleCorrection : null },
        additions: additions || null,
      } as Record<string, unknown>,
      submitter_name: submitterName || null,
      submitter_email: submitterEmail || null,
      submitter_org: org.name,
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
          Your response has been received and will be reviewed by our team. Thank you for helping us build a clearer picture of the ecosystem.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Header */}
      <div className="mb-10">
        <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.08em] mb-4">
          Cultural Architecture &middot; Ecosystem Verification
        </p>
        <p className="text-[14px] text-muted leading-relaxed max-w-xl">
          We&rsquo;re mapping the NWA cultural ecosystem to support better coordination and investment.
          Here&rsquo;s what we have on <span className="text-text font-medium">{org.name}</span>.
          We&rsquo;d appreciate your review.
        </p>
      </div>

      <hr className="border-border mb-8" />

      {/* Org identity */}
      <div className="mb-8">
        <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] mb-1">Organization</p>
        <p className="text-[16px] font-display font-semibold text-text">{org.name}</p>
        <p className="text-[13px] text-muted mt-0.5">{ORG_TYPE_LABELS[org.org_type] || org.org_type}</p>
      </div>

      {/* Mandate */}
      {org.mandate && (
        <VerificationField
          label="Our Understanding of Your Mandate"
          currentValue={org.mandate}
          status={mandateStatus}
          onStatusChange={setMandateStatus}
          correction={mandateCorrection}
          onCorrectionChange={setMandateCorrection}
        />
      )}

      {/* Shapes */}
      {org.controls && (
        <VerificationField
          label="What We Understand You Shape"
          currentValue={org.controls}
          status={shapesStatus}
          onStatusChange={setShapesStatus}
          correction={shapesCorrection}
          onCorrectionChange={setShapesCorrection}
        />
      )}

      {/* Decision cycle */}
      {org.decision_cycle && (
        <VerificationField
          label="Decision Cycle"
          currentValue={org.decision_cycle}
          status={cycleStatus}
          onStatusChange={setCycleStatus}
          correction={cycleCorrection}
          onCorrectionChange={setCycleCorrection}
        />
      )}

      {/* Anything missing */}
      <div className="mb-8">
        <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] mb-2">
          Anything We&rsquo;re Missing?
        </p>
        <p className="text-[12px] text-dim mb-2">
          Upcoming initiatives, leadership changes, new programs, shifted priorities
        </p>
        <textarea
          value={additions}
          onChange={(e) => setAdditions(e.target.value)}
          rows={3}
          className="w-full bg-surface-inset border border-border rounded-md px-4 py-3 text-[13px] text-text placeholder:text-dim resize-none focus:outline-none focus:border-accent"
          placeholder="Optional"
        />
      </div>

      <hr className="border-border mb-8" />

      {/* Submitter info */}
      <div className="space-y-4 mb-8">
        <div>
          <label className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] block mb-1">Your Name</label>
          <input
            type="text"
            value={submitterName}
            onChange={(e) => setSubmitterName(e.target.value)}
            className="w-full bg-surface-inset border border-border rounded-md px-4 py-2.5 text-[13px] text-text placeholder:text-dim focus:outline-none focus:border-accent"
            required
          />
        </div>
        <div>
          <label className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] block mb-1">Your Role</label>
          <input
            type="text"
            value={submitterRole}
            onChange={(e) => setSubmitterRole(e.target.value)}
            className="w-full bg-surface-inset border border-border rounded-md px-4 py-2.5 text-[13px] text-text placeholder:text-dim focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em] block mb-1">Email (optional)</label>
          <input
            type="email"
            value={submitterEmail}
            onChange={(e) => setSubmitterEmail(e.target.value)}
            className="w-full bg-surface-inset border border-border rounded-md px-4 py-2.5 text-[13px] text-text placeholder:text-dim focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-accent text-surface font-medium text-[14px] py-3 rounded-md hover:bg-accent-warm transition-colors disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit verification"}
      </button>

      <p className="text-[12px] text-dim mt-4 text-center">
        Your response will be reviewed by our team. Thank you for helping us build a clearer picture of the ecosystem.
      </p>
    </form>
  );
}

/* ── Reusable verification field ─────────────────── */

function VerificationField({
  label,
  currentValue,
  status,
  onStatusChange,
  correction,
  onCorrectionChange,
}: {
  label: string;
  currentValue: string;
  status: FieldStatus;
  onStatusChange: (s: FieldStatus) => void;
  correction: string;
  onCorrectionChange: (v: string) => void;
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
          This is accurate
        </label>
        <label className="flex items-center gap-2 text-[13px] text-muted cursor-pointer">
          <input
            type="radio"
            name={label}
            checked={status === "correction"}
            onChange={() => onStatusChange("correction")}
            className="accent-accent"
          />
          I&rsquo;d adjust this
        </label>
      </div>
      {status === "correction" && (
        <textarea
          value={correction}
          onChange={(e) => onCorrectionChange(e.target.value)}
          rows={2}
          className="w-full mt-2 bg-surface-inset border border-border rounded-md px-4 py-3 text-[13px] text-text placeholder:text-dim resize-none focus:outline-none focus:border-accent"
          placeholder="What would you change?"
        />
      )}
    </div>
  );
}
