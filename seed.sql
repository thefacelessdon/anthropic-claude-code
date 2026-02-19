-- ============================================================
-- SEED DATA: NWA CULTURAL ARCHITECTURE PLATFORM
-- ============================================================
-- Run AFTER schema.sql. Populates the full NWA prototype with
-- realistic data across both practice and public surfaces.
--
-- Uses deterministic UUIDs (format: X0000000-...) so foreign
-- keys resolve correctly. UUID prefix convention:
--   a = ecosystem
--   b = organization
--   c = investment
--   d = decision
--   e = precedent
--   f = opportunity
--   10 = practitioner (ecosystem map)
--   20 = public profile
--   30 = engagement
--   40 = narrative
--   50 = output
-- ============================================================


-- ──────────────────────────────────────────
-- ECOSYSTEM
-- ──────────────────────────────────────────

INSERT INTO ecosystems (id, name, slug, description, region) VALUES
('a0000000-0000-0000-0000-000000000001',
 'Northwest Arkansas',
 'nwa',
 'Cultural ecosystem spanning Bentonville, Fayetteville, Rogers, and Springdale. Anchored by Crystal Bridges, CACHE, Walton Family Foundation, and a growing independent creative workforce.',
 'Northwest Arkansas, USA');


-- ──────────────────────────────────────────
-- ORGANIZATIONS (10)
-- ──────────────────────────────────────────

INSERT INTO organizations (id, ecosystem_id, name, org_type, mandate, controls, constraints, decision_cycle, acceleration_enabled, avg_payment_days) VALUES

('b0000000-0000-0000-0000-000000000001',
 'a0000000-0000-0000-0000-000000000001',
 'CACHE',
 'intermediary',
 'Advance NWA creative economy through grants, programs, and advocacy',
 'Annual grant allocation (~$2M), creative economy programming, advocacy agenda, practitioner census data',
 'Dependent on foundation funding, limited staff capacity (5 FTE), no endowment',
 'Annual grant cycle (applications Q1, awards Q2). Board meets quarterly. Strategic plan review every 3 years.',
 true, 18),

('b0000000-0000-0000-0000-000000000002',
 'a0000000-0000-0000-0000-000000000001',
 'Walton Family Foundation',
 'foundation',
 'Community development, education, and environmental stewardship in NWA',
 'Significant capital for arts, culture, and placemaking (~$10M+ annually in cultural adjacencies). Sets regional strategy through grantmaking priorities.',
 'Board-driven, long planning cycles, geographic mandate extends beyond arts',
 'Rolling proposals accepted. Annual strategic review in Q4. Program officer discretion within approved areas.',
 false, 45),

('b0000000-0000-0000-0000-000000000003',
 'a0000000-0000-0000-0000-000000000001',
 'Crystal Bridges Museum of American Art',
 'cultural_institution',
 'Welcome all to celebrate the power of art, nature, and architecture',
 'Exhibition programming, residencies, community programs, education. Significant earned + endowed revenue. National visibility and convening power.',
 'Institutional scale and pace, curatorial independence, free admission model requires ongoing subsidy',
 'Exhibition calendar planned 18-24 months out. Community programming quarterly. Residency calls annually.',
 false, 31),

('b0000000-0000-0000-0000-000000000004',
 'a0000000-0000-0000-0000-000000000001',
 'City of Bentonville',
 'government',
 'Economic development, quality of life, infrastructure for residents',
 'Zoning, permits, public space, cultural district designation, municipal budget allocation, procurement',
 'Political cycles, competing priorities, limited cultural affairs staff (1 FTE), state procurement rules',
 'Annual budget cycle (deliberation Aug-Oct, finalized Nov). Council meetings biweekly. RFPs rolling.',
 false, 52),

('b0000000-0000-0000-0000-000000000005',
 'a0000000-0000-0000-0000-000000000001',
 'TheatreSquared',
 'cultural_institution',
 'Professional theatre serving NWA and broader region',
 'Season programming (6-8 productions), education programs, new play development, community partnerships',
 'Earned revenue dependency (~60%), facility capacity, limited endowment, seasonal staffing',
 'Season planning 12-18 months ahead. Education programming annually. Fundraising year-round.',
 false, 35),

('b0000000-0000-0000-0000-000000000006',
 'a0000000-0000-0000-0000-000000000001',
 'Walmart Inc. / Walmart Foundation',
 'corporate',
 'Community investment, associate engagement, brand positioning in home market',
 'Corporate sponsorships, foundation grants, in-kind support, significant convening power, employee volunteer programs',
 'Corporate governance, PR sensitivity, associate-focus mandate, long approval chains',
 'Foundation grants quarterly. Corporate sponsorships rolling. Annual giving strategy set in Q4.',
 false, 67),

('b0000000-0000-0000-0000-000000000007',
 'a0000000-0000-0000-0000-000000000001',
 'University of Arkansas',
 'education',
 'Education, research, and community service. School of Art offers MFA, residency, and community programs.',
 'Degree programs, visiting artist series, facilities (studios, galleries, performance venues), research funding',
 'Academic calendar, tenure politics, enrollment-driven budgets, state funding constraints',
 'Academic year planning in spring for following year. Residency calls in fall. Visiting artist series planned per semester.',
 false, 40),

('b0000000-0000-0000-0000-000000000008',
 'a0000000-0000-0000-0000-000000000001',
 'The Momentary',
 'cultural_institution',
 'Contemporary art and performance venue. Crystal Bridges satellite focused on contemporary work and live programming.',
 'Exhibition space, performance venue (capacity 500+), residency studios, event programming',
 'Operated by Crystal Bridges (shared governance), focused on contemporary/emerging (different audience), seasonal programming spikes',
 'Programming planned 6-12 months out. Exhibition calendar set annually. Events rolling.',
 false, 31),

('b0000000-0000-0000-0000-000000000009',
 'a0000000-0000-0000-0000-000000000001',
 'Arkansas Arts Council',
 'government',
 'State-level arts funding and advocacy. Distributes NEA funds and state appropriations.',
 'Individual artist fellowships, organizational grants, arts education funding. State-level policy influence.',
 'Small budget relative to NWA private philanthropy, serves entire state, political vulnerability',
 'Annual grant cycle (applications in fall, awards in spring). Fellowship nominations rolling.',
 false, 60),

('b0000000-0000-0000-0000-000000000010',
 'a0000000-0000-0000-0000-000000000001',
 'Bentonville Film Festival',
 'nonprofit',
 'Annual film festival championing underrepresented voices. National visibility, local economic impact.',
 'Festival programming, filmmaker residency pipeline, year-round screenings, industry connections',
 'Annual event concentration, limited year-round infrastructure, dependent on sponsorship',
 'Festival dates set 12 months out. Submissions open in fall. Programming finalized 3 months before.',
 false, 30);


-- ──────────────────────────────────────────
-- CONTACTS
-- ──────────────────────────────────────────

