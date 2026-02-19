-- ============================================================
-- CULTURAL ARCHITECTURE PLATFORM — SCHEMA
-- ============================================================
-- Run in Supabase SQL Editor. Creates all tables, enums, RLS,
-- indexes, views, functions, and triggers.
--
-- Then run seed.sql separately.
--
-- Supersedes the original schema.sql. Adds: public_profiles,
-- opportunity_interests, engagements (with milestones,
-- deliverables, activity), float_fund_transactions,
-- preparation_context on opportunities, and the engagement →
-- investment lifecycle connection.
-- ============================================================


-- ──────────────────────────────────────────
-- ENUMS
-- ──────────────────────────────────────────

CREATE TYPE org_type AS ENUM (
  'foundation',
  'government',
  'cultural_institution',
  'corporate',
  'nonprofit',
  'intermediary',
  'education',
  'media'
);

CREATE TYPE investment_status AS ENUM (
  'planned',
  'active',
  'completed',
  'cancelled'
);

CREATE TYPE investment_category AS ENUM (
  'direct_artist_support',
  'strategic_planning',
  'public_art',
  'artist_development',
  'education_training',
  'sector_development',
  'institutional_capacity',
  'infrastructure',
  'programming',
  'communications',
  'creative_production'
);

CREATE TYPE compounding_status AS ENUM (
  'compounding',
  'not_compounding',
  'too_early',
  'unknown'
);

CREATE TYPE decision_status AS ENUM (
  'upcoming',
  'deliberating',
  'locked',
  'completed'
);

CREATE TYPE opportunity_type AS ENUM (
  'grant',
  'rfp',
  'commission',
  'project',
  'residency',
  'program',
  'fellowship'
);

CREATE TYPE opportunity_status AS ENUM (
  'open',
  'closing_soon',
  'closed',
  'awarded'
);

CREATE TYPE narrative_source_type AS ENUM (
  'institutional',
  'regional_positioning',
  'media_coverage',
  'practitioner',
  'funder_report'
);

CREATE TYPE gap_level AS ENUM (
  'high',
  'medium',
  'low',
  'aligned'
);

CREATE TYPE output_type AS ENUM (
  'directional_brief',
  'orientation_framework',
  'state_of_ecosystem',
  'memory_transfer',
  'field_note',
  'foundational_text'
);

CREATE TYPE submission_status AS ENUM (
  'pending',
  'approved',
  'rejected'
);

CREATE TYPE user_role AS ENUM (
  'partner',
  'project_lead',
  'contributor',
  'practitioner',
  'funder'
);

CREATE TYPE engagement_status AS ENUM (
  'pending',
  'active',
  'complete',
  'cancelled'
);

CREATE TYPE availability_status AS ENUM (
  'available',
  'booked',
  'selective'
);


-- ──────────────────────────────────────────
-- CORE: PROFILES (extends Supabase auth.users)
-- ──────────────────────────────────────────
-- Internal profiles for practice team auth

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'contributor',
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ──────────────────────────────────────────
-- ECOSYSTEMS
-- ──────────────────────────────────────────

CREATE TABLE ecosystems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  region TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ──────────────────────────────────────────
-- 1. ECOSYSTEM MAP: ORGANIZATIONS
-- ──────────────────────────────────────────

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ecosystem_id UUID NOT NULL REFERENCES ecosystems(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  org_type org_type NOT NULL,
  mandate TEXT,
  controls TEXT,
  constraints TEXT,
  decision_cycle TEXT,
  website TEXT,
  notes TEXT,
  -- Payment acceleration eligibility
  acceleration_enabled BOOLEAN DEFAULT false,
  avg_payment_days INTEGER,
  last_reviewed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ──────────────────────────────────────────
-- 1b. ECOSYSTEM MAP: CONTACTS
-- ──────────────────────────────────────────

CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT,
  role_description TEXT,
  email TEXT,
  phone TEXT,
  is_decision_maker BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ──────────────────────────────────────────
-- 1c. ECOSYSTEM MAP: ORG RELATIONSHIPS
-- ──────────────────────────────────────────

CREATE TABLE org_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_a_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  org_b_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL,
  description TEXT,
  strength TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT different_orgs CHECK (org_a_id != org_b_id)
);


