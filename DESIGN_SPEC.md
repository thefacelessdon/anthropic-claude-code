# Cultural Architecture Toolkit — Design Specification

## What This Document Is

Hand this to Claude Code. Every page, every component, every interaction pattern described here should replace what's currently built. This isn't a philosophy document — it's a build spec.

---

## The Core Problem With The Current Build

Every page is a flat list of cards. Nothing connects to anything else. There's no language explaining what each tool is for or why it matters. There are no detail views, no filtering, no drill-through. The dashboard shows stats but doesn't tell a story. It looks like a database viewer with a dark theme.

Cultural architecture infrastructure needs to do three things the current build doesn't:
1. **Explain itself** — every page should be legible without a tutorial
2. **Connect the dots** — information from one tool should surface inside another
3. **Feel like it was designed for this specific work** — not like a generic admin panel

---

## Global Design Direction

### Aesthetic
Refined, editorial, quiet authority. Think: a well-designed research publication, not a SaaS dashboard. The aesthetic should communicate "this is serious institutional work" without looking corporate. Dark theme is fine but it needs warmth and typographic sophistication.

### Typography
- **Display/Headers**: A serif or distinctive sans — something with character. Consider: Instrument Serif, Fraunces, Newsreader, or DM Serif Display for headings. NOT Inter, not system fonts.
- **Body**: A clean, highly legible sans for data and body text. Consider: DM Sans, Plus Jakarta Sans, Satoshi. Pair with the display font.
- **Mono/Data**: JetBrains Mono or IBM Plex Mono for numbers, amounts, dates where precision matters.
- Import via Google Fonts or Fontsource.

### Color Refinement
Keep the dark palette but add depth:
```
--bg-primary:     #0C0C0C    (deeper black)
--bg-surface:     #141414    (cards, panels)
--bg-elevated:    #1A1A1A    (hover states, active items)
--bg-inset:       #0A0A0A    (recessed areas, code blocks)

--border-subtle:  #1F1F1F    (default borders)
--border-medium:  #2A2A2A    (active/hover borders)
--border-accent:  #3D3224    (warm accent border)

--text-primary:   #E8E4E0    (warm white, not pure white)
--text-secondary: #9A9590    (warm gray)
--text-tertiary:  #5C5854    (dim, labels)

--accent-gold:    #C4A67A    (primary accent)
--accent-warm:    #A68B5B    (muted gold)
--accent-glow:    rgba(196, 166, 122, 0.08)  (subtle gold tint for backgrounds)

--status-green:   #6B9E6A    (compounding, open, aligned)
--status-red:     #C45B5B    (not compounding, high gap)
--status-blue:    #6B8EC4    (upcoming, in progress)
--status-orange:  #C49B6B    (deliberating, closing soon, medium gap)
--status-purple:  #9B7EC4    (published, special)
```

### Spacing & Layout
- Generous whitespace. Let things breathe.
- Max content width: 1200px within the main area
- Card padding: 24px (not 16px — too tight)
- Section spacing: 40px between major sections
- Sidebar: 240px (slightly wider for readable labels)

### Micro-interactions
- Cards: subtle border-color transition on hover (0.2s)
- Links/clickable items: color transition, not underline
- Status badges: very slight glow matching their color
- Page transitions: content fades in with 0.15s ease

---

## Navigation & Sidebar

### Current Problem
The sidebar is a flat list of page names. "Ecosystem Map" and "Narratives" mean nothing to someone who doesn't already know the system.

### Redesign

Each nav item gets a **verb label** underneath the tool name in smaller text. This is the language layer:

```
Dashboard                    [icon: grid]

── TOOLS ──

Ecosystem Map                [icon: network/nodes]
  Who's in this system

Investments                  [icon: layers/stack]
  Where money flows

Decisions                    [icon: clock/calendar]
  What's being decided

Precedents                   [icon: archive/book]
  What's been tried

Opportunities                [icon: compass/signal]
  What's available now

Narratives                   [icon: quotes/speech]
  Story vs. reality

── SYNTHESIS ──

Outputs                      [icon: document/pen]
  Intelligence we've produced

── OPERATIONS ──

Submissions                  [icon: inbox]
  Review queue [badge: count]

Settings                     [icon: gear]
```

The grouping matters. Tools are the seven instruments. Outputs are what we produce from them. Submissions are operational. This hierarchy communicates what the system is.

