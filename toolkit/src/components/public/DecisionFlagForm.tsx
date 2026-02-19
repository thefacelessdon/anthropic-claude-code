"use client";

import { useState } from "react";
import Link from "next/link";
import { submitDecisionFlag } from "@/app/(practice)/submissions/actions";

export function DecisionFlagForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await submitDecisionFlag(formData);
    setLoading(false);
    if (result.success) {
      setSubmitted(true);
    } else {
      setError(result.error || "Something went wrong.");
    }
  }

  if (submitted) {
    return (
      <div className="pub-page">
        <div className="pub-submit-container">
          <h1 className="pub-submit-title">Thank you</h1>
          <p className="pub-submit-desc" style={{ marginTop: 12 }}>
            Your decision flag has been received. Our practice team will review
            it and determine whether to track it.
          </p>
          <Link
            href="/"
            className="pub-link"
            style={{ display: "inline-block", marginTop: 24 }}
          >
            &larr; Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pub-page">
      <div className="pub-submit-container">
        <Link
          href="/"
          className="pub-link"
          style={{ display: "inline-block", marginBottom: 24, fontSize: 13 }}
        >
          &larr; Back to home
        </Link>

        <h1 className="pub-submit-title">Flag a Decision</h1>
        <p className="pub-submit-desc">
          Know of an upcoming decision that could affect NWA&apos;s creative
          economy? A budget vote, zoning change, grant cycle, or policy review?
          Let us know so we can track it.
        </p>

        <form action={handleSubmit} className="pub-form">
          {/* Organization */}
          <div className="pub-form-field">
            <label htmlFor="organization" className="pub-form-label">
              Organization or body making the decision{" "}
              <span className="pub-required">*</span>
            </label>
            <input
              type="text"
              id="organization"
              name="organization"
              required
              className="pub-form-input"
              placeholder="e.g. City of Bentonville, Arkansas Arts Council"
            />
          </div>

          {/* What's being decided */}
          <div className="pub-form-field">
            <label htmlFor="what_being_decided" className="pub-form-label">
              What&apos;s being decided{" "}
              <span className="pub-required">*</span>
            </label>
            <textarea
              id="what_being_decided"
              name="what_being_decided"
              required
              rows={3}
              className="pub-form-textarea"
              placeholder="e.g. FY2027 cultural funding allocation, public art ordinance revision..."
            />
          </div>

          {/* Approximate lock date */}
          <div className="pub-form-field">
            <label htmlFor="lock_date" className="pub-form-label">
              Approximate date when the decision locks{" "}
              <span className="pub-optional">(if known)</span>
            </label>
            <input
              type="date"
              id="lock_date"
              name="lock_date"
              className="pub-form-input"
            />
          </div>

          {/* Context */}
          <div className="pub-form-field">
            <label htmlFor="context" className="pub-form-label">
              Any additional context
            </label>
            <textarea
              id="context"
              name="context"
              rows={3}
              className="pub-form-textarea"
              placeholder="Who's involved, what's at stake, how it connects to the arts sector..."
            />
          </div>

          <div
            style={{
              borderTop: "1px solid var(--pub-border)",
              paddingTop: 20,
              marginTop: 8,
            }}
          >
            {/* Submitter name */}
            <div className="pub-form-field">
              <label htmlFor="submitter_name" className="pub-form-label">
                Your name{" "}
                <span className="pub-optional">(optional)</span>
              </label>
              <input
                type="text"
                id="submitter_name"
                name="submitter_name"
                className="pub-form-input"
              />
            </div>

            {/* Submitter email */}
            <div className="pub-form-field">
              <label htmlFor="submitter_email" className="pub-form-label">
                Your email{" "}
                <span className="pub-optional">
                  (optional, in case we have questions)
                </span>
              </label>
              <input
                type="email"
                id="submitter_email"
                name="submitter_email"
                className="pub-form-input"
              />
            </div>
          </div>

          {error && <p className="pub-form-error">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="pub-form-submit"
          >
            {loading ? "Submitting..." : "Submit flag"}
          </button>

          <p className="pub-form-note">
            Flags are reviewed by our practice team before being tracked.
          </p>
        </form>
      </div>
    </div>
  );
}
