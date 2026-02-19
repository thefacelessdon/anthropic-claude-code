"use client";

import { useState } from "react";
import Link from "next/link";
import { upsertProfile } from "@/app/profile/actions";
import { formatCurrency, formatDate } from "@/lib/utils/formatting";

const SKILL_SUGGESTIONS = [
  "Brand Design", "Visual Arts", "Film Production", "Sound Engineering",
  "Fabrication", "Teaching", "Architecture", "Performance", "Photography",
  "Ceramics", "Music Production", "Writing", "Choreography", "Graphic Design",
];

const LOCATION_SUGGESTIONS = [
  "Bentonville", "Fayetteville", "Rogers", "Springdale", "Siloam Springs",
];

const LOOKING_FOR_OPTIONS = [
  { value: "grants", label: "Grants" },
  { value: "commissions", label: "Commissions" },
  { value: "contracts", label: "Contracts" },
  { value: "teaching", label: "Teaching" },
  { value: "crew", label: "Crew work" },
];

interface ProfileData {
  id: string;
  name: string;
  email: string;
  primary_skill: string;
  location: string;
  bio: string | null;
  portfolio_url: string | null;
  additional_skills: string[] | null;
  rate_range: string | null;
  availability: string;
  looking_for: string[] | null;
  is_verified: boolean;
}

interface EngagementSummary {
  id: string;
  title: string;
  status: string;
  total_amount: number | null;
  completed_at: string | null;
  funder_org: { name: string } | null;
  milestones_total: number;
  milestones_done: number;
}

interface InterestSummary {
  id: string;
  created_at: string;
  opportunity: { id: string; title: string; deadline: string | null; status: string } | null;
}

interface Props {
  userId: string;
  userEmail: string;
  existingProfile: ProfileData | null;
  engagements: EngagementSummary[];
  interests: InterestSummary[];
}

