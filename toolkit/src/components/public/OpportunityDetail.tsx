"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency, daysUntil } from "@/lib/utils/formatting";
import { OPPORTUNITY_TYPE_LABELS } from "@/lib/utils/constants";
import { expressInterest } from "@/app/opportunities/[id]/actions";

const TYPE_CLASSES: Record<string, string> = {
  grant: "pub-type-grant",
  rfp: "pub-type-rfp",
  commission: "pub-type-commission",
  residency: "pub-type-residency",
  fellowship: "pub-type-fellowship",
};

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
  interestCount: number;
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

export function OpportunityDetail({ opportunity: opp, funder, interestCount, user }: Props) {
  const [interested, setInterested] = useState(user.hasInterest);
  const [submitting, setSubmitting] = useState(false);

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

  async function handleInterest() {
    if (!user.profileId) return;
    setSubmitting(true);
    const result = await expressInterest(opp.id, user.profileId);
    if (result.success) setInterested(true);
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
          <a
            href={opp.application_url}
            target="_blank"
            rel="noopener noreferrer"
            className="pub-form-submit"
            style={{ display: "inline-block", textDecoration: "none", marginTop: 8 }}
          >
            View application &rarr;
          </a>
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

      {/* Section 4: Engagement Path */}
      <div style={{
        background: "var(--pub-bg-card)",
        border: "1px solid var(--pub-border)",
        borderRadius: 8,
        padding: "20px 24px",
      }}>
        {!user.isLoggedIn ? (
          <>
            <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>
              <Link href={`/auth/login?redirect=/opportunities/${opp.id}`} className="pub-link">
                Create a profile
              </Link>{" "}
              to express interest and get the most from this platform.
            </p>
            <p style={{ fontSize: 13, color: "var(--pub-text-tertiary)" }}>
              Already have a profile?{" "}
              <Link href={`/auth/login?redirect=/opportunities/${opp.id}`} className="pub-link">
                Sign in &rarr;
              </Link>
            </p>
          </>
        ) : !user.hasProfile ? (
          <>
            <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>
              <Link href="/profile" className="pub-link">
                Create your profile
              </Link>{" "}
              to express interest in opportunities and track engagements.
            </p>
          </>
        ) : interested ? (
          <>
            <p style={{ fontSize: 14, color: "var(--pub-text-primary)" }}>
              <span style={{ color: "var(--pub-grant)" }}>&#10003;</span> Noted. Good luck with your application.
            </p>
            {opp.application_url && (
              <a
                href={opp.application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="pub-link"
                style={{ fontSize: 14, display: "inline-block", marginTop: 8 }}
              >
                View application page &rarr;
              </a>
            )}
          </>
        ) : (
          <>
            <p className="pub-detail-label" style={{ marginBottom: 12 }}>
              Interested in this opportunity?
            </p>
            <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
              <button
                onClick={handleInterest}
                disabled={submitting}
                className="pub-form-submit"
              >
                {submitting ? "Recording..." : "I\u2019m applying to this \u2192"}
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
            {interestCount > 0 && (
              <p style={{ fontSize: 12, color: "var(--pub-text-tertiary)", marginTop: 12, fontFamily: "var(--font-mono)" }}>
                {interestCount} practitioner{interestCount !== 1 ? "s" : ""} interested
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
