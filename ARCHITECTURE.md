# Cultural Architecture Toolkit — Architecture

## Overview

A practice surface for cultural ecosystem analysis and intervention, built for the NWA (Northwest Arkansas) creative economy. The toolkit tracks organizations, investments, decisions, opportunities, narratives, precedents, and outputs — providing a coherent view of how cultural money flows, where decisions are forming, and what the gap is between institutional narrative and practitioner reality.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router, React 18) |
| Language | TypeScript 5 |
| Database | Supabase (PostgreSQL + RLS + Auth) |
| Styling | Tailwind CSS 3.4 + custom CSS properties |
| Charts | Recharts 3.7 |
| Fonts | DM Serif Display, DM Sans, JetBrains Mono |

## Project Structure

```
toolkit/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout (fonts, global CSS)
│   │   ├── page.tsx                      # Root redirect (→ /dashboard or /auth/login)
│   │   ├── globals.css                   # Design tokens + pub-theme styles
│   │   ├── (practice)/                   # Authenticated practice surface
│   │   │   ├── layout.tsx                # Auth check, sidebar, dark theme
│   │   │   ├── dashboard/page.tsx        # Overview: ecosystem stats, headlines
│   │   │   ├── ecosystem-map/page.tsx    # Organizations, contacts, practitioners
│   │   │   ├── investments/page.tsx      # Investment ledger with compounding chains
│   │   │   ├── decisions/page.tsx        # Decision calendar and interventions
│   │   │   ├── precedents/page.tsx       # Historical archive
│   │   │   ├── opportunity-tracker/page.tsx  # Internal opportunity management
│   │   │   ├── narratives/page.tsx       # Narrative vs. reality tracking
│   │   │   ├── outputs/page.tsx          # Intelligence layer (briefs, analyses)
│   │   │   ├── submissions/page.tsx      # Review queue for external submissions
│   │   │   └── settings/page.tsx         # Configuration
│   │   ├── opportunities/                # Public surface (light theme, no auth)
│   │   │   ├── layout.tsx                # pub-theme wrapper + metadata
│   │   │   ├── page.tsx                  # Public opportunity listing
│   │   │   └── submit/page.tsx           # External opportunity submission form
│   │   ├── auth/
│   │   │   ├── login/page.tsx            # Login (password + magic link)
│   │   │   ├── callback/route.ts         # OAuth callback handler
│   │   │   └── logout/route.ts           # Sign out
│   │   └── submit/
│   │       └── verify/page.tsx           # Verification forms for orgs/practitioners
│   ├── components/
│   │   ├── ui/                           # Reusable primitives (Button, Input, Badge, etc.)
│   │   ├── practice/                     # Practice surface components
│   │   │   ├── Sidebar.tsx               # Navigation sidebar
│   │   │   ├── StatsBar.tsx              # Ecosystem stats bar
│   │   │   └── *View.tsx                 # Page-specific view components
│   │   ├── contributor/                  # External verification forms
│   │   └── public/                       # Public surface components
│   │       ├── PublicOpportunities.tsx    # Card grid + filters + detail overlay
│   │       └── OpportunitySubmitForm.tsx  # External submission form
│   └── lib/
│       ├── supabase/
│       │   ├── client.ts                 # Browser Supabase client
│       │   ├── server.ts                 # Server Supabase client (cookies)
│       │   ├── middleware.ts             # Auth middleware
│       │   └── types.ts                  # TypeScript types matching schema
│       └── utils/
│           ├── constants.ts              # Enum labels, status colors, thresholds
│           └── formatting.ts             # Currency, date, countdown helpers
├── schema.sql                            # ← Source of truth (root)
├── seed.sql                              # ← Full demo dataset (root)
└── reset.sql                             # ← Drop-everything script (root)
```

## Database Schema

### Source Files

| File | Purpose |
|------|---------|
| `schema.sql` | Complete DDL: enums, tables, indexes, views, RLS policies, functions, triggers, and minimal seed data |
| `seed.sql` | Comprehensive NWA prototype dataset (run after schema.sql) |
| `reset.sql` | Drops all objects for a clean rebuild |

### Enums

| Enum | Values |
|------|--------|
| `org_type` | foundation, government, cultural_institution, corporate, nonprofit, intermediary, education, media |
| `investment_status` | planned, active, completed, cancelled |
| `investment_category` | direct_artist_support, strategic_planning, public_art, artist_development, education_training, sector_development, institutional_capacity, infrastructure, programming, communications |
| `compounding_status` | compounding, not_compounding, too_early, unknown |
| `decision_status` | upcoming, deliberating, locked, completed |
| `opportunity_type` | grant, rfp, commission, project, residency, program, fellowship |
| `opportunity_status` | open, closing_soon, closed, awarded |
| `narrative_source_type` | institutional, regional_positioning, media_coverage, practitioner |
| `gap_level` | high, medium, low, aligned |
| `output_type` | directional_brief, orientation_framework, state_of_ecosystem, memory_transfer, field_note, foundational_text |
| `submission_status` | pending, approved, rejected |
| `user_role` | partner, project_lead, contributor |

### Tables

#### Core

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `profiles` | Extends `auth.users` | id (FK → auth.users), full_name, role, email |
| `ecosystems` | Multi-ecosystem support | name, slug, description, region |

#### 1. Ecosystem Map

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `organizations` | Stakeholder entities | → ecosystems. Fields: name, org_type, mandate, controls, constraints, decision_cycle, website, notes |
| `contacts` | People at orgs | → organizations. Fields: name, title, role_description, is_decision_maker |
| `org_relationships` | Inter-org links | → organizations (org_a_id, org_b_id). Fields: relationship_type, strength |
| `practitioners` | Individual creatives | → ecosystems. Fields: discipline, tenure, income_sources, retention_factors, risk_factors, institutional_affiliations |

