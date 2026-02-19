# DEMO_BUILD_SPEC.md — Claude Code Execution Plan

This translates PLATFORM_CORE.md into a build spec. Read PLATFORM_CORE.md first for the architecture and reasoning. This document tells you exactly what to build, in what order, with what code.

**Tech stack:** Next.js (App Router) on Vercel, Supabase (Postgres + Auth), CSS modules or inline styles. The existing practice surface is already deployed. This adds the public-facing platform alongside it.

**Demo scope:** Fully functional. Real Supabase data, real forms, real auth. Both funders and practitioners will see this. Everything must work.

---

## DATABASE: New Tables

Run these migrations in Supabase SQL Editor BEFORE building any pages.

### 1. Public Profiles (Practitioners)

```sql
-- Practitioner profiles for the public surface
CREATE TABLE public_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Auth link
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  
  -- Core info (required)
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  primary_skill TEXT NOT NULL,
  location TEXT NOT NULL,
  
  -- Enrichment (optional)
  bio TEXT,
  portfolio_url TEXT,
  additional_skills TEXT[],
  rate_range TEXT,                     -- e.g. "$50-75/hr" or "$5K-15K/project"
  availability TEXT DEFAULT 'available'
    CHECK (availability IN ('available', 'booked', 'selective')),
  looking_for TEXT[],                  -- ['grants', 'commissions', 'contracts', 'teaching']
  
  -- Verification (Phase 2 — nullable for now)
  business_entity_type TEXT,           -- 'sole_proprietor', 'llc', 'corp', etc.
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  
  -- Link to practice surface ecosystem map
  practitioner_id UUID,                -- links to practitioners table if match exists
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE public_profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can view profiles
CREATE POLICY "Profiles are viewable by everyone" ON public_profiles
  FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 2. Opportunity Interests

```sql
CREATE TABLE opportunity_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES opportunities(id) NOT NULL,
  profile_id UUID REFERENCES public_profiles(id) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE opportunity_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Interests viewable by owner and practice team" ON opportunity_interests
  FOR SELECT USING (
    profile_id IN (SELECT id FROM public_profiles WHERE user_id = auth.uid())
    OR auth.uid() IN (SELECT user_id FROM public_profiles WHERE is_verified = true)
  );

CREATE POLICY "Users can insert own interests" ON opportunity_interests
  FOR INSERT WITH CHECK (
    profile_id IN (SELECT id FROM public_profiles WHERE user_id = auth.uid())
  );