-- ──────────────────────────────────────────
-- 1d. ECOSYSTEM MAP: PRACTITIONERS (practice team's analytical view)
-- ──────────────────────────────────────────

CREATE TABLE practitioners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ecosystem_id UUID NOT NULL REFERENCES ecosystems(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  discipline TEXT,
  tenure TEXT,
  income_sources TEXT,
  retention_factors TEXT,
  risk_factors TEXT,
  institutional_affiliations TEXT,
  notes TEXT,
  -- Link to public profile (if practitioner has one)
  public_profile_id UUID,
  last_reviewed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ──────────────────────────────────────────
-- 2. INVESTMENT LEDGER
-- ──────────────────────────────────────────

CREATE TABLE investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ecosystem_id UUID NOT NULL REFERENCES ecosystems(id) ON DELETE CASCADE,
  source_org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  source_name TEXT,
  initiative_name TEXT NOT NULL,
  amount INTEGER,
  period TEXT,
  category investment_category,
  status investment_status NOT NULL DEFAULT 'active',
  description TEXT,
  outcome TEXT,
  compounding compounding_status DEFAULT 'unknown',
  compounding_notes TEXT,
  builds_on_id UUID REFERENCES investments(id) ON DELETE SET NULL,
  led_to_id UUID REFERENCES investments(id) ON DELETE SET NULL,
  precedent_id UUID,
  -- Platform source tracking
  source TEXT DEFAULT 'manual',  -- 'manual' or 'platform' (auto-created from engagement)
  engagement_id UUID,            -- back-link to the engagement that created this
  last_reviewed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ──────────────────────────────────────────
-- 3. DECISION CALENDAR
-- ──────────────────────────────────────────

CREATE TABLE decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ecosystem_id UUID NOT NULL REFERENCES ecosystems(id) ON DELETE CASCADE,
  stakeholder_org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  stakeholder_name TEXT,
  decision_title TEXT NOT NULL,
  description TEXT,
  deliberation_start DATE,
  deliberation_end DATE,
  locks_date DATE,
  status decision_status NOT NULL DEFAULT 'upcoming',
  dependencies TEXT,
  intervention_needed TEXT,
  outcome TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT,
  last_reviewed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE decision_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  depends_on_id UUID NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  description TEXT,
  CONSTRAINT different_decisions CHECK (decision_id != depends_on_id)
);


-- ──────────────────────────────────────────
-- 4. PRECEDENT ARCHIVE
-- ──────────────────────────────────────────

CREATE TABLE precedents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ecosystem_id UUID NOT NULL REFERENCES ecosystems(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  period TEXT,
  involved TEXT,
  description TEXT,
  what_produced TEXT,
  what_worked TEXT,
  what_didnt TEXT,
  connects_to TEXT,
  takeaway TEXT,
  investment_id UUID REFERENCES investments(id) ON DELETE SET NULL,
  last_reviewed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE investments ADD CONSTRAINT fk_precedent
  FOREIGN KEY (precedent_id) REFERENCES precedents(id) ON DELETE SET NULL;


-- ──────────────────────────────────────────
-- 5. OPPORTUNITY LAYER
-- ──────────────────────────────────────────

CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ecosystem_id UUID NOT NULL REFERENCES ecosystems(id) ON DELETE CASCADE,
  source_org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  source_name TEXT,
  title TEXT NOT NULL,
  opportunity_type opportunity_type NOT NULL,
  amount_min INTEGER,
  amount_max INTEGER,
  amount_description TEXT,
  deadline DATE,
  deadline_description TEXT,
  eligibility TEXT,
  description TEXT,
  application_url TEXT,
  contact_email TEXT,
  status opportunity_status NOT NULL DEFAULT 'open',
  -- New fields
  preparation_context TEXT,              -- practice team's strategic framing
  target_disciplines TEXT[],             -- for future discipline filtering
  -- Lifecycle
  awarded_to TEXT,
  awarded_investment_id UUID REFERENCES investments(id) ON DELETE SET NULL,
  -- Submission tracking
  submitted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  submitted_externally BOOLEAN DEFAULT false,
  last_reviewed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ──────────────────────────────────────────
-- 6. NARRATIVE RECORD
-- ──────────────────────────────────────────

CREATE TABLE narratives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ecosystem_id UUID NOT NULL REFERENCES ecosystems(id) ON DELETE CASCADE,
  source_org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  source_name TEXT,
  source_type narrative_source_type NOT NULL,
  date DATE,
  narrative_text TEXT NOT NULL,
  reality_text TEXT,
  gap gap_level DEFAULT 'medium',
  evidence_notes TEXT,
  source_url TEXT,
  last_reviewed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ──────────────────────────────────────────
-- 7. INTELLIGENCE LAYER: OUTPUTS
-- ──────────────────────────────────────────

CREATE TABLE outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ecosystem_id UUID NOT NULL REFERENCES ecosystems(id) ON DELETE CASCADE,
  output_type output_type NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  summary TEXT,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  target_stakeholder_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  triggered_by_decision_id UUID REFERENCES decisions(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE output_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  output_id UUID NOT NULL REFERENCES outputs(id) ON DELETE CASCADE,
  reference_type TEXT NOT NULL,
  reference_id UUID NOT NULL,
  context_note TEXT
);


-- ──────────────────────────────────────────
-- TAGS
-- ──────────────────────────────────────────

CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ecosystem_id UUID NOT NULL REFERENCES ecosystems(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  UNIQUE(ecosystem_id, name)
);

CREATE TABLE organization_tags (
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (organization_id, tag_id)
);

CREATE TABLE investment_tags (
  investment_id UUID REFERENCES investments(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (investment_id, tag_id)
);

CREATE TABLE opportunity_tags (
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (opportunity_id, tag_id)
);

CREATE TABLE precedent_tags (
  precedent_id UUID REFERENCES precedents(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (precedent_id, tag_id)
);


-- ──────────────────────────────────────────
-- EXTERNAL SUBMISSIONS
-- ──────────────────────────────────────────

CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ecosystem_id UUID NOT NULL REFERENCES ecosystems(id) ON DELETE CASCADE,
  submission_type TEXT NOT NULL,
  data JSONB NOT NULL,
  submitter_name TEXT,
  submitter_email TEXT,
  submitter_org TEXT,
  status submission_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_entity_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ──────────────────────────────────────────
-- ACTIVITY LOG
-- ──────────────────────────────────────────

CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ecosystem_id UUID NOT NULL REFERENCES ecosystems(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  changes JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ============================================================
-- NEW: PUBLIC PLATFORM TABLES
-- ============================================================


-- ──────────────────────────────────────────
-- PUBLIC PROFILES (practitioners on the public surface)
-- ──────────────────────────────────────────

CREATE TABLE public_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  
  -- Core (required)
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  primary_skill TEXT NOT NULL,
  location TEXT NOT NULL,
  
  -- Enrichment (optional)
  bio TEXT,
  portfolio_url TEXT,
  additional_skills TEXT[],
  rate_range TEXT,
  availability availability_status DEFAULT 'available',
  looking_for TEXT[],
  
  -- Verification
  business_entity_type TEXT,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  
  -- Link to practice surface ecosystem map
  practitioner_id UUID REFERENCES practitioners(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Back-reference from practitioners
ALTER TABLE practitioners ADD CONSTRAINT fk_public_profile
  FOREIGN KEY (public_profile_id) REFERENCES public_profiles(id) ON DELETE SET NULL;


-- ──────────────────────────────────────────
-- OPPORTUNITY INTERESTS (engagement signals)
-- ──────────────────────────────────────────

CREATE TABLE opportunity_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES opportunities(id) NOT NULL,
  profile_id UUID REFERENCES public_profiles(id) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(opportunity_id, profile_id)  -- one interest per person per opportunity
);


-- ──────────────────────────────────────────
-- ENGAGEMENTS (project-based work)
-- ──────────────────────────────────────────

CREATE TABLE engagements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Links
  opportunity_id UUID REFERENCES opportunities(id),
  profile_id UUID REFERENCES public_profiles(id) NOT NULL,
  funder_org_id UUID REFERENCES organizations(id),
  funder_contact_email TEXT,
  
  -- Terms
  title TEXT NOT NULL,
  scope TEXT,
  total_amount NUMERIC,
  start_date DATE,
  end_date DATE,
  payment_terms JSONB DEFAULT '[]',
  
  -- Status
  status engagement_status NOT NULL DEFAULT 'active',
  practitioner_confirmed_complete BOOLEAN DEFAULT FALSE,
  funder_confirmed_complete BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  
  -- Payment acceleration
  payment_accelerated BOOLEAN DEFAULT FALSE,
  accelerated_payment_date TIMESTAMPTZ,
  funder_payment_received_date TIMESTAMPTZ,
  
  -- Generated investment
  investment_id UUID REFERENCES investments(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Back-reference from investments
ALTER TABLE investments ADD CONSTRAINT fk_engagement
  FOREIGN KEY (engagement_id) REFERENCES engagements(id) ON DELETE SET NULL;

CREATE TABLE engagement_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id UUID REFERENCES engagements(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE engagement_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id UUID REFERENCES engagements(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  file_url TEXT,
  submitted_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE engagement_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id UUID REFERENCES engagements(id) ON DELETE CASCADE NOT NULL,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  detail TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ──────────────────────────────────────────
-- FLOAT FUND (payment acceleration tracking)
-- ──────────────────────────────────────────

CREATE TABLE float_fund_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id UUID REFERENCES engagements(id),
  transaction_type TEXT NOT NULL
    CHECK (transaction_type IN (
      'acceleration_out', 'funder_replenish', 'capitalization', 'fee_revenue', 'adjustment'
    )),
  amount NUMERIC NOT NULL,
  balance_after NUMERIC NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- INDEXES
-- ============================================================

-- Practice surface
CREATE INDEX idx_orgs_ecosystem ON organizations(ecosystem_id);
CREATE INDEX idx_orgs_type ON organizations(org_type);
CREATE INDEX idx_contacts_org ON contacts(organization_id);
CREATE INDEX idx_practitioners_ecosystem ON practitioners(ecosystem_id);
CREATE INDEX idx_investments_ecosystem ON investments(ecosystem_id);
CREATE INDEX idx_investments_source ON investments(source_org_id);
CREATE INDEX idx_investments_status ON investments(status);
CREATE INDEX idx_investments_category ON investments(category);
CREATE INDEX idx_decisions_ecosystem ON decisions(ecosystem_id);
CREATE INDEX idx_decisions_status ON decisions(status);
CREATE INDEX idx_decisions_locks ON decisions(locks_date);
CREATE INDEX idx_precedents_ecosystem ON precedents(ecosystem_id);
CREATE INDEX idx_opportunities_ecosystem ON opportunities(ecosystem_id);
CREATE INDEX idx_opportunities_status ON opportunities(status);
CREATE INDEX idx_opportunities_deadline ON opportunities(deadline);
CREATE INDEX idx_opportunities_type ON opportunities(opportunity_type);
CREATE INDEX idx_narratives_ecosystem ON narratives(ecosystem_id);
CREATE INDEX idx_narratives_gap ON narratives(gap);
CREATE INDEX idx_outputs_ecosystem ON outputs(ecosystem_id);
CREATE INDEX idx_outputs_type ON outputs(output_type);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_activity_ecosystem ON activity_log(ecosystem_id);
CREATE INDEX idx_activity_entity ON activity_log(entity_type, entity_id);

-- Public surface
CREATE INDEX idx_public_profiles_skill ON public_profiles(primary_skill);
CREATE INDEX idx_public_profiles_user ON public_profiles(user_id);
CREATE INDEX idx_interests_opportunity ON opportunity_interests(opportunity_id);
CREATE INDEX idx_interests_profile ON opportunity_interests(profile_id);
CREATE INDEX idx_engagements_profile ON engagements(profile_id);
CREATE INDEX idx_engagements_funder ON engagements(funder_org_id);
CREATE INDEX idx_engagements_status ON engagements(status);
CREATE INDEX idx_engagement_milestones_engagement ON engagement_milestones(engagement_id);
CREATE INDEX idx_engagement_deliverables_engagement ON engagement_deliverables(engagement_id);
CREATE INDEX idx_engagement_activity_engagement ON engagement_activity(engagement_id);


-- ============================================================
-- VIEWS
-- ============================================================

CREATE VIEW stale_entries AS
  SELECT 'organization' AS entity_type, id AS entity_id, name, last_reviewed_at, ecosystem_id
  FROM organizations WHERE last_reviewed_at < now() - INTERVAL '90 days'
  UNION ALL
  SELECT 'investment', id, initiative_name, last_reviewed_at, ecosystem_id
  FROM investments WHERE last_reviewed_at < now() - INTERVAL '60 days'
  UNION ALL
  SELECT 'decision', id, decision_title, last_reviewed_at, ecosystem_id
  FROM decisions WHERE last_reviewed_at < now() - INTERVAL '30 days'
  UNION ALL
  SELECT 'opportunity', id, title, last_reviewed_at, ecosystem_id
  FROM opportunities WHERE last_reviewed_at < now() - INTERVAL '14 days' AND status = 'open'
  UNION ALL
  SELECT 'practitioner', id, name, last_reviewed_at, ecosystem_id
  FROM practitioners WHERE last_reviewed_at < now() - INTERVAL '180 days';

CREATE VIEW ecosystem_stats AS
  SELECT
    e.id AS ecosystem_id,
    e.name,
    (SELECT COUNT(*) FROM organizations WHERE ecosystem_id = e.id) AS org_count,
    (SELECT COUNT(*) FROM practitioners WHERE ecosystem_id = e.id) AS practitioner_count,
    (SELECT COALESCE(SUM(amount), 0) FROM investments WHERE ecosystem_id = e.id) AS total_investment,
    (SELECT COUNT(*) FROM investments WHERE ecosystem_id = e.id AND compounding = 'compounding') AS compounding_count,
    (SELECT COUNT(*) FROM investments WHERE ecosystem_id = e.id AND compounding = 'not_compounding') AS not_compounding_count,
    (SELECT COUNT(*) FROM opportunities WHERE ecosystem_id = e.id AND status IN ('open', 'closing_soon')) AS open_opportunities,
    (SELECT COUNT(*) FROM decisions WHERE ecosystem_id = e.id AND status IN ('upcoming', 'deliberating')) AS active_decisions,
    (SELECT COUNT(*) FROM narratives WHERE ecosystem_id = e.id AND gap = 'high') AS high_gap_narratives,
    (SELECT COUNT(*) FROM engagements WHERE status = 'active') AS active_engagements,
    (SELECT COUNT(*) FROM public_profiles) AS public_profile_count
  FROM ecosystems e;

CREATE VIEW upcoming_interventions AS
  SELECT
    d.*,
    o.name AS stakeholder_org_name
  FROM decisions d
  LEFT JOIN organizations o ON d.stakeholder_org_id = o.id
  WHERE d.status IN ('upcoming', 'deliberating')
    AND d.locks_date IS NOT NULL
    AND d.locks_date <= CURRENT_DATE + INTERVAL '90 days'
  ORDER BY d.locks_date ASC;

-- Opportunity engagement stats (for practice surface)
CREATE VIEW opportunity_engagement_stats AS
  SELECT
    o.id AS opportunity_id,
    o.title,
    COUNT(DISTINCT oi.id) AS interest_count,
    ARRAY_AGG(DISTINCT pp.primary_skill) FILTER (WHERE pp.primary_skill IS NOT NULL) AS interested_disciplines,
    COUNT(DISTINCT e.id) AS engagement_count
  FROM opportunities o
  LEFT JOIN opportunity_interests oi ON o.id = oi.opportunity_id
  LEFT JOIN public_profiles pp ON oi.profile_id = pp.id
  LEFT JOIN engagements e ON o.id = e.opportunity_id
  GROUP BY o.id, o.title;


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecosystems ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE practitioners ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE precedents ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE narratives ENABLE ROW LEVEL SECURITY;
ALTER TABLE outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE float_fund_transactions ENABLE ROW LEVEL SECURITY;

-- ── Public read access ──

CREATE POLICY "Opportunities publicly readable"
  ON opportunities FOR SELECT
  USING (true);  -- all statuses readable (practice team needs closed/awarded too)

CREATE POLICY "Published outputs publicly readable"
  ON outputs FOR SELECT
  USING (is_published = true);

CREATE POLICY "Public profiles readable by everyone"
  ON public_profiles FOR SELECT
  USING (true);

-- ── Public profile management ──

CREATE POLICY "Users can insert own profile"
  ON public_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- ── Opportunity interests ──

CREATE POLICY "Interests readable by owner and authenticated"
  ON opportunity_interests FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert own interests"
  ON opportunity_interests FOR INSERT TO authenticated
  WITH CHECK (
    profile_id IN (SELECT id FROM public_profiles WHERE user_id = auth.uid())
  );

-- ── Engagements ──

CREATE POLICY "Engagements readable by authenticated"
  ON engagements FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Engagements updatable by authenticated"
  ON engagements FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Milestones readable" ON engagement_milestones FOR SELECT TO authenticated USING (true);
CREATE POLICY "Milestones updatable" ON engagement_milestones FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Deliverables readable" ON engagement_deliverables FOR SELECT TO authenticated USING (true);
CREATE POLICY "Deliverables updatable" ON engagement_deliverables FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Engagement activity readable" ON engagement_activity FOR SELECT TO authenticated USING (true);
CREATE POLICY "Engagement activity insertable" ON engagement_activity FOR INSERT TO authenticated WITH CHECK (true);

-- ── Float fund (practice team only) ──

CREATE POLICY "Float fund readable by authenticated"
  ON float_fund_transactions FOR SELECT TO authenticated
  USING (true);

-- ── Authenticated read for practice surface ──

CREATE POLICY "Auth read all" ON organizations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read investments" ON investments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read decisions" ON decisions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read precedents" ON precedents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read narratives" ON narratives FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read outputs" ON outputs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read contacts" ON contacts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read relationships" ON org_relationships FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read practitioners" ON practitioners FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read ecosystems" ON ecosystems FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read profiles" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read tags" ON tags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read submissions" ON submissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read activity" ON activity_log FOR SELECT TO authenticated USING (true);

-- ── Team write access ──

CREATE POLICY "Team insert orgs" ON organizations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Team update orgs" ON organizations FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Team insert investments" ON investments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Team update investments" ON investments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Team insert decisions" ON decisions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Team update decisions" ON decisions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Team insert precedents" ON precedents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Team update precedents" ON precedents FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Team insert opportunities" ON opportunities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Team update opportunities" ON opportunities FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Team insert narratives" ON narratives FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Team update narratives" ON narratives FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Team insert outputs" ON outputs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Team update outputs" ON outputs FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Team manage contacts" ON contacts FOR ALL TO authenticated USING (true);
CREATE POLICY "Team manage relationships" ON org_relationships FOR ALL TO authenticated USING (true);
CREATE POLICY "Team manage practitioners" ON practitioners FOR ALL TO authenticated USING (true);
CREATE POLICY "Team manage tags" ON tags FOR ALL TO authenticated USING (true);
CREATE POLICY "Team manage submissions" ON submissions FOR ALL TO authenticated USING (true);
CREATE POLICY "Team insert activity" ON activity_log FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Team manage ecosystems" ON ecosystems FOR ALL TO authenticated USING (true);
CREATE POLICY "Team manage engagements" ON engagements FOR ALL TO authenticated USING (true);
CREATE POLICY "Team insert milestones" ON engagement_milestones FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Team insert deliverables" ON engagement_deliverables FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Team manage float" ON float_fund_transactions FOR ALL TO authenticated USING (true);

CREATE POLICY "Profiles self-manage" ON profiles FOR ALL TO authenticated USING (auth.uid() = id);

-- Anon submission
CREATE POLICY "Anyone can submit" ON submissions FOR INSERT TO anon WITH CHECK (true);


-- ============================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON ecosystems FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON practitioners FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON investments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON decisions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON precedents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON narratives FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON outputs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON engagements FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create internal profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'practitioner')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ============================================================
-- DONE — Run seed.sql next
-- ============================================================
