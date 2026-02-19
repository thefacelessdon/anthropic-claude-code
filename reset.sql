-- ============================================================
-- FULL DATABASE RESET
-- ============================================================
-- Run this FIRST in the Supabase SQL Editor.
-- It drops ALL existing objects, then runs the full schema
-- and seed data. This is a clean reset — everything goes.
-- ============================================================

-- ──────────────────────────────────────────
-- STEP 0: NUKE EVERYTHING
-- ──────────────────────────────────────────

-- Drop triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS set_updated_at ON profiles;
DROP TRIGGER IF EXISTS set_updated_at ON ecosystems;
DROP TRIGGER IF EXISTS set_updated_at ON organizations;
DROP TRIGGER IF EXISTS set_updated_at ON contacts;
DROP TRIGGER IF EXISTS set_updated_at ON practitioners;
DROP TRIGGER IF EXISTS set_updated_at ON investments;
DROP TRIGGER IF EXISTS set_updated_at ON decisions;
DROP TRIGGER IF EXISTS set_updated_at ON precedents;
DROP TRIGGER IF EXISTS set_updated_at ON opportunities;
DROP TRIGGER IF EXISTS set_updated_at ON narratives;
DROP TRIGGER IF EXISTS set_updated_at ON outputs;

-- Drop views
DROP VIEW IF EXISTS upcoming_interventions CASCADE;
DROP VIEW IF EXISTS ecosystem_stats CASCADE;
DROP VIEW IF EXISTS stale_entries CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Drop tables (order matters for foreign keys)
DROP TABLE IF EXISTS activity_log CASCADE;
DROP TABLE IF EXISTS output_references CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS opportunity_tags CASCADE;
DROP TABLE IF EXISTS investment_tags CASCADE;
DROP TABLE IF EXISTS organization_tags CASCADE;
DROP TABLE IF EXISTS precedent_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS narratives CASCADE;
DROP TABLE IF EXISTS outputs CASCADE;
DROP TABLE IF EXISTS opportunities CASCADE;
DROP TABLE IF EXISTS precedents CASCADE;
DROP TABLE IF EXISTS decision_dependencies CASCADE;
DROP TABLE IF EXISTS decisions CASCADE;
DROP TABLE IF EXISTS investments CASCADE;
DROP TABLE IF EXISTS org_relationships CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS practitioners CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS ecosystems CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop enums
DROP TYPE IF EXISTS org_type CASCADE;
DROP TYPE IF EXISTS investment_status CASCADE;
DROP TYPE IF EXISTS investment_category CASCADE;
DROP TYPE IF EXISTS compounding_status CASCADE;
DROP TYPE IF EXISTS decision_status CASCADE;
DROP TYPE IF EXISTS opportunity_type CASCADE;
DROP TYPE IF EXISTS opportunity_status CASCADE;
DROP TYPE IF EXISTS narrative_source_type CASCADE;
DROP TYPE IF EXISTS gap_level CASCADE;
DROP TYPE IF EXISTS output_type CASCADE;
DROP TYPE IF EXISTS submission_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- ============================================================
-- DONE NUKING. Now run schema.sql, then seed.sql.
-- ============================================================
