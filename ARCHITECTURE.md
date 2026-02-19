# Cultural Architecture Platform — Technical Architecture

## What This Is

Two connected surfaces backed by one database:

1. **Practice Surface** — the analytical toolkit where the practice team tracks investments, decisions, precedents, opportunities, narratives, and practitioners across the NWA cultural ecosystem. Dark theme. Authenticated.

2. **Public Surface** — where creative workers find opportunities, build profiles, track engagements, and get paid. Where funders see verified practitioners and manage engagements. Light theme. Public browsing, auth for interaction.

The surfaces share a database. A completed engagement on the public surface automatically generates an investment entry in the practice toolkit. A preparation context written by the practice team appears on the public opportunity detail page. The more work flows through the platform, the more the toolkit knows.

---

## Stack

- **Database**: Supabase (Postgres + Auth + RLS + Storage)
- **Front-end**: Next.js 14+ (App Router) + TypeScript
- **Styling**: CSS Modules with design tokens (not Tailwind utility classes — the design language is too specific for utility-first)
- **Auth**: Supabase Auth (email + password for demo; magic links for production)
- **Payments**: Stripe Connect (Phase 3, when funder alignment exists)
- **Deployment**: Vercel
- **Email**: Resend (opportunity digest, future)
- **Fonts**: Google Fonts — Instrument Serif, DM Sans, JetBrains Mono

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # server-side only
```

---

## Project Structure

```
platform/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout, font imports, providers
│   │   ├── page.tsx                      # Landing — routes to /opportunities or /tools/dashboard
│   │   │
│   │   ├── (public)/                     # PUBLIC SURFACE (light theme)
│   │   │   ├── layout.tsx                # Light theme wrapper, public header/footer
│   │   │   ├── opportunities/
│   │   │   │   ├── page.tsx              # Card grid + filters + summary line
│   │   │   │   ├── [id]/page.tsx         # Full detail + prep context + funder info + engagement path
│   │   │   │   └── submit/page.tsx       # Community opportunity submission form
│   │   │   ├── profile/
│   │   │   │   ├── page.tsx              # Create / edit own profile (auth required)
│   │   │   │   └── [id]/page.tsx         # Public profile view
│   │   │   ├── engagements/
│   │   │   │   └── [id]/page.tsx         # Shared engagement workspace (auth required)
│   │   │   └── login/
│   │   │       └── page.tsx              # Auth page (signup + login)
│   │   │
│   │   ├── (practice)/                   # PRACTICE SURFACE (dark theme, auth required)
│   │   │   ├── layout.tsx                # Sidebar nav, auth gate, dark theme
│   │   │   ├── tools/
│   │   │   │   ├── dashboard/page.tsx    # Overview: stats, stale items, upcoming interventions
│   │   │   │   ├── ecosystem-map/page.tsx
│   │   │   │   ├── investments/page.tsx  # List + Landscape toggle
│   │   │   │   ├── decisions/page.tsx    # List + Timeline toggle
│   │   │   │   ├── precedents/page.tsx
│   │   │   │   ├── opportunities/page.tsx # Practice view with engagement tracking
│   │   │   │   ├── narratives/page.tsx
│   │   │   │   ├── outputs/page.tsx
│   │   │   │   └── submissions/page.tsx  # Review queue
│   │   │   └── settings/page.tsx
│   │   │
│   │   ├── auth/
│   │   │   └── callback/route.ts         # Auth callback handler
│   │   │
│   │   └── api/
│   │       ├── engagement-complete/route.ts  # Webhook: engagement → investment
│   │       └── digest/route.ts               # Cron: weekly opportunity digest
│   │
│   ├── components/
│   │   ├── ui/                           # Shared base components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── StatusDot.tsx
│   │   │
│   │   ├── practice/                     # Practice surface components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── DetailPanel.tsx           # Slide-over detail panel (shared across tools)
│   │   │   ├── InlineReferenceCard.tsx   # Colored left-border entity cards
│   │   │   ├── AcrossTheToolkit.tsx      # Cross-tool connections section
│   │   │   ├── EditorialStats.tsx        # Sentence-format stats
│   │   │   ├── TimelineBar.tsx           # Deliberation timeline visualization
│   │   │   ├── LandscapeCharts.tsx       # Investment analytical views
│   │   │   └── DecisionTimeline.tsx      # Gantt-style decision view
│   │   │
│   │   ├── public/                       # Public surface components
│   │   │   ├── PublicHeader.tsx
│   │   │   ├── PublicFooter.tsx
│   │   │   ├── OpportunityCard.tsx
│   │   │   ├── OpportunityFilters.tsx
│   │   │   ├── SummaryLine.tsx
│   │   │   ├── PreparationContext.tsx    # Gold-bordered prep context callout
│   │   │   ├── FunderContext.tsx         # "About this funder" section
│   │   │   ├── ProfileForm.tsx
│   │   │   ├── ProfileCard.tsx
│   │   │   ├── EngagementWorkspace.tsx
│   │   │   ├── MilestoneTracker.tsx
│   │   │   ├── DeliverableTracker.tsx
│   │   │   ├── PaymentTracker.tsx
│   │   │   └── ActivityLog.tsx
│   │   │
│   │   └── shared/
│   │       ├── AmountDisplay.tsx         # Handles min===max, ranges, fallbacks
│   │       ├── CountdownBadge.tsx        # Color-coded deadline countdown
│   │       ├── TypeBadge.tsx             # Colored opportunity type badges
│   │       └── CompoundingBadge.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                 # Browser client
│   │   │   ├── server.ts                 # Server client
│   │   │   ├── middleware.ts             # Auth middleware
│   │   │   └── types.ts                  # Generated from schema
│   │   │
│   │   ├── queries/                      # Reusable data fetching
│   │   │   ├── organizations.ts
│   │   │   ├── investments.ts
│   │   │   ├── decisions.ts
│   │   │   ├── precedents.ts
│   │   │   ├── opportunities.ts
│   │   │   ├── narratives.ts
│   │   │   ├── outputs.ts
│   │   │   ├── profiles.ts              # Public profiles
│   │   │   ├── engagements.ts           # Engagement workspace data
│   │   │   ├── interests.ts             # Opportunity interest signals
│   │   │   └── stats.ts                 # Dashboard aggregations
│   │   │
│   │   ├── actions/                      # Server actions
│   │   │   ├── createProfile.ts
│   │   │   ├── expressInterest.ts
│   │   │   ├── updateMilestone.ts
│   │   │   ├── confirmCompletion.ts
│   │   │   ├── createInvestmentFromEngagement.ts
│   │   │   └── submitOpportunity.ts
│   │   │
│   │   └── utils/
│   │       ├── formatting.ts             # Currency, dates, countdowns
│   │       ├── constants.ts              # Enum labels, colors
│   │       └── amounts.ts                # formatAmountRange logic
│   │
│   └── styles/
│       ├── tokens.css                    # Design tokens (both themes)
│       ├── practice.css                  # Dark theme variables
│       └── public.css                    # Light theme variables
│
├── supabase/
│   ├── schema.sql                        # Full database schema
│   └── seed.sql                          # NWA prototype seed data
│
├── public/
├── .env.local
├── next.config.js
├── tsconfig.json
└── package.json
```

---

## Design Tokens

### Practice Surface (Dark)

```css
:root[data-theme="practice"] {
  --bg-primary: #0F0F0F;
  --bg-surface: #1A1A1A;
  --bg-inset: #141414;
  --border-subtle: #2A2A2A;
  --border-medium: #3A3A3A;
  --text-primary: #E8E8E8;
  --text-secondary: #999999;
  --text-tertiary: #666666;
  --accent-gold: #C4A67A;
  --accent-glow: rgba(196, 166, 122, 0.06);
  --status-green: #5B8C5A;
  --status-red: #C45B5B;
  --status-blue: #5B7FC4;
  --status-orange: #C4885B;
  --status-purple: #8B5BC4;
  --font-serif: 'Instrument Serif', Georgia, serif;
  --font-sans: 'DM Sans', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

### Public Surface (Light)

```css
:root[data-theme="public"] {
  --bg-primary: #FAFAF7;
  --bg-surface: #FFFFFF;
  --bg-inset: #F5F5F0;
  --border-subtle: #E8E8E3;
  --border-medium: #D0D0C8;
  --text-primary: #1A1A18;
  --text-secondary: #6B6B66;
  --text-tertiary: #9A9A94;
  --accent-gold: #C4A67A;
  --accent-glow: rgba(196, 166, 122, 0.07);
  --status-green: #2D7D46;
  --status-red: #C45B5B;
  --status-blue: #2D5A7D;
  --status-orange: #C49A5B;
  --status-purple: #6B2D7D;
  --font-serif: 'Instrument Serif', Georgia, serif;
  --font-sans: 'DM Sans', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

Same accent gold, same fonts. Different ground and text colors. The practice surface is warm-dark. The public surface is warm-light.

---

## Routing Logic

### Public Surface (`/opportunities`, `/profile`, `/engagements`)
- No auth required to browse opportunities
- Auth required to: create profile, express interest, access engagement workspace
- Server-rendered opportunity pages for SEO and shareability
- Light theme applied via layout

### Practice Surface (`/tools/*`)
- Auth required for all routes
- Redirect to `/login` if not authenticated
- Practice team users only (role-gated in production)
- Dark theme applied via layout
- Sidebar navigation across all tools

### Auth Flow
1. User visits `/login`
2. Creates account or signs in (email + password for demo)
3. On first login → redirect to `/profile` for profile creation
4. On subsequent login → redirect to `/opportunities` (or `/tools/dashboard` if practice team)
5. Session persisted via Supabase cookie

---

## Key Data Flows

### Opportunity Discovery → Interest Signal
```
Practitioner browses /opportunities
  → Clicks card → /opportunities/[id]
  → Sees preparation context + funder intelligence
  → Clicks "I'm applying" → interest record created
  → Applies externally via funder's process
  → Interest signal visible in practice surface
```

### Engagement Lifecycle
```
Opportunity awarded (practice team or funder records this)
  → Engagement created with scope, milestones, deliverables, payment terms
  → Practitioner and funder access shared workspace at /engagements/[id]
  → Milestones checked as completed
  → Deliverables submitted and accepted
  → Both parties confirm completion
  → Investment entry auto-created in practice toolkit
  → Practitioner profile updated with verified engagement
  → Opportunity status updated to 'awarded'
```

### Engagement → Investment Feed
```
Double confirmation fires on engagement completion
  → API route /api/engagement-complete
  → Creates investment record:
     - initiative_name = engagement.title
     - amount = engagement.total_amount
     - source_org_id = engagement.funder_org_id
     - status = 'completed'
     - source = 'platform' (distinguishes from manual entries)
     - compounding = null (practice team assesses later)
  → Links engagement.investment_id to new investment
  → Updates opportunity.status to 'awarded' (if linked)
  → Creates activity log entry
  → Practice team sees "NEW COMPLETION" prompt on dashboard
```

### Payment Acceleration (Conditional on Funder Alignment)
```
Double confirmation fires
  → If funder is acceleration-enabled:
     → Check float fund balance
     → If sufficient: initiate Stripe payout to practitioner (7 days)
     → Create float_fund_transaction (acceleration_out)
     → Invoice funder via platform entity
     → When funder pays: create float_fund_transaction (funder_replenish)
  → If funder is not acceleration-enabled:
     → Standard payment flow (practitioner invoices funder directly)
     → Platform tracks payment status for visibility
```

### Submission Flow
```
Anyone submits via /opportunities/submit
  → submissions table (status: pending)
  → Practice team reviews in /tools/submissions
  → Approved → opportunity created in opportunities table
  → Appears on public /opportunities surface
```

---

## Component Design Patterns

### Inline Reference Cards
Used across both surfaces. A compact card with colored left border indicating entity type:
- Gold: Investment
- Blue: Decision
- Green: Opportunity
- Neutral/gray: Precedent
- Orange: Narrative
- Purple: Output

Each card shows: entity name, 1-2 key details, clickable. Used in "Across the Toolkit" sections and "Connects To" sections.

### Detail Panel (Practice Surface)
Slide-over panel on the right side. Consistent structure per tool:
1. Entity title + badges
2. Key fields (labeled, not under a generic heading)
3. Tool-specific sections (takeaway, intervention, dependencies, etc.)
4. "Across the Toolkit" — cross-tool connections
5. Record (created, reviewed, actions)

### Engagement Workspace (Public Surface)
Centered single-column layout. Sections:
1. Header (title, parties, amount, dates, status)
2. Scope
3. Milestones (checklist)
4. Deliverables (checklist with file attachment)
5. Payment (terms with status tracking)
6. Activity log (reverse chronological)

### Summary Line Pattern
Used on public opportunities page and practice dashboard:
"9 open opportunities totaling $200,500 from 7 sources"
Numbers in mono bold. Words in body font. Dynamically computed. Updates with filters.

### Editorial Stats Pattern
Used on practice surface (dashboard, investment list):
"6 investments totaling $3.6M tracked across 6 organizations. 3 are compounding. 2 are not. The lowest allocation: Sector Development at 2.9% of total."
Sentence format, not stat cards.

---

## Build Phases

### Phase 1: Foundation + Public Surface (Now)
- Database schema deployment
- Auth setup
- Public opportunities page (card grid, filters, summary)
- Opportunity detail page (with prep context + funder info)
- Practitioner profiles (create, edit, view)
- Opportunity submission form
- Practice surface layout + dashboard (existing, refined)

### Phase 2: Context Layer
- Preparation context written for each opportunity
- "About this funder" section on opportunity detail
- Practitioner verification fields
- "Verified" badge on profiles
- Interest signals + aggregate display in practice surface

### Phase 3: Engagement Loop + Payment (Conditional)
- Engagement workspace (milestones, deliverables, activity)
- Completion confirmation flow
- Engagement → investment auto-creation
- Profile update on engagement completion
- Funder interface (lightweight — or practice team acts as proxy)
- Payment acceleration (if funder says yes to payment routing)
- Float fund tracking

### Phase 4: Expanded Workforce
- Availability calendar on profiles
- Day-rate display
- Quick-book flow for short engagements
- Simplified workspace for day-rate work

---

## What This Doesn't Cover

- Mobile native app (web-first, responsive)
- AI-powered opportunity matching (future — profile-based recommendations)
- Multi-ecosystem support (schema supports it via ecosystem_id, UI deferred)
- Automated payment processing for funders that don't support routing
- Legal contract generation (the engagement template is operational, not legal)
- Practitioner survey/census flow (separate from profile creation)
