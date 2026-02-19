-- ============================================================
-- MIGRATION: Public Surface Tables
-- ============================================================
-- Run AFTER schema.sql and seed.sql.
-- Adds: public_profiles, opportunity_interests, engagements,
-- engagement_milestones, engagement_deliverables, engagement_activity,
-- float_fund_transactions, and columns on opportunities.
-- ============================================================

-- ──────────────────────────────────────────
-- 1. PUBLIC PROFILES
-- ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  primary_skill TEXT NOT NULL,
  location TEXT NOT NULL,
  bio TEXT,
  portfolio_url TEXT,
  additional_skills TEXT[],
  rate_range TEXT,
  availability TEXT DEFAULT 'available'
    CHECK (availability IN ('available', 'booked', 'selective')),
  looking_for TEXT[],
  business_entity_type TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  practitioner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" ON public_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ──────────────────────────────────────────
-- 2. OPPORTUNITY INTERESTS
-- ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS opportunity_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES opportunities(id) NOT NULL,
  profile_id UUID REFERENCES public_profiles(id) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE opportunity_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Interests viewable by owner and team" ON opportunity_interests
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own interests" ON opportunity_interests
  FOR INSERT WITH CHECK (
    profile_id IN (SELECT id FROM public_profiles WHERE user_id = auth.uid())
  );

CREATE INDEX idx_interests_opportunity ON opportunity_interests(opportunity_id);
CREATE INDEX idx_interests_profile ON opportunity_interests(profile_id);