Active state: left accent bar (gold), text goes primary white, subtle gold background tint on the row.

---

## Page Template

Every tool page follows this structure:

```
┌─────────────────────────────────────────────────────┐
│ PAGE TITLE                                          │
│ Subtitle — one sentence explaining what this tool   │
│ does and why it matters                             │
│                                                     │
│ [+ Add New]                    [Filter] [Sort] [View│
├─────────────────────────────────────────────────────┤
│                                                     │
│ SUMMARY STATS (contextual to this tool)             │
│ Not just counts — the stat that tells a story       │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│ CONTENT AREA                                        │
│ Cards / list items with proper hierarchy            │
│                                                     │
│ Each item is clickable → opens detail panel         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### The Subtitle Line
This is critical. It's the language layer that makes the page self-explanatory. Not a generic description — a statement of purpose:

- Dashboard: "The state of the NWA cultural ecosystem at a glance."
- Ecosystem Map: "Every institution, funder, and practitioner in the system — and how they connect."
- Investments: "Where money is going, what it's producing, and whether it's compounding."
- Decisions: "What's being decided right now, when it locks, and where we need to show up."
- Precedents: "What's been tried before. The institutional memory that prevents starting from scratch."
- Opportunities: "Every open grant, commission, RFP, and residency flowing through the ecosystem."
- Narratives: "What's being said about this ecosystem versus what's actually happening."
- Outputs: "Briefs, analyses, and frameworks we've produced from the intelligence."
- Submissions: "External contributions waiting for review."

---

## Detail Views — The Slide-Over Panel

### Pattern
Every item in every tool is clickable. Clicking opens a **slide-over panel** from the right side — 50-60% of the viewport width. The list stays visible (dimmed/blurred) on the left. This is better than a separate page because:
- Context is maintained (you can see where this item sits in the list)
- Navigation is faster (close panel, click another item)
- Mobile: panel goes full-width

### Panel Structure
```
┌──────────────────────────────────────┐
│ [← Back to list]            [Edit]  │
│                                      │
│ ENTITY NAME                          │
│ Type badge    Status badge           │
│                                      │
│ ─────────────────────────────────── │
│                                      │
│ PRIMARY INFORMATION                  │
│ (specific to entity type)            │
│                                      │
│ ─────────────────────────────────── │
│                                      │
│ CONNECTED DATA                       │
│ "Across the toolkit"                 │
│                                      │
│ Inline cards from OTHER tools:       │
│ - Investments by this org            │
│ - Decisions involving them           │
│ - Opportunities they've posted       │
│ - Narrative entries about them       │
│ - Precedents they were part of       │
│                                      │
│ ─────────────────────────────────── │
│                                      │
│ METADATA                             │
│ Last reviewed, created, updated      │
│ [Mark as reviewed]                   │
│                                      │
└──────────────────────────────────────┘
```

The "Connected Data" section is the most important part. This is where the inline references from the design doc manifest. When someone opens CACHE's org detail, they should see CACHE's investments, CACHE's upcoming decisions, CACHE's narrative entries, and opportunities CACHE has posted — all without leaving the panel. Each connected item is a compact card that links to its own detail in its own tool.

---

## Page-by-Page Specifications

---

### 1. DASHBOARD

#### Current Problem
Stats bar at top is just numbers. "Upcoming Interventions" only shows one item. "Needs Review" is empty. "Recent Activity" is a flat list. Nothing tells a story.

#### Redesign

**Hero Stats Row** — Keep but redesign. Instead of 8 equal boxes, use a hierarchy:

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  $6.04M                    10 compounding           │
│  tracked across             4 not compounding       │
│  18 investments              4 too early            │
│                                                     │
│  14 orgs · 12 practitioners · 8 active decisions    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

The total investment and compounding ratio are the headline. Everything else is secondary. The compounding ratio IS the story — use a small visual indicator (stacked bar or ratio visualization) showing green/red/gray proportions.

**Section: "Needs Attention"** — Replace "Upcoming Interventions" + "Needs Review" with a single prioritized section. Sorted by urgency:

```
NEEDS ATTENTION
Things that need action in the next 30 days

● DECISION FORMING   2026 Grant Cycle Priorities
  CACHE · Locks Mar 15 (25d) · Brief needed before Feb board meeting
  [View decision →]

● SUBMISSION          NWA Community Mural Project
  From Sarah Chen (Downtown Rogers) · Pending review
  [Review →]

