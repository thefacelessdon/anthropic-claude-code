// Generated from schema.sql — update with `supabase gen types typescript` when schema changes

export type OrgType =
  | "foundation"
  | "government"
  | "cultural_institution"
  | "corporate"
  | "nonprofit"
  | "intermediary"
  | "education"
  | "media";

export type InvestmentStatus = "planned" | "active" | "completed" | "cancelled";

export type InvestmentCategory =
  | "direct_artist_support"
  | "strategic_planning"
  | "public_art"
  | "artist_development"
  | "education_training"
  | "sector_development"
  | "institutional_capacity"
  | "infrastructure"
  | "programming"
  | "communications";

export type CompoundingStatus =
  | "compounding"
  | "not_compounding"
  | "too_early"
  | "unknown";

export type DecisionStatus =
  | "upcoming"
  | "deliberating"
  | "locked"
  | "completed";

export type OpportunityType =
  | "grant"
  | "rfp"
  | "commission"
  | "project"
  | "residency"
  | "program"
  | "fellowship";

export type OpportunityStatus =
  | "open"
  | "closing_soon"
  | "closed"
  | "awarded";

export type NarrativeSourceType =
  | "institutional"
  | "regional_positioning"
  | "media_coverage"
  | "practitioner";

export type GapLevel = "high" | "medium" | "low" | "aligned";

export type OutputType =
  | "directional_brief"
  | "orientation_framework"
  | "state_of_ecosystem"
  | "memory_transfer"
  | "field_note"
  | "foundational_text";

export type SubmissionStatus = "pending" | "approved" | "rejected";

export type UserRole = "partner" | "project_lead" | "contributor";

