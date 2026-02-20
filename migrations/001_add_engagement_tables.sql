-- ============================================================
-- MIGRATION 001: Add engagement workspace tables
-- ============================================================
-- Run this in Supabase SQL Editor if you already have the core
-- schema and just need to add the engagement-related tables.
-- Safe to re-run — uses IF NOT EXISTS.
-- ============================================================

-- Add file_url and file_type to outputs (if not already present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'outputs' AND column_name = 'file_url'
  ) THEN
    ALTER TABLE outputs ADD COLUMN file_url TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'outputs' AND column_name = 'file_type'
  ) THEN
    ALTER TABLE outputs ADD COLUMN file_type TEXT;
  END IF;
END $$;

-- Public profiles (practitioner-facing)
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

-- Opportunity interests
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

-- Engagements
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

-- Engagement milestones
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

-- Engagement deliverables
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

-- Engagement activity
CREATE TABLE IF NOT EXISTS engagement_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id UUID NOT NULL REFERENCES engagements(id) ON DELETE CASCADE,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  detail TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS policies for new tables
ALTER TABLE public_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_activity ENABLE ROW LEVEL SECURITY;

-- Read policies (authenticated users can read)
DO $$ BEGIN
  CREATE POLICY "Authenticated read public_profiles"
    ON public_profiles FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated read opportunity_interests"
    ON opportunity_interests FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated read engagements"
    ON engagements FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated read engagement_milestones"
    ON engagement_milestones FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated read engagement_deliverables"
    ON engagement_deliverables FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated read engagement_activity"
    ON engagement_activity FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Write policies (authenticated users can write)
DO $$ BEGIN
  CREATE POLICY "Team can manage public_profiles"
    ON public_profiles FOR ALL TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Team can manage opportunity_interests"
    ON opportunity_interests FOR ALL TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Team can manage engagements"
    ON engagements FOR ALL TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Team can manage engagement_milestones"
    ON engagement_milestones FOR ALL TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Team can manage engagement_deliverables"
    ON engagement_deliverables FOR ALL TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Team can manage engagement_activity"
    ON engagement_activity FOR ALL TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- DONE — tables created (or already existed)
-- ============================================================
