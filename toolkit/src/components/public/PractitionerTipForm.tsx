"use client";

import { useState } from "react";
import Link from "next/link";
import { submitPractitionerTip } from "@/app/(practice)/submissions/actions";

export function PractitionerTipForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await submitPractitionerTip(formData);
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
            Your practitioner tip has been received. Our practice team will
            review it and consider adding them to the ecosystem map.
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

        <h1 className="pub-submit-title">Suggest a Practitioner</h1>
        <p className="pub-submit-desc">
          Know a creative practitioner working in NWA who should be on our radar?
          Musicians, visual artists, writers, designers, filmmakers, cultural
          organizers — we want to know about them.
        </p>

        <form action={handleSubmit} className="pub-form">
          {/* Practitioner name */}
          <div className="pub-form-field">
            <label htmlFor="name" className="pub-form-label">
              Practitioner name <span className="pub-required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="pub-form-input"
              placeholder="Full name"
            />
          </div>

          {/* Discipline */}
          <div className="pub-form-field">
            <label htmlFor="discipline" className="pub-form-label">
              Primary discipline <span className="pub-required">*</span>
            </label>
            <input
              type="text"
              id="discipline"
              name="discipline"
              required
              className="pub-form-input"
              placeholder="e.g. Visual art, Music, Film, Dance, Writing, Design"
            />
          </div>

          {/* Tenure */}
          <div className="pub-form-field">
            <label htmlFor="tenure" className="pub-form-label">
              How long in NWA{" "}
              <span className="pub-optional">(approximate)</span>
            </label>
            <input
              type="text"
              id="tenure"
              name="tenure"
              className="pub-form-input"
              placeholder="e.g. 5 years, Recently relocated, Lifelong"
            />
          </div>

          {/* Context */}
          <div className="pub-form-field">
            <label htmlFor="context" className="pub-form-label">
              Why should we know about them?
            </label>
            <textarea
              id="context"
              name="context"
              rows={3}
              className="pub-form-textarea"
              placeholder="What they're working on, what makes their practice notable, any connection to the NWA arts ecosystem..."
            />
          </div>

          {/* Website */}
          <div className="pub-form-field">
            <label htmlFor="website" className="pub-form-label">
              Website or portfolio link
            </label>
            <input
              type="url"
              id="website"
              name="website"
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
            {loading ? "Submitting..." : "Submit tip"}
          </button>

          <p className="pub-form-note">
            Tips are reviewed by our practice team before being added to the
            ecosystem map.
          </p>
        </form>
      </div>
    </div>
  );
}
