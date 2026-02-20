-- ============================================================
-- MIGRATION 002: Seed engagement workspace data
-- ============================================================
-- Run this AFTER 001_add_engagement_tables.sql
-- Uses ON CONFLICT DO NOTHING so it's safe to re-run.
-- ============================================================

-- Public profiles
INSERT INTO public_profiles (id, name, email, primary_skill, location, bio, portfolio_url, additional_skills, rate_range, availability, looking_for, is_verified) VALUES
('11000000-0000-0000-0000-000000000001', 'Elena Vasquez', 'elena.v@example.com', 'Visual Art / Murals', 'Bentonville, AR', 'Muralist and visual artist exploring cultural memory through large-scale public works. 8 years in NWA, deeply connected to the Latinx creative community.', 'https://elenavasquez.art', ARRAY['Community Engagement', 'Teaching', 'Installation'], '$2,000–$15,000/project', 'available', ARRAY['commissions', 'grants', 'residencies'], true),
('11000000-0000-0000-0000-000000000002', 'Marcus Thompson', 'marcus.t@example.com', 'Music Production', 'Fayetteville, AR', 'Producer and audio engineer building NWA''s independent music infrastructure. Runs a home studio serving 20+ local artists per year.', NULL, ARRAY['Sound Design', 'Live Sound', 'Workshop Facilitation'], '$500–$3,000/project', 'selective', ARRAY['grants', 'project'], false),
('11000000-0000-0000-0000-000000000003', 'Sarah Chen', 'sarah.c@example.com', 'Documentary Film', 'Rogers, AR', 'Documentary filmmaker focused on rural creative economies and cultural preservation. Recent work follows NWA''s transformation through the lens of long-term residents.', 'https://sarahchenfilms.com', ARRAY['Video Production', 'Photography', 'Storytelling'], '$5,000–$25,000/project', 'available', ARRAY['commissions', 'fellowships', 'grants'], true)
ON CONFLICT (id) DO NOTHING;