INSERT INTO contacts (organization_id, name, title, role_description, is_decision_maker) VALUES
('b0000000-0000-0000-0000-000000000001', 'Rachel Torres', 'Executive Director', 'Sets strategic direction, manages grant cycle, represents CACHE to funders', true),
('b0000000-0000-0000-0000-000000000001', 'David Kim', 'Program Manager', 'Manages micro-grant applications, practitioner relationships, event programming', false),
('b0000000-0000-0000-0000-000000000002', 'Lauren Mitchell', 'Program Officer, Arts & Culture', 'Manages cultural investment portfolio, evaluates proposals, recommends to board', true),
('b0000000-0000-0000-0000-000000000003', 'Maria Santos', 'Director of Community Programs', 'Oversees community engagement, residencies, education programs', true),
('b0000000-0000-0000-0000-000000000003', 'James Whitfield', 'Community Engagement Coordinator', 'Day-to-day community partnerships, local artist relations', false),
('b0000000-0000-0000-0000-000000000004', 'Sarah Collins', 'Cultural Affairs Liaison', 'Only cultural affairs staff. Manages public art, cultural district process, arts-related procurement', false),
('b0000000-0000-0000-0000-000000000004', 'Mayor Tom Bradley', 'Mayor', 'Final authority on municipal budget and cultural district designation', true),
('b0000000-0000-0000-0000-000000000007', 'Dr. Patricia Nguyen', 'Director, School of Art', 'Sets residency program direction, manages visiting artists, faculty hiring', true),
('b0000000-0000-0000-0000-000000000009', 'Amanda Reeves', 'Grants Manager', 'Manages individual artist fellowships and organizational grants for NWA region', false),
('b0000000-0000-0000-0000-000000000010', 'Chris Morton', 'Festival Director', 'Programming decisions, filmmaker selection, industry partnerships', true);


-- ──────────────────────────────────────────
-- ORG RELATIONSHIPS
-- ──────────────────────────────────────────

