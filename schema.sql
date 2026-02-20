-- ============================================================
-- CULTURAL ARCHITECTURE TOOLKIT — SUPABASE SCHEMA
-- ============================================================
-- Run this in the Supabase SQL Editor to set up the full database.
-- Includes: tables, enums, relationships, RLS policies, indexes,
-- views, and seed data for NWA prototype.
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
  'communications'
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
  'practitioner'
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
  'contributor'
);

-- ──────────────────────────────────────────
-- CORE: PROFILES (extends Supabase auth.users)
-- ──────────────────────────────────────────

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'contributor',
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────
-- ECOSYSTEMS (supports multiple ecosystems)
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
  controls TEXT,           -- what they control (budget, programming, policy, space)
  constraints TEXT,        -- what limits them
  decision_cycle TEXT,     -- when their key decisions happen
  website TEXT,
  notes TEXT,
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
  role_description TEXT,   -- what they actually decide or influence
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
  relationship_type TEXT NOT NULL,  -- 'funds', 'partners_with', 'governed_by', etc.
  description TEXT,
  strength TEXT,           -- 'strong', 'moderate', 'weak', 'formal_only'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT different_orgs CHECK (org_a_id != org_b_id)
);

-- ──────────────────────────────────────────
-- 1d. ECOSYSTEM MAP: PRACTITIONERS
-- ──────────────────────────────────────────