● CLOSING SOON        Cultural District Branding RFP
  City of Bentonville · Due Feb 28 (10d)
  [View opportunity →]

● STALE ENTRY         University of Arkansas
  Ecosystem map entry not reviewed in 95 days
  [Review →]
```

This merges decisions, submissions, closing opportunities, and stale items into one prioritized queue. Color-coded by type. Each item has a single action.

**Section: "Recent Activity"** — Keep but improve the content. Currently shows "PUBLISHED OUTPUT" but for the investment line it just says "investment" with no name. Every activity entry needs:
- Action verb (Published, Created, Updated, Reviewed)
- Entity type
- Entity name (the actual title, not the generic type)
- Time ago
- If updated: what changed (one line)

**Section: "Ecosystem Pulse"** — NEW. A compact section showing the narrative-reality gaps:

```
NARRATIVE GAPS
Where the story doesn't match the data

HIGH GAP   City of Bentonville — "Creative Capital of the South"
           Investment flat YoY, practitioner outflow in music/film

HIGH GAP   BFF — "Year-round filmmaking destination"
           No post-production infrastructure, filmmaker retention weak

MEDIUM GAP CACHE Annual Report — "Record investment"
           Dollars up but unique recipients down
```

This immediately communicates what the narrative record tool is for and why it matters. It's a preview that makes someone want to click through.

---

### 2. ECOSYSTEM MAP

#### Current Problem
Flat alphabetical list of orgs. No practitioner tab. No relationships visible. No sense of ecosystem structure. Cards show controls/constraints but without hierarchy.

#### Redesign

**Two tabs**: Organizations | Practitioners (current build may have this but needs prominence)

**Organization Cards — Redesigned**:

```
┌─────────────────────────────────────────────────────┐
│ CACHE                                  Intermediary │
│                                                     │
│ Advance NWA creative economy through grants,        │
│ programs, and advocacy.                             │
│                                                     │
│ Controls: ~$2M grants, programming, advocacy        │
│                                                     │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│ │ 2 active │ │ 1 open   │ │ 2 upcoming│            │
│ │investments│ │decisions │ │ opps     │            │
│ └──────────┘ └──────────┘ └──────────┘            │
│                                                     │
│ Connected to: Walton FF, Crystal Bridges, City of B │
│                                             [View →]│
└─────────────────────────────────────────────────────┘
```

The key change: **inline connection counts**. Each org card shows how many investments, decisions, and opportunities involve them. This communicates density and importance at a glance. The "Connected to" line shows partner organizations.

**Organization Detail Panel** should show:
1. Full profile (mandate, controls, constraints, decision cycle, contacts)
2. "Across the Toolkit" section with:
   - Their investments (compact cards with amount, status, compounding)
   - Their upcoming decisions (title, locks date, status)
   - Opportunities they've posted
   - Narrative entries involving them
   - Precedents they were part of
3. Relationship map — even a simple list of connected orgs with relationship type

**Practitioner Cards — Redesigned**:

```
┌─────────────────────────────────────────────────────┐
│ Sample: Visual Artist A          Painting/Install.  │
│ 6 years in NWA                                      │
│                                                     │
│ Income: Gallery sales, CACHE grants, UA teaching    │
│                                                     │
│ ● Keeps them here: Studio space, CB community,      │
│   partner employment                                │
│ ▲ Risk: Studio lease +15%, limited gallery infra    │
│                                             [View →]│
└─────────────────────────────────────────────────────┘
```

Practitioners need the retention/risk framing visible on the card. That's the whole point — understanding who's staying, who might leave, and why.

**Practitioner Detail Panel** should show:
1. Full profile
2. Income breakdown (visual if possible — simple horizontal bar)
3. Retention factors (green indicators)
4. Risk factors (red/orange indicators)
5. Institutional affiliations (linked to org entries)
6. Notes / interview excerpts

**Filtering**:
- Organizations: by type (foundation, government, cultural institution, corporate, etc.), by tag
- Practitioners: by discipline, by tenure range, by risk level

**Sorting**:
- Organizations: alphabetical, by type, by investment count (most connected first)
- Practitioners: by tenure, by discipline, by risk level

---

### 3. INVESTMENTS

#### Current Problem
Flat list sorted by... unclear. Stats at top are four equal boxes. Compounding tags exist but don't tell the compounding story. No filtering. No chain visualization.

#### Redesign

**Stats Row — Story-First**:

Instead of four equal boxes, lead with the insight:

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│ $6.04M tracked across 18 initiatives                │
│                                                     │
│ ████████████████████░░░░░░░░  10 compounding        │
│ ████████░░░░░░░░░░░░░░░░░░░   4 not compounding    │
│ ████████████░░░░░░░░░░░░░░░   4 too early to tell  │
│                                                     │
│ Largest source: Walton FF ($1.9M)                   │
│ Most active category: Direct artist support         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

The compounding ratio visualization immediately communicates the health of the investment ecosystem.

**Investment Cards — Redesigned**:

```
┌─────────────────────────────────────────────────────┐
│ Creative Economy Grants — Cycle 2             $450K │
│ CACHE · Q1-Q2 2025 · Completed                      │
│                                                     │
│ 32 grants across 5 disciplines. Unique recipients   │
│ decreased from Cycle 1 despite higher total.        │
│                                                     │
│ ● Compounding                                       │
│ Builds on: Creative Economy Grants — Cycle 1        │
│                                             [View →]│
└─────────────────────────────────────────────────────┘
```

Key changes:
- Outcome text is visible on the card (not hidden in detail)
- Compounding chain visible ("Builds on" / "Led to")
- Source org is a clickable link to ecosystem map

**Investment Detail Panel** should show:
1. Full details (source, amount, period, category, description)
2. Outcome and compounding assessment with notes
3. **Compounding chain** — visual: previous investment → this → next investment, each clickable
4. Connected data: source organization profile, related precedent entry, related opportunity (if it started as one)
5. Tags

**Filtering**:
- By status (active, completed, planned)
- By compounding status (compounding, not compounding, too early)
- By source organization
- By category
- By amount range

**Sorting**:
- By amount (high to low)
- By date (recent first)
- By compounding status

---

### 4. DECISIONS

#### Current Problem
This is actually one of the better pages — it shows lock dates and days remaining. But dependencies are just text, not linked. Intervention notes are there but don't connect to the outputs that address them.

#### Redesign

**Timeline View** — Instead of a flat list, organize by temporal proximity:

```
WITHIN 30 DAYS
● 2026 Grant Cycle Priorities  [Deliberating]
  CACHE · Locks Mar 15 · 25d remaining
  Brief needed before Feb board meeting
  ▸ Related output: CACHE 2026 Grant Cycle Brief [Published]

