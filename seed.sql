-- ============================================================
-- SEED DATA: NWA PROTOTYPE — FULL DEMO
-- ============================================================
-- Run AFTER schema.sql. This replaces the minimal seed data
-- with a comprehensive dataset that shows every tool at capacity.
-- ============================================================

-- Clear existing seed data
DELETE FROM activity_log;
DELETE FROM output_references;
DELETE FROM submissions;
DELETE FROM opportunity_tags;
DELETE FROM investment_tags;
DELETE FROM organization_tags;
DELETE FROM precedent_tags;
DELETE FROM tags;
DELETE FROM narratives;
DELETE FROM outputs;
DELETE FROM opportunities;
DELETE FROM precedents;
DELETE FROM decision_dependencies;
DELETE FROM decisions;
DELETE FROM investments;
DELETE FROM org_relationships;
DELETE FROM contacts;
DELETE FROM practitioners;
DELETE FROM organizations;
DELETE FROM ecosystems;


-- ──────────────────────────────────────────
-- ECOSYSTEM
-- ──────────────────────────────────────────

INSERT INTO ecosystems (id, name, slug, description, region) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Northwest Arkansas', 'nwa', 'Cultural ecosystem spanning Bentonville, Fayetteville, Rogers, and Springdale. A region with significant institutional investment in arts and culture, emerging creative communities, and a structural gap between the money being spent and the coherent cultural identity forming.', 'Northwest Arkansas, USA');


-- ──────────────────────────────────────────
-- ORGANIZATIONS (14)
-- ──────────────────────────────────────────

INSERT INTO organizations (id, ecosystem_id, name, org_type, mandate, controls, constraints, decision_cycle, website, notes) VALUES

-- Foundations & Intermediaries
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'CACHE', 'intermediary',
 'Advance NWA creative economy through grants, programs, and advocacy. Primary intermediary between funders and creative practitioners.',
 'Annual grant allocation (~$2M), creative economy programming, advocacy agenda, creative economy data/research',
 'Dependent on foundation funding, limited staff capacity (8 FTE), broad mandate relative to resources',
 'Annual grant cycle (applications Q1, awards Q2). Board meets quarterly. Strategic plan review every 3 years.',
 'https://cachecreate.org', 'Key connector in the ecosystem. Grant program is the most visible direct-to-practitioner funding mechanism. Recent leadership transition.'),

('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Walton Family Foundation', 'foundation',
 'Community development, education, and environmental stewardship in NWA. Largest philanthropic force in the region.',
 'Significant capital for arts, culture, and placemaking (~$10M+ annually in cultural adjacencies). Drives major infrastructure and planning initiatives.',
 'Board-driven, long planning cycles, strong preference for systemic interventions over individual grants, sensitive to perception of outsized influence',
 'Rolling proposals, annual strategic review in Q4. Program officer discretion within approved strategy areas.',
 'https://waltonfamilyfoundation.org', 'De facto agenda-setter for regional cultural strategy. Their priorities shape what other funders do.'),

('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Arkansas Arts Council', 'government',
 'State-level arts funding and advocacy. Distributes NEA partnership funds and state appropriations.',
 'State arts grants ($500K-$1M annually to NWA organizations), technical assistance, advocacy at state level',
 'State budget politics, limited staff, statewide mandate dilutes NWA focus, bureaucratic application process',
 'Annual grant cycle (applications Sept, awards Jan). State budget cycle aligns with legislative session.',
 'https://arkansasarts.org', 'Important but secondary funder. Often duplicates CACHE grant categories without coordination.'),

-- Cultural Institutions
('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Crystal Bridges Museum of American Art', 'cultural_institution',
 'Welcome all to celebrate the power of art, nature, and architecture. Flagship cultural institution of NWA.',
 'Exhibition programming, residencies, community programs, significant earned + endowed revenue, 200+ staff, trail system, event spaces',
 'Institutional scale and pace, curatorial independence, national reputation to maintain, tension between community service and national ambition',
 'Exhibition calendar planned 18-24 months out. Community programming quarterly. Residency applications annual.',
 'https://crystalbridges.org', 'Dominant cultural institution. Defines external perception of NWA arts scene. Community programs are strong but institution''s gravity can overshadow smaller players.'),

('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'The Momentary', 'cultural_institution',
 'Contemporary art and performance space. Crystal Bridges'' sister institution focused on contemporary and emerging work.',
 'Contemporary exhibitions, performance programming, residencies, food/beverage operations, event venue',
 'Linked to Crystal Bridges governance, still defining distinct identity, programming skews toward national/international artists',
 'Programming planned 6-12 months out. Residency cycle annual.',
 'https://themomentary.org', 'Has potential to be the bridge between institutional and grassroots creative community but hasn''t fully realized that role.'),

('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'TheatreSquared', 'cultural_institution',
 'Professional theatre serving NWA and broader region. One of the few performing arts institutions with national recognition.',
 'Season programming (6-8 productions), education programs, community partnerships, new facility',
 'Earned revenue dependency, facility capacity, audience development in a region without strong theatre tradition',
 'Season planning 12-18 months ahead. Education programming annually. Capital campaign active.',
 'https://theatre2.org', 'Successfully built audience in a non-traditional theatre market. New facility expanding capacity. Model for institutional growth in NWA.'),

('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'Bentonville Film Festival', 'cultural_institution',
 'Annual film festival focused on diverse storytelling. National visibility for NWA as a cultural destination.',
 'Festival programming, filmmaker networking, year-round screening events, corporate partnerships',
 'Revenue concentrated in festival week, limited year-round programming budget, dependent on corporate sponsorship',
 'Festival planning 12 months out. Sponsorship cycle begins Q3 prior year.',
 'https://bentonvillefilm.org', 'Strong brand, national reach. But year-round impact on local creative economy is limited. Festival energy doesn''t translate to sustained production ecosystem.'),

-- Government
('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'City of Bentonville', 'government',
 'Economic development, quality of life, infrastructure for residents. Cultural investment through placemaking and district development.',
 'Zoning, permits, public space, cultural district designation, municipal budget allocation (~$500K cultural line items), public art program',
 'Political cycles, competing priorities, limited cultural affairs staff (1.5 FTE), council turnover',
 'Annual budget cycle (deliberation Aug-Oct, finalized Nov). Public art commissions ad hoc. Cultural district planning ongoing.',
 'https://bentonvillear.com', 'Cultural district designation is the current major initiative. Public art program has been uneven — strong production quality but criticized for favoring non-local artists.'),

('b0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'City of Fayetteville', 'government',
 'Cultural affairs, economic development, and quality of life. Historically stronger grassroots creative scene than Bentonville.',
 'Cultural affairs office, public art fund, Fayetteville Town Center programming, Parks & Rec cultural programs',
 'Smaller budget than Bentonville, university town dynamics (transient population), less foundation investment',
 'Annual budget cycle. Cultural affairs programming seasonal. Public art fund replenished annually.',
 'https://fayetteville-ar.gov', 'More organic creative community than Bentonville. University of Arkansas drives a lot of cultural activity. Less institutional investment but more practitioner density per capita.'),

-- Corporate
('b0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'Walmart Inc. / Walmart Foundation', 'corporate',
 'Community investment, associate engagement, brand positioning in home market. Largest employer and economic presence in NWA.',
 'Corporate sponsorships, foundation grants, in-kind support, significant convening power, associate volunteer programs',
 'Corporate governance, PR sensitivity, associate-focus mandate, decisions made at multiple levels (corporate, foundation, local)',
 'Foundation grants quarterly. Corporate sponsorships rolling. Annual giving strategy set in Q4.',
 'https://walmart.org', 'Enormous but diffuse cultural footprint. Foundation grants tend toward workforce and education. Corporate sponsorships skew toward events. No unified cultural investment strategy.'),

-- Education
('b0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', 'University of Arkansas', 'education',
 'Public research university. School of Art, Music, Theatre anchor creative education in NWA.',
 'Degree programs, faculty expertise, performance venues, galleries, student pipeline, research capacity',
 'Academic calendar and governance, faculty tenure system, enrollment-driven funding, limited community engagement mandate',
 'Academic year planning. Program reviews on 5-year cycle. Facility decisions tied to capital campaigns.',
 'https://uark.edu', 'Major talent pipeline but weak connection between graduating students and NWA creative economy. Most graduates leave the region.'),

-- Community / Infrastructure
('b0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000001', 'Downtown Bentonville Inc.', 'nonprofit',
 'Downtown development, small business support, and placemaking. Manages the Bentonville square programming.',
 'Square programming, First Friday events, small business grants, downtown marketing, merchant coordination',
 'Limited budget, volunteer board, dependent on city and foundation support, programming capacity constrained',
 'Programming planned quarterly. Budget annual. First Friday year-round.',
 NULL, 'Important connector at street level. First Friday is one of the few regular moments where institutional and grassroots creative communities intersect.'),

('b0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000001', 'NWA Council', 'nonprofit',
 'Regional coordination across NWA cities. Transportation, economic development, workforce.',
 'Regional planning, data/research, convening across municipal boundaries, federal grant applications',
 'No direct cultural mandate, advisory role, dependent on member city buy-in',
 'Strategic plan updates biannual. Regional forums quarterly.',
 'https://nwacouncil.org', 'Has the regional coordination mandate but not the cultural expertise. Could be an important partner if cultural architecture becomes part of regional strategy.'),

('b0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000001', 'The Record / Meteor Guitar Gallery', 'cultural_institution',
 'Live music venue and community gathering space in Bentonville. One of the few dedicated music venues in the region.',
 'Live programming (3-4 shows/week), private events, emerging artist showcases',
 'Revenue-dependent, small capacity (150), owner-operated, no institutional backing',
 'Programming monthly. Season loosely aligned with weather/tourism patterns.',
 NULL, 'Grassroots venue doing important work with almost no institutional support. Representative of the gap between institutional cultural investment and ground-level creative infrastructure.');