CREATE TABLE practitioners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ecosystem_id UUID NOT NULL REFERENCES ecosystems(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  discipline TEXT,
  tenure TEXT,             -- how long in ecosystem
  income_sources TEXT,
  retention_factors TEXT,  -- what keeps them
  risk_factors TEXT,       -- what might push them out
  institutional_affiliations TEXT,
  notes TEXT,
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
  source_name TEXT,        -- fallback if org not yet in system
  initiative_name TEXT NOT NULL,
  amount INTEGER,          -- in dollars
  period TEXT,             -- e.g. "Q1-Q2 2025" or "2024-2025"
  category investment_category,
  status investment_status NOT NULL DEFAULT 'active',
  description TEXT,
  outcome TEXT,
  compounding compounding_status DEFAULT 'unknown',
  compounding_notes TEXT,
  builds_on_id UUID REFERENCES investments(id) ON DELETE SET NULL,  -- what it built on
  led_to_id UUID REFERENCES investments(id) ON DELETE SET NULL,     -- what it led to
  precedent_id UUID,       -- linked after precedent archive entry created
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
  stakeholder_name TEXT,   -- fallback
  decision_title TEXT NOT NULL,
  description TEXT,
  deliberation_start DATE,
  deliberation_end DATE,
  locks_date DATE,
  status decision_status NOT NULL DEFAULT 'upcoming',
  dependencies TEXT,       -- what this depends on
  intervention_needed TEXT,-- what we should do before this locks
  outcome TEXT,            -- what was decided (filled after)
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT, -- e.g. "annual, typically Q4"
  last_reviewed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- decision dependencies (many-to-many)
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
  involved TEXT,           -- who was involved
  description TEXT,        -- what it was
  what_produced TEXT,      -- tangible outcomes
  what_worked TEXT,
  what_didnt TEXT,
  connects_to TEXT,        -- what it built on / what built on it
  takeaway TEXT,           -- the 1-2 sentence summary
  investment_id UUID REFERENCES investments(id) ON DELETE SET NULL,
  last_reviewed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- back-reference from investments
ALTER TABLE investments ADD CONSTRAINT fk_precedent
  FOREIGN KEY (precedent_id) REFERENCES precedents(id) ON DELETE SET NULL;

-- ──────────────────────────────────────────
-- 5. OPPORTUNITY LAYER
-- ──────────────────────────────────────────

CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ecosystem_id UUID NOT NULL REFERENCES ecosystems(id) ON DELETE CASCADE,
  source_org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  source_name TEXT,        -- fallback
  title TEXT NOT NULL,
  opportunity_type opportunity_type NOT NULL,
  amount_min INTEGER,
  amount_max INTEGER,
  amount_description TEXT, -- for non-numeric (e.g. "Stipend + housing")
  deadline DATE,
  deadline_description TEXT, -- e.g. "Rolling"
  eligibility TEXT,
  description TEXT,
  application_url TEXT,
  contact_email TEXT,
  status opportunity_status NOT NULL DEFAULT 'open',
  awarded_to TEXT,         -- filled after close
  awarded_investment_id UUID REFERENCES investments(id) ON DELETE SET NULL,
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
  narrative_text TEXT NOT NULL,   -- what's being said
  reality_text TEXT,              -- what's actually happening
  gap gap_level DEFAULT 'medium',
  evidence_notes TEXT,            -- what data supports the reality assessment
  source_url TEXT,
  significance TEXT,              -- why this gap matters for upcoming decisions
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
  content TEXT,            -- the actual brief/framework/analysis
  summary TEXT,            -- short description
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  target_stakeholder_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  triggered_by_decision_id UUID REFERENCES decisions(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  delivery_status TEXT DEFAULT 'draft' CHECK (delivery_status IN ('draft', 'published', 'delivered', 'acknowledged')),
  delivered_at TIMESTAMPTZ,
  delivered_to_contact TEXT,
  delivery_notes TEXT,
  file_url TEXT,
  file_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- references cited in outputs
CREATE TABLE output_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  output_id UUID NOT NULL REFERENCES outputs(id) ON DELETE CASCADE,
  reference_type TEXT NOT NULL,  -- 'investment', 'decision', 'precedent', 'narrative', 'opportunity', 'organization'
  reference_id UUID NOT NULL,
  context_note TEXT              -- why this reference matters
);

-- ──────────────────────────────────────────
-- TAGS (shared across all tools)
-- ──────────────────────────────────────────

CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ecosystem_id UUID NOT NULL REFERENCES ecosystems(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,           -- 'sector', 'theme', 'geography', etc.
  UNIQUE(ecosystem_id, name)
);

-- junction tables for tagging
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
-- EXTERNAL SUBMISSIONS (review queue)
-- ──────────────────────────────────────────

CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ecosystem_id UUID NOT NULL REFERENCES ecosystems(id) ON DELETE CASCADE,
  submission_type TEXT NOT NULL,  -- 'opportunity', 'investment_verification', 'decision_flag'
  data JSONB NOT NULL,           -- flexible payload
  submitter_name TEXT,
  submitter_email TEXT,
  submitter_org TEXT,
  status submission_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_entity_id UUID,        -- ID of entity created from this submission
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────
-- ACTIVITY LOG
-- ──────────────────────────────────────────

CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ecosystem_id UUID NOT NULL REFERENCES ecosystems(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,          -- 'created', 'updated', 'reviewed', 'published'
  entity_type TEXT NOT NULL,     -- 'organization', 'investment', etc.
  entity_id UUID NOT NULL,
  changes JSONB,                 -- what changed
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────
-- PUBLIC PROFILES (practitioner-facing)
-- ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  primary_skill TEXT NOT NULL,
  location TEXT NOT NULL,
  bio TEXT,
  portfolio_url TEXT,
  additional_skills TEXT[],
  rate_range TEXT,
  availability TEXT DEFAULT 'available' CHECK (availability IN ('available', 'booked', 'selective')),
  looking_for TEXT[],
  business_entity_type TEXT,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  practitioner_id UUID REFERENCES practitioners(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────
-- OPPORTUNITY INTERESTS (interest signals from public surface)
-- ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS opportunity_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public_profiles(id) ON DELETE SET NULL,
  practitioner_name TEXT,
  practitioner_email TEXT,
  practitioner_discipline TEXT,
  notes TEXT,
  status TEXT DEFAULT 'expressed' CHECK (status IN ('expressed', 'applied', 'awarded', 'not_awarded', 'withdrew', 'did_not_apply')),
  followed_up_at TIMESTAMPTZ,
  followup_response JSONB,
  outcome_notes TEXT,
  practitioner_id UUID REFERENCES practitioners(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────
-- ENGAGEMENTS (practitioner ↔ funder workspace)
-- ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS engagements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
  profile_id UUID NOT NULL REFERENCES public_profiles(id) ON DELETE CASCADE,
  funder_org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  funder_contact_email TEXT,
  title TEXT NOT NULL,
  scope TEXT,
  total_amount NUMERIC,
  start_date DATE,
  end_date DATE,
  payment_terms JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'complete', 'cancelled')),
  practitioner_confirmed_complete BOOLEAN DEFAULT false,
  funder_confirmed_complete BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  payment_accelerated BOOLEAN DEFAULT false,
  accelerated_payment_date DATE,
  funder_payment_received_date DATE,
  investment_id UUID REFERENCES investments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS engagement_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id UUID NOT NULL REFERENCES engagements(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS engagement_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id UUID NOT NULL REFERENCES engagements(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_url TEXT,
  submitted_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS engagement_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id UUID NOT NULL REFERENCES engagements(id) ON DELETE CASCADE,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  detail TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────
-- INDEXES
-- ──────────────────────────────────────────

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

-- ──────────────────────────────────────────
-- VIEWS (useful aggregations)
-- ──────────────────────────────────────────

-- Stale entries that need review
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

-- Ecosystem summary stats
CREATE VIEW ecosystem_stats AS
  SELECT
    e.id AS ecosystem_id,
    e.name,
    (SELECT COUNT(*) FROM organizations WHERE ecosystem_id = e.id) AS org_count,
    (SELECT COUNT(*) FROM practitioners WHERE ecosystem_id = e.id) AS practitioner_count,
    (SELECT COALESCE(SUM(amount), 0) FROM investments WHERE ecosystem_id = e.id) AS total_investment,
    (SELECT COUNT(*) FROM investments WHERE ecosystem_id = e.id AND compounding = 'compounding') AS compounding_count,
    (SELECT COUNT(*) FROM investments WHERE ecosystem_id = e.id AND compounding = 'not_compounding') AS not_compounding_count,
    (SELECT COUNT(*) FROM opportunities WHERE ecosystem_id = e.id AND status = 'open') AS open_opportunities,
    (SELECT COUNT(*) FROM decisions WHERE ecosystem_id = e.id AND status IN ('upcoming', 'deliberating')) AS active_decisions,
    (SELECT COUNT(*) FROM narratives WHERE ecosystem_id = e.id AND gap = 'high') AS high_gap_narratives
  FROM ecosystems e;

-- Upcoming interventions (decisions that need action soon)
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

-- ──────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ──────────────────────────────────────────

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

-- Public read access for opportunities (the public surface)
CREATE POLICY "Opportunities are publicly readable"
  ON opportunities FOR SELECT
  USING (status IN ('open', 'closing_soon'));

-- Public read access for published outputs
CREATE POLICY "Published outputs are publicly readable"
  ON outputs FOR SELECT
  USING (is_published = true);

-- Authenticated users can read everything in their ecosystem
CREATE POLICY "Authenticated read all"
  ON organizations FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated read investments"
  ON investments FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated read decisions"
  ON decisions FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated read precedents"
  ON precedents FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated read all opportunities"
  ON opportunities FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated read narratives"
  ON narratives FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated read outputs"
  ON outputs FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated read contacts"
  ON contacts FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated read relationships"
  ON org_relationships FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated read practitioners"
  ON practitioners FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated read ecosystems"
  ON ecosystems FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated read profiles"
  ON profiles FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated read tags"
  ON tags FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated read submissions"
  ON submissions FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated read activity"
  ON activity_log FOR SELECT TO authenticated
  USING (true);

-- Partners and project leads can write
CREATE POLICY "Team can insert orgs"
  ON organizations FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Team can update orgs"
  ON organizations FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Team can insert investments"
  ON investments FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Team can update investments"
  ON investments FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Team can insert decisions"
  ON decisions FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Team can update decisions"
  ON decisions FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Team can insert precedents"
  ON precedents FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Team can update precedents"
  ON precedents FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Team can insert opportunities"
  ON opportunities FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Team can update opportunities"
  ON opportunities FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Team can insert narratives"
  ON narratives FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Team can update narratives"
  ON narratives FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Team can insert outputs"
  ON outputs FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Team can update outputs"
  ON outputs FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Team can manage contacts"
  ON contacts FOR ALL TO authenticated
  USING (true);

CREATE POLICY "Team can manage relationships"
  ON org_relationships FOR ALL TO authenticated
  USING (true);

CREATE POLICY "Team can manage practitioners"
  ON practitioners FOR ALL TO authenticated
  USING (true);

CREATE POLICY "Team can manage tags"
  ON tags FOR ALL TO authenticated
  USING (true);

CREATE POLICY "Team can manage submissions"
  ON submissions FOR ALL TO authenticated
  USING (true);

CREATE POLICY "Team can insert activity"
  ON activity_log FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Team can manage ecosystems"
  ON ecosystems FOR ALL TO authenticated
  USING (true);

CREATE POLICY "Profiles self-manage"
  ON profiles FOR ALL TO authenticated
  USING (auth.uid() = id);

-- Anyone can submit (anon)
CREATE POLICY "Anyone can submit"
  ON submissions FOR INSERT TO anon
  WITH CHECK (true);

-- ──────────────────────────────────────────
-- FUNCTIONS
-- ──────────────────────────────────────────

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
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

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ============================================================
-- SEED DATA: NWA PROTOTYPE
-- ============================================================

-- Ecosystem
INSERT INTO ecosystems (id, name, slug, description, region) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Northwest Arkansas', 'nwa', 'Cultural ecosystem spanning Bentonville, Fayetteville, Rogers, and Springdale.', 'Northwest Arkansas, USA');

-- Organizations
INSERT INTO organizations (id, ecosystem_id, name, org_type, mandate, controls, constraints, decision_cycle) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'CACHE', 'intermediary', 'Advance NWA creative economy through grants, programs, and advocacy', 'Annual grant allocation (~$2M), creative economy programming, advocacy agenda', 'Dependent on foundation funding, limited staff capacity', 'Annual grant cycle (applications Q1, awards Q2)'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Walton Family Foundation', 'foundation', 'Community development, education, and environmental stewardship in NWA', 'Significant capital for arts, culture, and placemaking (~$10M+ annually in cultural adjacencies)', 'Board-driven, long planning cycles', 'Rolling proposals, annual strategic review in Q4'),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Crystal Bridges Museum', 'cultural_institution', 'Welcome all to celebrate the power of art, nature, and architecture', 'Exhibition programming, residencies, community programs, significant earned + endowed revenue', 'Institutional scale and pace, curatorial independence', 'Exhibition calendar planned 18-24 months out, programming quarterly'),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'City of Bentonville', 'government', 'Economic development, quality of life, infrastructure for residents', 'Zoning, permits, public space, cultural district designation, municipal budget allocation', 'Political cycles, competing priorities, limited cultural affairs staff', 'Annual budget cycle (deliberation Aug-Oct, finalized Nov)'),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'TheatreSquared', 'cultural_institution', 'Professional theatre serving NWA and broader region', 'Season programming, education programs, community partnerships', 'Earned revenue dependency, facility capacity', 'Season planning 12-18 months ahead, education programming annually'),
  ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Walmart Corporate / Foundation', 'corporate', 'Community investment, associate engagement, brand positioning in home market', 'Corporate sponsorships, foundation grants, in-kind support, significant convening power', 'Corporate governance, PR sensitivity, associate-focus mandate', 'Foundation grants quarterly, corporate sponsorships rolling');

-- Contacts
INSERT INTO contacts (organization_id, name, title, is_decision_maker) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Sample: Executive Director', 'Executive Director', true),
  ('b0000000-0000-0000-0000-000000000001', 'Sample: Program Manager', 'Program Manager', false),
  ('b0000000-0000-0000-0000-000000000002', 'Sample: Program Officer', 'Program Officer, Arts & Culture', true),
  ('b0000000-0000-0000-0000-000000000003', 'Sample: Director of Community Programs', 'Director of Community Programs', true),
  ('b0000000-0000-0000-0000-000000000004', 'Sample: Cultural Affairs Liaison', 'Cultural Affairs Liaison', false),
  ('b0000000-0000-0000-0000-000000000004', 'Sample: Mayor', 'Mayor', true);

-- Org Relationships
INSERT INTO org_relationships (org_a_id, org_b_id, relationship_type, strength) VALUES
  ('b0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'funds', 'strong'),
  ('b0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003', 'funds', 'strong'),
  ('b0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004', 'partners_with', 'moderate'),
  ('b0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005', 'partners_with', 'moderate'),
  ('b0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000003', 'funds', 'strong');

-- Practitioners
INSERT INTO practitioners (ecosystem_id, name, discipline, tenure, income_sources, retention_factors, risk_factors) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Sample: Visual Artist A', 'Painting / Installation', '6 years in NWA', 'Gallery sales, CACHE grants, teaching at UA', 'Affordable studio space, Crystal Bridges community, partner employment', 'Studio lease increasing, limited commercial gallery infrastructure'),
  ('a0000000-0000-0000-0000-000000000001', 'Sample: Musician B', 'Production / Performance', '3 years in NWA', 'Live performance, session work, teaching', 'Cost of living, emerging music scene', 'Limited venue infrastructure, no recording studio ecosystem'),
  ('a0000000-0000-0000-0000-000000000001', 'Sample: Designer C', 'Graphic / Brand Design', '8 years in NWA', 'Freelance for regional clients, Walmart vendor work', 'Family ties, homeownership, client base', 'Corporate client concentration, limited creative peer community'),
  ('a0000000-0000-0000-0000-000000000001', 'Sample: Filmmaker D', 'Documentary / Commercial', '2 years in NWA', 'BFF adjacent work, freelance commercial', 'BFF network, lower cost than LA/NYC', 'Insufficient year-round production work');

-- Investments
INSERT INTO investments (ecosystem_id, source_org_id, initiative_name, amount, period, category, status, outcome, compounding) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Creative Economy Grants - Cycle 1', 450000, 'Q1-Q2 2025', 'direct_artist_support', 'completed', '32 grants awarded across 5 disciplines', 'compounding'),
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'Downtown Cultural District Planning', 750000, '2024-2025', 'strategic_planning', 'active', 'Consultant engaged, community input phase', 'too_early'),
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004', 'Public Art Installations - Phase 2', 200000, 'Q3 2024', 'public_art', 'completed', '4 installations completed, 2 by non-local artists', 'not_compounding'),
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'Artist Residency Expansion', 350000, '2025', 'artist_development', 'active', '8 residency slots (up from 5), housing included', 'compounding'),
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000006', 'Creative Workforce Development', 500000, '2024-2025', 'education_training', 'completed', 'Training program graduated 45 participants, 60% employed in creative sector', 'compounding'),
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'NWA Music Initiative', 175000, 'Q2-Q4 2025', 'sector_development', 'active', 'Venue partnerships established, 3 showcase events', 'too_early'),
  ('a0000000-0000-0000-0000-000000000001', NULL, 'TheatreSquared Capital Campaign', 1200000, '2023-2025', 'institutional_capacity', 'active', 'New facility 70% funded', 'compounding');