#### 2. Investment Ledger

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `investments` | Funding flows | → ecosystems, → organizations (source_org_id), → investments (builds_on_id, led_to_id), → precedents. Fields: initiative_name, amount, period, category, status, compounding, compounding_notes |

#### 3. Decision Calendar

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `decisions` | Upcoming/active decisions | → ecosystems, → organizations (stakeholder). Fields: decision_title, deliberation_start/end, locks_date, status, dependencies, intervention_needed, is_recurring |
| `decision_dependencies` | Decision → decision links | → decisions (decision_id, depends_on_id) |

#### 4. Precedent Archive

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `precedents` | Historical reference | → ecosystems, → investments. Fields: name, period, involved, what_produced, what_worked, what_didnt, connects_to, takeaway |

#### 5. Opportunity Layer

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `opportunities` | Available opportunities | → ecosystems, → organizations (source_org_id), → investments (awarded_investment_id), → profiles (submitted_by). Fields: title, opportunity_type, amount_min/max, deadline, eligibility, status |

#### 6. Narrative Record

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `narratives` | Story vs. reality | → ecosystems, → organizations (source_org_id). Fields: source_type, narrative_text, reality_text, gap, evidence_notes |

#### 7. Intelligence Layer

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `outputs` | Produced analysis | → ecosystems, → profiles (author), → organizations (target_stakeholder), → decisions (triggered_by). Fields: output_type, title, content, summary, is_published |
| `output_references` | Citations in outputs | → outputs. Fields: reference_type, reference_id, context_note |

#### Supporting

| Table | Purpose |
|-------|---------|
| `tags` | Shared tagging (sector, theme, geography) |
| `organization_tags` | Junction: org ↔ tag |
| `investment_tags` | Junction: investment ↔ tag |
| `opportunity_tags` | Junction: opportunity ↔ tag |
| `precedent_tags` | Junction: precedent ↔ tag |
| `submissions` | External submission review queue |
| `activity_log` | Audit trail |

### Views

| View | Purpose |
|------|---------|
| `stale_entries` | Entries overdue for review (orgs 90d, investments 60d, decisions 30d, opportunities 14d, practitioners 180d) |
| `ecosystem_stats` | Aggregate counts and totals per ecosystem |
| `upcoming_interventions` | Decisions that need action within 90 days |

### Row Level Security

- **Public (anon)**: Can read open/closing_soon opportunities and published outputs. Can insert submissions.
- **Authenticated**: Can read all tables. Can insert/update most tables. Profiles are self-managed.
- All tables have RLS enabled.

### Functions & Triggers

- `update_updated_at()` — Auto-updates `updated_at` on all tables that have it
- `handle_new_user()` — Auto-creates a profile row when a new auth user signs up

## Seed Data (NWA Prototype)

The `seed.sql` file loads a comprehensive demo dataset:

| Entity | Count | Notes |
|--------|-------|-------|
| Ecosystems | 1 | Northwest Arkansas |
| Organizations | 14 | Foundations, institutions, government, corporate, education, nonprofits |
| Contacts | 20 | Sample contacts with roles and decision-maker flags |
| Org Relationships | 15 | Funding, partnership, and governance links |
| Practitioners | 12 | Across disciplines with income, retention, and risk data |
| Investments | 18 | With compounding chains linked (builds_on_id ↔ led_to_id) |
| Decisions | 8 | With 4 dependency links between them |
| Precedents | 7 | Historical cases with lessons and investment links |
| Opportunities | 12 | 9 open/closing, 3 closed/awarded with investment links |
| Narratives | 8 | Institutional, media, practitioner, and regional positioning |
| Outputs | 3 | Directional brief, memory transfer, state-of-ecosystem |
| Tags | 16 | Sector (7), theme (6), geography (3) |
| Submissions | 4 | Review queue demo entries |
| Activity Log | 10 | Recent activity entries |

### UUID Convention

All seed UUIDs follow a predictable pattern for cross-referencing:

| Prefix | Entity |
|--------|--------|
| `a0000000-...` | Ecosystems |
| `b0000000-...-000000000001` through `...0014` | Organizations |
| `c0000000-...-000000000001` through `...0018` | Investments |
| `d0000000-...-000000000001` through `...0008` | Decisions |
| `e0000000-...-000000000001` through `...0003` | Outputs |
| `f0000000-...-000000000001` through `...0016` | Tags |

## Two Surfaces

### Practice Surface (Dark Theme)

Authenticated dashboard at `/(practice)/*`. Dark background (`#141414`), warm text (`#E8E4E0`). Uses Tailwind utility classes referencing CSS custom properties defined in `globals.css`.

Auth: Supabase auth with password + magic link. Middleware redirects unauthenticated users to `/auth/login`.

### Public Surface (Light Theme)

Unauthenticated at `/opportunities`. Light background (`#FAFAF7`), dark text (`#1A1A18`). Uses `.pub-theme` CSS class with dedicated custom properties. No Tailwind dark mode — standalone CSS.

RLS policy allows anon reads of open/closing_soon opportunities.

## Database Reset Procedure

To nuke and rebuild:

1. Open Supabase Dashboard → SQL Editor
2. Run `reset.sql` (drops all objects)
3. Run `schema.sql` (creates everything + minimal seed)
4. Run `seed.sql` (loads full NWA prototype data)

Verify with:
```sql
SELECT COUNT(*) as orgs FROM organizations;
SELECT COUNT(*) as investments FROM investments;
SELECT COUNT(*) as opportunities FROM opportunities;
```

Expected: 14 orgs, 18 investments, 12 opportunities.