WITHIN 90 DAYS
● 2027 Community Programming Slate  [Deliberating]
  Crystal Bridges · Locks Jun 15 · 117d remaining
  Share ecosystem map showing programming gaps
  ▸ Depends on: 2026 Grant Cycle Priorities

WITHIN 6 MONTHS
● Public Art Phase 3 Approach  [Upcoming]
  ...
● Creative Workforce Dev Phase 2  [Upcoming]
  ...
● BFF Year-Round Strategy  [Upcoming]
  ...

BEYOND 6 MONTHS
● FY2027 Cultural Budget Allocation  [Upcoming]
  ...
```

The temporal grouping creates urgency hierarchy. The "Related output" line shows when we've already produced something for this decision. The "Depends on" line shows linked dependencies (actual database links, not text).

**Decision Detail Panel** should show:
1. Full decision info (stakeholder, description, deliberation window, lock date)
2. **Dependency chain** — what this depends on, what depends on this (linked)
3. Intervention needed (what to do, by when)
4. Related outputs (briefs/frameworks already produced for this decision)
5. Connected stakeholder org profile (from ecosystem map)
6. Related investments (what this stakeholder has funded)
7. Related precedents (what's been tried in this area before)

---

### 5. PRECEDENTS

#### Current Problem
Cards show all the content at once — produced, worked, didn't work, takeaway. It's a wall of text. The four-column layout crams too much into each card. No sense of which precedents are most relevant right now.

#### Redesign

**Card — Progressive Disclosure**:

Show the takeaway first. Everything else is in the detail panel.

```
┌─────────────────────────────────────────────────────┐
│ NWA Creative Economy Strategic Plan        2018-2019│
│ CACHE, External consultants, Regional stakeholders  │
│                                                     │
│ TAKEAWAY                                            │
│ Comprehensive plans without implementation tracking  │
│ and sequencing logic get shelved. Next plan needs    │
│ fewer recommendations and built-in accountability.  │
│                                                     │
│ Connected to: Downtown Cultural District Planning,  │
│ CACHE Creative Economy Census                       │
│                                             [View →]│
└─────────────────────────────────────────────────────┘
```

The takeaway is what matters on the card. It's the sentence a decision-maker reads. Everything else (what it produced, what worked, what didn't) lives in the detail panel.

**"Connects to" line** — Shows which current investments or decisions this precedent is relevant to. This is the institutional memory function working: "you're about to make a decision, and here's what we learned last time."

**Precedent Detail Panel** should show:
1. Period, who was involved, description
2. What it produced
3. What worked (green accent)
4. What didn't work (red accent)
5. What it connects to (linked to current investments/decisions)
6. Takeaway (prominent, at top)
7. Related investment entry (if linked)
8. Timeline of connected events

**Filtering**:
- By time period
- By organizations involved
- By tag/theme

---

### 6. OPPORTUNITIES

#### Current Problem
Decent list view but no filtering. No way to see closed/awarded opportunities (lifecycle). No practitioner-facing public view distinction.

#### Redesign

**Three tabs**: Open | Closing Soon | Closed/Awarded

The closed tab shows lifecycle — what happened, who was awarded, and links to the investment ledger entry that resulted.

**Opportunity Cards — Redesigned**:

```
┌─────────────────────────────────────────────────────┐
│ GRANT        CACHE Creative Economy Micro-Grants    │
│                                                     │
│ $2,500 — $10,000             Due Mar 15, 2026       │
│                                      [27d remaining]│
│                                                     │
│ Project-based grants for creative work. Priority:   │
│ community engagement, cross-disciplinary, underserved│
│                                                     │
│ Eligibility: NWA-based practitioners and orgs       │
│                                             [View →]│
└─────────────────────────────────────────────────────┘
```

Type badge is prominent (GRANT, RFP, COMMISSION, RESIDENCY, FELLOWSHIP). Deadline has days remaining. Eligibility is always visible — that's what a practitioner checks first.

**Closed/Awarded Card**:

```
┌─────────────────────────────────────────────────────┐
│ GRANT        CACHE Creative Economy Grants - Cycle 2│
│                                          [Awarded]  │
│ $5,000 — $50,000                    Closed Feb 2025 │
│                                                     │
│ 32 awards made                                      │
│ → Became: Creative Economy Grants Cycle 2 investment│
│                                             [View →]│
└─────────────────────────────────────────────────────┘
```

The "Became" line links to the investment ledger entry. This shows the opportunity → investment lifecycle.

**Filtering**:
- By type (grant, RFP, commission, residency, fellowship, program)
- By amount range
- By source organization
- By eligibility (for practitioners: "things I'm eligible for")

---

### 7. NARRATIVES

#### Current Problem
Actually has the right structure — narrative vs. reality with gap indicator. But the cards are walls of text. The gap indicator doesn't visually dominate enough.

#### Redesign

**Lead with the gap indicator**:

```
┌─────────────────────────────────────────────────────┐
│ ██ HIGH GAP                                Jan 2026 │
│                                                     │
│ City of Bentonville — Economic Development          │
│ Regional Positioning                                │
│                                                     │
│ THE NARRATIVE                                       │
│ "Creative Capital of the South" — emphasis on       │
│ Crystal Bridges, trail system, tech startups        │
│                                                     │
│ THE REALITY                                         │
│ Cultural funding flat YoY. Net outflow of musicians │
│ and filmmakers. Practitioner income declining.       │
│                                                     │
│ Evidence: Investment ledger, practitioner data,      │
│ CACHE census                                        │
│                                             [View →]│
└─────────────────────────────────────────────────────┘
```

The gap indicator is a thick color bar on the left edge of the card. HIGH = red, MEDIUM = orange, LOW = subtle, ALIGNED = green. Visible from across the room.

**"Evidence" line** — Shows which other tools support the reality assessment. These should be clickable links.

**Filtering**:
- By gap level (high, medium, low, aligned)
- By source type (institutional, media, practitioner, regional positioning)
- By source organization

---

### 8. OUTPUTS

#### Current Problem
Basic list with type badge and published badge. No way to read the output. No connection to what triggered it. No citation links.

#### Redesign

**Two sections**: Published | Drafts

**Published Output Card**:

```
┌─────────────────────────────────────────────────────┐
│ DIRECTIONAL BRIEF                    Published      │
│                                       Feb 10, 2026  │
│                                                     │
│ CACHE 2026 Grant Cycle — Pre-Deliberation Brief     │
│                                                     │
│ Pre-deliberation brief for CACHE board. Surfaces    │
│ concentration trend, district plan overlap, and     │
│ practitioner retention signal.                      │
│                                                     │
│ Triggered by: 2026 Grant Cycle Priorities [decision]│
│ Delivered to: CACHE                                 │
│ Cites: 4 investments, 1 decision, 1 census         │
│                                             [Read →]│
└─────────────────────────────────────────────────────┘
```

"Triggered by" links to the decision that prompted it. "Cites" shows the reference count.

**Output Detail Panel — Full Reader View**:
The output content should be rendered as a clean, readable document. Not a code block. Formatted prose with:
- Title and metadata at top
- Full content rendered as paragraphs with proper typography
- Inline citations that are clickable — "[Investment Ledger: Cycle 2]" links to that investment entry
- At the bottom: "References" section listing all cited data points with links

This is where the intelligence layer comes to life. The output isn't just text — it's text connected to the data it draws from.

---

### 9. SUBMISSIONS

#### Current Problem
Flat list with "Pending" badges. The decision_flag and investment_verification entries don't show their actual content — just the submission type.

#### Redesign

**Submission Cards — Type-Specific**:

Each submission type should render differently based on what was submitted:

**Opportunity Submission**:
```
┌─────────────────────────────────────────────────────┐
│ OPPORTUNITY SUBMISSION          Pending · Feb 18    │
│                                                     │
│ NWA Community Mural Project                         │
│ From: Sarah Chen (Downtown Rogers Partnership)      │
│                                                     │
│ Commission · $5,000-$12,000 · Due Apr 30            │
│ NWA-based muralists                                 │
│                                                     │
│ [Approve & Create] [Reject] [View Details]          │
└─────────────────────────────────────────────────────┘
```

**Decision Flag**:
```
┌─────────────────────────────────────────────────────┐
│ DECISION FLAG                   Pending · Feb 18    │
│                                                     │
│ "Momentary considering changing residency model     │
│ from 4-week to 2-week"                              │
│ From: Anonymous (The Momentary)                     │
│ Expected: April 2026                                │
│                                                     │
│ [Create Decision Entry] [Dismiss] [View Details]    │
└─────────────────────────────────────────────────────┘
```

**Investment Verification**:
```
┌─────────────────────────────────────────────────────┐
│ INVESTMENT VERIFICATION         Pending · Feb 18    │
│                                                     │
│ Crystal Bridges — Community Art Education Program   │
│ From: Jamie Rodriguez (Crystal Bridges)             │
│                                                     │
│ Correction: Actual amount $195K (not $175K,         │
│ includes in-kind facility costs)                    │
│ Additional: Parent engagement component not captured │
│                                                     │
│ [Apply Correction] [Dismiss] [View Current Entry]   │
└─────────────────────────────────────────────────────┘
```

Each submission type has specific actions. "Approve & Create" for opportunities creates the entry directly. "Apply Correction" for verifications updates the existing investment entry. The JSONB data should be parsed and displayed meaningfully, not shown as a generic type label.

---

## Component Library Specs

### Card Component
```
- Background: var(--bg-surface)
- Border: 1px solid var(--border-subtle)
- Border-radius: 8px
- Padding: 24px
- Hover: border-color transitions to var(--border-medium), very subtle box-shadow
- Clickable cards: cursor pointer, entire card is click target
- Active/selected: left border 2px solid var(--accent-gold)
```

### Status Badge
```
- Pill shape, border-radius: 12px
- Padding: 3px 10px
- Font-size: 11px, font-weight: 600, letter-spacing: 0.03em
- Border: 1px solid matching color at 40% opacity
- Background: matching color at 8% opacity
- Text: matching color
- e.g., "Compounding" = green text, green/8% bg, green/40% border
```

### Stat Display
```
- Number: display font, 28px, font-weight: 700, var(--text-primary)
- Label: body font, 11px, uppercase, letter-spacing: 0.08em, var(--text-tertiary)
- Optional color dot before number for status-coded stats
```

### Section Header (within pages)
```
- Title: display font, 16px, font-weight: 600, var(--text-primary)
- Subtitle: body font, 13px, var(--text-secondary)
- Optional count badge next to title
- Divider line: 1px var(--border-subtle) below, 12px margin
```

### Detail Panel (slide-over)
```
- Width: 55% of viewport (min 500px, max 800px)
- Background: var(--bg-surface)
- Left border: 1px solid var(--border-subtle)
- Entry animation: slide from right, 0.2s ease-out
- Overlay: left side dims to 40% opacity black
- Close: click overlay, click X, or press Escape
- Scroll: panel content scrolls independently
```

### Inline Reference Card (inside detail panels)
```
- Compact card showing data from another tool
- Background: var(--bg-inset)
- Border-radius: 6px
- Padding: 12px 16px
- Left accent bar: 2px, color matches source tool
  (gold for investments, blue for decisions, green for opportunities, etc.)
