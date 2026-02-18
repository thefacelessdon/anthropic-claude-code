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

// ─── Staleness thresholds (days) ─────────────────────

export const STALENESS_THRESHOLDS: Record<string, number> = {
  organization: 90,
  investment: 60,
  decision: 30,
  opportunity: 14,
  practitioner: 180,
};