// ─── Row types ───────────────────────────────────────

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface Ecosystem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  region: string | null;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  ecosystem_id: string;
  name: string;
  org_type: OrgType;
  mandate: string | null;
  controls: string | null;
  constraints: string | null;
  decision_cycle: string | null;
  website: string | null;
  notes: string | null;
  last_reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  organization_id: string;
  name: string;
  title: string | null;
  role_description: string | null;
  email: string | null;
  phone: string | null;
  is_decision_maker: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Practitioner {
  id: string;
  ecosystem_id: string;
  name: string;
  discipline: string | null;
  tenure: string | null;
  income_sources: string | null;
  retention_factors: string | null;
  risk_factors: string | null;
  institutional_affiliations: string | null;
  notes: string | null;
  last_reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Investment {
  id: string;
  ecosystem_id: string;
  source_org_id: string | null;
  source_name: string | null;
  initiative_name: string;
  amount: number | null;
  period: string | null;
  category: InvestmentCategory | null;
  status: InvestmentStatus;
  description: string | null;
  outcome: string | null;
  compounding: CompoundingStatus;
  compounding_notes: string | null;
  builds_on_id: string | null;
  led_to_id: string | null;
  precedent_id: string | null;
  last_reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Decision {
  id: string;
  ecosystem_id: string;
  stakeholder_org_id: string | null;
  stakeholder_name: string | null;
  decision_title: string;
  description: string | null;
  deliberation_start: string | null;
  deliberation_end: string | null;
  locks_date: string | null;
  status: DecisionStatus;
  dependencies: string | null;
  intervention_needed: string | null;
  outcome: string | null;
  is_recurring: boolean;
  recurrence_pattern: string | null;
  last_reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Precedent {
  id: string;
  ecosystem_id: string;
  name: string;
  period: string | null;
  involved: string | null;
  description: string | null;
  what_produced: string | null;
  what_worked: string | null;
  what_didnt: string | null;
  connects_to: string | null;
  takeaway: string | null;
  investment_id: string | null;
  last_reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Opportunity {
  id: string;
  ecosystem_id: string;
  source_org_id: string | null;
  source_name: string | null;
  title: string;
  opportunity_type: OpportunityType;
  amount_min: number | null;
  amount_max: number | null;
  amount_description: string | null;
  deadline: string | null;
  deadline_description: string | null;
  eligibility: string | null;
  description: string | null;
  application_url: string | null;
  contact_email: string | null;
  status: OpportunityStatus;
  awarded_to: string | null;
  awarded_investment_id: string | null;
  submitted_by: string | null;
  submitted_externally: boolean;
  last_reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Narrative {
  id: string;
  ecosystem_id: string;
  source_org_id: string | null;
  source_name: string | null;
  source_type: NarrativeSourceType;
  date: string | null;
  narrative_text: string;
  reality_text: string | null;
  gap: GapLevel;
  evidence_notes: string | null;
  source_url: string | null;
  significance: string | null;
  last_reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type DeliveryStatus = 'draft' | 'published' | 'delivered' | 'acknowledged';

export interface Output {
  id: string;
  ecosystem_id: string;
  output_type: OutputType;
  title: string;
  content: string | null;
  summary: string | null;
  author_id: string | null;
  target_stakeholder_id: string | null;
  triggered_by_decision_id: string | null;
  is_published: boolean;
  published_at: string | null;
  delivery_status: DeliveryStatus;
  delivered_at: string | null;
  delivered_to_contact: string | null;
  delivery_notes: string | null;
  file_url: string | null;
  file_type: string | null;
  created_at: string;
  updated_at: string;
}

export interface OutputReference {
  id: string;
  output_id: string;
  reference_type: string;
  reference_id: string;
  context_note: string | null;
}

export interface Submission {
  id: string;
  ecosystem_id: string;
  submission_type: string;
  data: Record<string, unknown>;
  submitter_name: string | null;
  submitter_email: string | null;
  submitter_org: string | null;
  status: SubmissionStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_entity_id: string | null;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  ecosystem_id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  changes: Record<string, unknown> | null;
  created_at: string;
}

export interface Tag {
  id: string;
  ecosystem_id: string;
  name: string;
  category: string | null;
}

export interface DecisionDependency {
  decision_id: string;
  depends_on_id: string;
  description: string | null;
}

// ─── Public surface types ────────────────────────────

export type Availability = 'available' | 'booked' | 'selective';
export type EngagementStatus = 'pending' | 'active' | 'complete' | 'cancelled';

export interface PublicProfile {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  primary_skill: string;
  location: string;
  bio: string | null;
  portfolio_url: string | null;
  additional_skills: string[] | null;
  rate_range: string | null;
  availability: Availability;
  looking_for: string[] | null;
  business_entity_type: string | null;
  is_verified: boolean;
  verified_at: string | null;
  practitioner_id: string | null;
  created_at: string;
  updated_at: string;
}

export type InterestStatus = 'expressed' | 'applied' | 'awarded' | 'not_awarded' | 'withdrew' | 'did_not_apply';

export interface OpportunityInterest {
  id: string;
  opportunity_id: string;
  profile_id: string | null;
  practitioner_name: string | null;
  practitioner_email: string | null;
  practitioner_discipline: string | null;
  notes: string | null;
  status: InterestStatus;
  followed_up_at: string | null;
  followup_response: Record<string, unknown> | null;
  outcome_notes: string | null;
  practitioner_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Engagement {
  id: string;
  opportunity_id: string | null;
  profile_id: string;
  funder_org_id: string | null;
  funder_contact_email: string | null;
  title: string;
  scope: string | null;
  total_amount: number | null;
  start_date: string | null;
  end_date: string | null;
  payment_terms: Record<string, unknown>[];
  status: EngagementStatus;
  practitioner_confirmed_complete: boolean;
  funder_confirmed_complete: boolean;
  completed_at: string | null;
  payment_accelerated: boolean;
  accelerated_payment_date: string | null;
  funder_payment_received_date: string | null;
  investment_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface EngagementMilestone {
  id: string;
  engagement_id: string;
  title: string;
  due_date: string | null;
  completed_at: string | null;
  confirmed_at: string | null;
  sort_order: number;
  created_at: string;
}

export interface EngagementDeliverable {
  id: string;
  engagement_id: string;
  title: string;
  file_url: string | null;
  submitted_at: string | null;
  accepted_at: string | null;
  sort_order: number;
  created_at: string;
}

export interface EngagementActivity {
  id: string;
  engagement_id: string;
  actor: string;
  action: string;
  detail: string | null;
  created_at: string;
}

// ─── View types ──────────────────────────────────────

export interface StaleEntry {
  entity_type: string;
  entity_id: string;
  name: string;
  last_reviewed_at: string | null;
  ecosystem_id: string;
}

export interface EcosystemStats {
  ecosystem_id: string;
  name: string;
  org_count: number;
  practitioner_count: number;
  total_investment: number;
  compounding_count: number;
  not_compounding_count: number;
  open_opportunities: number;
  active_decisions: number;
  high_gap_narratives: number;
}

export interface UpcomingIntervention {
  id: string;
  ecosystem_id: string;
  stakeholder_org_id: string | null;
  stakeholder_name: string | null;
  decision_title: string;
  description: string | null;
  deliberation_start: string | null;
  deliberation_end: string | null;
  locks_date: string | null;
  status: DecisionStatus;
  dependencies: string | null;
  intervention_needed: string | null;
  stakeholder_org_name: string | null;
}

// ─── Database type for Supabase client ───────────────

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      ecosystems: { Row: Ecosystem; Insert: Partial<Ecosystem>; Update: Partial<Ecosystem> };
      organizations: { Row: Organization; Insert: Partial<Organization>; Update: Partial<Organization> };
      contacts: { Row: Contact; Insert: Partial<Contact>; Update: Partial<Contact> };
      practitioners: { Row: Practitioner; Insert: Partial<Practitioner>; Update: Partial<Practitioner> };
      investments: { Row: Investment; Insert: Partial<Investment>; Update: Partial<Investment> };
      decisions: { Row: Decision; Insert: Partial<Decision>; Update: Partial<Decision> };
      precedents: { Row: Precedent; Insert: Partial<Precedent>; Update: Partial<Precedent> };
      opportunities: { Row: Opportunity; Insert: Partial<Opportunity>; Update: Partial<Opportunity> };
      narratives: { Row: Narrative; Insert: Partial<Narrative>; Update: Partial<Narrative> };
      outputs: { Row: Output; Insert: Partial<Output>; Update: Partial<Output> };
      output_references: { Row: OutputReference; Insert: Partial<OutputReference>; Update: Partial<OutputReference> };
      submissions: { Row: Submission; Insert: Partial<Submission>; Update: Partial<Submission> };
      activity_log: { Row: ActivityLog; Insert: Partial<ActivityLog>; Update: Partial<ActivityLog> };
      tags: { Row: Tag; Insert: Partial<Tag>; Update: Partial<Tag> };
      public_profiles: { Row: PublicProfile; Insert: Partial<PublicProfile>; Update: Partial<PublicProfile> };
      opportunity_interests: { Row: OpportunityInterest; Insert: Partial<OpportunityInterest>; Update: Partial<OpportunityInterest> };
      engagements: { Row: Engagement; Insert: Partial<Engagement>; Update: Partial<Engagement> };
      engagement_milestones: { Row: EngagementMilestone; Insert: Partial<EngagementMilestone>; Update: Partial<EngagementMilestone> };
      engagement_deliverables: { Row: EngagementDeliverable; Insert: Partial<EngagementDeliverable>; Update: Partial<EngagementDeliverable> };
      engagement_activity: { Row: EngagementActivity; Insert: Partial<EngagementActivity>; Update: Partial<EngagementActivity> };
    };
    Views: {
      stale_entries: { Row: StaleEntry };
      ecosystem_stats: { Row: EcosystemStats };
      upcoming_interventions: { Row: UpcomingIntervention };
    };
    Enums: {
      org_type: OrgType;
      investment_status: InvestmentStatus;
      investment_category: InvestmentCategory;
      compounding_status: CompoundingStatus;
      decision_status: DecisionStatus;
      opportunity_type: OpportunityType;
      opportunity_status: OpportunityStatus;
      narrative_source_type: NarrativeSourceType;
      gap_level: GapLevel;
      output_type: OutputType;
      submission_status: SubmissionStatus;
      user_role: UserRole;
    };
  };
}