INSERT INTO org_relationships (org_a_id, org_b_id, relationship_type, description, strength) VALUES
('b0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'funds', 'Primary funder of CACHE operating budget and grant pool', 'strong'),
('b0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003', 'funds', 'Endowment and capital support for Crystal Bridges', 'strong'),
('b0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000008', 'operates', 'Crystal Bridges operates The Momentary as a satellite venue', 'strong'),
('b0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004', 'partners_with', 'CACHE advises City on cultural district, provides practitioner data', 'moderate'),
('b0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005', 'partners_with', 'Co-programming, shared audiences, occasional grant support', 'moderate'),
('b0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000003', 'funds', 'Corporate sponsorship of exhibitions and events', 'strong'),
('b0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000010', 'funds', 'Primary corporate sponsor of BFF', 'strong'),
('b0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000001', 'partners_with', 'Guest lectures, MFA student engagement, shared research', 'weak'),
('b0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000001', 'funds', 'State grants for CACHE programming', 'weak');


-- ──────────────────────────────────────────
-- PRACTITIONERS (ecosystem map — practice team's analytical view)
-- ──────────────────────────────────────────

INSERT INTO practitioners (id, ecosystem_id, name, discipline, tenure, income_sources, retention_factors, risk_factors) VALUES

('10000000-0000-0000-0000-000000000001',
 'a0000000-0000-0000-0000-000000000001',
 'Maya Chen', 'Brand + Visual Design', '3 years in NWA',
 'Freelance design for regional clients (~$30K), part-time teaching at UA (~$15K), occasional grant-funded projects (~$10K)',
 'Affordable studio space downtown, partner employed at Walmart HQ, growing local client base',
 'Limited creative peer community for design, corporate client concentration, studio lease increasing 2027'),

('10000000-0000-0000-0000-000000000002',
 'a0000000-0000-0000-0000-000000000001',
 'James Torres', 'Public Art + Fabrication', '5 years in NWA',
 'Commissions (~$25K), fabrication contracts (~$20K), occasional teaching workshops (~$5K)',
 'Owns workshop space in Fayetteville, strong relationship with Crystal Bridges community programs, family ties',
 'Commission pipeline inconsistent, 6-month gaps between major projects, health insurance through spouse'),

('10000000-0000-0000-0000-000000000003',
 'a0000000-0000-0000-0000-000000000001',
 'Sarah Okafor', 'Documentary Film', '2 years in NWA',
 'Freelance commercial video (~$20K), BFF-adjacent work (~$10K), teaching artist at community centers (~$8K)',
 'Lower cost than LA/NYC, BFF network, Momentary connection, growing documentary subject matter in region',
 'Insufficient year-round production work, no post-production ecosystem locally, considering return to LA'),

('10000000-0000-0000-0000-000000000004',
 'a0000000-0000-0000-0000-000000000001',
 'Marcus Webb', 'Music Production + Performance', '4 years in NWA',
 'Live performance (~$15K), session work (~$10K), home studio production (~$12K), teaching guitar (~$8K)',
 'Cost of living, emerging music scene, partner employed locally, home studio investment',
 'Limited venue infrastructure, no recording studio ecosystem, most session work is remote for out-of-state clients'),

('10000000-0000-0000-0000-000000000005',
 'a0000000-0000-0000-0000-000000000001',
 'Elena Voss', 'Painting + Installation', '7 years in NWA',
 'Gallery sales (~$20K), Crystal Bridges community commissions (~$15K), CACHE grants (~$8K), teaching UA adjunct (~$12K)',
 'Affordable studio, Crystal Bridges community, CACHE support network, established local reputation',
 'Gallery infrastructure limited (1 commercial gallery), adjunct pay stagnant, studio lease renewal uncertain'),

('10000000-0000-0000-0000-000000000006',
 'a0000000-0000-0000-0000-000000000001',
 'Andre Mitchell', 'Architecture + Spatial Design', '1 year in NWA',
 'Remote architecture contracts for previous firm (~$45K), occasional local consulting (~$10K)',
 'Relocated for partner''s job, interested in civic design work, sees cultural district as opportunity',
 'Most income still from remote work, not yet integrated into local creative community, no local portfolio'),

('10000000-0000-0000-0000-000000000007',
 'a0000000-0000-0000-0000-000000000001',
 'Priya Sharma', 'Textile Arts + Community Practice', '6 years in NWA',
 'Workshop facilitation (~$18K), CACHE grants (~$6K), Etsy/direct sales (~$12K), farmers market (~$5K)',
 'Deep community connections, culturally specific practice valued by institutions, homeownership',
 'Workshop income seasonal, grant dependency for larger projects, no dedicated retail space'),

('10000000-0000-0000-0000-000000000008',
 'a0000000-0000-0000-0000-000000000001',
 'Tommy Redhawk', 'Photography + Videography', '10 years in NWA',
 'Event photography (~$25K), commercial video for local businesses (~$20K), editorial (~$5K)',
 'Longest-tenured creative in our map, deep relationships with every institution, known and trusted',
 'Income entirely dependent on volume of bookings, no benefits, equipment costs escalating, aging out of event work');


-- ──────────────────────────────────────────
-- INVESTMENTS (12)
-- ──────────────────────────────────────────

INSERT INTO investments (id, ecosystem_id, source_org_id, source_name, initiative_name, amount, period, category, status, outcome, compounding, compounding_notes, description) VALUES

('c0000000-0000-0000-0000-000000000001',
 'a0000000-0000-0000-0000-000000000001',
 'b0000000-0000-0000-0000-000000000001', 'CACHE',
 'Creative Economy Grants - Cycle 1', 450000, 'Q1-Q2 2024', 'direct_artist_support', 'completed',
 '32 grants awarded across 5 disciplines. Average grant: $14K. Largest: $45K to TheatreSquared education program.',
 'compounding', 'Created pipeline for Cycle 2. Several grantees used funds to leverage additional funding. Teaching artist program spawned from grantee network.',
 'First cycle of CACHE''s signature grant program. Open to individual practitioners and organizations.'),

('c0000000-0000-0000-0000-000000000002',
 'a0000000-0000-0000-0000-000000000001',
 'b0000000-0000-0000-0000-000000000001', 'CACHE',
 'Creative Economy Grants - Cycle 2', 520000, 'Q1-Q2 2025', 'direct_artist_support', 'completed',
 '28 grants awarded. Larger average grant ($18.5K) but fewer recipients than Cycle 1. Concentration in established organizations increased.',
 'not_compounding', 'Fewer unique recipients despite larger total. Individual practitioner grants averaged $6K vs $11K in Cycle 1. Concentration trend concerning — institutions capturing larger share.',
 'Second cycle. Application requirements expanded, which may have deterred individual applicants.'),

('c0000000-0000-0000-0000-000000000003',
 'a0000000-0000-0000-0000-000000000001',
 'b0000000-0000-0000-0000-000000000002', 'Walton Family Foundation',
 'Downtown Cultural District Planning', 750000, '2024-2025', 'strategic_planning', 'active',
 'Consultant engaged. Community input phase completed (6 sessions, 180 participants). Draft plan expected Q1 2026.',
 'too_early', 'Planning process is thorough but outcomes depend entirely on implementation. Previous strategic plan (2019) was shelved.',
 'Comprehensive cultural district planning process for downtown Bentonville corridor between Crystal Bridges and the Momentary.'),

('c0000000-0000-0000-0000-000000000004',
 'a0000000-0000-0000-0000-000000000001',
 'b0000000-0000-0000-0000-000000000004', 'City of Bentonville',
 'Public Art Installations - Phase 1', 180000, '2021-2022', 'public_art', 'completed',
 '6 permanent installations across downtown corridor. 4 of 6 artists non-local. Positive media coverage but local artists felt excluded.',
 'not_compounding', 'High production quality but majority of economic benefit left the region. No selection transparency. No community input on locations. Repeated in Phase 2.',
 'First phase of Bentonville''s public art program. Curated by external consultant.'),

('c0000000-0000-0000-0000-000000000005',
 'a0000000-0000-0000-0000-000000000001',
 'b0000000-0000-0000-0000-000000000004', 'City of Bentonville',
 'Public Art Installations - Phase 2', 200000, 'Q3-Q4 2024', 'public_art', 'completed',
 '4 installations completed. 2 by non-local artists. Selection process remained opaque despite Phase 1 feedback.',
 'not_compounding', 'No documented learning transfer from Phase 1. Same external curator. Same opaque selection process. Local artists again underrepresented.',
 'Continuation of Phase 1 with no structural changes despite practitioner feedback.'),

('c0000000-0000-0000-0000-000000000006',
 'a0000000-0000-0000-0000-000000000001',
 'b0000000-0000-0000-0000-000000000003', 'Crystal Bridges',
 'Artist Residency Expansion', 350000, '2025-2026', 'artist_development', 'active',
 '8 residency slots (up from 5). Housing included. Mix of local and national artists. Community engagement requirement added.',
 'compounding', 'Expansion created more slots AND added community engagement component. 3 of 8 slots reserved for NWA-connected artists. Previous residents contributing to ongoing programming.',
 'Expanded residency program with new community integration requirements.'),

('c0000000-0000-0000-0000-000000000007',
 'a0000000-0000-0000-0000-000000000001',
 'b0000000-0000-0000-0000-000000000006', 'Walmart Foundation',
 'Creative Workforce Development - Phase 1', 500000, '2024-2025', 'education_training', 'completed',
 'Training program graduated 45 participants across graphic design, video production, and digital marketing. 60% employed in creative sector within 6 months.',
 'compounding', 'Graduates now forming a peer network. Several hired by NWA institutions. Created documented curriculum reusable for Phase 2.',
 'Workforce training program targeting career-changers and underemployed creatives.'),

('c0000000-0000-0000-0000-000000000008',
 'a0000000-0000-0000-0000-000000000001',
 'b0000000-0000-0000-0000-000000000001', 'CACHE',
 'NWA Music Initiative', 175000, 'Q2-Q4 2025', 'sector_development', 'active',
 'Venue partnerships established with 3 locations. 3 showcase events completed. Recording sessions pilot launched.',
 'too_early', 'Early signs of venue ecosystem forming but sustainability unclear. Recording pilot reached capacity immediately — demand signal is strong.',
 'Sector-specific initiative to build music infrastructure. Includes venue partnerships, showcases, and recording access.'),

('c0000000-0000-0000-0000-000000000009',
 'a0000000-0000-0000-0000-000000000001',
 NULL, 'Private donors (aggregated)',
 'TheatreSquared Capital Campaign', 1200000, '2023-2026', 'institutional_capacity', 'active',
 'New facility 80% funded. Construction 60% complete. Expected opening Q4 2026.',
 'compounding', 'New facility will double capacity. Includes dedicated education wing. Already attracting larger touring productions based on planned specs.',
 'Capital campaign for TheatreSquared''s new permanent facility in downtown Fayetteville.'),

('c0000000-0000-0000-0000-000000000010',
 'a0000000-0000-0000-0000-000000000001',
 'b0000000-0000-0000-0000-000000000003', 'Crystal Bridges',
 'Community Wayfinding and Signage', 12000, 'Q4 2025-Q1 2026', 'public_art', 'completed',
 'Completed through NWA Creative Opportunities platform. 6 steel and wood wayfinding signs for North Forest Trail. Practitioner: James Torres.',
 'compounding', 'First engagement completed through the platform. Local fabricator, local materials, community-responsive design. Sets precedent for future trail system commissions.',
 'Wayfinding signage for the trail connecting Crystal Bridges to the Momentary. Commissioned through the platform.',
 'platform'),

('c0000000-0000-0000-0000-000000000011',
 'a0000000-0000-0000-0000-000000000001',
 'b0000000-0000-0000-0000-000000000009', 'Arkansas Arts Council',
 'Individual Artist Fellowships - NWA Recipients', 30000, '2025', 'direct_artist_support', 'completed',
 '3 NWA artists received $10K fellowships: Elena Voss (painting), Marcus Webb (music composition), Priya Sharma (textile arts).',
 'compounding', 'State-level recognition strengthens practitioners'' credentials and visibility. All three are active in the ecosystem and reinvested in local work.',
 'Annual fellowships administered by state. NWA representation was notably strong this cycle.'),

('c0000000-0000-0000-0000-000000000012',
 'a0000000-0000-0000-0000-000000000001',
 'b0000000-0000-0000-0000-000000000002', 'Walton Family Foundation',
 'NWA Trail System Cultural Integration', 400000, '2025-2026', 'infrastructure', 'active',
 'Arts integration into regional trail system. 8 sites identified for permanent installations. Artist selection process underway.',
 'too_early', 'Scale is significant. If artist selection process improves on Phase 1-2 public art model, this could be transformative. If it repeats the same pattern, it''s another non-compounding investment.',
 'Integration of art and cultural programming into the 50+ mile NWA trail system.');

-- Set compounding chains
UPDATE investments SET builds_on_id = 'c0000000-0000-0000-0000-000000000001' WHERE id = 'c0000000-0000-0000-0000-000000000002';
UPDATE investments SET builds_on_id = 'c0000000-0000-0000-0000-000000000004' WHERE id = 'c0000000-0000-0000-0000-000000000005';


-- ──────────────────────────────────────────
-- DECISIONS (7)
-- ──────────────────────────────────────────

INSERT INTO decisions (id, ecosystem_id, stakeholder_org_id, decision_title, description, deliberation_start, deliberation_end, locks_date, status, dependencies, intervention_needed) VALUES

('d0000000-0000-0000-0000-000000000001',
 'a0000000-0000-0000-0000-000000000001',
 'b0000000-0000-0000-0000-000000000001',
 'CACHE 2026 Grant Cycle Priorities',
 'CACHE board deciding priority areas and allocation model for Cycle 3. Key question: reverse concentration trend from Cycle 2 or continue current model.',
 '2026-01-15', '2026-02-28', '2026-03-14',
 'deliberating',
 'Should reference Walton cultural district plan findings. Should address concentration trend identified in Cycle 2 outcomes.',
 'Directional brief needed before Feb board meeting. Brief should surface: concentration trend in Cycle 2, practitioner census data on income decline, and overlap with AAC grants. Deliver to Rachel Torres by Feb 20.'),

('d0000000-0000-0000-0000-000000000002',
 'a0000000-0000-0000-0000-000000000001',
 'b0000000-0000-0000-0000-000000000004',
 'FY2027 Cultural Budget Allocation',
 'City of Bentonville annual budget deliberation. Cultural affairs line item historically <1% of total budget. Cultural district designation may increase allocation.',
 '2026-06-01', '2026-10-15', '2026-11-01',
 'upcoming',
 'Influenced by cultural district designation timeline and Phase 2 public art outcomes.',
 'Present ecosystem investment landscape to Sarah Collins before deliberation begins (Jun). Show how city investment compares to foundation and institutional spending. Frame cultural budget as infrastructure, not discretionary.'),

('d0000000-0000-0000-0000-000000000003',
 'a0000000-0000-0000-0000-000000000001',
 'b0000000-0000-0000-0000-000000000003',
 '2027 Community Programming Slate',
 'Crystal Bridges deciding community programming direction for 2027. Includes residency focus areas, community partnerships, and Momentary programming.',
 '2026-03-01', '2026-05-31', '2026-06-14',
 'deliberating',
 'Should align with CACHE grant cycle to avoid duplication. Should consider Momentary programming gaps.',
 'Share ecosystem map showing current programming gaps. Highlight: music and film are underserved by institutional programming. Most Crystal Bridges community programs are visual arts.'),

('d0000000-0000-0000-0000-000000000004',
 'a0000000-0000-0000-0000-000000000001',
 'b0000000-0000-0000-0000-000000000006',
 'Creative Workforce Phase 2 Funding',
 'Walmart Foundation deciding whether to fund Phase 2 of workforce development. Phase 1 outcomes were strong (60% employment rate). Decision depends on evaluation report.',
 '2026-04-01', '2026-07-31', '2026-09-01',
 'upcoming',
 'Phase 1 evaluation must be complete. Curriculum needs updating based on graduate feedback. Partnership with UA School of Art proposed but not formalized.',
 'Precedent archive entry on Phase 1 needs to reach decision-makers. Emphasize: 60% employment rate, peer network formation, curriculum reusability. Deliver to Walmart Foundation program officer by May.'),

('d0000000-0000-0000-0000-000000000005',
 'a0000000-0000-0000-0000-000000000001',
 'b0000000-0000-0000-0000-000000000004',
 'Public Art Phase 3 Artist Selection Model',
 'City deciding whether to change artist selection process for Phase 3 of public art program. Practitioners have been vocal about local exclusion in Phases 1-2.',
 '2026-05-01', '2026-07-31', '2026-08-15',
 'upcoming',
 'Should reference Phase 1-2 precedent analysis. Cultural district plan may include public art policy recommendations.',
 'Present Phase 1-2 precedent analysis showing non-local concentration. Recommend: minimum 50% local artist requirement, transparent selection criteria, community advisory role. Deliver to Sarah Collins and Mayor.'),

('d0000000-0000-0000-0000-000000000006',
 'a0000000-0000-0000-0000-000000000001',
 'b0000000-0000-0000-0000-000000000002',
 'Walton Foundation Q4 Strategic Review - Cultural Investment',
 'Annual review of cultural investment strategy. Sets priorities for following year. Critical for ecosystem direction.',
 '2026-10-01', '2026-11-30', '2026-12-15',
 'upcoming',
 'Downtown cultural district plan should be complete by this point. CACHE Cycle 3 outcomes will be available.',
 'Ensure district plan findings reach WFF program officers before October. Prepare state-of-ecosystem summary showing investment landscape, compounding analysis, and practitioner reality data.'),

('d0000000-0000-0000-0000-000000000007',
 'a0000000-0000-0000-0000-000000000001',
 'b0000000-0000-0000-0000-000000000010',
 'BFF Year-Round Programming Strategy',
 'BFF board evaluating whether to expand beyond annual festival into year-round programming. Would include monthly screenings, filmmaker workshops, and production support.',
 '2026-07-01', '2026-09-30', '2026-10-15',
 'upcoming',
 'Should consider NWA Music Initiative as model/cautionary tale for sector-specific year-round programming.',
 'Share BFF precedent analysis showing gap between festival visibility and year-round practitioner support. If BFF expands, it could anchor film infrastructure the ecosystem currently lacks.');

-- Decision dependencies
INSERT INTO decision_dependencies (decision_id, depends_on_id, description) VALUES
('d0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', 'Crystal Bridges should align community programming with CACHE grant priorities to avoid duplication'),
('d0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000002', 'Public art budget depends on overall cultural budget allocation');


-- ──────────────────────────────────────────
-- PRECEDENTS (5)
-- ──────────────────────────────────────────

INSERT INTO precedents (id, ecosystem_id, name, period, involved, what_produced, what_worked, what_didnt, connects_to, takeaway, investment_id) VALUES

('e0000000-0000-0000-0000-000000000001',
 'a0000000-0000-0000-0000-000000000001',
 'NWA Creative Economy Strategic Plan (2019)', '2018-2019',
 'CACHE (commissioned), External consultants, Regional stakeholders, City of Bentonville, Crystal Bridges',
 '50-page strategic plan with 12 recommendations across 4 pillars: infrastructure, workforce, visibility, funding',
 'Strong community engagement process (12 forums, 300+ participants). Good baseline data collection. Established CACHE as the coordinating intermediary.',
 'Recommendations too broad to sequence. No implementation tracking mechanism. No accountability structure. Plan was referenced briefly in 2020, then shelved. No follow-up assessment conducted. Several recommendations overlap with the 2024 Walton cultural district plan — suggesting the 2019 plan was either forgotten or ignored.',
 'Walton downtown cultural district plan (2024) commissioned without documented reference to this plan. Several recommendations overlap. If the 2024 plan repeats the pattern — comprehensive document, no implementation tracking — it will produce the same outcome.',
 'Comprehensive plans without implementation tracking and sequencing logic get shelved. The next plan needs: fewer recommendations, built-in accountability milestones, a named implementation lead, and a 6-month review cycle.',
 NULL),

('e0000000-0000-0000-0000-000000000002',
 'a0000000-0000-0000-0000-000000000001',
 'Bentonville Film Festival - Institutional Partnership Model', '2015-present',
 'BFF, Crystal Bridges, Walmart, City of Bentonville, local businesses, visiting filmmakers',
 'Annual festival with national visibility, tourism impact ($4M+ estimated), filmmaker network, emerging residency pipeline',
 'Strong brand identity and programming mandate. Corporate sponsorship model that doesn''t compromise creative direction. National media coverage positions NWA on cultural map. Community goodwill is high.',
 'Year-round economic impact for local film practitioners remains limited. Festival energy doesn''t translate to sustained production ecosystem. Most hired crew are brought in from out of state. Local filmmaker Sarah Okafor reports "feast or famine" cycle — busy during festival, nothing after.',
 'NWA Music Initiative (2025) attempting similar sector-specific model for music. Should learn from BFF''s year-round sustainability challenge before replicating the festival-dependent model.',
 'Tentpole events create visibility but don''t automatically build year-round creative infrastructure. The gap between event energy and ecosystem sustainability needs explicit programming. BFF needs a year-round production strategy, not just a year-round screening series.',
 NULL),

('e0000000-0000-0000-0000-000000000003',
 'a0000000-0000-0000-0000-000000000001',
 'Public Art Installations - Phases 1 & 2', '2021-2024',
 'City of Bentonville, External curator, 10 artists (6 non-local), Crystal Bridges (advisory), community members (feedback only)',
 '10 permanent public art installations across downtown Bentonville. High production quality. Positive media coverage.',
 'High production quality. Strong placemaking impact. Media coverage positioned Bentonville as culturally ambitious. Installations are well-maintained and frequently photographed.',
 'Majority of artists non-local across both phases (6 of 10), limiting economic impact for NWA practitioners. Selection process opaque — criteria never published, no community advisory role. No documented learning transfer between Phase 1 and Phase 2. Local artists like James Torres and Elena Voss report feeling excluded despite having relevant portfolios. Phase 2 repeated Phase 1''s structural choices despite explicit feedback.',
 'Phase 3 is upcoming. Trail system cultural integration ($400K, Walton Foundation) will face the same artist selection question at larger scale. If the same model is applied to 8 trail sites, the non-local concentration problem scales.',
 'Public art programs that don''t prioritize local practitioners undermine the creative ecosystem they''re meant to support. Phase 3 needs: published selection criteria, minimum local artist percentage, community advisory input on siting, and transparent evaluation.',
 'c0000000-0000-0000-0000-000000000004'),

('e0000000-0000-0000-0000-000000000004',
 'a0000000-0000-0000-0000-000000000001',
 'Creative Workforce Development - Phase 1', '2024-2025',
 'Walmart Foundation (funder), CACHE (administrator), Local employers (placement partners), UA School of Art (curriculum advisory)',
 'Training program for 45 participants across graphic design, video production, and digital marketing. 60% employed in creative sector within 6 months.',
 'Strong employment outcomes. Curriculum developed with employer input, ensuring relevance. Peer cohort model created lasting professional network among graduates. Program reached demographics underrepresented in NWA creative economy.',
 'Curriculum was too focused on technical skills without addressing business fundamentals (invoicing, contracts, client management). Graduates employed but mostly in junior/entry-level roles. No mentorship component connecting graduates to established practitioners. UA partnership was advisory only — deeper integration would strengthen academic pipeline.',
 'Phase 2 funding decision upcoming at Walmart Foundation. If Phase 2 adds business fundamentals, mentorship, and UA integration, it compounds. If it repeats Phase 1 curriculum unchanged, returns diminish.',
 'Workforce programs that teach only technical skills create employees, not practitioners. Phase 2 needs: business fundamentals module, structured mentorship with established NWA creatives, and deeper UA integration for academic credit pathway.',
 'c0000000-0000-0000-0000-000000000007'),

('e0000000-0000-0000-0000-000000000005',
 'a0000000-0000-0000-0000-000000000001',
 'CACHE Grant Cycle Evolution (Cycles 1-2)', '2024-2025',
 'CACHE (administrator), NWA practitioners and organizations (applicants), Walton Family Foundation (primary funder)',
 'Two grant cycles totaling $970K across 60 grants. Cycle 1 distributed more broadly (32 grants, avg $14K). Cycle 2 concentrated in fewer, larger grants (28 grants, avg $18.5K).',
 'Total funding increased 15%. Application process refined. Review panel included practitioners in Cycle 2. Reporting requirements improved.',
 'Concentration increased — institutions captured larger share in Cycle 2. Individual practitioner grants averaged $6K in Cycle 2 vs $11K in Cycle 1. Expanded application requirements in Cycle 2 may have deterred individual applicants. No analysis of who didn''t apply and why.',
 'Cycle 3 priorities decision is upcoming. This precedent should directly inform whether CACHE reverses the concentration trend or accepts it as structural.',
 'Grant programs that increase total funding while concentrating it in fewer recipients are not compounding for the ecosystem. The measure that matters is not total dollars — it''s unique practitioners served and whether funding reaches people who wouldn''t otherwise have it.',
 'c0000000-0000-0000-0000-000000000002');


-- ──────────────────────────────────────────
-- OPPORTUNITIES (9)
-- ──────────────────────────────────────────

INSERT INTO opportunities (id, ecosystem_id, source_org_id, source_name, title, opportunity_type, amount_min, amount_max, amount_description, deadline, eligibility, description, application_url, status, preparation_context) VALUES

('f0000000-0000-0000-0000-000000000001',
 'a0000000-0000-0000-0000-000000000001',
 'b0000000-0000-0000-0000-000000000001', 'CACHE',
 'CACHE Creative Economy Micro-Grants', 'grant', 2500, 10000, NULL,
 '2026-03-14',
 'NWA-based creative practitioners and organizations',
 'Micro-grants supporting individual creative projects, community programs, and small organizational initiatives. Open to all disciplines.',
 'https://cachenwarkansas.org/grants',
 'open',
 'CACHE has invested over $970K across two grant cycles. Cycle 2 concentrated larger awards in established organizations — individual practitioner grants averaged $6K vs $11K in Cycle 1. The board is currently deliberating Cycle 3 priorities, which may reverse this trend. Successful applicants in previous cycles emphasized community engagement outcomes and cross-disciplinary collaboration. If you''re applying as an individual practitioner, demonstrate how your work creates conditions beyond your own practice.'),

('f0000000-0000-0000-0000-000000000002',
 'a0000000-0000-0000-0000-000000000001',
 'b0000000-0000-0000-0000-000000000004', 'City of Bentonville',
 'Bentonville Cultural District Branding RFP', 'rfp', 45000, 45000, NULL,
 '2026-02-27',
 'Design studios and independent designers with cultural/civic experience. LLCs and sole proprietors are eligible.',
 'Brand identity for Bentonville Cultural District. Includes visual identity, signage system, marketing collateral, and brand guidelines. The cultural district encompasses the downtown corridor between Crystal Bridges and the Momentary.',
 NULL,
 'closing_soon',
 'This RFP emerged from a 2-year cultural district planning process funded by the Walton Family Foundation. The planning phase found that the district''s identity should emphasize living artists and working studios, not just institutional anchors. The 2019 NWA Creative Economy Strategic Plan recommended explicit place-based branding but was shelved before implementation. Proposals that demonstrate understanding of the district as a creative production corridor — not just a cultural tourism destination — will likely resonate with the selection committee.'),

('f0000000-0000-0000-0000-000000000003',
 'a0000000-0000-0000-0000-000000000001',
 'b0000000-0000-0000-0000-000000000003', 'Crystal Bridges',
 'Community Art Commission - North Forest Trail', 'commission', 15000, 25000, NULL,
 '2026-04-01',
 'Artists working in outdoor/site-specific installation. Preference for NWA-based artists.',
 'Site-specific artwork for 3 locations along the North Forest Trail. Work should respond to the natural landscape and create moments of pause and reflection for trail users.',
 'https://crystalbridges.org/opportunities',
 'open',
 'Crystal Bridges has invested $350K in the expanded residency program and $12K in wayfinding signage through this platform. Community programs are shifting toward deeper local integration. The recently completed wayfinding project (James Torres) set a precedent for commissioning local fabricators. Proposals that demonstrate connection to NWA landscape and community will be strongest.'),

('f0000000-0000-0000-0000-000000000004',
 'a0000000-0000-0000-0000-000000000001',
 'b0000000-0000-0000-0000-000000000007', 'University of Arkansas',
 'UA Artist-in-Residence (School of Art)', 'residency', NULL, NULL, 'Stipend + studio + material budget',
 '2026-02-28',
 'Mid-career artists, national. All media.',
 'Semester-long residency including dedicated studio space, material budget, stipend, and housing. Residents are expected to engage with MFA students and present public work.',
 'https://art.uark.edu/residency',
 'closing_soon',
 'The School of Art residency has historically brought non-local artists with the expectation of community engagement. Previous residents have had mixed integration with the local creative ecosystem — some built lasting connections, others completed their term with minimal community impact. NWA-based applicants who can demonstrate how the residency would deepen their existing community ties have an advantage, though the program officially targets national candidates.'),

('f0000000-0000-0000-0000-000000000005',
 'a0000000-0000-0000-0000-000000000001',
 'b0000000-0000-0000-0000-000000000005', 'TheatreSquared',
 'Playwright Development Program', 'program', NULL, NULL, 'Dramaturgy support + staged reading + travel stipend',
 NULL,
 'Emerging playwrights, national. Unproduced full-length plays.',
 'Development support for 3 emerging playwrights, culminating in staged readings during the season. Includes dramaturgy, director pairing, and professional feedback.',
 'https://theatre2.org/newplays',
 'open',
 NULL),

('f0000000-0000-0000-0000-000000000006',
 'a0000000-0000-0000-0000-000000000001',
 'b0000000-0000-0000-0000-000000000006', 'Walmart Foundation',
 'Creative Workforce Training Partners', 'rfp', 50000, 100000, NULL,
 '2026-03-29',
 'Education/training organizations in NWA',
 'Seeking training partners for Phase 2 of Creative Workforce Development program. Partners will deliver curriculum in graphic design, video production, and digital marketing with added business fundamentals module.',
 NULL,
 'open',
 'Phase 1 graduated 45 participants with 60% employment in creative sector. Phase 2 adds business fundamentals, mentorship, and deeper UA integration. The Walmart Foundation values measurable outcomes — proposals should include specific employment targets and tracking methodology. Phase 1 curriculum is available as a starting point.'),

('f0000000-0000-0000-0000-000000000007',
 'a0000000-0000-0000-0000-000000000001',
 'b0000000-0000-0000-0000-000000000003', 'Crystal Bridges',
 'Performing Arts Residency at the Momentary', 'residency', NULL, NULL, 'Housing + studio + $5,000 stipend + production budget',
 '2026-05-01',
 'Performance artists, interdisciplinary. Emerging and mid-career.',
 'Performance-focused residency at the Momentary. 6-week residency culminating in a public performance or installation. Interdisciplinary work encouraged.',
 'https://themomentary.org/residency',
 'open',
 'The Momentary is actively building its contemporary and performance programming identity, distinct from Crystal Bridges. Performance and interdisciplinary work is especially encouraged. Previous residents who engaged the local community report stronger institutional support.'),

('f0000000-0000-0000-0000-000000000008',
 'a0000000-0000-0000-0000-000000000001',
 'b0000000-0000-0000-0000-000000000009', 'Arkansas Arts Council',
 'Individual Artist Fellowship', 'fellowship', 10000, 10000, NULL,
 '2026-09-15',
 'Arkansas resident artists. All disciplines. Based on artistic excellence.',
 'Unrestricted $10,000 fellowship recognizing artistic excellence. No project requirement — award is based on body of work and contribution to Arkansas creative landscape.',
 'https://arkansasarts.org/fellowships',
 'open',
 'Three NWA artists received fellowships in 2025 (Elena Voss, Marcus Webb, Priya Sharma). The AAC values artistic excellence over project proposals — your portfolio and body of work matter more than a planned deliverable. NWA artists have been increasingly competitive in recent cycles.'),

('f0000000-0000-0000-0000-000000000009',
 'a0000000-0000-0000-0000-000000000001',
 'b0000000-0000-0000-0000-000000000004', 'City of Bentonville',
 'Public Art Phase 3 - Call for Artists', 'commission', 20000, 50000, NULL,
 '2026-04-15',
 'Professional artists. Preference for Arkansas-based artists noted in RFP.',
 '3-5 permanent public art installations for the expanded cultural district. Includes downtown corridor and trail connections. Medium open.',
 NULL,
 'open',
 'Phases 1 and 2 installed 10 works with 6 non-local artists. Practitioners have been vocal about local exclusion. The artist selection process is currently under review — the City is deciding whether to change the model (that decision locks in August). This call may reflect the new model or the old one. Proposals emphasizing local connection, community responsiveness, and the living-artist identity of the cultural district are likely strongest.');


-- ──────────────────────────────────────────
-- NARRATIVES (5)
-- ──────────────────────────────────────────

INSERT INTO narratives (id, ecosystem_id, source_org_id, source_name, source_type, date, narrative_text, reality_text, gap, evidence_notes) VALUES

('40000000-0000-0000-0000-000000000001',
 'a0000000-0000-0000-0000-000000000001',
 'b0000000-0000-0000-0000-000000000004', 'City of Bentonville - Economic Development', 'regional_positioning',
 '2026-01-15',
 'Marketing campaign positions Bentonville as "The Creative Capital of the South" with emphasis on Crystal Bridges, trail system, and tech startup scene.',
 'Investment ledger shows cultural funding from the city flat year-over-year at <1% of municipal budget. Practitioner layer shows net outflow of musicians and filmmakers. "Creative Capital" narrative not supported by ecosystem investment trends — the capital is institutional (Crystal Bridges endowment) not municipal.',
 'high',
 'City budget analysis FY2024-2026. Practitioner exit interviews (Marcus Webb, Sarah Okafor). Crystal Bridges funding is Walton-derived, not municipal.'),

('40000000-0000-0000-0000-000000000002',
 'a0000000-0000-0000-0000-000000000001',
 'b0000000-0000-0000-0000-000000000001', 'CACHE Annual Report 2025', 'institutional',
 '2025-12-01',
 'Reports "record investment in NWA creative economy" and highlights grant program reach across disciplines. Emphasizes total dollars deployed and number of programs supported.',
 'Total dollars increased but unique recipients decreased. Cycle 2 concentrated larger grants in established organizations, with individual practitioner grants averaging nearly half of Cycle 1 levels. "Record investment" is true by total but misleading by distribution.',
 'medium',
 'Grant data comparison Cycle 1 vs Cycle 2. Individual vs organizational breakdown. Average grant size by applicant type.'),

('40000000-0000-0000-0000-000000000003',
 'a0000000-0000-0000-0000-000000000001',
 NULL, 'Northwest Arkansas Democrat-Gazette', 'media_coverage',
 '2026-02-01',
 'Feature series on NWA arts scene emphasizes Crystal Bridges expansion, new gallery/restaurant openings, and TheatreSquared facility. Frames NWA as "arriving" culturally.',
 'Coverage focused entirely on institutional and commercial activity. No mention of practitioner retention challenges, studio space costs, income instability, or gaps in year-round creative employment. The "arriving" frame centers buildings and brands, not the people who make art.',
 'medium',
 'Content analysis of 5-article series. Zero sources who are working artists. All sources are institutional leaders or business owners.'),

('40000000-0000-0000-0000-000000000004',
 'a0000000-0000-0000-0000-000000000001',
 NULL, 'Practitioner Conversations (Aggregated)', 'practitioner',
 '2026-02-01',
 'Consistent theme across 12 conversations: NWA is exciting and affordable but "hard to make a living as an artist." Appreciation for institutional presence but sense that opportunities flow to established players and outsiders.',
 'Aligns with investment ledger showing concentration of funding in institutions vs. direct practitioner support. Opportunity layer confirms most high-value opportunities require institutional affiliation or are awarded to non-local artists. Practitioners report spending 30-40% of their time on unpaid application and proposal work.',
 'aligned',
 'Aggregated from 12 practitioner check-ins conducted Jan-Feb 2026. Cross-referenced with investment and opportunity data.'),

('40000000-0000-0000-0000-000000000005',
 'a0000000-0000-0000-0000-000000000001',
 'b0000000-0000-0000-0000-000000000003', 'Crystal Bridges', 'funder_report',
 '2026-01-20',
 'Annual impact report emphasizes: 1.2M visitors, 8 residency artists, expanded community programming, trail integration. Frames Crystal Bridges as "the heart of NWA cultural life."',
 'Visitor numbers are impressive but community program participation is flat. Residency program expanded but 5 of 8 residents are non-NWA. "Heart of cultural life" framing may obscure that most NWA creative practitioners rarely interact with Crystal Bridges outside of occasional event attendance.',
 'medium',
 'Visitor data vs. community program enrollment. Residency artist origin analysis. Practitioner interview data on institutional engagement.');


-- ──────────────────────────────────────────
-- OUTPUTS (3)
-- ──────────────────────────────────────────

INSERT INTO outputs (id, ecosystem_id, output_type, title, summary, content, target_stakeholder_id, triggered_by_decision_id, is_published, published_at) VALUES

('50000000-0000-0000-0000-000000000001',
 'a0000000-0000-0000-0000-000000000001',
 'directional_brief',
 'CACHE 2026 Grant Cycle Brief',
 'Analysis of Cycle 1-2 trends with recommendations for Cycle 3 priority setting. Addresses concentration trend and practitioner impact.',
 'Brief content would go here. Draws on investment ledger data showing Cycle 2 concentration, practitioner interview data, and precedent analysis of grant cycle evolution.',
 'b0000000-0000-0000-0000-000000000001',
 'd0000000-0000-0000-0000-000000000001',
 true, '2026-02-10'),

('50000000-0000-0000-0000-000000000002',
 'a0000000-0000-0000-0000-000000000001',
 'foundational_text',
 'A Cultural Diagnosis of Northwest Arkansas',
 'Comprehensive analysis of NWA''s cultural ecosystem synthesizing nine months of research into investment patterns, practitioner reality, and structural gaps.',
 'Full diagnosis text would go here.',
 NULL, NULL,
 true, '2026-01-15'),

('50000000-0000-0000-0000-000000000003',
 'a0000000-0000-0000-0000-000000000001',
 'orientation_framework',
 'An Operating Doctrine for Cultural Architecture',
 'Defines the practice''s approach: upstream positioning, compounding assessment, investment-vs-narrative gap analysis, and decision calendar methodology.',
 'Full doctrine text would go here.',
 NULL, NULL,
 true, '2026-01-15');


-- ──────────────────────────────────────────
-- PUBLIC PROFILES (3 demo practitioners)
-- ──────────────────────────────────────────

INSERT INTO public_profiles (id, name, email, primary_skill, location, bio, portfolio_url, availability, looking_for, is_verified, verified_at, business_entity_type, practitioner_id) VALUES

('20000000-0000-0000-0000-000000000001',
 'Maya Chen', 'maya@example.com',
 'Brand + Visual Design', 'Bentonville',
 'Independent designer specializing in cultural and civic identity systems. 3 years in NWA. Previously at a Kansas City design studio focused on public sector clients.',
 'https://mayachen.design',
 'available',
 ARRAY['commissions', 'contracts'],
 true, '2026-01-20', 'llc',
 '10000000-0000-0000-0000-000000000001'),

('20000000-0000-0000-0000-000000000002',
 'James Torres', 'james@example.com',
 'Public Art + Fabrication', 'Fayetteville',
 'Sculptor and fabricator working in steel and mixed media. 5 years in NWA. Completed public installations for municipalities in Arkansas and Oklahoma.',
 'https://jamestorres.art',
 'selective',
 ARRAY['commissions', 'grants'],
 true, '2026-01-20', 'sole_proprietor',
 '10000000-0000-0000-0000-000000000002'),

('20000000-0000-0000-0000-000000000003',
 'Sarah Okafor', 'sarah@example.com',
 'Documentary Film', 'Rogers',
 'Documentary filmmaker focused on community stories and cultural preservation. 2 years in NWA. MFA from UA. Teaching artist at community centers.',
 'https://sarahokafor.com',
 'available',
 ARRAY['grants', 'commissions', 'teaching'],
 false, NULL, NULL,
 '10000000-0000-0000-0000-000000000003');

-- Link practitioners back to public profiles
UPDATE practitioners SET public_profile_id = '20000000-0000-0000-0000-000000000001' WHERE id = '10000000-0000-0000-0000-000000000001';
UPDATE practitioners SET public_profile_id = '20000000-0000-0000-0000-000000000002' WHERE id = '10000000-0000-0000-0000-000000000002';
UPDATE practitioners SET public_profile_id = '20000000-0000-0000-0000-000000000003' WHERE id = '10000000-0000-0000-0000-000000000003';


-- ──────────────────────────────────────────
-- OPPORTUNITY INTERESTS
-- ──────────────────────────────────────────

INSERT INTO opportunity_interests (opportunity_id, profile_id, notes) VALUES
('f0000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'I''ve worked with City of Bentonville stakeholders before through Crystal Bridges events.'),
('f0000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', NULL),
('f0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', NULL),
('f0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 'Planning a documentary about NWA creative workers — this could fund the initial research phase.'),
('f0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', NULL),
('f0000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', 'This is exactly the type of site-specific work I do. Happy to share my North Forest Trail wayfinding project as reference.'),
('f0000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', NULL),
('f0000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000002', NULL);


-- ──────────────────────────────────────────
-- ENGAGEMENTS (1 completed, 1 active)
-- ──────────────────────────────────────────

-- Completed: James Torres - Community Wayfinding Signage
INSERT INTO engagements (id, opportunity_id, profile_id, funder_org_id, title, scope, total_amount, start_date, end_date, status, practitioner_confirmed_complete, funder_confirmed_complete, completed_at, investment_id, payment_terms) VALUES
('30000000-0000-0000-0000-000000000001',
 NULL,
 '20000000-0000-0000-0000-000000000002',
 'b0000000-0000-0000-0000-000000000003',
 'Community Wayfinding Signage',
 'Design and fabrication of 6 wayfinding signs for the North Forest Trail connecting Crystal Bridges to the Momentary. Steel and wood construction with integrated art elements reflecting the regional landscape.',
 12000,
 '2025-10-01', '2026-01-15',
 'complete', true, true, '2026-01-15',
 'c0000000-0000-0000-0000-000000000010',
 '[{"amount": 6000, "trigger": "midpoint", "status": "paid", "paid_date": "2025-11-20"}, {"amount": 6000, "trigger": "completion", "status": "paid", "paid_date": "2026-02-10"}]');

-- Active: Maya Chen - Cultural District Branding (awarded from the RFP)
INSERT INTO engagements (id, opportunity_id, profile_id, funder_org_id, title, scope, total_amount, start_date, end_date, status, payment_terms) VALUES
('30000000-0000-0000-0000-000000000002',
 'f0000000-0000-0000-0000-000000000002',
 '20000000-0000-0000-0000-000000000001',
 'b0000000-0000-0000-0000-000000000004',
 'Cultural District Branding',
 'Brand identity for Bentonville Cultural District. Includes visual identity system (logo, color palette, typography), signage design specifications, marketing collateral templates, and comprehensive brand guidelines document.',
 45000,
 '2026-03-01', '2026-06-15',
 'active',
 '[{"amount": 22500, "trigger": "midpoint", "status": "pending"}, {"amount": 22500, "trigger": "completion", "status": "pending"}]');

-- Milestones for active engagement
INSERT INTO engagement_milestones (engagement_id, title, due_date, sort_order, completed_at) VALUES
('30000000-0000-0000-0000-000000000002', 'Kickoff and stakeholder research', '2026-03-15', 1, '2026-03-14'),
('30000000-0000-0000-0000-000000000002', 'Concept directions (3)', '2026-03-31', 2, '2026-03-29'),
('30000000-0000-0000-0000-000000000002', 'Stakeholder presentation and feedback', '2026-04-15', 3, NULL),
('30000000-0000-0000-0000-000000000002', 'Refined direction (1)', '2026-04-30', 4, NULL),
('30000000-0000-0000-0000-000000000002', 'Final deliverables', '2026-05-31', 5, NULL),
('30000000-0000-0000-0000-000000000002', 'Brand guidelines document', '2026-06-15', 6, NULL);

-- Deliverables for active engagement
INSERT INTO engagement_deliverables (engagement_id, title, sort_order) VALUES
('30000000-0000-0000-0000-000000000002', 'Visual identity system (logo, color, typography)', 1),
('30000000-0000-0000-0000-000000000002', 'Signage design specifications', 2),
('30000000-0000-0000-0000-000000000002', 'Marketing collateral templates (4)', 3),
('30000000-0000-0000-0000-000000000002', 'Brand guidelines PDF', 4);

-- Activity log for active engagement
INSERT INTO engagement_activity (engagement_id, actor, action, detail, created_at) VALUES
('30000000-0000-0000-0000-000000000002', 'system', 'Engagement created', 'Cultural District Branding — Maya Chen ↔ City of Bentonville', '2026-02-28 10:00:00'),
('30000000-0000-0000-0000-000000000002', 'practitioner', 'Milestone completed', 'Kickoff and stakeholder research', '2026-03-14 16:00:00'),
('30000000-0000-0000-0000-000000000002', 'practitioner', 'Milestone completed', 'Concept directions (3)', '2026-03-29 14:00:00'),
('30000000-0000-0000-0000-000000000002', 'practitioner', 'File uploaded', '3 concept directions — presented to Cultural District stakeholder group', '2026-03-29 14:30:00');

-- Completed engagement activity
INSERT INTO engagement_activity (engagement_id, actor, action, detail, created_at) VALUES
('30000000-0000-0000-0000-000000000001', 'system', 'Engagement created', 'Community Wayfinding Signage — James Torres ↔ Crystal Bridges', '2025-09-28 10:00:00'),
('30000000-0000-0000-0000-000000000001', 'practitioner', 'Milestone completed', 'Site survey and design concepts', '2025-10-15 12:00:00'),
('30000000-0000-0000-0000-000000000001', 'funder', 'Payment processed', 'Midpoint payment: $6,000', '2025-11-20 09:00:00'),
('30000000-0000-0000-0000-000000000001', 'practitioner', 'Deliverable submitted', 'All 6 signs fabricated and installed', '2026-01-10 15:00:00'),
('30000000-0000-0000-0000-000000000001', 'funder', 'Deliverable accepted', 'Installation confirmed and approved', '2026-01-14 11:00:00'),
('30000000-0000-0000-0000-000000000001', 'practitioner', 'Completion confirmed', NULL, '2026-01-15 10:00:00'),
('30000000-0000-0000-0000-000000000001', 'funder', 'Completion confirmed', NULL, '2026-01-15 14:00:00'),
('30000000-0000-0000-0000-000000000001', 'system', 'Engagement completed', 'Investment entry created in practice toolkit', '2026-01-15 14:00:01'),
('30000000-0000-0000-0000-000000000001', 'funder', 'Payment processed', 'Final payment: $6,000', '2026-02-10 09:00:00');


-- ──────────────────────────────────────────
-- FLOAT FUND (initial capitalization)
-- ──────────────────────────────────────────

INSERT INTO float_fund_transactions (transaction_type, amount, balance_after, notes) VALUES
('capitalization', 50000, 50000, 'Initial float fund capitalization — philanthropic investment for payment acceleration infrastructure');


-- ============================================================
-- DONE
-- ============================================================