-- Engagements
INSERT INTO engagements (id, opportunity_id, profile_id, funder_org_id, title, scope, total_amount, start_date, end_date, payment_terms, status, practitioner_confirmed_complete, funder_confirmed_complete) VALUES
('22000000-0000-0000-0000-000000000001', NULL, '11000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004', 'Downtown Bentonville Mural — Cultural Roots Series', 'Design and paint a 40x20ft exterior mural on the downtown square celebrating NWA''s multicultural heritage. Includes community input sessions, design development, and 3-week installation.', 12000, '2026-01-15', '2026-04-15', '[{"label": "Design approval", "amount": 3000, "status": "paid"}, {"label": "Installation start", "amount": 5000, "status": "paid"}, {"label": "Completion", "amount": 4000, "status": "pending"}]', 'active', false, false),
('22000000-0000-0000-0000-000000000002', NULL, '11000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'NWA Creative Economy Documentary — Short Film', 'Produce a 15-minute documentary exploring the state of the creative economy in Northwest Arkansas. Interviews with practitioners, funders, and policymakers.', 8000, '2025-11-01', '2026-02-28', '[{"label": "Pre-production", "amount": 2000, "status": "paid"}, {"label": "Production", "amount": 3000, "status": "paid"}, {"label": "Post-production", "amount": 3000, "status": "paid"}]', 'complete', true, true)
ON CONFLICT (id) DO NOTHING;

-- Engagement milestones
INSERT INTO engagement_milestones (id, engagement_id, title, due_date, completed_at, sort_order) VALUES
('33000000-0000-0000-0000-000000000001', '22000000-0000-0000-0000-000000000001', 'Community input sessions (2 sessions)', '2026-01-31', '2026-01-28 00:00:00+00', 1),
('33000000-0000-0000-0000-000000000002', '22000000-0000-0000-0000-000000000001', 'Design concept presentation', '2026-02-15', '2026-02-12 00:00:00+00', 2),
('33000000-0000-0000-0000-000000000003', '22000000-0000-0000-0000-000000000001', 'Final design approval', '2026-02-28', NULL, 3),
('33000000-0000-0000-0000-000000000004', '22000000-0000-0000-0000-000000000001', 'Wall preparation + installation', '2026-03-31', NULL, 4),
('33000000-0000-0000-0000-000000000005', '22000000-0000-0000-0000-000000000001', 'Completion + unveiling event', '2026-04-15', NULL, 5),
('33000000-0000-0000-0000-000000000006', '22000000-0000-0000-0000-000000000002', 'Interview schedule finalized', '2025-11-15', '2025-11-14 00:00:00+00', 1),
('33000000-0000-0000-0000-000000000007', '22000000-0000-0000-0000-000000000002', 'Principal photography complete', '2025-12-15', '2025-12-18 00:00:00+00', 2),
('33000000-0000-0000-0000-000000000008', '22000000-0000-0000-0000-000000000002', 'Rough cut review', '2026-01-15', '2026-01-12 00:00:00+00', 3),
('33000000-0000-0000-0000-000000000009', '22000000-0000-0000-0000-000000000002', 'Final delivery', '2026-02-28', '2026-02-25 00:00:00+00', 4)
ON CONFLICT (id) DO NOTHING;

-- Engagement deliverables
INSERT INTO engagement_deliverables (id, engagement_id, title, file_url, submitted_at, accepted_at, sort_order) VALUES
('44000000-0000-0000-0000-000000000001', '22000000-0000-0000-0000-000000000001', 'Community input summary report', NULL, NULL, NULL, 1),
('44000000-0000-0000-0000-000000000002', '22000000-0000-0000-0000-000000000001', 'Design concept (3 options)', NULL, NULL, NULL, 2),
('44000000-0000-0000-0000-000000000003', '22000000-0000-0000-0000-000000000001', 'Final mural (photo documentation)', NULL, NULL, NULL, 3),
('44000000-0000-0000-0000-000000000004', '22000000-0000-0000-0000-000000000002', 'Interview footage (raw)', NULL, '2025-12-20 00:00:00+00', '2025-12-22 00:00:00+00', 1),
('44000000-0000-0000-0000-000000000005', '22000000-0000-0000-0000-000000000002', 'Rough cut (15 min)', NULL, '2026-01-12 00:00:00+00', '2026-01-18 00:00:00+00', 2),
('44000000-0000-0000-0000-000000000006', '22000000-0000-0000-0000-000000000002', 'Final film + promotional stills', NULL, '2026-02-25 00:00:00+00', '2026-02-27 00:00:00+00', 3)
ON CONFLICT (id) DO NOTHING;

-- Engagement activity
INSERT INTO engagement_activity (engagement_id, actor, action, detail, created_at) VALUES
('22000000-0000-0000-0000-000000000001', 'Elena Vasquez', 'milestone_completed', 'Completed community input sessions — 45 attendees across 2 sessions', '2026-01-28 17:00:00+00'),
('22000000-0000-0000-0000-000000000001', 'Elena Vasquez', 'milestone_completed', 'Design concept presented to City of Bentonville Arts Commission', '2026-02-12 15:00:00+00'),
('22000000-0000-0000-0000-000000000001', 'City of Bentonville', 'payment', 'Design approval payment ($3,000) processed', '2026-02-14 10:00:00+00'),
('22000000-0000-0000-0000-000000000001', 'City of Bentonville', 'payment', 'Installation start payment ($5,000) processed', '2026-02-20 10:00:00+00'),
('22000000-0000-0000-0000-000000000002', 'Sarah Chen', 'started', 'Engagement kicked off — pre-production begins', '2025-11-01 09:00:00+00'),
('22000000-0000-0000-0000-000000000002', 'Sarah Chen', 'deliverable_submitted', 'Submitted interview footage (12 interviews, 8 hours)', '2025-12-20 14:00:00+00'),
('22000000-0000-0000-0000-000000000002', 'CACHE', 'deliverable_accepted', 'Interview footage reviewed and accepted', '2025-12-22 10:00:00+00'),
('22000000-0000-0000-0000-000000000002', 'Sarah Chen', 'deliverable_submitted', 'Rough cut submitted for review', '2026-01-12 16:00:00+00'),
('22000000-0000-0000-0000-000000000002', 'Sarah Chen', 'completed', 'Final film delivered — both parties confirmed completion', '2026-02-25 11:00:00+00');

-- ============================================================
-- DONE — engagement seed data inserted
-- ============================================================