- Title: 13px, font-weight: 600
- Subtitle: 12px, var(--text-secondary)
- Click: navigates to that tool and opens the item's detail
```

### Filter Bar
```
- Row of filter dropdowns/buttons above content
- Each filter: pill-style toggle button
- Inactive: border only, var(--text-tertiary)
- Active: filled background var(--accent-gold) at 10%, gold text
- Clear all: text button at right
- Mobile: horizontally scrollable row
```

### Empty State
```
- Centered in content area
- Icon: 48px, var(--text-tertiary)
- Title: 16px, var(--text-secondary), font-weight: 500
- Description: 13px, var(--text-tertiary)
- Action button: if applicable
- Example: "No precedents yet. Start documenting what's been tried."
```

---

## Cross-Tool Connection Spec

This is the feature that makes the toolkit more than seven separate databases. Here's exactly what each entity type should show from other tools in its detail panel:

### Organization Detail → Shows:
- Investments where `source_org_id` matches (their funding)
- Decisions where `stakeholder_org_id` matches (their decisions)
- Opportunities where `source_org_id` matches (what they're offering)
- Narratives where `source_org_id` matches (stories about them)
- Contacts linked to this org
- Org relationships (who they're connected to)

### Investment Detail → Shows:
- Source organization profile (from ecosystem map)
- Compounding chain (builds_on → this → led_to)
- Related precedent (if `precedent_id` is set)
- Related opportunity (if this investment started as an awarded opportunity)
- Outputs that cite this investment (from `output_references`)

### Decision Detail → Shows:
- Stakeholder organization profile
- Decision dependencies (linked decisions via `decision_dependencies`)
- Outputs triggered by this decision (where `triggered_by_decision_id` matches)
- Related investments by the same stakeholder
- Related precedents (semantic — same domain/topic)

### Precedent Detail → Shows:
- Related investment (if `investment_id` is set)
- Current decisions that this precedent is relevant to (manual connection or tag-based)
- Organizations involved (linked when possible)

### Opportunity Detail → Shows:
- Source organization profile
- If closed/awarded: the investment it became (via `awarded_investment_id`)

### Narrative Detail → Shows:
- Source organization profile
- Evidence links to specific investments, opportunities, or practitioner data that support the reality assessment

### Output Detail → Shows:
- All references (from `output_references`) rendered as clickable inline citations
- Decision that triggered it
- Target stakeholder organization

---

## What to Build First

Priority order for Claude Code:

1. **Typography and spacing** — swap fonts, adjust padding, fix the visual foundation
2. **Sidebar redesign** — add verb labels, grouping, refined active states
3. **Page subtitles** — add the explanatory language to every page header
4. **Detail panel** — build the slide-over component, wire it up for organizations first
5. **Cross-tool connections** — add "Across the Toolkit" section to org detail panel
6. **Investment cards** — add compounding chain, outcome text, source links
7. **Decision timeline grouping** — organize by temporal proximity
8. **Precedent card simplification** — takeaway first, details in panel
9. **Narrative gap indicator redesign** — thick color bar, evidence links
10. **Output reader** — formatted content with inline citations
11. **Submission type-specific rendering** — parse JSONB, show meaningful content
12. **Filtering** — add to every page
13. **Dashboard redesign** — needs attention queue, narrative pulse section

This order matters. Typography and the sidebar fix the feel immediately. The detail panel and cross-tool connections are what make this a toolkit instead of a database viewer. Everything else builds on those foundations.

---

## Note on the Public Surface

This spec covers the practice surface only. The public surface (opportunity browsing, published output reader) should be designed separately once the practice surface is right. The public surface has completely different typography, layout, and interaction patterns — it's a publication, not a tool.
