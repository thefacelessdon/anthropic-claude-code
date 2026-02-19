"use client";

import Link from "next/link";

interface Props {
  profile: {
    id: string;
    name: string;
    primary_skill: string;
    location: string;
    bio: string | null;
    portfolio_url: string | null;
    is_verified: boolean;
    looking_for: string[] | null;
    availability: string;
    additional_skills: string[] | null;
  };
  completedEngagements: {
    id: string;
    title: string;
    funder_name: string | null;
    completed_at: string | null;
  }[];
}

const AVAILABILITY_LABELS: Record<string, string> = {
  available: "Available",
  booked: "Booked",
  selective: "Selectively available",
};

export function PublicProfileView({ profile, completedEngagements }: Props) {
  return (
    <div className="pub-theme" style={{
      ["--font-display" as string]: "'DM Serif Display', serif",
      ["--font-body" as string]: "'DM Sans', sans-serif",
      ["--font-mono" as string]: "'JetBrains Mono', monospace",
    }}>
      <div className="pub-page" style={{ paddingBottom: 64 }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          {/* Back nav */}
          <div style={{ padding: "24px 0" }}>
            <Link href="/opportunities" className="pub-link" style={{ fontSize: 14 }}>
              &larr; Back to opportunities
            </Link>
          </div>

          {/* Profile header */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 500 }}>
              {profile.name}
            </h1>
            <p style={{ fontSize: 15, color: "var(--pub-text-secondary)", marginTop: 4 }}>
              {profile.primary_skill} &middot; {profile.location}
              {profile.is_verified && (
                <span style={{ color: "var(--pub-grant)", marginLeft: 8, fontSize: 13 }}>
                  &#10003; Verified
                </span>
              )}
            </p>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>
              {profile.bio}
            </p>
          )}

          {/* Portfolio */}
          {profile.portfolio_url && (
            <p style={{ marginBottom: 24 }}>
              <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer" className="pub-link" style={{ fontSize: 14 }}>
                Portfolio &rarr;
              </a>
            </p>
          )}

          {/* Additional skills */}
          {profile.additional_skills && profile.additional_skills.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <p className="pub-detail-label" style={{ marginBottom: 6 }}>Additional Skills</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {profile.additional_skills.map((s) => (
                  <span key={s} style={{
                    fontSize: 13,
                    padding: "3px 10px",
                    borderRadius: 4,
                    background: "rgba(0,0,0,0.04)",
                    color: "var(--pub-text-secondary)",
                  }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Completed engagements */}
          {completedEngagements.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <p className="pub-detail-label" style={{ marginBottom: 8 }}>Completed Through Platform</p>
              {completedEngagements.map((eng) => (
                <p key={eng.id} style={{ fontSize: 14, marginBottom: 4 }}>
                  {eng.title}
                  {eng.funder_name && (
                    <span style={{ color: "var(--pub-text-tertiary)" }}> &middot; {eng.funder_name}</span>
                  )}
                </p>
              ))}
            </div>
          )}

          {/* Looking for */}
          {profile.looking_for && profile.looking_for.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <p className="pub-detail-label" style={{ marginBottom: 6 }}>Looking For</p>
              <p style={{ fontSize: 14, textTransform: "capitalize" }}>
                {profile.looking_for.join(", ")}
              </p>
            </div>
          )}

          {/* Availability */}
          <div style={{ marginBottom: 24 }}>
            <p className="pub-detail-label" style={{ marginBottom: 6 }}>Availability</p>
            <p style={{ fontSize: 14 }}>
              {AVAILABILITY_LABELS[profile.availability] || profile.availability}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