-- ──────────────────────────────────────────
-- CONTACTS (20)
-- ──────────────────────────────────────────

INSERT INTO contacts (organization_id, name, title, role_description, is_decision_maker) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Sample: CACHE Executive Director', 'Executive Director', 'Sets organizational strategy, manages board relationships, final approval on grants', true),
  ('b0000000-0000-0000-0000-000000000001', 'Sample: CACHE Program Manager', 'Program Manager', 'Manages grant application process, community outreach, data collection', false),
  ('b0000000-0000-0000-0000-000000000001', 'Sample: CACHE Board Chair', 'Board Chair', 'Governs strategic direction, fundraising relationships with major foundations', true),
  ('b0000000-0000-0000-0000-000000000002', 'Sample: WFF Program Officer', 'Program Officer, Arts & Culture', 'Evaluates proposals, manages active grants, recommends to board', true),
  ('b0000000-0000-0000-0000-000000000002', 'Sample: WFF Senior Director', 'Senior Director, Community', 'Sets program area strategy, budget allocation across arts/culture/placemaking', true),
  ('b0000000-0000-0000-0000-000000000003', 'Sample: AAC Director', 'Executive Director', 'Statewide arts strategy, NEA partnership management', true),
  ('b0000000-0000-0000-0000-000000000004', 'Sample: CB Director of Community', 'Director of Community Programs', 'Community programming strategy, residency program, local partnerships', true),
  ('b0000000-0000-0000-0000-000000000004', 'Sample: CB Chief Curator', 'Chief Curator', 'Exhibition programming, artist relationships, collection development', true),
  ('b0000000-0000-0000-0000-000000000005', 'Sample: Momentary Director', 'Director', 'Programming, identity, community positioning', true),
  ('b0000000-0000-0000-0000-000000000006', 'Sample: T2 Artistic Director', 'Artistic Director', 'Season selection, artistic vision, community partnerships', true),
  ('b0000000-0000-0000-0000-000000000006', 'Sample: T2 Managing Director', 'Managing Director', 'Business operations, fundraising, capital campaign', true),
  ('b0000000-0000-0000-0000-000000000007', 'Sample: BFF Executive Director', 'Executive Director', 'Festival programming, sponsorship strategy, year-round initiatives', true),
  ('b0000000-0000-0000-0000-000000000008', 'Sample: Bentonville Mayor', 'Mayor', 'Budget priorities, cultural district designation, public appointments', true),
  ('b0000000-0000-0000-0000-000000000008', 'Sample: Bentonville Cultural Liaison', 'Cultural Affairs Liaison', 'Day-to-day cultural policy, public art program coordination, stakeholder communication', false),
  ('b0000000-0000-0000-0000-000000000008', 'Sample: Bentonville Council Member', 'Council Member, Ward 2', 'Budget votes, district advocacy, constituent representation. Champion of cultural investment.', true),
  ('b0000000-0000-0000-0000-000000000009', 'Sample: Fayetteville Cultural Affairs', 'Cultural Affairs Director', 'Fayetteville cultural programming, public art, artist liaison', true),
  ('b0000000-0000-0000-0000-000000000010', 'Sample: Walmart Foundation PO', 'Program Officer, Community', 'Evaluates community investment proposals, manages workforce development grants', true),
  ('b0000000-0000-0000-0000-000000000010', 'Sample: Walmart Corporate Relations', 'Director, NWA Community Relations', 'Corporate sponsorship decisions, local partnership approvals', true),
  ('b0000000-0000-0000-0000-000000000011', 'Sample: UA School of Art Director', 'Director, School of Art', 'Program direction, community partnerships, student pipeline initiatives', true),
  ('b0000000-0000-0000-0000-000000000012', 'Sample: DBI Executive Director', 'Executive Director', 'Downtown programming, merchant relationships, square activation', true);


-- ──────────────────────────────────────────
-- ORG RELATIONSHIPS (15)
-- ──────────────────────────────────────────

