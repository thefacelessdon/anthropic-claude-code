"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency, daysUntil } from "@/lib/utils/formatting";
import { OPPORTUNITY_TYPE_LABELS } from "@/lib/utils/constants";
import { expressInterest, submitIntent } from "@/app/opportunities/[id]/actions";

const TYPE_CLASSES: Record<string, string> = {
  grant: "pub-type-grant",
  rfp: "pub-type-rfp",
  commission: "pub-type-commission",
  residency: "pub-type-residency",
  fellowship: "pub-type-fellowship",
};

const DISCIPLINE_OPTIONS = [
  "Visual Arts",
  "Graphic / Brand Design",
  "Architecture / Spatial Design",
  "Public Art + Fabrication",
  "Film / Video",
  "Photography",
  "Music / Sound",
  "Writing / Literary Arts",
  "Performing Arts",
  "Craft / Textiles",
  "Digital / New Media",
  "Curatorial / Arts Admin",
  "Community Arts / Social Practice",
  "Other",
];

interface Props {
  opportunity: {
    id: string;
    title: string;
    opportunity_type: string;
    status: string;
    deadline: string | null;
    deadline_description: string | null;
    amount_min: number | null;
    amount_max: number | null;
    amount_description: string | null;
    description: string | null;
    eligibility: string | null;
    application_url: string | null;
    contact_email: string | null;
    source_name: string | null;
    source_org_id: string | null;
    preparation_context: string | null;
    target_disciplines: string[] | null;
  };
  funder: {
    totalInvested: number;
    topInvestments: { initiative_name: string; amount: number | null }[];
    otherOpportunities: { id: string; title: string; deadline: string | null }[];
  };
  interestCount?: number;
  user: {
    isLoggedIn: boolean;
    hasProfile: boolean;
    profileId: string | null;
    hasInterest: boolean;
  };
}

function formatAmount(min: number | null, max: number | null, desc: string | null): string {
  if (min !== null && max !== null && min === max) return formatCurrency(min);
  if (min !== null && max !== null) return `${formatCurrency(min)} \u2013 ${formatCurrency(max)}`;
  if (min !== null) return `From ${formatCurrency(min)}`;
  if (max !== null) return `Up to ${formatCurrency(max)}`;
  if (desc) return desc;
  return "";
}