-- Decisions
INSERT INTO decisions (ecosystem_id, stakeholder_org_id, decision_title, deliberation_start, deliberation_end, locks_date, status, dependencies, intervention_needed) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', '2026 Grant Cycle Priorities', '2026-01-15', '2026-02-28', '2026-03-15', 'deliberating', 'Should reference Walton cultural district plan findings', 'Directional brief needed before Feb board meeting'),
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004', 'FY2027 Cultural Budget Allocation', '2026-08-01', '2026-10-31', '2026-11-15', 'upcoming', 'Influenced by cultural district designation timeline', 'Present ecosystem investment view before deliberation begins'),
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'Q4 Strategic Review - Cultural Investment', '2026-10-01', '2026-11-30', '2026-12-15', 'upcoming', 'Downtown cultural district plan should be complete', 'Ensure district plan findings reach WFF program officers'),
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', '2027 Community Programming', '2026-03-01', '2026-05-31', '2026-06-15', 'deliberating', 'Should align with CACHE grant cycle to avoid duplication', 'Share ecosystem map showing current programming gaps'),
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000006', 'Creative Workforce Phase 2 Funding', '2026-04-01', '2026-06-30', '2026-09-01', 'upcoming', 'Phase 1 outcomes should inform design', 'Precedent archive entry on Phase 1 needs to reach decision-makers');

