-- ============================================================
-- MIGRATION: Intent Layer — Expanded opportunity_interests
-- ============================================================
-- Run AFTER migration-public-surface.sql.
-- Adds standalone practitioner fields to opportunity_interests
-- so the intent form works without requiring authentication.
-- Also adds status tracking for the interest lifecycle.
-- ============================================================

-- Add standalone practitioner fields (form data, no auth required)
ALTER TABLE opportunity_interests ADD COLUMN IF NOT EXISTS practitioner_name TEXT;
ALTER TABLE opportunity_interests ADD COLUMN IF NOT EXISTS practitioner_email TEXT;
ALTER TABLE opportunity_interests ADD COLUMN IF NOT EXISTS practitioner_discipline TEXT;

-- Add lifecycle tracking
ALTER TABLE opportunity_interests ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'expressed'
  CHECK (status IN ('expressed', 'applied', 'awarded', 'not_awarded', 'withdrew', 'did_not_apply'));

-- Add follow-up tracking
ALTER TABLE opportunity_interests ADD COLUMN IF NOT EXISTS followed_up_at TIMESTAMPTZ;
ALTER TABLE opportunity_interests ADD COLUMN IF NOT EXISTS followup_response JSONB;
ALTER TABLE opportunity_interests ADD COLUMN IF NOT EXISTS outcome_notes TEXT;

-- Add practitioner linking (optional match to practitioners table)
ALTER TABLE opportunity_interests ADD COLUMN IF NOT EXISTS practitioner_id UUID;

ALTER TABLE opportunity_interests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Make profile_id nullable (interests can now come from non-authenticated users)
ALTER TABLE opportunity_interests ALTER COLUMN profile_id DROP NOT NULL;

-- Index for querying interests by email (practitioner history)
CREATE INDEX IF NOT EXISTS idx_interests_email ON opportunity_interests(practitioner_email);

-- Allow anonymous inserts for the intent form (public, no auth)
DROP POLICY IF EXISTS "Users can insert own interests" ON opportunity_interests;
CREATE POLICY "Anyone can insert interests" ON opportunity_interests
  FOR INSERT WITH CHECK (true);

-- Backfill existing interests with profile names/emails
UPDATE opportunity_interests oi
SET
  practitioner_name = pp.name,
  practitioner_email = pp.email,
  practitioner_discipline = pp.primary_skill
FROM public_profiles pp
WHERE oi.profile_id = pp.id
  AND oi.practitioner_name IS NULL;

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
