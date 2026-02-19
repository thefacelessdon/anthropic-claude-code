"use client";

import { useState } from "react";
import Link from "next/link";
import { submitOpportunity } from "@/app/opportunities/submit/actions";

const TYPES = [
  { value: "grant", label: "Grant" },
  { value: "rfp", label: "RFP" },
  { value: "commission", label: "Commission" },
  { value: "residency", label: "Residency" },
  { value: "fellowship", label: "Fellowship" },
  { value: "project", label: "Project" },
  { value: "program", label: "Program" },
];

export function OpportunitySubmitForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await submitOpportunity(formData);
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
            Your submission has been received. It will be reviewed before
            appearing on the site.
          </p>
          <Link
            href="/opportunities"
            className="pub-link"
            style={{ display: "inline-block", marginTop: 24 }}
          >
            &larr; Back to opportunities
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pub-page">
      <div className="pub-submit-container">
        <Link
          href="/opportunities"
          className="pub-link"
          style={{ display: "inline-block", marginBottom: 24, fontSize: 13 }}
        >
          &larr; Back to opportunities
        </Link>

        <h1 className="pub-submit-title">Submit an Opportunity</h1>
        <p className="pub-submit-desc">
          Know of a grant, RFP, commission, residency, or fellowship available
          to creative practitioners in NWA? Let us know.
        </p>

        <form action={handleSubmit} className="pub-form">
          {/* Title */}
          <div className="pub-form-field">
            <label htmlFor="title" className="pub-form-label">
              Opportunity title <span className="pub-required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="pub-form-input"
              placeholder="e.g. CACHE Creative Economy Micro-Grants"
            />
          </div>

          {/* Type */}
          <div className="pub-form-field">
            <label htmlFor="opportunity_type" className="pub-form-label">
              Type <span className="pub-required">*</span>
            </label>
            <select
              id="opportunity_type"
              name="opportunity_type"
              required
              className="pub-form-select"
              defaultValue=""
            >
              <option value="" disabled>
                Select type...
              </option>
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Source */}
          <div className="pub-form-field">
            <label htmlFor="source_name" className="pub-form-label">
              Source organization
            </label>
            <input
              type="text"
              id="source_name"
              name="source_name"
              className="pub-form-input"
              placeholder="e.g. CACHE, Crystal Bridges Museum"
            />
          </div>

          {/* Amount */}
          <div className="pub-form-field">
            <label htmlFor="amount_description" className="pub-form-label">
              Amount or range
            </label>
            <input
              type="text"
              id="amount_description"
              name="amount_description"
              className="pub-form-input"
              placeholder="e.g. $5,000 – $10,000 or Stipend + materials"
            />
          </div>

          {/* Deadline */}
          <div className="pub-form-field">
            <label htmlFor="deadline" className="pub-form-label">
              Deadline
            </label>
            <input
              type="date"
              id="deadline"
              name="deadline"
              className="pub-form-input"
            />
          </div>

          {/* Description */}
          <div className="pub-form-field">
            <label htmlFor="description" className="pub-form-label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="pub-form-textarea"
              placeholder="Brief description of the opportunity..."
            />
          </div>

          {/* Eligibility */}
          <div className="pub-form-field">
            <label htmlFor="eligibility" className="pub-form-label">
              Eligibility
            </label>
            <input
              type="text"
              id="eligibility"
              name="eligibility"
              className="pub-form-input"
              placeholder="e.g. NWA-based visual artists and designers"
            />
          </div>

          {/* Link */}
          <div className="pub-form-field">
            <label htmlFor="application_url" className="pub-form-label">
              Link (application page, announcement, etc.)
            </label>
            <input
              type="url"
              id="application_url"
              name="application_url"
              className="pub-form-input"
              placeholder="https://..."
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
            {loading ? "Submitting..." : "Submit"}
          </button>

          <p className="pub-form-note">
            Submissions are reviewed before appearing on the site.
          </p>
        </form>
      </div>
    </div>
  );
}