-- Precedents
INSERT INTO precedents (ecosystem_id, name, period, involved, what_produced, what_worked, what_didnt, connects_to, takeaway) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'NWA Creative Economy Strategic Plan (2019)', '2018-2019', 'CACHE (commissioned), External consultants, Regional stakeholders', '50-page strategic plan with 12 recommendations across 4 pillars', 'Strong community engagement process, good baseline data collection', 'Recommendations too broad to sequence. No implementation tracking mechanism. Plan was referenced briefly then shelved. No follow-up assessment.', 'Walton downtown cultural district plan (2024) commissioned without documented reference to this plan. Several recommendations overlap.', 'Comprehensive plans without implementation tracking and sequencing logic get shelved. Next plan needs built-in accountability and fewer, more actionable commitments.'),
  ('a0000000-0000-0000-0000-000000000001', 'Bentonville Film Festival - Institutional Partnership Model', '2015-present', 'BFF, Crystal Bridges, Walmart, City of Bentonville, local businesses', 'Annual festival with national visibility, tourism impact, filmmaker residency pipeline', 'Strong brand identity, clear programming mandate, corporate sponsorship model that doesn''t compromise creative direction', 'Year-round economic impact for local film practitioners remains limited. Festival energy doesn''t translate to sustained production ecosystem. Most economic benefit concentrated in festival week.', 'NWA Music Initiative (2025) attempting similar model for music. Should learn from BFF''s year-round sustainability challenge.', 'Tentpole events create visibility but don''t automatically build year-round creative infrastructure. Gap between event energy and ecosystem sustainability needs explicit programming.'),
  ('a0000000-0000-0000-0000-000000000001', 'Public Art Installations - Phase 1 (2022)', '2021-2022', 'City of Bentonville, External curator, 6 artists (4 non-local)', '6 permanent public art installations across downtown corridor', 'High production quality, positive media coverage, strong placemaking impact', 'Majority of artists non-local, limiting economic impact for NWA practitioners. Selection process opaque. No community input on locations or themes. Local artists felt excluded.', 'Phase 2 (2024) repeated same pattern — 2 of 4 artists non-local. No documented learning transfer between phases.', 'Public art programs that don''t prioritize local practitioners undermine the creative ecosystem they''re meant to support. Phase 3 needs explicit local artist requirements and transparent selection.');

