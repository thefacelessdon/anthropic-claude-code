// ─── Enum display labels ─────────────────────────────

export const ORG_TYPE_LABELS: Record<string, string> = {
  foundation: "Foundation",
  government: "Government",
  cultural_institution: "Cultural Institution",
  corporate: "Corporate",
  nonprofit: "Nonprofit",
  intermediary: "Intermediary",
  education: "Education",
  media: "Media",
};

export const INVESTMENT_STATUS_LABELS: Record<string, string> = {
  planned: "Planned",
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const COMPOUNDING_LABELS: Record<string, string> = {
  compounding: "Compounding",
  not_compounding: "Not Compounding",
  too_early: "Too Early",
  unknown: "Unknown",
};

export const DECISION_STATUS_LABELS: Record<string, string> = {
  upcoming: "Upcoming",
  deliberating: "Deliberating",
  locked: "Locked",
  completed: "Completed",
};

export const OPPORTUNITY_STATUS_LABELS: Record<string, string> = {
  open: "Open",
  closing_soon: "Closing Soon",
  closed: "Closed",
  awarded: "Awarded",
};

export const GAP_LABELS: Record<string, string> = {
  high: "High Gap",
  medium: "Medium Gap",
  low: "Low Gap",
  aligned: "Aligned",
};

// ─── Status colors (Tailwind class suffixes) ─────────

export const COMPOUNDING_COLORS: Record<string, string> = {
  compounding: "status-green",
  not_compounding: "status-red",
  too_early: "status-blue",
  unknown: "dim",
};

export const DECISION_STATUS_COLORS: Record<string, string> = {
  upcoming: "status-blue",
  deliberating: "status-orange",
  locked: "status-red",
  completed: "status-green",
};

export const OPPORTUNITY_STATUS_COLORS: Record<string, string> = {
  open: "status-green",
  closing_soon: "status-orange",
  closed: "dim",
  awarded: "status-blue",
};

export const GAP_COLORS: Record<string, string> = {
  high: "status-red",
  medium: "status-orange",
  low: "status-blue",
  aligned: "status-green",
};

export const INVESTMENT_CATEGORY_LABELS: Record<string, string> = {
  direct_artist_support: "Direct Artist Support",
  strategic_planning: "Strategic Planning",
  public_art: "Public Art",
  artist_development: "Artist Development",
  education_training: "Education & Training",
  sector_development: "Sector Development",
  institutional_capacity: "Institutional Capacity",
  infrastructure: "Infrastructure",
  programming: "Programming",
  communications: "Communications",
};

export const OPPORTUNITY_TYPE_LABELS: Record<string, string> = {
  grant: "Grant",
  rfp: "RFP",
  commission: "Commission",
  project: "Project",
  residency: "Residency",
  program: "Program",
  fellowship: "Fellowship",
};

export const OUTPUT_TYPE_LABELS: Record<string, string> = {
  directional_brief: "Directional Brief",
  orientation_framework: "Orientation Framework",
  state_of_ecosystem: "State of Ecosystem",
  memory_transfer: "Memory Transfer",
  field_note: "Field Note",
  foundational_text: "Foundational Text",
};

export const NARRATIVE_SOURCE_LABELS: Record<string, string> = {
  institutional: "Institutional",
  regional_positioning: "Regional Positioning",
  media_coverage: "Media Coverage",
  practitioner: "Practitioner",
};

// ─── Staleness thresholds (days) ─────────────────────

export const STALENESS_THRESHOLDS: Record<string, number> = {
  organization: 90,
  investment: 60,
  decision: 30,
  opportunity: 14,
  practitioner: 180,
};