export function OpportunityDetail({ opportunity: opp, funder, user }: Props) {
  const [interested, setInterested] = useState(user.hasInterest);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Intent form state
  const [intentName, setIntentName] = useState("");
  const [intentEmail, setIntentEmail] = useState("");
  const [intentDiscipline, setIntentDiscipline] = useState("");
  const [intentNotes, setIntentNotes] = useState("");

  const amount = formatAmount(opp.amount_min, opp.amount_max, opp.amount_description);
  const typeClass = TYPE_CLASSES[opp.opportunity_type] || "pub-type-default";
  const days = opp.deadline ? daysUntil(opp.deadline) : null;
  const deadlineStr = opp.deadline
    ? new Date(opp.deadline).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : opp.deadline_description || null;

  // Quick interest for logged-in users with profiles
  async function handleQuickInterest() {
    if (!user.profileId) return;
    setSubmitting(true);
    setFormError(null);
    const result = await expressInterest(opp.id, user.profileId);
    if (result.success) {
      setInterested(true);
    } else {
      setFormError(result.error || "Something went wrong.");
    }
    setSubmitting(false);
  }

  // Open intent form submission
  async function handleIntentSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    const result = await submitIntent(opp.id, {
      name: intentName,
      email: intentEmail,
      discipline: intentDiscipline,
      notes: intentNotes,
    });

    if (result.success) {
      setInterested(true);
    } else {
      setFormError(result.error || "Something went wrong.");
    }
    setSubmitting(false);
  }

  return (
    <div className="pub-page" style={{ paddingBottom: 64 }}>
      {/* Back nav */}
      <div style={{ padding: "24px 0" }}>
        <Link href="/opportunities" className="pub-link" style={{ fontSize: 14 }}>
          &larr; Back to opportunities
        </Link>
      </div>

      {/* Section 1: Opportunity Info */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <span className={`pub-card-type ${typeClass}`}>
            {OPPORTUNITY_TYPE_LABELS[opp.opportunity_type] || opp.opportunity_type}
          </span>
          <span className={`pub-card-type ${opp.status === "closing_soon" ? "pub-type-fellowship" : "pub-type-default"}`}>
            {opp.status === "closing_soon" ? "Closing Soon" : "Open"}
          </span>
          {amount && (
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 18, marginLeft: "auto" }}>
              {amount}
            </span>
          )}
        </div>

        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 500, lineHeight: 1.3, marginBottom: 12 }}>
          {opp.title}
        </h1>

        {opp.source_name && (
          <p style={{ fontSize: 15, color: "var(--pub-text-secondary)", marginBottom: 8 }}>
            {opp.source_name}
          </p>
        )}

        {deadlineStr && (
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 14, marginBottom: 24 }}>
            Deadline: {deadlineStr}
            {days !== null && days > 0 && (
              <span style={{
                color: days <= 14 ? "var(--pub-urgent)" : days <= 30 ? "var(--pub-soon)" : "var(--pub-text-tertiary)",
                fontWeight: days <= 14 ? 600 : 400,
                marginLeft: 8,
              }}>
                ({days} days remaining)
              </span>
            )}
            {days !== null && days <= 0 && (
              <span style={{ color: "var(--pub-urgent)", marginLeft: 8 }}>Past deadline</span>
            )}
          </p>
        )}

        {opp.description && (
          <div style={{ marginBottom: 20 }}>
            <p className="pub-detail-label">Description</p>
            <p style={{ fontSize: 15, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{opp.description}</p>
          </div>
        )}

        {opp.eligibility && (
          <div style={{ marginBottom: 20 }}>
            <p className="pub-detail-label">Eligibility</p>
            <p style={{ fontSize: 15, lineHeight: 1.5 }}>{opp.eligibility}</p>
          </div>
        )}

        {opp.application_url && (
          <div style={{ marginBottom: 20 }}>
            <p className="pub-detail-label">How to Apply</p>
            <a
              href={opp.application_url}
              target="_blank"
              rel="noopener noreferrer"
              className="pub-link"
              style={{ fontSize: 14 }}
            >
              View application page &rarr;
            </a>
          </div>
        )}
      </div>

      {/* Section 2: Preparation Context */}
      {opp.preparation_context && (
        <div style={{
          borderLeft: "3px solid var(--pub-accent)",
          background: "var(--pub-accent-bg)",
          padding: "20px 24px",
          borderRadius: "0 8px 8px 0",
          marginBottom: 40,
        }}>
          <p className="pub-detail-label" style={{ marginBottom: 8 }}>
            Preparing for this opportunity
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--pub-text-primary)", whiteSpace: "pre-wrap" }}>
            {opp.preparation_context}
          </p>
        </div>
      )}

      {/* Section 3: About This Funder */}
      {opp.source_org_id && funder.totalInvested > 0 && (
        <div style={{
          background: "var(--pub-bg-card)",
          border: "1px solid var(--pub-border)",
          borderRadius: 8,
          padding: "20px 24px",
          marginBottom: 40,
        }}>
          <p className="pub-detail-label" style={{ marginBottom: 8 }}>About this funder</p>
          <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>
            <strong>{opp.source_name}</strong> has invested{" "}
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>
              {formatCurrency(funder.totalInvested)}
            </span>{" "}
            in cultural initiatives in NWA
            {funder.topInvestments.length > 0 && (
              <>
                , including{" "}
                {funder.topInvestments
                  .map((i) => i.initiative_name)
                  .join(", ")}
              </>
            )}
            .
          </p>

          {funder.otherOpportunities.length > 0 && (
            <div>
              <p style={{ fontSize: 13, color: "var(--pub-text-secondary)", marginBottom: 6 }}>
                Also open from this source:
              </p>
              {funder.otherOpportunities.map((o) => (
                <Link
                  key={o.id}
                  href={`/opportunities/${o.id}`}
                  className="pub-link"
                  style={{ display: "block", fontSize: 14, marginBottom: 4 }}
                >
                  {o.title}
                  {o.deadline && (
                    <span style={{ color: "var(--pub-text-tertiary)", fontWeight: 400, marginLeft: 8, fontFamily: "var(--font-mono)", fontSize: 12 }}>
                      Due {new Date(o.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Section 4: Intent Signal */}
      <div style={{
        background: "var(--pub-bg-card)",
        border: "1px solid var(--pub-border)",
        borderRadius: 8,
        padding: "24px",
      }}>
        {interested ? (
          /* ── Confirmation View ─────────────────── */
          <div>
            <p style={{ fontSize: 16, fontWeight: 500, color: "var(--pub-text-primary)", marginBottom: 16 }}>
              <span style={{ color: "var(--pub-grant)" }}>&#10003;</span>{" "}
              Thanks for letting us know.
            </p>

            <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--pub-text-secondary)", marginBottom: 16 }}>
              Here&rsquo;s what happens next:
            </p>

            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {opp.application_url && (
                <li style={{ fontSize: 14, lineHeight: 1.5, color: "var(--pub-text-primary)", paddingLeft: 20, position: "relative" }}>
                  <span style={{ position: "absolute", left: 0, color: "var(--pub-text-tertiary)" }}>&bull;</span>
                  Apply directly through the funder&rsquo;s application process{" "}
                  <a
                    href={opp.application_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pub-link"
                    style={{ fontSize: 14 }}
                  >
                    View application page &rarr;
                  </a>
                </li>
              )}
              <li style={{ fontSize: 14, lineHeight: 1.5, color: "var(--pub-text-primary)", paddingLeft: 20, position: "relative" }}>
                <span style={{ position: "absolute", left: 0, color: "var(--pub-text-tertiary)" }}>&bull;</span>
                We&rsquo;ll follow up after the deadline to see how it went
              </li>
              <li style={{ fontSize: 14, lineHeight: 1.5, color: "var(--pub-text-primary)", paddingLeft: 20, position: "relative" }}>
                <span style={{ position: "absolute", left: 0, color: "var(--pub-text-tertiary)" }}>&bull;</span>
                Your interest helps us understand what NWA practitioners need &mdash; and advocate for more opportunities like this
              </li>
            </ul>
          </div>
        ) : user.isLoggedIn && user.hasProfile && user.profileId ? (
          /* ── Quick interest for logged-in users with profiles ── */
          <div>
            <p className="pub-detail-label" style={{ marginBottom: 8, fontSize: 13 }}>
              Interested in this opportunity?
            </p>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--pub-text-secondary)", marginBottom: 16 }}>
              Let us know you&rsquo;re considering applying. We track engagement across the ecosystem
              to better understand what practitioners need.
            </p>

            {formError && (
              <p className="pub-form-error">{formError}</p>
            )}

            <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
              <button
                onClick={handleQuickInterest}
                disabled={submitting}
                className="pub-form-submit"
              >
                {submitting ? "Recording..." : "I\u2019m Interested"}
              </button>
              {opp.application_url && (
                <a
                  href={opp.application_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pub-link"
                  style={{ fontSize: 14 }}
                >
                  View application page &rarr;
                </a>
              )}
            </div>
            <p style={{ fontSize: 12, color: "var(--pub-text-tertiary)", marginTop: 12 }}>
              We don&rsquo;t share your information with funders without your permission.
            </p>
          </div>
        ) : (
          /* ── Open intent form (no auth required) ── */
          <div>
            <p className="pub-detail-label" style={{ marginBottom: 8, fontSize: 13 }}>
              Interested in this opportunity?
            </p>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--pub-text-secondary)", marginBottom: 20 }}>
              Let us know you&rsquo;re considering applying. We track engagement across the ecosystem
              to better understand what practitioners need.
            </p>

            {formError && (
              <p className="pub-form-error">{formError}</p>
            )}

            <form onSubmit={handleIntentSubmit} className="pub-form">
              <div className="pub-form-field">
                <label className="pub-form-label">
                  Your name <span className="pub-required">*</span>
                </label>
                <input
                  type="text"
                  className="pub-form-input"
                  value={intentName}
                  onChange={(e) => setIntentName(e.target.value)}
                  required
                />
              </div>

              <div className="pub-form-field">
                <label className="pub-form-label">
                  Your discipline <span className="pub-required">*</span>
                </label>
                <select
                  className="pub-form-select"
                  value={intentDiscipline}
                  onChange={(e) => setIntentDiscipline(e.target.value)}
                  required
                >
                  <option value="">Select a discipline</option>
                  {DISCIPLINE_OPTIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="pub-form-field">
                <label className="pub-form-label">
                  Email <span className="pub-required">*</span>
                </label>
                <input
                  type="email"
                  className="pub-form-input"
                  value={intentEmail}
                  onChange={(e) => setIntentEmail(e.target.value)}
                  required
                />
              </div>

              <div className="pub-form-field">
                <label className="pub-form-label">
                  Anything we should know? <span className="pub-optional">(optional)</span>
                </label>
                <textarea
                  className="pub-form-textarea"
                  value={intentNotes}
                  onChange={(e) => setIntentNotes(e.target.value)}
                  placeholder={'e.g., "I\'ve worked with ' + (opp.source_name || "this funder") + ' before" or "I\'m not sure I\'m eligible \u2014 can you clarify?"'}
                  rows={3}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="pub-form-submit"
              >
                {submitting ? "Submitting..." : "I\u2019m Interested"}
              </button>

              <p style={{ fontSize: 12, color: "var(--pub-text-tertiary)", marginTop: 12 }}>
                We don&rsquo;t share your information with funders without your permission.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
