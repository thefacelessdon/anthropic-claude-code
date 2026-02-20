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

-- Drop trigger on auth.users (the only table we don't drop ourselves)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop functions (CASCADE removes all dependent triggers automatically)
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Drop views
DROP VIEW IF EXISTS upcoming_interventions CASCADE;
DROP VIEW IF EXISTS ecosystem_stats CASCADE;
DROP VIEW IF EXISTS stale_entries CASCADE;

-- Drop tables (order matters for foreign keys)
-- Migration tables (from migration-public-surface.sql)
DROP TABLE IF EXISTS float_fund_transactions CASCADE;
DROP TABLE IF EXISTS engagement_activity CASCADE;
DROP TABLE IF EXISTS engagement_deliverables CASCADE;
DROP TABLE IF EXISTS engagement_milestones CASCADE;
DROP TABLE IF EXISTS engagements CASCADE;
DROP TABLE IF EXISTS opportunity_interests CASCADE;
DROP TABLE IF EXISTS public_profiles CASCADE;
-- Core tables (from schema.sql)
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