-- Opportunities
INSERT INTO opportunities (ecosystem_id, source_org_id, title, opportunity_type, amount_min, amount_max, deadline, eligibility, status) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Creative Economy Micro-Grants', 'grant', 2500, 10000, '2026-03-15', 'NWA-based creative practitioners and organizations', 'open'),
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'Community Art Commission - Trail System', 'commission', 15000, 25000, '2026-04-01', 'Artists working in outdoor/site-specific installation', 'open'),
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004', 'Cultural District Branding RFP', 'rfp', 45000, 45000, '2026-02-28', 'Design studios with cultural/civic experience', 'closing_soon'),
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005', 'Playwright Development Program', 'program', NULL, NULL, NULL, 'Emerging playwrights, national', 'open'),
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000006', 'Creative Workforce Training Partners', 'rfp', 50000, 100000, '2026-03-30', 'Education/training organizations in NWA', 'open'),
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'Performing Arts Residency', 'residency', NULL, NULL, '2026-05-01', 'Performance artists, interdisciplinary', 'open');

-- Narratives
INSERT INTO narratives (ecosystem_id, source_org_id, source_name, source_type, date, narrative_text, reality_text, gap) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004', 'City of Bentonville - Economic Development', 'regional_positioning', '2026-01-15', 'Marketing campaign positions Bentonville as "The Creative Capital of the South" with emphasis on Crystal Bridges, trail system, and tech startup scene.', 'Investment ledger shows cultural funding flat year-over-year. Practitioner layer shows net outflow of musicians and filmmakers. Creative Capital narrative not yet supported by ecosystem investment trends.', 'high'),
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'CACHE - Annual Report', 'institutional', '2025-12-01', 'Reports "record investment in NWA creative economy" and highlights grant program reach across disciplines.', 'Grant amounts have increased but number of unique recipients has decreased. Larger grants going to established organizations, fewer to individual practitioners. Concentration increasing.', 'medium'),
  ('a0000000-0000-0000-0000-000000000001', NULL, 'Northwest Arkansas Democrat-Gazette', 'media_coverage', '2026-02-01', 'Feature series on NWA arts scene emphasizes Crystal Bridges expansion and new restaurant/gallery openings. Frames NWA as "arriving" culturally.', 'Coverage focused on institutional and commercial activity. No mention of practitioner retention challenges, studio space costs, or gaps in year-round creative employment.', 'medium'),
  ('a0000000-0000-0000-0000-000000000001', NULL, 'Practitioner Interviews (Aggregated)', 'practitioner', '2026-02-01', 'Consistent theme: NWA is exciting and affordable but "hard to make a living as an artist." Appreciation for institutional presence but sense that opportunities flow to established players and outsiders.', 'Aligns with investment ledger data showing concentration of funding in institutions vs. direct practitioner support. Opportunity layer shows most high-value opportunities requiring institutional affiliation.', 'aligned');


-- ============================================================
-- DONE
-- ============================================================