-- ──────────────────────────────────────────
-- 3. ENGAGEMENTS
-- ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS engagements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES opportunities(id),
  profile_id UUID REFERENCES public_profiles(id) NOT NULL,
  funder_org_id UUID REFERENCES organizations(id),
  funder_contact_email TEXT,
  title TEXT NOT NULL,
  scope TEXT,
  total_amount NUMERIC,
  start_date DATE,
  end_date DATE,
  payment_terms JSONB DEFAULT '[]',
  status TEXT DEFAULT 'active'
    CHECK (status IN ('pending', 'active', 'complete', 'cancelled')),
  practitioner_confirmed_complete BOOLEAN DEFAULT FALSE,
  funder_confirmed_complete BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  payment_accelerated BOOLEAN DEFAULT FALSE,
  accelerated_payment_date TIMESTAMPTZ,
  funder_payment_received_date TIMESTAMPTZ,
  investment_id UUID REFERENCES investments(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engagement_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id UUID REFERENCES engagements(id) NOT NULL,
  title TEXT NOT NULL,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engagement_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id UUID REFERENCES engagements(id) NOT NULL,
  title TEXT NOT NULL,
  file_url TEXT,
  submitted_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engagement_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id UUID REFERENCES engagements(id) NOT NULL,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  detail TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for engagements
ALTER TABLE engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Engagements viewable by all" ON engagements
  FOR SELECT USING (true);
CREATE POLICY "Engagements insertable by auth" ON engagements
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Engagements updatable by auth" ON engagements
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Milestones viewable by all" ON engagement_milestones
  FOR SELECT USING (true);
CREATE POLICY "Milestones manageable by auth" ON engagement_milestones
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Deliverables viewable by all" ON engagement_deliverables
  FOR SELECT USING (true);
CREATE POLICY "Deliverables manageable by auth" ON engagement_deliverables
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Activity viewable by all" ON engagement_activity
  FOR SELECT USING (true);
CREATE POLICY "Activity insertable by auth" ON engagement_activity
  FOR INSERT TO authenticated WITH CHECK (true);

-- ──────────────────────────────────────────
-- 4. ADD COLUMNS TO OPPORTUNITIES
-- ──────────────────────────────────────────

ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS preparation_context TEXT;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS target_disciplines TEXT[];

-- ──────────────────────────────────────────
-- 5. FLOAT FUND TRACKING
-- ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS float_fund_transactions (
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

-- ──────────────────────────────────────────
-- 6. DEMO PROFILES
-- ──────────────────────────────────────────

INSERT INTO public_profiles (id, name, email, primary_skill, location, bio, portfolio_url, availability, looking_for, is_verified, business_entity_type) VALUES
(
  'a1111111-1111-1111-1111-111111111111',
  'Maya Chen',
  'maya@example.com',
  'Brand + Visual Design',
  'Bentonville',
  'Independent designer specializing in cultural and civic identity systems. 3 years in NWA. Previously at a Kansas City design studio focused on public sector clients.',
  'https://mayachen.design',
  'available',
  ARRAY['commissions', 'contracts'],
  true,
  'llc'
),
(
  'a2222222-2222-2222-2222-222222222222',
  'James Torres',
  'james@example.com',
  'Public Art + Fabrication',
  'Fayetteville',
  'Sculptor and fabricator working in steel and mixed media. Completed public installations for municipalities in Arkansas and Oklahoma.',
  'https://jamestorres.art',
  'selective',
  ARRAY['commissions', 'grants'],
  true,
  'sole_proprietor'
),
(
  'a3333333-3333-3333-3333-333333333333',
  'Sarah Okafor',
  'sarah@example.com',
  'Documentary Film',
  'Rogers',
  'Documentary filmmaker focused on community stories and cultural preservation. MFA from UA. Teaching artist at community centers across NWA.',
  'https://sarahokafor.com',
  'available',
  ARRAY['grants', 'commissions', 'teaching'],
  false,
  null
);

-- ──────────────────────────────────────────
-- 7. UPDATE OPPORTUNITIES WITH PREPARATION CONTEXT
-- ──────────────────────────────────────────

UPDATE opportunities SET preparation_context =
'This RFP emerged from a 2-year cultural district planning process funded by the Walton Family Foundation. The planning phase found that the district''s identity should emphasize living artists and working studios, not just institutional anchors. The 2019 NWA Creative Economy Strategic Plan recommended explicit place-based branding but was shelved before implementation. Proposals that demonstrate understanding of the district as a creative production corridor — not just a cultural tourism destination — will likely resonate with the selection committee.'
WHERE title ILIKE '%cultural district branding%';

UPDATE opportunities SET preparation_context =
'CACHE has invested over $830K across 4 initiatives in the NWA creative economy. Their most recent grant cycle concentrated larger awards in established organizations — the average individual practitioner grant was smaller than Cycle 1. Successful applicants in previous cycles emphasized community engagement outcomes and cross-disciplinary collaboration. If you''re applying as an individual practitioner, demonstrate how your work creates conditions beyond your own practice.'
WHERE title ILIKE '%micro-grant%';

UPDATE opportunities SET preparation_context =
'The School of Art residency has historically brought non-local artists with the expectation that they''ll engage the NWA community. Previous residents have had mixed integration with the local creative ecosystem — some built lasting connections, others completed their term with minimal community impact. Applicants who demonstrate genuine interest in NWA''s creative community (not just the university context) have an advantage.'
WHERE title ILIKE '%artist-in-residence%';

-- ──────────────────────────────────────────
-- 8. DEMO ENGAGEMENTS
-- ──────────────────────────────────────────

-- Completed engagement: James Torres - Community Wayfinding Signage
INSERT INTO engagements (
  id, profile_id, funder_org_id, title, scope, total_amount,
  start_date, end_date, status, practitioner_confirmed_complete,
  funder_confirmed_complete, completed_at, payment_terms
) VALUES (
  'e1111111-1111-1111-1111-111111111111',
  'a2222222-2222-2222-2222-222222222222',
  (SELECT id FROM organizations WHERE name ILIKE '%crystal bridges%' LIMIT 1),
  'Community Wayfinding Signage',
  'Design and fabrication of wayfinding signage for the North Forest Trail connecting Crystal Bridges to the Momentary. 6 steel and wood signs with integrated art elements reflecting the regional landscape.',
  12000,
  '2025-10-01',
  '2026-01-15',
  'complete',
  true,
  true,
  '2026-01-15',
  '[{"amount": 6000, "trigger": "midpoint", "status": "paid", "paid_date": "2025-11-20"}, {"amount": 6000, "trigger": "completion", "status": "paid", "paid_date": "2026-02-10"}]'
);

-- Active engagement: Maya Chen - Cultural District Branding
INSERT INTO engagements (
  id, profile_id, funder_org_id, title, scope, total_amount,
  start_date, end_date, status, payment_terms
) VALUES (
  'e2222222-2222-2222-2222-222222222222',
  'a1111111-1111-1111-1111-111111111111',
  (SELECT id FROM organizations WHERE name ILIKE '%city of bentonville%' LIMIT 1),
  'Cultural District Branding',
  'Brand identity for Bentonville Cultural District. Includes visual identity, signage system, marketing collateral templates, and brand guidelines document.',
  45000,
  '2026-03-01',
  '2026-06-15',
  'active',
  '[{"amount": 22500, "trigger": "midpoint", "status": "pending"}, {"amount": 22500, "trigger": "completion", "status": "pending"}]'
);

-- Milestones for active engagement
INSERT INTO engagement_milestones (engagement_id, title, due_date, sort_order, completed_at) VALUES
('e2222222-2222-2222-2222-222222222222', 'Kickoff and research', '2026-03-15', 1, '2026-03-14'),
('e2222222-2222-2222-2222-222222222222', 'Concept directions (3)', '2026-03-31', 2, '2026-03-29'),
('e2222222-2222-2222-2222-222222222222', 'Stakeholder presentation', '2026-04-15', 3, NULL),
('e2222222-2222-2222-2222-222222222222', 'Refined direction', '2026-04-30', 4, NULL),
('e2222222-2222-2222-2222-222222222222', 'Final deliverables', '2026-05-31', 5, NULL),
('e2222222-2222-2222-2222-222222222222', 'Brand guidelines document', '2026-06-15', 6, NULL);

-- Deliverables for active engagement
INSERT INTO engagement_deliverables (engagement_id, title, sort_order) VALUES
('e2222222-2222-2222-2222-222222222222', 'Visual identity system (logo, color, typography)', 1),
('e2222222-2222-2222-2222-222222222222', 'Signage design specifications', 2),
('e2222222-2222-2222-2222-222222222222', 'Marketing collateral templates (4)', 3),
('e2222222-2222-2222-2222-222222222222', 'Brand guidelines PDF', 4);

-- Activity log for active engagement
INSERT INTO engagement_activity (engagement_id, actor, action, detail) VALUES
('e2222222-2222-2222-2222-222222222222', 'system', 'Engagement started', NULL),
('e2222222-2222-2222-2222-222222222222', 'practitioner', 'Completed milestone', 'Kickoff and research'),
('e2222222-2222-2222-2222-222222222222', 'practitioner', 'Completed milestone', 'Concept directions (3)'),
('e2222222-2222-2222-2222-222222222222', 'practitioner', 'Uploaded file', '3 concept directions presented to stakeholders');

-- Demo interests
INSERT INTO opportunity_interests (opportunity_id, profile_id, notes) VALUES
((SELECT id FROM opportunities WHERE title ILIKE '%cultural district branding%' LIMIT 1), 'a1111111-1111-1111-1111-111111111111', 'I''ve worked with City of Bentonville stakeholders before through Crystal Bridges events.'),
((SELECT id FROM opportunities WHERE title ILIKE '%cultural district branding%' LIMIT 1), 'a2222222-2222-2222-2222-222222222222', NULL),
((SELECT id FROM opportunities WHERE title ILIKE '%micro-grant%' LIMIT 1), 'a1111111-1111-1111-1111-111111111111', NULL),
((SELECT id FROM opportunities WHERE title ILIKE '%micro-grant%' LIMIT 1), 'a3333333-3333-3333-3333-333333333333', 'Planning a documentary about NWA creative workers — this could fund the initial research phase.'),
((SELECT id FROM opportunities WHERE title ILIKE '%micro-grant%' LIMIT 1), 'a2222222-2222-2222-2222-222222222222', NULL);

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