export function ProfileEditor({ userEmail, existingProfile, engagements, interests }: Props) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const formData = new FormData(e.currentTarget);
    const result = await upsertProfile(formData);

    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setError(result.error || "Something went wrong.");
    }
    setSaving(false);
  }

  const isNew = !existingProfile;
  const p = existingProfile;

  return (
    <div className="pub-page" style={{ paddingBottom: 64 }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ padding: "48px 0 32px" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 500 }}>
            {isNew ? "Create Your Profile" : "Your Profile"}
          </h1>
          <p style={{ fontSize: 14, color: "var(--pub-text-secondary)", marginTop: 4 }}>
            {isNew
              ? "Set up your profile so funders and collaborators can find you."
              : "Update your information. Changes are visible immediately."}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="pub-form">
          <div className="pub-form-field">
            <label className="pub-form-label">Name <span className="pub-required">*</span></label>
            <input name="name" type="text" required defaultValue={p?.name || ""} className="pub-form-input" />
          </div>

          <div className="pub-form-field">
            <label className="pub-form-label">Primary skill <span className="pub-required">*</span></label>
            <input name="primary_skill" type="text" required defaultValue={p?.primary_skill || ""} className="pub-form-input" list="skill-suggestions" />
            <datalist id="skill-suggestions">
              {SKILL_SUGGESTIONS.map((s) => <option key={s} value={s} />)}
            </datalist>
          </div>

          <div className="pub-form-field">
            <label className="pub-form-label">Location <span className="pub-required">*</span></label>
            <input name="location" type="text" required defaultValue={p?.location || ""} className="pub-form-input" list="location-suggestions" />
            <datalist id="location-suggestions">
              {LOCATION_SUGGESTIONS.map((l) => <option key={l} value={l} />)}
            </datalist>
          </div>

          <div className="pub-form-field">
            <label className="pub-form-label">Bio <span className="pub-optional">(optional)</span></label>
            <textarea name="bio" defaultValue={p?.bio || ""} className="pub-form-textarea" placeholder="2-3 sentences about your practice" />
          </div>

          <div className="pub-form-field">
            <label className="pub-form-label">Portfolio URL <span className="pub-optional">(optional)</span></label>
            <input name="portfolio_url" type="url" defaultValue={p?.portfolio_url || ""} className="pub-form-input" placeholder="https://yoursite.com" />
          </div>

          <div className="pub-form-field">
            <label className="pub-form-label">Additional skills <span className="pub-optional">(comma-separated)</span></label>
            <input name="additional_skills" type="text" defaultValue={p?.additional_skills?.join(", ") || ""} className="pub-form-input" placeholder="Teaching, Project management, Fabrication" />
          </div>

          <div className="pub-form-field">
            <label className="pub-form-label">What are you looking for?</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 4 }}>
              {LOOKING_FOR_OPTIONS.map((opt) => (
                <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    name="looking_for"
                    value={opt.value}
                    defaultChecked={p?.looking_for?.includes(opt.value) || false}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <div className="pub-form-field">
            <label className="pub-form-label">Rate range <span className="pub-optional">(optional)</span></label>
            <input name="rate_range" type="text" defaultValue={p?.rate_range || ""} className="pub-form-input" placeholder="$50-75/hr or $5K-15K/project" />
          </div>

          <div className="pub-form-field">
            <label className="pub-form-label">Availability</label>
            <select name="availability" defaultValue={p?.availability || "available"} className="pub-form-select">
              <option value="available">Available</option>
              <option value="booked">Booked</option>
              <option value="selective">Selectively available</option>
            </select>
          </div>

          <input type="hidden" name="email" value={userEmail} />

          {error && <p className="pub-form-error">{error}</p>}

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button type="submit" disabled={saving} className="pub-form-submit">
              {saving ? "Saving..." : isNew ? "Create profile" : "Save changes"}
            </button>
            {saved && (
              <span style={{ fontSize: 14, color: "var(--pub-grant)" }}>&#10003; Saved</span>
            )}
          </div>

          {p && (
            <p className="pub-form-note">
              <Link href={`/profile/${p.id}`} className="pub-link">
                View your public profile &rarr;
              </Link>
            </p>
          )}
        </form>

        {/* My Engagements */}
        {engagements.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, marginBottom: 16 }}>
              My Engagements
            </h2>
            {engagements.map((eng) => (
              <Link
                key={eng.id}
                href={`/engagements/${eng.id}`}
                style={{
                  display: "block",
                  background: "var(--pub-bg-card)",
                  border: "1px solid var(--pub-border)",
                  borderRadius: 8,
                  padding: 16,
                  marginBottom: 12,
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: eng.status === "complete" ? "var(--pub-grant)" : eng.status === "active" ? "var(--pub-rfp)" : "var(--pub-text-tertiary)",
                  }}>
                    {eng.status}
                  </span>
                  {eng.total_amount && (
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 14 }}>
                      {formatCurrency(eng.total_amount)}
                    </span>
                  )}
                </div>
                <p style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 500 }}>
                  {eng.title}
                </p>
                <p style={{ fontSize: 13, color: "var(--pub-text-secondary)", marginTop: 2 }}>
                  {eng.funder_org?.name || ""}
                  {eng.status === "active" && eng.milestones_total > 0 && (
                    <span style={{ marginLeft: 8, fontFamily: "var(--font-mono)", fontSize: 12 }}>
                      {eng.milestones_done} of {eng.milestones_total} milestones
                    </span>
                  )}
                  {eng.status === "complete" && eng.completed_at && (
                    <span style={{ marginLeft: 8 }}>Completed {formatDate(eng.completed_at)}</span>
                  )}
                </p>
              </Link>
            ))}
          </div>
        )}

        {/* My Interests */}
        {interests.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, marginBottom: 16 }}>
              My Interests
            </h2>
            {interests.map((int) =>
              int.opportunity ? (
                <Link
                  key={int.id}
                  href={`/opportunities/${int.opportunity.id}`}
                  style={{
                    display: "block",
                    fontSize: 14,
                    padding: "8px 0",
                    borderBottom: "1px solid var(--pub-border)",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <span className="pub-link">{int.opportunity.title}</span>
                  {int.opportunity.deadline && (
                    <span style={{ fontSize: 12, color: "var(--pub-text-tertiary)", marginLeft: 8, fontFamily: "var(--font-mono)" }}>
                      Due {new Date(int.opportunity.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  )}
                </Link>
              ) : null
            )}
          </div>
        )}

        {/* Footer nav */}
        <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid var(--pub-border)" }}>
          <Link href="/opportunities" className="pub-link" style={{ fontSize: 14 }}>
            &larr; Browse opportunities
          </Link>
        </div>
      </div>
    </div>
  );
}