CREATE INDEX idx_interests_opportunity ON opportunity_interests(opportunity_id);
CREATE INDEX idx_interests_profile ON opportunity_interests(profile_id);
```

### 3. Engagements

```sql
CREATE TABLE engagements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Links
  opportunity_id UUID REFERENCES opportunities(id),
  profile_id UUID REFERENCES public_profiles(id) NOT NULL,
  funder_org_id UUID REFERENCES organizations(id),
  funder_contact_email TEXT,
  
  -- Terms
  title TEXT NOT NULL,
  scope TEXT,
  total_amount NUMERIC,
  start_date DATE,
  end_date DATE,
  payment_terms JSONB DEFAULT '[]',
  
  -- Status
  status TEXT DEFAULT 'active'
    CHECK (status IN ('pending', 'active', 'complete', 'cancelled')),
  practitioner_confirmed_complete BOOLEAN DEFAULT FALSE,
  funder_confirmed_complete BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  
  -- Payment acceleration
  payment_accelerated BOOLEAN DEFAULT FALSE,
  accelerated_payment_date TIMESTAMPTZ,
  funder_payment_received_date TIMESTAMPTZ,
  
  -- Generated investment (after completion)
  investment_id UUID REFERENCES investments(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE engagement_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id UUID REFERENCES engagements(id) NOT NULL,
  title TEXT NOT NULL,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE engagement_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id UUID REFERENCES engagements(id) NOT NULL,
  title TEXT NOT NULL,
  file_url TEXT,
  submitted_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE engagement_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id UUID REFERENCES engagements(id) NOT NULL,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  detail TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Engagements viewable by participants" ON engagements
  FOR SELECT USING (true);
CREATE POLICY "Milestones viewable by participants" ON engagement_milestones
  FOR SELECT USING (true);
CREATE POLICY "Deliverables viewable by participants" ON engagement_deliverables
  FOR SELECT USING (true);
CREATE POLICY "Activity viewable by participants" ON engagement_activity
  FOR SELECT USING (true);
```

### 4. Add preparation_context to opportunities

```sql
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS preparation_context TEXT;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS target_disciplines TEXT[];
```

### 5. Float Fund Tracking (for payment acceleration)

```sql
CREATE TABLE float_fund_transactions (
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
```

---

## SEED DATA: Demo Scenarios

After running migrations, insert demo data that tells a complete story.

### Demo Profiles (3 practitioners)

```sql
-- These are demo profiles, not linked to real auth users yet
-- For the demo, create them directly and we'll link auth later

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
```

### Update existing opportunities with preparation_context

```sql
-- Update the Bentonville Cultural District Branding RFP
UPDATE opportunities SET preparation_context = 
'This RFP emerged from a 2-year cultural district planning process funded by the Walton Family Foundation. The planning phase found that the district''s identity should emphasize living artists and working studios, not just institutional anchors. The 2019 NWA Creative Economy Strategic Plan recommended explicit place-based branding but was shelved before implementation. Proposals that demonstrate understanding of the district as a creative production corridor — not just a cultural tourism destination — will likely resonate with the selection committee.'
WHERE title ILIKE '%cultural district branding%';

-- Update CACHE micro-grants
UPDATE opportunities SET preparation_context = 
'CACHE has invested over $830K across 4 initiatives in the NWA creative economy. Their most recent grant cycle concentrated larger awards in established organizations — the average individual practitioner grant was smaller than Cycle 1. Successful applicants in previous cycles emphasized community engagement outcomes and cross-disciplinary collaboration. If you''re applying as an individual practitioner, demonstrate how your work creates conditions beyond your own practice.'
WHERE title ILIKE '%micro-grant%';

-- Update UA residency
UPDATE opportunities SET preparation_context =
'The School of Art residency has historically brought non-local artists with the expectation that they''ll engage the NWA community. Previous residents have had mixed integration with the local creative ecosystem — some built lasting connections, others completed their term with minimal community impact. Applicants who demonstrate genuine interest in NWA''s creative community (not just the university context) have an advantage.'
WHERE title ILIKE '%artist-in-residence%';
```

### Demo Engagement (one completed, one active)

```sql
-- Completed engagement: James Torres - Community Wayfinding Signage
INSERT INTO engagements (
  id, profile_id, funder_org_id, title, scope, total_amount,
  start_date, end_date, status, practitioner_confirmed_complete,
  funder_confirmed_complete, completed_at,
  payment_terms
) VALUES (
  'e1111111-1111-1111-1111-111111111111',
  'a2222222-2222-2222-2222-222222222222', -- James Torres
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
  start_date, end_date, status,
  payment_terms
) VALUES (
  'e2222222-2222-2222-2222-222222222222',
  'a1111111-1111-1111-1111-111111111111', -- Maya Chen
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
```

---

## ROUTES AND PAGES

### Public Surface (Light Theme — no auth required to browse)

| Route | Purpose |
|-------|---------|
| `/opportunities` | Card grid with filters and summary line |
| `/opportunities/[id]` | Full detail with prep context, funder info, engagement path |
| `/opportunities/submit` | Community opportunity submission form |
| `/profile` | Create / edit own profile (requires auth) |
| `/profile/[id]` | View a practitioner's public profile |
| `/engagements/[id]` | Shared engagement workspace (requires auth) |
| `/login` | Supabase auth (email magic link or email+password) |

### Practice Surface (Dark Theme — existing, authenticated)

Existing routes stay. Add:
- Engagement count + discipline breakdown to opportunity detail panels
- Engagement tracking section to practice dashboard

---

## PAGE SPECS

### Page: `/opportunities`

**Layout:**
```
max-width: 1080px, centered, padding: 0 24px
```

**Header:**
```html
<h1 class="pub-title">NWA Creative Opportunities</h1>
```
One line. No subtitle. `font-family: var(--pub-font-display); font-size: 36px; font-weight: 500;`

**Summary line:**
```
9 open opportunities totaling $200,500 from 7 sources
```
Dynamic. Numbers in `font-family: var(--pub-font-mono); font-weight: 700;`

Compute from:
```typescript
const open = opportunities.filter(o => ['open', 'closing_soon'].includes(o.status));
const total = open.reduce((s, o) => s + (o.amount_max || o.amount_min || 0), 0);
const sources = new Set(open.map(o => o.source_org?.name || o.source_name)).size;
```

Summary updates when filters change.

**Filters:**
```
[All types ▾]  [All sources ▾]  Sort: [Deadline ▾]
```
Client-side filtering. Dropdowns populated from distinct values in the data.

**Card grid:** `display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;`
Single column below 680px.

**Card component:** See PLATFORM_CORE.md Part 1 for the full card spec. Key fields:
- Type badge (colored by type: GRANT green, RFP blue, COMMISSION gold, RESIDENCY purple)
- Amount (mono, right-aligned) — use formatAmountRange: single number when min===max, range when different, amount_description as fallback
- Title (display serif, 18px)
- Source org name (13px, secondary color)
- Deadline + countdown (mono, color-coded: ≤14d red bold, 15-30d red, 31-90d orange, >90d secondary)
- Eligibility (13px, tertiary, 2-line clamp)
- Entire card clickable → `/opportunities/[id]`
- Cards with ≤14 day deadline get `border-left: 3px solid #C45B5B`

**Supabase query:**
```typescript
const { data } = await supabase
  .from('opportunities')
  .select(`
    id, title, opportunity_type, status, deadline,
    amount_min, amount_max, amount_description,
    description, eligibility, application_url,
    source_name, preparation_context,
    source_org:organizations!source_org_id (id, name)
  `)
  .in('status', ['open', 'closing_soon'])
  .order('deadline', { ascending: true });
```

**Footer:**
```
This surface is maintained by Face.works as part of ongoing
cultural architecture work in Northwest Arkansas.

Know of an opportunity that should be listed? Submit it →

Contact: hello@face.works
```

`Submit it →` links to `/opportunities/submit`.

---

### Page: `/opportunities/[id]`

**Navigation:** `← Back to opportunities` at top, links to `/opportunities`.

**Section 1: Opportunity Info**
- Type badge + status badge + amount (same style as card but larger)
- Title: `font-family: display serif; font-size: 28px;`
- Source org + Deadline with countdown
- Full description (no truncation)
- Full eligibility
- Application info (if `application_url` exists)

**Section 2: Preparation Context** (only if `preparation_context` is not null)
```
PREPARING FOR THIS OPPORTUNITY

[preparation_context text from database]
```
Styled as a callout with left gold border, slightly warm background.

**Section 3: About This Funder** (only if source_org exists)

Query:
```typescript
// Total investments by this org
const { data: investments } = await supabase
  .from('investments')
  .select('initiative_name, amount')
  .eq('source_org_id', opportunity.source_org.id);

const totalInvested = investments?.reduce((s, i) => s + (i.amount || 0), 0);

// Other open opportunities from same source
const { data: otherOpps } = await supabase
  .from('opportunities')
  .select('id, title, deadline')
  .eq('source_org_id', opportunity.source_org.id)
  .neq('id', opportunity.id)
  .in('status', ['open', 'closing_soon']);
```

Display:
```
ABOUT THIS FUNDER

[Org name] has invested $[total] in cultural initiatives in NWA,
including [top 2-3 initiative names].

Also open from this source:
  [Other opp title] (Due [date])
```

**Section 4: Engagement Path**

If user is NOT logged in:
```
[Create a profile] to express interest and get the most from
this platform.

Already have a profile? [Sign in →]
```

If user IS logged in with a profile:
```
INTERESTED IN THIS OPPORTUNITY?

[I'm applying to this →]  (one-click, creates interest record)

Apply directly: [View application page →]  (external link, new tab)
```

The "I'm applying" button creates an `opportunity_interests` record linking to their profile. After clicking, show confirmation:
```
✓ Noted. Good luck with your application.

[View application page →]
```

---

### Page: `/opportunities/submit`

Light theme form. Fields:
- Opportunity title * (text)
- Type * (select: Grant, RFP, Commission, Residency, Fellowship)
- Source organization (text)
- Amount or range (text, placeholder: "$5,000 – $10,000 or Stipend + materials")
- Deadline (date picker)
- Description (textarea)
- Eligibility (text)
- Link (url)
- Your name (text, optional)
- Your email (email, optional)

Submit creates a record in the `submissions` table:
```typescript
await supabase.from('submissions').insert({
  submission_type: 'opportunity',
  data: formData,
  submitter_name: formData.name || null,
  submitter_email: formData.email || null,
  status: 'pending'
});
```

Confirmation: "Thanks. Submissions are reviewed before appearing on the site."

---

### Page: `/profile`

**Requires auth.** If not logged in, redirect to `/login` with return URL.

**If user has no profile:** Show creation form.

**If user has a profile:** Show edit form with current data.

**Profile form fields:**
- Name * (text)
- Primary skill * (text with suggestions dropdown: "Brand Design", "Visual Arts", "Film Production", "Sound Engineering", "Fabrication", "Teaching", "Architecture", "Performance", etc.)
- Location * (text with suggestions: "Bentonville", "Fayetteville", "Rogers", "Springdale", "Siloam Springs")
- Bio (textarea, 2-3 sentences)
- Portfolio URL (url)
- Additional skills (tags input or comma-separated text)
- What I'm looking for (multi-select checkboxes: Grants, Commissions, Contracts, Teaching, Crew work)
- Rate range (text, optional, placeholder: "$50-75/hr or $5K-15K/project")
- Availability (select: Available, Booked, Selectively available)

**On save:** Upserts to `public_profiles` with `user_id = auth.uid()`.

**Profile display section below the form:** Shows "Your profile as others see it" — the public-facing card view.

**My Engagements section:**
```typescript
const { data: engagements } = await supabase
  .from('engagements')
  .select('*, funder_org:organizations!funder_org_id(name)')
  .eq('profile_id', profile.id)
  .order('created_at', { ascending: false });
```

Shows engagement cards:
```
ACTIVE
Cultural District Branding · City of Bentonville · $45,000
2 of 6 milestones complete
[View workspace →]

COMPLETED
Community Wayfinding Signage · Crystal Bridges · $12,000
Completed Jan 2026
[View record →]
```

**My Interests section:**
```typescript
const { data: interests } = await supabase
  .from('opportunity_interests')
  .select('*, opportunity:opportunities(title, deadline, status)')
  .eq('profile_id', profile.id)
  .order('created_at', { ascending: false });
```

---

### Page: `/profile/[id]`

Public view of a practitioner's profile. No auth required.

```
Maya Chen
Brand + Visual Design · Bentonville
✓ Verified

Independent designer specializing in cultural and civic
identity systems. 3 years in NWA.

Portfolio →

COMPLETED THROUGH PLATFORM
Cultural District Branding · City of Bentonville
Community Wayfinding Signage · Crystal Bridges

LOOKING FOR
Commissions, Contracts

AVAILABILITY
Available
```

Only shows completed engagements (not active — active scope is private).

---

### Page: `/engagements/[id]`

**Requires auth.** Only visible to the engagement's practitioner, the funder contact, and practice team admins.

This is the shared workspace. Full spec in PLATFORM_CORE.md Part 3.

**Layout:**
```
max-width: 720px, centered
```

**Header:**
```
CULTURAL DISTRICT BRANDING
Maya Chen ↔ City of Bentonville
$45,000 · Mar 2026 – Jun 2026

STATUS: In Progress
```

**Sections:**

1. **Scope** — full scope text
2. **Milestones** — checklist with due dates
   - Practitioner can check milestones
   - Each check creates an activity log entry
   - Overdue milestones (due_date < today and not completed) get a subtle red indicator
3. **Deliverables** — checklist with file upload/link capability
   - Practitioner can mark as submitted + attach file URL
   - Funder can mark as accepted
4. **Payment** — shows payment terms from JSONB
   - Each payment milestone: amount, trigger, status
   - Status: pending → invoiced → processing → paid
   - Color-coded: paid = green, processing = gold, invoiced = secondary, pending = tertiary
5. **Activity** — reverse-chronological log of all actions

**Completion flow:**
- When all deliverables are submitted, show "Mark as complete" button for practitioner
- When practitioner confirms, show "Confirm completion" button for funder (or practice team acting as funder)
- When both confirm:
  - Set `engagement.status = 'complete'`
  - Set `engagement.completed_at = NOW()`
  - Create activity log entry
  - **Trigger investment creation** (see below)

**Investment creation on completion:**
```typescript
async function onEngagementComplete(engagement) {
  // Create investment entry
  const { data: investment } = await supabase.from('investments').insert({
    initiative_name: engagement.title,
    amount: engagement.total_amount,
    source_org_id: engagement.funder_org_id,
    status: 'completed',
    category: 'Creative Production', // default, practice team refines later
    outcome: `Completed through NWA Creative Opportunities. Practitioner: ${engagement.profile.name}.`,
    is_compounding: null,
    compounding_notes: 'Pending assessment',
    source_name: engagement.funder_org?.name || 'Unknown',
  }).select().single();

  // Link engagement to investment
  await supabase.from('engagements')
    .update({ investment_id: investment.id })
    .eq('id', engagement.id);

  // Update opportunity lifecycle if linked
  if (engagement.opportunity_id) {
    await supabase.from('opportunities')
      .update({ status: 'awarded' })
      .eq('id', engagement.opportunity_id);
  }
}
```

---

### Page: `/login`

Simple auth page using Supabase Auth UI or a custom form.

For the demo, use **email + password** (simpler than magic links for a demo). Supabase Auth handles everything.

```typescript
const { data, error } = await supabase.auth.signUp({
  email: formData.email,
  password: formData.password,
});
```

After signup, redirect to `/profile` for profile creation.
After login, redirect to the return URL or `/profile`.

Light theme, minimal. Just the form and a link to create an account.

---

## LIGHT THEME CSS

Create a CSS file or CSS variables for the public surface. These ONLY apply to `/opportunities`, `/profile`, `/engagements`, and `/login` routes.

```css
:root {
  --pub-bg: #FAFAF7;
  --pub-bg-card: #FFFFFF;
  --pub-text-primary: #1A1A18;
  --pub-text-secondary: #6B6B66;
  --pub-text-tertiary: #9A9A94;
  --pub-border: #E8E8E3;
  --pub-border-hover: #D0D0C8;
  --pub-accent: #C4A67A;
  --pub-accent-bg: rgba(196, 166, 122, 0.07);

  --pub-grant: #2D7D46;
  --pub-grant-bg: rgba(45, 125, 70, 0.08);
  --pub-rfp: #2D5A7D;
  --pub-rfp-bg: rgba(45, 90, 125, 0.08);
  --pub-commission: #7D6B2D;
  --pub-commission-bg: rgba(125, 107, 45, 0.08);
  --pub-residency: #6B2D7D;
  --pub-residency-bg: rgba(107, 45, 125, 0.08);
  --pub-fellowship: #7D4B2D;
  --pub-fellowship-bg: rgba(125, 75, 45, 0.08);

  --pub-status-red: #C45B5B;
  --pub-status-orange: #C49A5B;
  --pub-status-green: #5BC45B;

  --pub-font-display: 'Instrument Serif', Georgia, serif;
  --pub-font-body: 'DM Sans', system-ui, sans-serif;
  --pub-font-mono: 'JetBrains Mono', monospace;
}

/* Apply to public routes */
.pub-surface {
  background: var(--pub-bg);
  color: var(--pub-text-primary);
  font-family: var(--pub-font-body);
  min-height: 100vh;
}
```

Import fonts in the layout:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
```

---

## BUILD ORDER

Execute in this exact order. Each step should be testable before moving to the next.

### Step 1: Database
Run all migrations from the DATABASE section above. Verify tables exist. Run seed data. Verify demo profiles, engagements, and interests exist.

### Step 2: Auth Setup
Configure Supabase Auth for email+password. Build the `/login` page. Test signup and login flow. Verify RLS policies work (public can read profiles, only owners can edit).

### Step 3: Public Opportunities Page (`/opportunities`)
Build the card grid, filters, summary line. Use the light theme CSS. Test with real opportunity data from Supabase. Verify:
- Summary line computes correctly
- Filters narrow cards and update summary
- Amount display handles min===max, ranges, and null amounts
- Deadline countdown is color-coded
- Cards are clickable
- 2-column on desktop, 1-column on mobile

### Step 4: Opportunity Detail Page (`/opportunities/[id]`)
Build the full detail view with all three sections: opportunity info, preparation context, about this funder. Test:
- Back navigation works
- Preparation context only shows when field is populated
- Funder section computes total investments and shows other open opportunities
- Engagement path shows login prompt for anonymous users, "I'm applying" for logged-in users

### Step 5: Practitioner Profiles (`/profile` and `/profile/[id]`)
Build profile creation/edit form and public profile view. Test:
- Profile creation links to auth user
- Profile edit works
- Public view shows correct info
- "Completed through platform" shows completed engagements

### Step 6: Engagement Workspace (`/engagements/[id]`)
Build the shared workspace page. Use the demo engagement data. Test:
- Milestones display with completion checkboxes
- Deliverables display with submission status
- Payment terms display with status colors
- Activity log shows in reverse chronological order
- Completion flow: practitioner confirm → funder confirm → status changes to complete

### Step 7: Completion → Investment Feed
Wire the completion trigger to create an investment entry. Test:
- Complete the demo engagement
- Verify investment entry appears in the practice surface's investment ledger
- Verify opportunity status updates to 'awarded'

### Step 8: Opportunity Submission Form (`/opportunities/submit`)
Build the community submission form. Test:
- Form submits to submissions table
- Confirmation message displays
- Practice team can see the submission in the Submissions page

### Step 9: Cross-linking
Wire everything together:
- Profile page shows "My Engagements" and "My Interests"
- Opportunity detail shows interest count for practice team (logged in as admin)
- Practice surface opportunity detail panel shows engagement count + discipline breakdown
- Engagement workspace "View profile" links work

### Step 10: Polish
- Test all pages on mobile
- Verify light theme is consistent across all public pages
- Check font loading
- Test the full flow: browse → create profile → express interest → view engagement workspace
- Verify the demo story is coherent (Maya and James have realistic data)

---

## WHAT NOT TO BUILD FOR THE DEMO

- Payment processing (Stripe Connect) — described in the architecture but not demo scope
- Funder admin interface (`/funder/[org-id]`) — the practice team acts as funder proxy for the demo
- Automated opportunity alerts — future feature
- Profile-based opportunity matching — future feature
- Day-rate booking flow — Phase 4
- Float fund dashboard — internal tooling, not demo scope
- Practitioner verification workflow — for the demo, manually set `is_verified = true` in the database

The demo shows: **a practitioner can find work, understand it in context, create a profile, track their engagement, and the completed work feeds the practice toolkit automatically.** That's the full loop. Everything else is optimization.