INSERT INTO org_relationships (org_a_id, org_b_id, relationship_type, description, strength) VALUES
  -- Funding relationships
  ('b0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'funds', 'WFF is CACHE''s largest funder. Provides operating support and program-specific grants.', 'strong'),
  ('b0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000004', 'funds', 'WFF funds Crystal Bridges programs. Historically the founding funder.', 'strong'),
  ('b0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000008', 'funds', 'WFF funds downtown placemaking and cultural district planning through city partnership.', 'moderate'),
  ('b0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000004', 'funds', 'Walmart Foundation supports Crystal Bridges education programs.', 'strong'),
  ('b0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000007', 'funds', 'Walmart is primary corporate sponsor of BFF.', 'strong'),
  ('b0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'funds', 'AAC provides state arts funding to CACHE as a sub-granting partner.', 'moderate'),
  ('b0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000006', 'funds', 'AAC provides annual operating support to TheatreSquared.', 'moderate'),
  -- Partnerships
  ('b0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000006', 'partners_with', 'CACHE and T2 collaborate on education programming and creative workforce initiatives.', 'moderate'),
  ('b0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000008', 'partners_with', 'CACHE advises City of Bentonville on cultural policy. Informal relationship.', 'moderate'),
  ('b0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000005', 'governed_by', 'Momentary is a Crystal Bridges initiative. Shared governance and staff overlap.', 'strong'),
  ('b0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000011', 'partners_with', 'Crystal Bridges and UA collaborate on exhibitions, internships, and research.', 'moderate'),
  ('b0000000-0000-0000-0000-000000000012', 'b0000000-0000-0000-0000-000000000008', 'partners_with', 'DBI coordinates with city on downtown programming and placemaking.', 'strong'),
  ('b0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000004', 'partners_with', 'BFF uses Crystal Bridges/Momentary as festival venues. Cross-promotion.', 'moderate'),
  ('b0000000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000006', 'partners_with', 'UA theatre program provides student talent pipeline to TheatreSquared.', 'weak'),
  ('b0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000013', 'partners_with', 'CACHE provides cultural economy data to NWA Council for regional planning.', 'weak');


-- ──────────────────────────────────────────
-- PRACTITIONERS (12)
-- ──────────────────────────────────────────

INSERT INTO practitioners (ecosystem_id, name, discipline, tenure, income_sources, retention_factors, risk_factors, institutional_affiliations, notes) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Sample: Visual Artist A', 'Painting / Installation', '6 years in NWA', 'Gallery sales (30%), CACHE grants (20%), teaching at UA (40%), commissions (10%)', 'Affordable studio space, Crystal Bridges artist community, partner employed at Walmart', 'Studio lease increasing 15% this year, limited commercial gallery infrastructure, no secondary market', 'Crystal Bridges community artist, UA adjunct', 'Considering relocating to Kansas City if studio costs continue rising. Has shown at CB community gallery twice.'),
  ('a0000000-0000-0000-0000-000000000001', 'Sample: Musician B', 'Production / Performance', '3 years in NWA', 'Live performance (50%), session work (20%), teaching (30%)', 'Cost of living, emerging music scene, partner''s job', 'Limited venue infrastructure, no recording studio ecosystem, touring requires leaving region for weeks at a time', 'Occasional Momentary performer', 'Part of a cohort of 5-6 musicians who moved to NWA in 2022-2023. Two have already left.'),
  ('a0000000-0000-0000-0000-000000000001', 'Sample: Designer C', 'Graphic / Brand Design', '8 years in NWA', 'Freelance for regional clients (60%), Walmart vendor work (30%), CACHE projects (10%)', 'Family ties, homeownership, established client base', 'Corporate client concentration (Walmart ecosystem accounts for 80%+ of income), limited creative community of peers', 'None formal', 'Would benefit from a design-specific community or co-working space. Currently works from home and feels isolated from other creatives.'),
  ('a0000000-0000-0000-0000-000000000001', 'Sample: Filmmaker D', 'Documentary / Commercial', '2 years in NWA', 'BFF adjacent work (40%), freelance commercial (50%), personal projects (10%)', 'BFF network, lower cost than LA/NYC, Crystal Bridges production opportunities', 'Insufficient year-round production work, no post-production infrastructure, crew base is thin', 'BFF filmmaker network', 'Moved from LA specifically for BFF connection. Struggling to find consistent work outside festival season. May return to LA.'),
  ('a0000000-0000-0000-0000-000000000001', 'Sample: Ceramicist E', 'Ceramics / Sculpture', '10 years in NWA', 'Studio sales (40%), commissions (25%), workshops (25%), grants (10%)', 'Own studio space, community of practice (3-4 other ceramicists), regional collector base', 'Collector base not growing, limited exhibition opportunities beyond Crystal Bridges community gallery', 'CACHE grant recipient (3x), Crystal Bridges community artist', 'One of the more established practitioners. Considering opening a shared studio/teaching space but needs investment.'),
  ('a0000000-0000-0000-0000-000000000001', 'Sample: Writer/Poet F', 'Literary Arts', '4 years in NWA', 'University position (70%), readings/workshops (15%), publishing (15%)', 'UA tenure-track position, low cost of living, NWA literary community', 'Literary scene is small, limited publishing infrastructure in the region, national literary community is elsewhere', 'UA Department of English', 'Active in building a literary reading series. Connected to UA but wants more community-facing programming.'),
  ('a0000000-0000-0000-0000-000000000001', 'Sample: Muralist G', 'Murals / Public Art', '5 years in NWA', 'Commissions (70%), CACHE grants (15%), freelance design (15%)', 'Consistent public art commission pipeline, affordable living, growing reputation regionally', 'City public art program has favored outside artists for high-profile projects, income feast-or-famine with commission cycle', 'DBI First Friday participant', 'Vocal about public art selection process. Has been passed over for two major city commissions in favor of non-local artists.'),
  ('a0000000-0000-0000-0000-000000000001', 'Sample: Dancer/Choreographer H', 'Dance / Movement', '1 year in NWA', 'Teaching (60%), performance (20%), choreography commissions (20%)', 'Momentary performance opportunities, cost of living', 'No dedicated dance company in NWA, limited rehearsal space, no presenter infrastructure', 'Momentary residency alum', 'Newest practitioner in the sample. Testing whether NWA can support a dance career. The answer so far is not without institutional subsidy.'),
  ('a0000000-0000-0000-0000-000000000001', 'Sample: Photographer I', 'Photography / Media', '7 years in NWA', 'Commercial photography (50%), editorial (20%), gallery sales (15%), teaching (15%)', 'Established commercial client base, studio lease, creative community connections', 'Commercial work crowds out art practice, gallery infrastructure weak, no photography-specific exhibition venues', 'CACHE board member, UA adjunct', 'Interesting case: successful commercially but frustrated artistically. Represents a category of practitioner whose economic stability masks creative infrastructure gaps.'),
  ('a0000000-0000-0000-0000-000000000001', 'Sample: Music Producer J', 'Music Production / Audio', '3 years in NWA', 'Remote production clients (70%), local sessions (20%), live sound (10%)', 'Remote work flexibility makes NWA cost of living advantageous, emerging music scene', 'Almost no local production infrastructure, professional studio space non-existent, nearest professional studio is in Tulsa or Little Rock', 'None', 'Can sustain income through remote work but NWA gets almost no benefit from their presence. No local studio means no local production ecosystem developing.'),
  ('a0000000-0000-0000-0000-000000000001', 'Sample: Theater Artist K', 'Acting / Directing', '4 years in NWA', 'TheatreSquared contracts (50%), teaching (30%), film extra work (20%)', 'TheatreSquared season provides consistent work, community, UA connection', 'T2 is essentially the only professional theatre employer, no fringe/independent scene, limited directing opportunities', 'TheatreSquared company member, UA guest lecturer', 'Career is viable only because of T2. If T2 reduced season or changed direction, this practitioner would likely leave.'),
  ('a0000000-0000-0000-0000-000000000001', 'Sample: Architect/Designer L', 'Architecture / Spatial Design', '12 years in NWA', 'Architecture firm (80%), cultural consulting (15%), personal projects (5%)', 'Firm partnership, family, deep community roots', 'Cultural consulting work is sporadic, no formal connection between architecture community and cultural planning', 'NWA AIA chapter, informal CACHE advisor', 'Long-tenured, well-connected, but operates in a silo from the creative practitioner community. Represents the gap between built environment professionals and cultural practitioners.');


-- ──────────────────────────────────────────
-- INVESTMENTS (18)
-- ──────────────────────────────────────────

INSERT INTO investments (id, ecosystem_id, source_org_id, source_name, initiative_name, amount, period, category, status, description, outcome, compounding, compounding_notes) VALUES

-- Compounding chain: CACHE grants cycle
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', NULL, 'Creative Economy Grants - Cycle 1 (2024)', 380000, '2024', 'direct_artist_support', 'completed', 'First full grant cycle under new framework. 28 grants across 5 disciplines.', '28 grants awarded. 85% completion rate. 4 grantees leveraged CACHE funding to secure additional support from other sources.', 'compounding', 'Grantees who received Cycle 1 funding were better positioned for Cycle 2. CACHE data on outcomes informed Cycle 2 priorities.'),

('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', NULL, 'Creative Economy Grants - Cycle 2 (2025)', 450000, 'Q1-Q2 2025', 'direct_artist_support', 'completed', 'Expanded cycle. 32 grants. Increased maximum grant size.', '32 grants awarded across 5 disciplines. Number of unique recipients decreased from Cycle 1 despite higher total. Larger grants concentrating in established organizations.', 'compounding', 'Program is compounding in terms of sophistication and total dollars, but concentration trend is concerning. Fewer unique voices being supported.'),

-- Compounding chain: Cultural district
('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', NULL, 'Downtown Cultural District Planning', 750000, '2024-2025', 'strategic_planning', 'active', 'Comprehensive planning process for Bentonville cultural district designation. External consultant engaged.', 'Community input phase completed. Draft recommendations in development. Final plan expected Q1 2026.', 'too_early', 'Critical moment: if this plan references and builds on the 2019 CACHE strategic plan, it compounds. If it starts fresh (as the consultant was not given the 2019 plan), it resets.'),

-- Public art chain (not compounding)
('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000008', NULL, 'Public Art Installations - Phase 1', 300000, '2021-2022', 'public_art', 'completed', '6 permanent installations across downtown. External curator. 4 of 6 artists non-local.', 'High production quality. Positive media. Strong placemaking impact. Local artists felt excluded from process.', 'not_compounding', 'No documented learnings transferred to Phase 2. Same issues repeated.'),

('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000008', NULL, 'Public Art Installations - Phase 2', 200000, 'Q3 2024', 'public_art', 'completed', '4 installations. 2 of 4 artists non-local. Same curator as Phase 1.', '4 installations completed. Same criticism from local community about artist selection. No change in process from Phase 1.', 'not_compounding', 'Phase 2 repeated Phase 1 without learning. No institutional memory transfer. Muralist G was publicly critical.'),

-- Crystal Bridges investments
('c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004', NULL, 'Artist Residency Expansion', 350000, '2025', 'artist_development', 'active', 'Expanded from 5 to 8 residency slots. Added housing stipend.', '8 residents selected. Stronger regional representation than previous years (5 of 8 from South/Midwest).', 'compounding', 'Expansion built on lessons from previous cohorts. Housing stipend addressed top barrier to participation.'),

('c0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004', NULL, 'Community Art Education Program', 175000, '2024-2025', 'education_training', 'completed', 'Free art workshops in underserved NWA communities. Partnership with school districts.', '1,200 participants across 8 communities. 85% from households below median income. Waitlists at every location.', 'compounding', 'Year 2 built on Year 1 community relationships. Demand significantly exceeds capacity.'),

-- Walmart Foundation
('c0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000010', NULL, 'Creative Workforce Development - Phase 1', 500000, '2024-2025', 'education_training', 'completed', 'Training program for creative sector employment. Partnership with NWA community colleges.', 'Graduated 45 participants. 60% employed in creative sector within 6 months. Program design focused on institutional employment, not independent practice.', 'compounding', 'Strong outcomes for institutional employment pipeline. Less relevant for independent practitioners. Phase 2 should address this gap.'),

-- Music initiative
('c0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', NULL, 'NWA Music Initiative', 175000, 'Q2-Q4 2025', 'sector_development', 'active', 'Pilot initiative to develop NWA music ecosystem. Venue partnerships, showcase events.', 'Venue partnerships with The Record and 2 other spaces established. 3 showcase events completed. Artist fee structure implemented.', 'too_early', 'Promising but too early to assess compounding. Key question: does this create infrastructure that outlasts the grant period?'),

-- TheatreSquared capital campaign
('c0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', NULL, 'Private donors (aggregated)', 'TheatreSquared Capital Campaign', 1200000, '2023-2025', 'institutional_capacity', 'active', 'New facility construction and endowment building.', 'Facility 70% funded. Construction timeline on track. Endowment component lagging.', 'compounding', 'New facility will expand capacity for programming, education, and community use. If endowment falls short, operating costs become a sustainability risk.'),

-- Walton placemaking
('c0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', NULL, 'NWA Trail System - Cultural Nodes', 400000, '2025', 'infrastructure', 'active', 'Adding cultural programming nodes along NWA trail system. Art installations, performance spaces, gathering areas.', 'Design phase complete. 3 of 7 nodes in construction. Artist selection for permanent installations underway.', 'too_early', 'Infrastructure investment with cultural overlay. Compounds if programming and maintenance are funded long-term. Risks becoming physical infrastructure without cultural activation.'),

-- Fayetteville
('c0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000009', NULL, 'Fayetteville Public Art Fund', 120000, '2025', 'public_art', 'active', 'Annual municipal fund for public art. Artist selection by local committee with community input.', 'Funded 6 projects in 2025. All local or regional artists. Community selection process seen as more inclusive than Bentonville model.', 'compounding', 'Fayetteville model compounds through community trust and local artist investment. Direct contrast with Bentonville approach.'),

-- State level
('c0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', NULL, 'Arkansas Arts Council - NWA Operating Grants', 280000, '2025', 'direct_artist_support', 'completed', 'Annual operating support to NWA cultural organizations. 12 recipients.', '12 organizations received operating support. Largely overlaps with CACHE grant recipients. No coordination between AAC and CACHE on recipient selection.', 'not_compounding', 'Duplication without coordination. AAC and CACHE fund many of the same organizations without a shared view of what the ecosystem needs.'),

-- Walmart corporate sponsorship
('c0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000010', NULL, 'Walmart - BFF Title Sponsorship', 350000, '2025', 'programming', 'completed', 'Annual title sponsorship of Bentonville Film Festival.', 'Festival held successfully. 15,000 attendees. National media coverage. Economic impact concentrated in festival week.', 'not_compounding', 'Sponsorship renews annually without evolving. Same format, same impact pattern. Not building toward year-round film ecosystem.'),

-- DBI
('c0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000012', NULL, 'First Friday Enhancement Program', 35000, '2025', 'programming', 'completed', 'Enhanced programming for monthly First Friday events. Artist fees, equipment, marketing.', 'Attendance up 40% year-over-year. 6 new artist vendors. First Friday becoming primary touchpoint between institutional and grassroots creative communities.', 'compounding', 'Small investment with outsized impact. First Friday is one of the few moments where the ecosystem is visible to itself.'),

-- UA
('c0000000-0000-0000-0000-000000000016', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000011', NULL, 'UA Creative Careers Initiative', 90000, '2025', 'education_training', 'active', 'Program to connect graduating arts students with NWA creative economy opportunities.', 'Pilot year. 20 students enrolled. Mentorship matches with local practitioners. Job placement rate TBD.', 'too_early', 'If successful, directly addresses the talent pipeline problem. Most UA arts graduates currently leave NWA.'),

-- Momentary
('c0000000-0000-0000-0000-000000000017', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005', NULL, 'Momentary Performance Series', 200000, '2025', 'programming', 'active', 'Year-round performance programming featuring regional and national artists.', '12 performances staged. 60% featured regional artists (up from 30% in 2024). Audience diversification improving.', 'compounding', 'Shift toward regional artists is a positive compounding signal. Creating performance opportunities that didn''t exist before.'),

-- CACHE data/research
('c0000000-0000-0000-0000-000000000018', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', NULL, 'NWA Creative Economy Census', 85000, '2025', 'strategic_planning', 'completed', 'Comprehensive data collection on NWA creative economy. Practitioner survey, organizational mapping, economic impact.', 'Survey completed. 340 practitioner responses. Report published. Data shows practitioner income declining in real terms despite rising institutional investment.', 'compounding', 'First rigorous dataset on the gap between institutional investment and practitioner experience. Critical evidence base for cultural architecture work.');

-- Link compounding chains
UPDATE investments SET builds_on_id = 'c0000000-0000-0000-0000-000000000001' WHERE id = 'c0000000-0000-0000-0000-000000000002';
UPDATE investments SET led_to_id = 'c0000000-0000-0000-0000-000000000002' WHERE id = 'c0000000-0000-0000-0000-000000000001';
UPDATE investments SET builds_on_id = 'c0000000-0000-0000-0000-000000000004' WHERE id = 'c0000000-0000-0000-0000-000000000005';
UPDATE investments SET led_to_id = 'c0000000-0000-0000-0000-000000000005' WHERE id = 'c0000000-0000-0000-0000-000000000004';


-- ──────────────────────────────────────────
-- DECISIONS (8)
-- ──────────────────────────────────────────

INSERT INTO decisions (id, ecosystem_id, stakeholder_org_id, decision_title, description, deliberation_start, deliberation_end, locks_date, status, dependencies, intervention_needed, is_recurring, recurrence_pattern) VALUES

('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001',
 '2026 Grant Cycle Priorities',
 'CACHE board sets strategic priorities for 2026 grant cycle. Determines which disciplines, project types, and applicant categories receive emphasis.',
 '2026-01-15', '2026-02-28', '2026-03-15', 'deliberating',
 'Should reference Walton cultural district plan findings. Should address concentration trend identified in Cycle 2 outcomes.',
 'Directional brief needed before Feb board meeting. Brief should surface: concentration trend in Cycle 2, practitioner census data on income decline, and overlap with AAC grants.',
 true, 'Annual, Q1'),

('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000008',
 'FY2027 Cultural Budget Allocation',
 'City of Bentonville sets cultural spending for next fiscal year. Includes public art program, cultural district funding, and cultural affairs staffing.',
 '2026-08-01', '2026-10-31', '2026-11-15', 'upcoming',
 'Cultural district plan should be finalized by then. Public art Phase 2 criticism should inform Phase 3 approach.',
 'Present ecosystem investment view before deliberation begins. Show the full picture of what the city is spending relative to what foundations and institutions are spending.',
 true, 'Annual, Aug-Nov'),

('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002',
 'Q4 Strategic Review - Cultural Investment',
 'WFF annual review of cultural investment strategy. Determines program area emphasis and budget for next year.',
 '2026-10-01', '2026-11-30', '2026-12-15', 'upcoming',
 'Downtown cultural district plan should be complete. CACHE creative economy census data should be in hand.',
 'Ensure district plan findings and census data reach WFF program officers before review. They need to see the gap between institutional investment growth and practitioner income decline.',
 true, 'Annual, Q4'),

('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004',
 '2027 Community Programming Slate',
 'Crystal Bridges sets community programming priorities and budget for 2027.',
 '2026-03-01', '2026-05-31', '2026-06-15', 'deliberating',
 'Should align with CACHE grant cycle to avoid duplication. Residency expansion outcomes should inform community program design.',
 'Share ecosystem map showing current programming gaps. Specifically: performance and music are underserved relative to visual arts.',
 true, 'Annual, Q1-Q2'),

('d0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000010',
 'Creative Workforce Development Phase 2',
 'Walmart Foundation decides whether to fund Phase 2 of creative workforce program and what design changes to make.',
 '2026-04-01', '2026-06-30', '2026-09-01', 'upcoming',
 'Phase 1 outcomes should inform design. Key learning: Phase 1 focused on institutional employment but most creative practitioners are independent.',
 'Precedent archive entry on Phase 1 needs to reach decision-makers. Recommend Phase 2 include independent practitioner track.',
 false, NULL),

('d0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000008',
 'Public Art Phase 3 Approach',
 'City decides approach for Phase 3 of public art program. Artist selection process, local vs. non-local balance, community input.',
 '2026-05-01', '2026-07-31', '2026-08-15', 'upcoming',
 'Phase 1 and Phase 2 precedent entries are critical. Fayetteville public art model provides alternative approach for comparison.',
 'Deliver precedent comparison: Bentonville Phases 1-2 vs. Fayetteville model. Make the case for transparent selection with local priority.',
 false, NULL),

('d0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000007',
 'BFF Year-Round Programming Strategy',
 'BFF board evaluates whether to invest in year-round programming beyond the annual festival.',
 '2026-06-01', '2026-08-31', '2026-09-30', 'upcoming',
 'NWA Music Initiative outcomes (similar sector development challenge) should inform approach. Filmmaker D practitioner data relevant.',
 'Share precedent entry on BFF institutional partnership model, highlighting year-round sustainability gap. Include practitioner data on filmmaker retention.',
 false, NULL),

('d0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000011',
 'UA Creative Careers Initiative - Year 2 Decision',
 'University decides whether to continue and expand the Creative Careers Initiative based on pilot year results.',
 '2026-09-01', '2026-11-30', '2026-12-01', 'upcoming',
 'Pilot year placement data needed. Should reference broader practitioner retention data from CACHE census.',
 'Provide CACHE census data on talent pipeline problem (most UA graduates leave NWA). Show how this initiative addresses it.',
 false, NULL);

-- Decision Dependencies (actual linked records)
INSERT INTO decision_dependencies (decision_id, depends_on_id, description) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000004', 'CACHE grant priorities should align with Crystal Bridges programming to avoid duplication'),
  ('d0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000006', 'Cultural budget should account for Phase 3 public art approach decision'),
  ('d0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000002', 'WFF strategic review should account for city cultural budget decisions'),
  ('d0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000001', 'Phase 2 design should consider CACHE grant cycle priorities for alignment');


-- ──────────────────────────────────────────
-- PRECEDENTS (7)
-- ──────────────────────────────────────────

INSERT INTO precedents (ecosystem_id, name, period, involved, description, what_produced, what_worked, what_didnt, connects_to, takeaway, investment_id) VALUES

('a0000000-0000-0000-0000-000000000001',
 'NWA Creative Economy Strategic Plan (2019)', '2018-2019',
 'CACHE (commissioned), External consulting firm, Regional stakeholders (120+ in input process)',
 'Comprehensive strategic plan for NWA creative economy. CACHE''s first attempt at ecosystem-level planning.',
 '50-page strategic plan with 12 recommendations across 4 pillars: talent, place, economy, infrastructure.',
 'Strong community engagement process. 120+ stakeholders participated. Good baseline data collection on creative economy size. Built community awareness that creative economy exists as a concept.',
 'Recommendations were too broad to sequence — everything was a priority, so nothing was. No implementation tracking mechanism built in. No one assigned to monitor progress. Plan was referenced briefly in 2019-2020 then shelved. No follow-up assessment was ever conducted. When WFF commissioned the cultural district plan in 2024, the consultant was not given this document.',
 'Walton downtown cultural district plan (2024) was commissioned without documented reference to this plan. Several recommendations overlap word-for-word. CACHE creative economy census (2025) captures some of the same baseline data, suggesting the 2019 baseline was lost.',
 'Comprehensive plans without implementation tracking and sequencing logic get shelved. Next plan needs: fewer recommendations, built-in accountability, explicit sequencing, and a mechanism for transferring learnings to the next planning cycle.',
 NULL),

('a0000000-0000-0000-0000-000000000001',
 'Bentonville Film Festival - Institutional Partnership Model', '2015-present',
 'BFF, Crystal Bridges, Walmart (title sponsor), City of Bentonville, local businesses, filmmaker community',
 'Annual film festival that built national visibility for NWA as a cultural destination.',
 'Annual festival with national media coverage, 15,000+ attendees, filmmaker networking events, limited year-round screening program.',
 'Strong brand identity that transcends NWA. Clear programming mandate focused on inclusive storytelling. Corporate sponsorship model that doesn''t compromise creative direction. Successfully positioned NWA in national cultural conversation.',
 'Year-round economic impact for local film practitioners remains limited. Festival energy doesn''t translate to sustained production ecosystem. Most economic benefit concentrated in festival week. Filmmaker D (sample practitioner) moved to NWA for BFF connection but may leave due to insufficient year-round work. No local post-production infrastructure has developed despite 10 years of festival presence.',
 'NWA Music Initiative (2025) attempting similar model for music sector. Should learn from BFF''s year-round sustainability challenge before replicating the pattern.',
 'Tentpole events create visibility but don''t automatically build year-round creative infrastructure. The gap between event energy and ecosystem sustainability needs explicit programming and investment. A festival is not an ecosystem.',
 NULL),

('a0000000-0000-0000-0000-000000000001',
 'Public Art Installations - Phase 1', '2021-2022',
 'City of Bentonville (funded), External curator, 6 artists (4 non-local, 2 regional)',
 'First major public art program for downtown Bentonville.',
 '6 permanent public art installations across downtown corridor. $50K average per installation.',
 'High production quality. Positive media coverage (NYT, regional publications). Strong placemaking impact — installations became landmarks and photo opportunities. Demonstrated city''s willingness to invest in public art.',
 'Majority of artists were non-local, limiting economic impact for NWA practitioners. Selection process was opaque — no public call, curator selected artists directly. No community input on locations or themes. Local artists felt excluded and publicly criticized the process. Muralist G (sample practitioner) was particularly vocal.',
 'Phase 2 (2024) repeated the same pattern — 2 of 4 artists non-local, same curator, same opaque process. No documented learning transfer between phases. Fayetteville''s public art program provides a direct contrast with community selection and local priority.',
 'Public art programs that don''t prioritize local practitioners undermine the creative ecosystem they''re meant to support. Production quality and local investment are not mutually exclusive — Fayetteville proves this. Phase 3 needs explicit local artist requirements, transparent selection, and community input.',
 'c0000000-0000-0000-0000-000000000004'),

('a0000000-0000-0000-0000-000000000001',
 'Creative Workforce Development - Phase 1', '2024-2025',
 'Walmart Foundation (funded), NWA community colleges (delivered), CACHE (advisory), 45 participants',
 'Training program designed to build creative sector employment pipeline.',
 'Graduated 45 participants. 60% employed in creative sector within 6 months. Curriculum covered design, digital media, arts administration, and cultural programming.',
 'Strong completion rate (85%). Employment outcomes exceeded projections. Community college partnership made program accessible to non-traditional students. Walmart Foundation satisfied with ROI metrics.',
 'Program design focused entirely on institutional employment (museums, galleries, theatres, agencies). Did not address independent creative practice at all. The 60% employment rate counts jobs at Walmart, Crystal Bridges, and similar institutions — not independent creative careers. Program didn''t serve the practitioner population that most needs economic support.',
 'Phase 2 decision upcoming. If Phase 2 repeats Phase 1 design, it will further the pattern of investing in institutional capacity while independent practitioners'' income continues declining.',
 'Workforce development programs for the creative sector need to include independent practice, not just institutional employment. The "creative workforce" includes freelancers, studio artists, and independent producers — they are the majority of the creative economy.',
 'c0000000-0000-0000-0000-000000000008'),

('a0000000-0000-0000-0000-000000000001',
 'AAC-CACHE Grant Overlap (2023-2025)', '2023-2025',
 'Arkansas Arts Council, CACHE, NWA cultural organizations (recipients)',
 'Pattern observed across three years of grant-making by AAC and CACHE.',
 'Analysis revealed 70% overlap in organizational recipients between AAC and CACHE grants in NWA. Several organizations received funding from both sources for substantially similar activities.',
 'Both programs individually function well. Application processes are clear. Disbursement is timely.',
 'No coordination between AAC and CACHE on grant-making strategy. Neither organization has visibility into the other''s funding decisions before they''re announced. Result: duplication of support to established organizations while emerging practitioners and organizations compete for a shrinking pool of unique funding.',
 'Connects to the broader pattern of uncoordinated cultural investment in NWA. This is a micro-example of the exact problem cultural architecture is designed to solve.',
 'Funders operating in the same ecosystem without a shared view of where money is going will inevitably duplicate. Coordination doesn''t require merged programs — it requires shared information and aligned timing.',
 NULL),

('a0000000-0000-0000-0000-000000000001',
 'Crystal Bridges Community Artist Program', '2018-present',
 'Crystal Bridges, local artists, community partners',
 'Ongoing program connecting local artists with Crystal Bridges resources and visibility.',
 'Community gallery exhibitions (rotating quarterly), artist talks, workshop opportunities, some supply stipends. ~30 artists in active community artist roster.',
 'Creates a real connection between the institution and local practitioners. Community gallery provides exhibition opportunity that doesn''t exist elsewhere. Artists report feeling valued and connected to something larger.',
 'Limited financial impact — stipends are small, gallery sales are minimal. Program is positioned as community service, not professional development. No pathway from community artist to exhibition in main galleries. Creates a two-tier system: community artists and "real" artists. Some practitioners feel the program is institutional goodwill that doesn''t change their economic reality.',
 'Represents the broader tension between institutional cultural investment and practitioner economic sustainability. Institution provides visibility and community, but not livelihood.',
 'Institutional community programs are valuable for connection but don''t substitute for direct economic support. The gap between "we celebrate local artists" and "local artists can sustain a living" is a structural issue, not a programming one.',
 NULL),

('a0000000-0000-0000-0000-000000000001',
 'Fayetteville Cultural District (2020)', '2019-2020',
 'City of Fayetteville, Fayetteville cultural organizations, UA, community stakeholders',
 'Fayetteville''s process for establishing a cultural district. Completed before Bentonville''s current process began.',
 'Cultural district designated. Zoning benefits for cultural uses. Small dedicated fund for cultural programming in district. Streamlined permitting for cultural events.',
 'Inclusive community process. Strong buy-in from existing cultural organizations. Practical zoning and permitting changes that reduced barriers. Small fund has been consistently used and renewed.',
 'Limited economic impact due to small fund size. District designation alone didn''t attract new cultural investment. Without significant institutional anchors (Fayetteville doesn''t have a Crystal Bridges), the district identity depends on grassroots activity that is fragile.',
 'Bentonville''s current cultural district planning process should study Fayetteville''s outcomes. What worked (inclusive process, practical policy changes) and what was limited (economic impact without anchor investment).',
 'Cultural district designation is a useful policy tool but not sufficient on its own. It enables cultural activity but doesn''t generate it. The Bentonville process has the advantage of anchor institutions that Fayetteville lacked — the question is whether the district plan leverages them for community benefit.',
 NULL);


-- ──────────────────────────────────────────
-- OPPORTUNITIES (12)
-- ──────────────────────────────────────────

INSERT INTO opportunities (ecosystem_id, source_org_id, title, opportunity_type, amount_min, amount_max, amount_description, deadline, deadline_description, eligibility, description, status) VALUES

-- Open
('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'CACHE Creative Economy Micro-Grants', 'grant', 2500, 10000, '$2,500-$10,000', '2026-03-15', NULL, 'NWA-based creative practitioners and organizations', 'Project-based grants for creative work that contributes to NWA cultural ecosystem. Priority areas: community engagement, cross-disciplinary collaboration, underserved communities.', 'open'),

('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004', 'Crystal Bridges Community Art Commission - Trail System', 'commission', 15000, 25000, '$15,000-$25,000', '2026-04-01', NULL, 'Artists working in outdoor/site-specific installation', 'Commission for permanent artwork at cultural nodes along NWA trail system. Part of WFF-funded trail cultural nodes project. Site visits available.', 'open'),

('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000010', 'Walmart Foundation - Creative Workforce Training Partners', 'rfp', 50000, 100000, '$50,000-$100,000', '2026-03-30', NULL, 'Education/training organizations in NWA', 'Seeking partners to deliver Phase 2 of creative workforce development program. New this cycle: independent practitioner track alongside institutional employment track.', 'open'),

('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005', 'Momentary Performing Arts Residency', 'residency', NULL, NULL, 'Stipend + housing + production support', '2026-05-01', NULL, 'Performance artists, interdisciplinary. National.', '4-week residency with public showing. Focus on new work development. Housing, studio, and production support provided.', 'open'),

('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000006', 'TheatreSquared New Works Commission', 'commission', 8000, 15000, '$8,000-$15,000', '2026-04-15', NULL, 'Playwrights at any career stage', 'Commission for new play development. Includes reading, workshop, and potential full production. Housing provided for development periods.', 'open'),

('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000012', 'DBI First Friday Artist Vendor Call', 'project', 200, 500, '$200-$500 per event', NULL, 'Rolling applications', 'NWA-based visual artists, craftspeople, and makers', 'Monthly vendor opportunity at First Friday on the Bentonville Square. Fee covers booth, setup assistance, and promotion.', 'open'),

('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'Arkansas Arts Council Individual Artist Fellowship', 'fellowship', 5000, 5000, '$5,000', '2026-06-01', NULL, 'Arkansas-resident artists in all disciplines', 'Unrestricted fellowship recognizing artistic excellence and professional commitment. Statewide competition.', 'open'),

('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000011', 'UA Artist-in-Residence (School of Art)', 'residency', NULL, NULL, 'Stipend + studio + material budget', '2026-03-01', NULL, 'Mid-career artists, national', 'Semester-long residency with teaching component. Studio, material budget, and housing stipend provided.', 'open'),

-- Closing soon
('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000008', 'Bentonville Cultural District Branding RFP', 'rfp', 45000, 45000, '$45,000', '2026-02-28', NULL, 'Design studios with cultural/civic experience', 'Brand identity for Bentonville Cultural District. Includes visual identity, signage system, marketing collateral, and brand guidelines.', 'closing_soon'),

-- Closed with outcomes (showing lifecycle)
('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'CACHE Creative Economy Grants - Cycle 2', 'grant', 5000, 50000, '$5,000-$50,000', '2025-02-15', NULL, 'NWA-based creative practitioners and organizations', 'Annual competitive grant program. 32 awards made.', 'awarded'),

('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004', 'Crystal Bridges 2025 Residency Cohort', 'residency', NULL, NULL, 'Stipend + housing', '2025-03-01', NULL, 'Artists at any career stage, national', '8 residents selected from 340 applications.', 'awarded'),

('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000008', 'Public Art Phase 2 - Artist Selection', 'commission', 25000, 75000, '$25,000-$75,000', '2024-06-01', NULL, 'Artists working in permanent public installation', '4 artists selected. 2 local, 2 non-local.', 'awarded');

-- Link awarded opportunities to investments
UPDATE opportunities SET awarded_investment_id = 'c0000000-0000-0000-0000-000000000002' WHERE title = 'CACHE Creative Economy Grants - Cycle 2';
UPDATE opportunities SET awarded_investment_id = 'c0000000-0000-0000-0000-000000000006' WHERE title = 'Crystal Bridges 2025 Residency Cohort';
UPDATE opportunities SET awarded_investment_id = 'c0000000-0000-0000-0000-000000000005' WHERE title = 'Public Art Phase 2 - Artist Selection';


-- ──────────────────────────────────────────
-- NARRATIVES (8)
-- ──────────────────────────────────────────

INSERT INTO narratives (ecosystem_id, source_org_id, source_name, source_type, date, narrative_text, reality_text, gap, evidence_notes, source_url, significance) VALUES

('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000008', 'City of Bentonville - Economic Development Office', 'regional_positioning', '2026-01-15',
 'Marketing campaign positions Bentonville as "The Creative Capital of the South." Campaign emphasizes Crystal Bridges, the trail system, tech startup scene, and "thriving creative community."',
 'Investment ledger shows total cultural funding flat year-over-year when adjusted for inflation. Practitioner layer shows net outflow of musicians and filmmakers over 18 months. CACHE census shows practitioner income declining in real terms despite rising institutional investment. The "creative community" the campaign references is primarily institutional employees, not independent practitioners.',
 'high', 'Investment ledger: flat cultural funding. Practitioner data: net outflow in music/film. CACHE census: income decline.', NULL,
 'This narrative is actively shaping public perception and may influence the FY2027 budget deliberation (locks Nov 1). If decision-makers believe the "Creative Capital" story is already true, there is no pressure to increase municipal cultural investment. The gap between marketing narrative and investment reality needs to surface before budget deliberation begins in June. Deliver investment landscape data to Sarah Collins.'),

('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'CACHE Annual Report 2025', 'institutional', '2025-12-01',
 'Reports "record investment in NWA creative economy" and highlights grant program expansion. Emphasizes reach across disciplines and growing total dollars.',
 'Total grant dollars increased but number of unique recipients decreased from Cycle 1 to Cycle 2. Larger grants concentrating in established organizations. Average individual practitioner grant is smaller than 2023. Report doesn''t mention concentration trend.',
 'medium', 'Investment ledger: compare Cycle 1 vs Cycle 2 unique recipients. Cycle 1: 28 unique. Cycle 2: 32 grants but several orgs received multiple awards.', NULL,
 'CACHE''s claim of "record investment" is being referenced in their board materials for the 2026 Grant Cycle deliberation (locks Mar 14). If the board sees total dollars as the success metric, the concentration trend in Cycle 2 — fewer recipients, larger average grants to institutions — will be accepted as normal. The directional brief for the Feb board meeting should present the distribution data alongside the total.'),

('a0000000-0000-0000-0000-000000000001', NULL, 'Northwest Arkansas Democrat-Gazette', 'media_coverage', '2026-02-01',
 'Feature series on NWA arts scene emphasizes Crystal Bridges expansion, Momentary programming, new restaurant/gallery openings, and BFF national recognition. Frames NWA as "arriving" culturally.',
 'Coverage focused entirely on institutional and commercial cultural activity. No mention of practitioner retention challenges, studio space costs, venue infrastructure gaps, or the gap between institutional investment and independent practitioner economic reality. No practitioner voices in the series.',
 'medium', 'Narrative record: compare coverage topics with practitioner interview themes. Zero overlap.', NULL, NULL),

('a0000000-0000-0000-0000-000000000001', NULL, 'Practitioner Interviews (Aggregated)', 'practitioner', '2026-02-01',
 'Consistent theme across 12 interviews: NWA is exciting and affordable but "hard to make a living as an artist." Appreciation for institutional presence (Crystal Bridges, TheatreSquared) but persistent sense that opportunities flow to established players and non-local artists. Several practitioners considering leaving.',
 'Aligns with investment ledger data showing concentration of funding in institutions vs. direct practitioner support. Opportunity layer shows most high-value opportunities ($10K+) require institutional affiliation or national reputation. Public art program criticism validated by precedent archive data.',
 'aligned', 'Practitioner narrative matches system data. This is the most reliable narrative because it comes from direct experience.', NULL, NULL),

('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'Walton Family Foundation - Annual Strategy Document', 'institutional', '2025-11-01',
 'Describes cultural investment as "catalytic" and positions NWA as a model for cultural development in mid-sized regions. Emphasizes Crystal Bridges, trail system, and placemaking as signature achievements.',
 'The catalytic framing is accurate for physical infrastructure and institutional capacity. Less accurate for creative practitioner ecosystem. WFF investment has primarily flowed to large-scale infrastructure and institutions, not to the conditions that allow independent creative practitioners to sustain careers. The "model for mid-sized regions" narrative is premature without solving the practitioner sustainability gap.',
 'medium', 'Investment ledger: WFF cultural spend breakdown shows 80%+ to infrastructure and institutions, <5% to direct practitioner support.', NULL, NULL),

('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000007', 'BFF Press Materials', 'institutional', '2025-09-01',
 'Describes BFF as "transforming NWA into a year-round filmmaking destination" and highlights filmmaker residency pipeline and local production growth.',
 'Festival is successful as an annual event. But "year-round filmmaking destination" is not supported by the data. There is no post-production infrastructure in NWA. Local crew base is thin. Filmmaker D (sample practitioner) reports insufficient year-round work. The "residency pipeline" has placed 3 filmmakers in NWA over 5 years, 1 of whom has already left.',
 'high', 'Practitioner data: Filmmaker D. Investment ledger: BFF sponsorship is event-focused with no year-round infrastructure investment.', NULL, NULL),

('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004', 'Crystal Bridges Community Impact Report', 'institutional', '2025-10-01',
 'Reports "deep community engagement" with 1.2M annual visitors, 50,000 education program participants, and 30 community artists in active roster.',
 'Visitor and participation numbers are real and impressive. But "deep community engagement" conflates tourism/visitation with creative ecosystem impact. The 30 community artists receive minimal financial support. The institution''s economic impact flows primarily to its own operations and employees, not to the broader creative community.',
 'medium', 'Compare CB reported impact metrics with practitioner income data from CACHE census. Different stories.', NULL, NULL),

('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000009', 'Fayetteville Mayor - State of the City', 'regional_positioning', '2026-01-20',
 'Highlights Fayetteville''s "organic creative culture" and positions the city as "the artistic heart of NWA." Emphasizes university connection, local music scene, and cultural district as evidence.',
 'More aligned with reality than Bentonville''s positioning. Fayetteville does have stronger grassroots creative community per capita. But "artistic heart of NWA" risks overstating what is actually a small, fragile scene dependent on university employment and low rents. Cultural district has not generated significant new investment.',
 'low', 'Fayetteville narrative is closer to reality but still somewhat aspirational. Key risk: if rents rise or UA contracts, the organic culture is vulnerable.', NULL, NULL);


-- ──────────────────────────────────────────
-- INTELLIGENCE LAYER: OUTPUTS (3)
-- ──────────────────────────────────────────

INSERT INTO outputs (id, ecosystem_id, output_type, title, content, summary, target_stakeholder_id, triggered_by_decision_id, is_published, published_at, delivery_status, delivered_at, delivered_to_contact, delivery_notes) VALUES

('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'directional_brief',
 'CACHE 2026 Grant Cycle — Pre-Deliberation Brief',
 'CACHE''s board meets in February to set 2026 grant priorities. Three things they should see before that conversation:

1. THE CONCENTRATION PROBLEM
The investment ledger shows grant funding reaching more dollars but fewer unique recipients year over year. In Cycle 1, 28 unique recipients shared $380K. In Cycle 2, 32 grants totaling $450K went to fewer unique recipients, with several organizations receiving multiple awards. Larger grants are flowing to established organizations while individual practitioner grants are shrinking as a share of the total. This is consolidation, not ecosystem development.

The CACHE creative economy census confirms the pattern from the practitioner side: creative practitioner income is declining in real terms despite rising institutional investment. The money is going up, but it''s concentrating at the top.

2. THE DISTRICT PLAN OVERLAP
Walton''s cultural district planning process is happening simultaneously and will recommend programming investments. Without coordination, CACHE risks funding things that the district plan will also fund, or missing gaps that the district plan assumes someone else is covering. Both processes lock within weeks of each other (CACHE grant priorities in March, district plan final recommendations in Q1). There is no documented coordination mechanism between them.

Additionally, the AAC grants overlap analysis in the precedent archive shows that 70% of AAC and CACHE organizational recipients overlap. Three uncoordinated funding streams serving the same ecosystem without a shared view of where money is going.

3. THE PRACTITIONER RETENTION SIGNAL
The ecosystem map shows net outflow of musicians and filmmakers over the past 18 months. The narrative record shows the region marketing itself as "The Creative Capital of the South." The opportunity layer shows most high-value opportunities requiring institutional affiliation. If CACHE wants to support a creative ecosystem rather than a set of cultural institutions, the grant priorities need to reflect that — specifically by increasing the individual practitioner allocation, reducing the concentration trend, and coordinating timing with AAC and the cultural district plan.

RECOMMENDED ACTIONS:
- Set an explicit target for unique recipient count, not just total dollars
- Request the cultural district plan draft before finalizing grant priorities
- Open a coordination conversation with AAC about NWA grant alignment
- Increase the individual practitioner grant ceiling to attract applications for substantial creative projects',
 'Pre-deliberation brief for CACHE board ahead of 2026 grant cycle priority-setting. Surfaces concentration trend, district plan overlap risk, and practitioner retention signal.',
 'b0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', true, '2026-02-10',
 'delivered', '2026-02-10', 'Rachel Torres, Executive Director', 'Emailed Feb 10. Discussed in Feb 12 board prep meeting. Rachel confirmed the concentration data was new to the board.'),

('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'memory_transfer',
 'Public Art Phases 1-2: What Phase 3 Needs to Know',
 'The City of Bentonville is approaching a decision on how to structure Phase 3 of its public art program. Before that decision locks, the people involved should see what happened in the first two phases — because the pattern suggests it will repeat unless the approach changes.

PHASE 1 (2021-2022): $300K, 6 installations, external curator
- 4 of 6 artists were non-local
- Selection process was curator-direct, no public call
- Production quality was high. Media coverage was strong.
- Local creative community felt excluded. Muralist G was publicly critical.
- No post-installation community engagement or evaluation

PHASE 2 (2024): $200K, 4 installations, same curator
- 2 of 4 artists were non-local
- Same selection process as Phase 1
- Same community criticism as Phase 1
- No documented evidence that Phase 1 feedback informed Phase 2 approach
- Investment ledger tags both phases as "not compounding" — each stands alone with no learning transfer

THE PATTERN: The same approach produces the same result. High production quality, community frustration, no ecosystem benefit for local practitioners.

THE CONTRAST: Fayetteville''s public art program operates with $120K annually — less than half of a single Bentonville phase. But their process uses a local selection committee with community input, prioritizes local and regional artists, and has higher community satisfaction and stronger practitioner economic impact per dollar spent.

WHAT PHASE 3 SHOULD CONSIDER:
- A hybrid model: external curator for artistic vision, local committee for artist selection
- An explicit local/regional artist allocation (e.g., minimum 60% of commissions)
- A transparent public call process with community input on sites and themes
- Post-installation evaluation that feeds into future phases
- Budget allocation that includes local artist professional development, not just production',
 'Institutional memory transfer for City of Bentonville ahead of Public Art Phase 3 decision. Compares Phases 1-2 outcomes with Fayetteville model.',
 'b0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000006', true, '2026-02-05',
 'delivered', '2026-02-05', 'Sarah Collins, Cultural Affairs Liaison', 'Hand-delivered at City Hall meeting. Sarah requested additional data on local vs. non-local artist economic impact.'),

('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'state_of_ecosystem',
 'NWA Cultural Ecosystem — State of the System (Early 2026)',
 'This is a synthesis of what the toolkit shows about the NWA cultural ecosystem as of early 2026. It draws from all seven tools.

THE HEADLINE: NWA has one of the strongest cultural investment infrastructures of any mid-sized region in the country. It also has a growing gap between institutional investment and practitioner sustainability. The money is present. The coherence is not.

WHAT''S WORKING:
- Total cultural investment is significant and growing. The investment ledger tracks $5.5M+ across 18 initiatives from 8 distinct sources. This is a well-resourced ecosystem.
- Several investments are compounding. Crystal Bridges residency expansion built on previous cohort learnings. CACHE grant program is maturing. Walmart workforce program produced real employment outcomes. DBI First Friday is a small investment with outsized community impact.
- Institutional capacity is strong. Crystal Bridges, TheatreSquared, Momentary, and BFF provide programming, employment, and visibility that most mid-sized regions don''t have.

WHAT''S NOT WORKING:
- Investment is concentrating, not distributing. Unique grant recipients are declining while total dollars increase. The ecosystem is getting richer at the institutional level and poorer at the practitioner level.
- Key cultural infrastructure is missing. No professional recording studio. Limited venue infrastructure for live music. No dedicated dance company or rehearsal space. No commercial gallery ecosystem. These gaps limit entire disciplines.
- Talent is leaving. Net outflow of musicians and filmmakers over 18 months. Practitioners in multiple disciplines report that NWA is "exciting but hard to make a living." The CACHE census confirms: practitioner income declining in real terms.
- Funding streams are uncoordinated. CACHE, AAC, and WFF fund overlapping activities without shared visibility. The cultural district plan is being developed simultaneously with the CACHE grant cycle without documented coordination.
- Narrative exceeds reality. The region markets itself as a creative capital, but the investment patterns and practitioner data don''t support that yet. The narrative record shows high gaps between institutional messaging and ecosystem reality.

THE STRUCTURAL DIAGNOSIS:
The problem is not a lack of money or institutional will. It''s a lack of coherence. Each stakeholder is making reasonable decisions from their own position. The foundation is funding what it values. The institutions are programming what they can. The city is investing in placemaking. But nobody holds the view of how these decisions relate to each other, whether they''re compounding or duplicating, and whether the ecosystem they''re collectively building actually supports the creative practitioners it depends on.

WHAT NEEDS TO HAPPEN NEXT:
1. Coordination mechanism between CACHE, AAC, and WFF on grant timing and recipients
2. Cultural district plan needs to explicitly reference the 2019 strategic plan and the CACHE census
3. Public art Phase 3 needs a fundamentally different approach to artist selection
4. Workforce development Phase 2 needs an independent practitioner track
5. Infrastructure gaps (studio space, venue infrastructure) need to be named as investment priorities, not assumed to develop organically
6. The opportunity layer should become a permanent piece of ecosystem infrastructure, making the flow of opportunities visible to all practitioners regardless of their institutional connections',
 'Comprehensive state-of-the-ecosystem synthesis drawing from all seven toolkit components. Diagnoses the gap between institutional investment and practitioner sustainability.',
 NULL, NULL, true, '2026-02-15',
 'published', NULL, NULL, 'Standing document. Shared with CACHE and Crystal Bridges leadership. Not decision-specific.');

-- Output References (linking outputs to their source data)
INSERT INTO output_references (output_id, reference_type, reference_id, context_note) VALUES
  -- CACHE brief references
  ('e0000000-0000-0000-0000-000000000001', 'investment', 'c0000000-0000-0000-0000-000000000001', 'Cycle 1 grant data: 28 unique recipients, $380K'),
  ('e0000000-0000-0000-0000-000000000001', 'investment', 'c0000000-0000-0000-0000-000000000002', 'Cycle 2 grant data: concentration trend'),
  ('e0000000-0000-0000-0000-000000000001', 'investment', 'c0000000-0000-0000-0000-000000000003', 'Cultural district plan timing overlap'),
  ('e0000000-0000-0000-0000-000000000001', 'investment', 'c0000000-0000-0000-0000-000000000018', 'CACHE census: practitioner income decline'),
  ('e0000000-0000-0000-0000-000000000001', 'decision', 'd0000000-0000-0000-0000-000000000001', 'Triggered by this decision window'),
  -- Public art memory transfer references
  ('e0000000-0000-0000-0000-000000000002', 'investment', 'c0000000-0000-0000-0000-000000000004', 'Phase 1 investment and outcomes'),
  ('e0000000-0000-0000-0000-000000000002', 'investment', 'c0000000-0000-0000-0000-000000000005', 'Phase 2 investment and outcomes'),
  ('e0000000-0000-0000-0000-000000000002', 'investment', 'c0000000-0000-0000-0000-000000000012', 'Fayetteville model comparison'),
  ('e0000000-0000-0000-0000-000000000002', 'decision', 'd0000000-0000-0000-0000-000000000006', 'Triggered by Phase 3 decision window'),
  -- Additional CACHE brief references: narratives + precedent
  ('e0000000-0000-0000-0000-000000000001', 'narrative', (SELECT id FROM narratives WHERE source_name ILIKE '%CACHE%Annual%' LIMIT 1), 'CACHE claims "record investment" — true by total, misleading by distribution'),
  ('e0000000-0000-0000-0000-000000000001', 'narrative', (SELECT id FROM narratives WHERE source_name ILIKE '%Practitioner%' LIMIT 1), 'Practitioner interviews confirm income declining despite rising total investment'),
  ('e0000000-0000-0000-0000-000000000001', 'precedent', (SELECT id FROM precedents WHERE name ILIKE '%AAC-CACHE%' LIMIT 1), 'Pattern of uncoordinated grant overlap between AAC and CACHE'),
  -- Public art memory transfer: precedent references
  ('e0000000-0000-0000-0000-000000000002', 'precedent', (SELECT id FROM precedents WHERE name ILIKE '%Public Art%Phase 1%' LIMIT 1), 'Phase 1 precedent: opaque selection, non-local artists, community exclusion'),
  ('e0000000-0000-0000-0000-000000000002', 'precedent', (SELECT id FROM precedents WHERE name ILIKE '%Fayetteville Cultural District%' LIMIT 1), 'Fayetteville model: inclusive process, local priority, community satisfaction');


-- ──────────────────────────────────────────
-- TAGS
-- ──────────────────────────────────────────

INSERT INTO tags (id, ecosystem_id, name, category) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Visual Arts', 'sector'),
  ('f0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Music', 'sector'),
  ('f0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Film', 'sector'),
  ('f0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Theatre', 'sector'),
  ('f0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Dance', 'sector'),
  ('f0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Literary Arts', 'sector'),
  ('f0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'Design', 'sector'),
  ('f0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'Public Art', 'theme'),
  ('f0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'Placemaking', 'theme'),
  ('f0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'Workforce Development', 'theme'),
  ('f0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', 'Practitioner Support', 'theme'),
  ('f0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000001', 'Institutional Capacity', 'theme'),
  ('f0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000001', 'Talent Pipeline', 'theme'),
  ('f0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000001', 'Bentonville', 'geography'),
  ('f0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000001', 'Fayetteville', 'geography'),
  ('f0000000-0000-0000-0000-000000000016', 'a0000000-0000-0000-0000-000000000001', 'Regional', 'geography');

-- Tag some investments
INSERT INTO investment_tags (investment_id, tag_id) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000011'),
  ('c0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000011'),
  ('c0000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000008'),
  ('c0000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000008'),
  ('c0000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000014'),
  ('c0000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000014'),
  ('c0000000-0000-0000-0000-000000000008', 'f0000000-0000-0000-0000-000000000010'),
  ('c0000000-0000-0000-0000-000000000009', 'f0000000-0000-0000-0000-000000000002'),
  ('c0000000-0000-0000-0000-000000000012', 'f0000000-0000-0000-0000-000000000008'),
  ('c0000000-0000-0000-0000-000000000012', 'f0000000-0000-0000-0000-000000000015'),
  ('c0000000-0000-0000-0000-000000000016', 'f0000000-0000-0000-0000-000000000013');

-- Tag some organizations
INSERT INTO organization_tags (organization_id, tag_id) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000011'),
  ('b0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000016'),
  ('b0000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000014'),
  ('b0000000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000004'),
  ('b0000000-0000-0000-0000-000000000007', 'f0000000-0000-0000-0000-000000000003'),
  ('b0000000-0000-0000-0000-000000000014', 'f0000000-0000-0000-0000-000000000002');


-- ──────────────────────────────────────────
-- SUBMISSIONS (review queue demo)
-- ──────────────────────────────────────────

INSERT INTO submissions (ecosystem_id, submission_type, data, submitter_name, submitter_email, submitter_org, status) VALUES
('a0000000-0000-0000-0000-000000000001', 'opportunity', '{"title": "NWA Community Mural Project", "type": "commission", "amount": "$5,000-$12,000", "deadline": "2026-04-30", "eligibility": "NWA-based muralists", "description": "Downtown Rogers mural project. 3 walls available. Community input on themes."}', 'Sarah Chen', 'sarah@downtownrogers.org', 'Downtown Rogers Partnership', 'pending'),

('a0000000-0000-0000-0000-000000000001', 'opportunity', '{"title": "Creative Economy Data Fellowship", "type": "fellowship", "amount": "$8,000", "deadline": "2026-05-15", "eligibility": "Researchers and data analysts interested in creative economy", "description": "6-month fellowship to analyze CACHE creative economy census data and produce public reports."}', 'Marcus Johnson', 'marcus@cachecreate.org', 'CACHE', 'pending'),

('a0000000-0000-0000-0000-000000000001', 'decision_flag', '{"decision": "Momentary is considering changing their residency model from 4-week to 2-week residencies to serve more artists", "stakeholder": "The Momentary", "approximate_timing": "Decision expected by April 2026"}', 'Anonymous', NULL, 'The Momentary', 'pending'),

('a0000000-0000-0000-0000-000000000001', 'investment_verification', '{"organization": "Crystal Bridges", "initiative": "Community Art Education Program", "reported_amount": 175000, "correction": "Actual amount was $195,000 including in-kind facility costs", "additional_info": "Program also includes a parent engagement component not captured in original entry"}', 'Jamie Rodriguez', 'jamie@crystalbridges.org', 'Crystal Bridges', 'pending'),

-- Practitioner tip (pending)
('a0000000-0000-0000-0000-000000000001', 'practitioner_tip', '{"name": "Jordan Blake", "discipline": "Ceramics + Community Workshop Facilitation", "tenure": "Just moved to Fayetteville, about 6 months", "context": "Met Jordan at a CACHE event. They run community ceramics workshops and are looking to build a practice here. Previously based in Memphis.", "website": "https://jordanblakestudio.com"}', 'David Kim', 'david@cachenwarkansas.org', NULL, 'pending'),

-- Interest signals (interest_signal type — separate tab)
('a0000000-0000-0000-0000-000000000001', 'interest_signal', '{"opportunity_id": "f0000000-0000-0000-0000-000000000006", "opportunity_title": "Community Art Commission - North Forest Trail", "discipline": "Public Art + Fabrication", "note": "This is exactly the type of site-specific work I do. Happy to share my wayfinding project as reference."}', 'James Torres', 'james@example.com', NULL, 'pending'),

('a0000000-0000-0000-0000-000000000001', 'interest_signal', '{"opportunity_id": "f0000000-0000-0000-0000-000000000001", "opportunity_title": "CACHE Creative Economy Micro-Grants", "discipline": "Sound Design", "note": null}', 'Alex Rivera', 'alex.rivera@example.com', NULL, 'pending'),

('a0000000-0000-0000-0000-000000000001', 'interest_signal', '{"opportunity_id": "f0000000-0000-0000-0000-000000000001", "opportunity_title": "CACHE Creative Economy Micro-Grants", "discipline": "Visual Arts + Murals", "note": "Planning to apply for mural supplies and community engagement materials."}', 'Elena Vasquez', 'elena.v@example.com', NULL, 'pending'),

-- Reviewed submissions (audit trail)
('a0000000-0000-0000-0000-000000000001', 'opportunity', '{"title": "Performing Arts Residency at the Momentary", "type": "residency", "amount": "$3,000 stipend + housing", "deadline": "2026-03-01", "eligibility": "Performing artists, dancers, theater makers", "description": "4-week residency with studio space, housing, and stipend. Culminates in a public performance."}', 'Lisa Park', 'lisa@themomentary.org', 'The Momentary', 'approved'),

('a0000000-0000-0000-0000-000000000001', 'decision_flag', '{"decision": "Crystal Bridges considering expanding parking structure", "stakeholder": "Crystal Bridges", "approximate_timing": "2026-2027"}', 'Anonymous', NULL, 'Crystal Bridges', 'rejected');


-- ──────────────────────────────────────────
-- ACTIVITY LOG (recent activity for demo)
-- ──────────────────────────────────────────

INSERT INTO activity_log (ecosystem_id, action, entity_type, entity_id, changes, created_at) VALUES
('a0000000-0000-0000-0000-000000000001', 'published', 'output', 'e0000000-0000-0000-0000-000000000003', '{"title": "NWA Cultural Ecosystem — State of the System (Early 2026)"}', '2026-02-15 14:30:00+00'),
('a0000000-0000-0000-0000-000000000001', 'published', 'output', 'e0000000-0000-0000-0000-000000000001', '{"title": "CACHE 2026 Grant Cycle — Pre-Deliberation Brief"}', '2026-02-10 10:00:00+00'),
('a0000000-0000-0000-0000-000000000001', 'published', 'output', 'e0000000-0000-0000-0000-000000000002', '{"title": "Public Art Phases 1-2: What Phase 3 Needs to Know"}', '2026-02-05 16:00:00+00'),
('a0000000-0000-0000-0000-000000000001', 'created', 'opportunity', 'b0000000-0000-0000-0000-000000000001', '{"title": "CACHE Creative Economy Micro-Grants"}', '2026-02-01 09:00:00+00'),
('a0000000-0000-0000-0000-000000000001', 'updated', 'investment', 'c0000000-0000-0000-0000-000000000002', '{"field": "compounding", "from": "too_early", "to": "compounding"}', '2026-01-28 11:00:00+00'),
('a0000000-0000-0000-0000-000000000001', 'created', 'narrative', 'b0000000-0000-0000-0000-000000000001', '{"source": "City of Bentonville - Economic Development", "gap": "high"}', '2026-01-20 14:00:00+00'),
('a0000000-0000-0000-0000-000000000001', 'updated', 'organization', 'b0000000-0000-0000-0000-000000000001', '{"field": "notes", "change": "Added leadership transition note"}', '2026-01-15 10:30:00+00'),
('a0000000-0000-0000-0000-000000000001', 'reviewed', 'organization', 'b0000000-0000-0000-0000-000000000004', '{"reviewed_by": "project_lead"}', '2026-01-12 09:00:00+00'),
('a0000000-0000-0000-0000-000000000001', 'created', 'decision', 'd0000000-0000-0000-0000-000000000001', '{"title": "2026 Grant Cycle Priorities", "status": "deliberating"}', '2026-01-10 08:00:00+00'),
('a0000000-0000-0000-0000-000000000001', 'created', 'investment', 'c0000000-0000-0000-0000-000000000018', '{"title": "NWA Creative Economy Census", "amount": 85000}', '2026-01-05 11:00:00+00');


-- ============================================================
-- SEED DATA COMPLETE
-- ============================================================
-- Totals:
--   1 ecosystem
--   14 organizations
--   20 contacts
--   15 org relationships
--   12 practitioners
--   18 investments (with compounding chains linked)
--   8 decisions (with 4 dependency links)
--   7 precedents
--   12 opportunities (9 open/closing, 3 closed/awarded with investment links)
--   8 narrative entries
--   3 intelligence outputs (with 9 reference links)
--   16 tags (with org and investment tagging)
--   4 submissions (review queue demo)
--   10 activity log entries
-- ============================================================
