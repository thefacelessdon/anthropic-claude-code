# DESIGN_AMENDMENT.md — Card Design, Detail Panels, and Visual Hierarchy

Read this after DESIGN_SPEC.md. This overrides and refines the card layouts, detail panel content, and visual hierarchy across every page. Apply these changes in order.

---

## 1. GLOBAL LAYOUT: SWITCH TO SINGLE-COLUMN CARDS

Every page currently uses a 2-column card grid. Change all pages to **single-column, full-width cards**. No exceptions.

**Why:** The content is text-heavy. Two columns force text wrapping that makes cards taller while showing less. Sections with 1-2 items leave empty space. Single column lets each card hug its content and stack tightly.

```css
/* Replace all card grid layouts with: */
.card-list {
  display: flex;
  flex-direction: column;
  gap: 6px; /* tight stacking — borders provide separation */
}

.card {
  padding: 16px 20px; /* tighter vertical, comfortable horizontal */
  min-height: unset; /* cards hug their content */
}
```

---

## 2. CARD SCAN PATH: EVERY CARD TYPE GETS A DIFFERENT VISUAL ANCHOR

The current cards have no hierarchy — badge, title, text block, all at similar visual weight. Fix: each card type has a **dominant element** your eye hits in under 2 seconds.

### Investment Cards

The dollar amount is the visual anchor. Right-aligned, large, monospace.

```
┌─────────────────────────────────────────────────────────────┐
│ ● Compounding   Active                          $750,000   │
│                                                  2024-2025  │
│ Downtown Cultural District Planning                         │
│ Walton Family Foundation · Strategic Planning               │
│                                                             │
│ Community input phase completed. Draft recommendations      │
│ in development.                                             │
│                                                             │
│ Builds on: NWA Creative Economy Strategic Plan (2019) →     │
└─────────────────────────────────────────────────────────────┘
```

Implementation:
- Amount: `font-family: monospace; font-size: 22px; font-weight: 700; text-align: right;` positioned top-right
- Period: `font-size: 12px; color: var(--text-tertiary);` directly below amount
- Compounding indicator: colored dot + text, top-left, same line as status badge
- Title: `font-family: serif; font-size: 16px; font-weight: 600;`
- Source org + category: `font-size: 13px; color: var(--text-secondary);` single line
- Outcome text: `font-size: 13px; color: var(--text-secondary);` 2-line max, truncate with ellipsis
- Chain link ("Builds on" / "Led to"): `font-size: 12px; color: var(--accent-gold);` at bottom with arrow icon

Top section is a **flex row**: left side has badges, right side has amount. Creates an L-shaped scan: eye goes to amount (top-right), then drops to title (left), then optionally reads description.

### Decision Cards

The lock date and countdown are the visual anchor.

```
┌─────────────────────────────────────────────────────────────┐
│ ● Deliberating                              Locks Mar 15   │
│                                                 25d left   │
│ 2026 Grant Cycle Priorities                                 │
│ CACHE                                                       │
│                                                             │
│ Directional brief needed before Feb board meeting.          │
│                                                             │
│ ▸ Output: CACHE 2026 Grant Cycle Brief [Published]          │
│ ▸ Depends on: 2027 Community Programming Slate              │
└─────────────────────────────────────────────────────────────┘
```

Implementation:
- Lock date: `font-family: monospace; font-size: 15px; font-weight: 600; text-align: right;`
- Countdown: below lock date, color-coded: ≤30d = `var(--status-red)`, 31-90d = `var(--status-orange)`, >90d = `var(--text-secondary)`
- Status badge: left side, colored dot + label
- Title: `font-family: serif; font-size: 16px; font-weight: 600;`
- Stakeholder org: `font-size: 13px; color: var(--text-secondary);`
- Intervention note: `font-size: 13px; color: var(--text-secondary);` 1-2 lines max
- Related output link: `font-size: 12px; color: var(--accent-gold);` — shows if an output exists for this decision
- Dependency link: `font-size: 12px; color: var(--text-tertiary);` — shows linked decision dependencies

### Opportunity Cards

Deadline countdown and amount are the dual anchors.

```
┌─────────────────────────────────────────────────────────────┐
│ GRANT   Open                        $2,500 – $10,000       │
│                                         Due Mar 15 (27d)   │
│ CACHE Creative Economy Micro-Grants                         │
│                                                             │
│ Project-based grants for creative work. Priority:           │
│ community engagement, cross-disciplinary.                   │
│                                                             │
│ Eligibility: NWA-based practitioners and orgs               │
└─────────────────────────────────────────────────────────────┘
```

Implementation:
- Type badge (GRANT, RFP, COMMISSION, etc.): `font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;` with colored border pill
- Amount range: `font-family: monospace; font-size: 16px; font-weight: 600; text-align: right;`
- Deadline + countdown: `font-family: monospace; font-size: 13px; text-align: right;` — countdown color-coded same as decisions
- Title: `font-family: serif; font-size: 16px; font-weight: 600;`
- Description: `font-size: 13px; color: var(--text-secondary);` 2-line max
- Eligibility: `font-size: 12px; color: var(--text-tertiary);` always visible — this is what practitioners check first

### Narrative Cards

The gap indicator is the dominant element — a thick left border, not a small badge.

```
┌──┬──────────────────────────────────────────────────────────┐
│  │ HIGH GAP · Regional Positioning              Jan 2026   │
│  │                                                          │
│R │ City of Bentonville — Economic Development               │
│E │                                                          │
│D │ SAYS: "Creative Capital of the South" — Crystal Bridges, │
│  │ trail system, tech startups                              │
│B │                                                          │
│A │ REALITY: Cultural funding flat YoY. Net outflow of       │
│R │ musicians and filmmakers. Practitioner income declining.  │
│  │                                                          │
│  │ Evidence: Investment ledger, practitioner data, census    │
└──┴──────────────────────────────────────────────────────────┘
```

Implementation:
- Left border: `border-left: 4px solid;` color matches gap level (red/orange/subtle-green/green)
- Gap level + source type: `font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;` — gap level is colored text
- Source name: `font-family: serif; font-size: 16px; font-weight: 600;`
- "SAYS" label: `font-size: 11px; font-weight: 600; color: var(--text-tertiary); letter-spacing: 0.04em;`
- Narrative text: `font-size: 13px; color: var(--text-primary);` — italic if possible to distinguish it as a claim
- "REALITY" label: same styling as SAYS
- Reality text: `font-size: 13px; color: var(--text-primary);` regular weight
- Evidence line: `font-size: 12px; color: var(--accent-gold);` — these should eventually be clickable links

### Precedent Cards

The takeaway IS the card. Everything else is in the detail panel.

```
┌─────────────────────────────────────────────────────────────┐
│ NWA Creative Economy Strategic Plan              2018-2019  │
│ CACHE, External consultants, Regional stakeholders          │
│                                                             │
│ "Comprehensive plans without implementation tracking and    │
│ sequencing logic get shelved. Next plan needs fewer          │
│ recommendations, built-in accountability, and explicit      │
│ sequencing."                                                │
│                                                             │
│ Connects to: Downtown Cultural District Planning,           │
│ CACHE Creative Economy Census                               │
└─────────────────────────────────────────────────────────────┘
```

Implementation:
- Title: `font-family: serif; font-size: 16px; font-weight: 600;`
- Period: `font-family: monospace; font-size: 13px; color: var(--text-tertiary);` right-aligned on same line as title
- Involved: `font-size: 13px; color: var(--text-secondary);` single line, truncate if long
- Takeaway: `font-size: 14px; color: var(--text-primary); font-style: italic; border-left: 2px solid var(--accent-gold); padding-left: 12px;` — styled as a pull quote
- "Connects to" line: `font-size: 12px; color: var(--accent-gold);` with linked entity names

Do NOT show "What Produced," "What Worked," "What Didn't Work" on the card. Those go in the detail panel under "Lessons."

### Organization Cards

Connection counts are the visual anchor — showing how connected this org is across the toolkit.

```
┌─────────────────────────────────────────────────────────────┐
│ CACHE                                        Intermediary   │
│                                                             │
│ Advance NWA creative economy through grants, programs,      │
│ and advocacy.                                               │
│                                                             │
│ Controls: ~$2M grants, programming, advocacy, data          │
│                                                             │
│ 4 investments · 1 decision · 2 opportunities · 1 narrative  │
│ Connected to: Walton FF, Crystal Bridges, City of B, AAC    │
└─────────────────────────────────────────────────────────────┘
```

Implementation:
- Name: `font-family: serif; font-size: 16px; font-weight: 600;`
- Type badge: right-aligned, pill style
- Mandate: `font-size: 13px; color: var(--text-secondary);` 2-line max
- Controls: `font-size: 12px; color: var(--text-tertiary);` preceded by "Controls:" label
- Connection counts: `font-size: 12px; color: var(--text-secondary);` — these numbers are fetched from the database (count investments, decisions, opportunities, narratives where org matches). Separate with middots or pipes.
- Connected orgs: `font-size: 12px; color: var(--accent-gold);` — names from org_relationships table

The connection count line is the key differentiator. An org with "4 investments · 3 decisions · 2 narratives" is clearly a major ecosystem player. An org with "0 investments · 0 decisions" is peripheral.

### Practitioner Cards

Retention and risk signals are the visual anchors.

```
┌─────────────────────────────────────────────────────────────┐
│ Sample: Visual Artist A                Painting / Install.  │
│ 6 years in NWA                                              │
│                                                             │
│ Income: Gallery sales, CACHE grants, UA teaching            │
│                                                             │
│ ● Studio space, CB community, partner employment            │
│ ▲ Studio lease +15%, limited gallery infrastructure         │
└─────────────────────────────────────────────────────────────┘
```

Implementation:
- Name: `font-family: serif; font-size: 16px; font-weight: 600;`
- Discipline: right-aligned, `font-size: 13px; color: var(--text-secondary);`
- Tenure: `font-size: 13px; color: var(--text-tertiary);`
- Income: `font-size: 12px; color: var(--text-secondary);`
- Retention line (●): `font-size: 12px; color: var(--status-green);` — green dot prefix
- Risk line (▲): `font-size: 12px; color: var(--status-orange);` or `var(--status-red)` — triangle prefix
- Keep retention/risk to ONE LINE each on the card. Full text in the detail panel.

### Output Cards

Type and trigger are the visual anchors.

```
┌─────────────────────────────────────────────────────────────┐
│ DIRECTIONAL BRIEF   Published                Feb 10, 2026  │
│                                                             │
│ CACHE 2026 Grant Cycle — Pre-Deliberation Brief             │
│                                                             │
│ Surfaces concentration trend, district plan overlap,        │
│ and practitioner retention signal.                          │
│                                                             │
│ Triggered by: 2026 Grant Cycle Priorities                   │
│ Delivered to: CACHE · Cites: 4 investments, 1 decision      │
└─────────────────────────────────────────────────────────────┘
```

### Submission Cards

Already detailed in DESIGN_SPEC.md. Key point: parse the JSONB `data` field and render type-specific content. Don't show "decision_flag" as the title — show the actual submitted content.

---

## 3. DETAIL PANELS: EARN THE CLICK

The detail panel must show something the card doesn't. Currently it just reformats the same data with labels. Fix: every detail panel has three sections.

### Section 1: Entity Details
The primary information, formatted well. This is the expanded version of what was on the card.

### Section 2: Across the Toolkit
**This is the section that makes this a toolkit.** It shows connected data from other tools as compact inline reference cards.

**Inline Reference Card component:**
```css
.inline-ref {
  background: var(--bg-inset); /* darker than the panel */
  border-radius: 6px;
  padding: 10px 14px;
  border-left: 3px solid; /* color by source tool */
  cursor: pointer;
  margin-bottom: 4px;
  transition: border-color 0.15s;
}
.inline-ref:hover {
  border-left-color: var(--accent-gold);
}
```

Tool colors for the left border:
- Investments: `var(--accent-gold)` (gold)
- Decisions: `var(--status-blue)` (blue)
- Opportunities: `var(--status-green)` (green)
- Narratives: `var(--status-orange)` (orange)
- Precedents: `var(--text-tertiary)` (neutral)
- Outputs: `var(--status-purple)` (purple)

Each inline reference card shows: tool icon + type label, entity title, one key data point (amount for investments, lock date for decisions, etc.), and clicking it navigates to that tool and opens that item's detail.

Here's exactly what each detail panel's "Across the Toolkit" section should query and display:

**Organization detail panel:**
```sql
-- Their investments
SELECT * FROM investments WHERE source_org_id = [this_org_id];
-- Their decisions
SELECT * FROM decisions WHERE stakeholder_org_id = [this_org_id];
-- Their opportunities
SELECT * FROM opportunities WHERE source_org_id = [this_org_id];
-- Their narratives
SELECT * FROM narratives WHERE source_org_id = [this_org_id];
-- Their contacts
SELECT * FROM contacts WHERE organization_id = [this_org_id];
-- Their relationships
SELECT * FROM org_relationships WHERE org_a_id = [this_org_id] OR org_b_id = [this_org_id];
```

**Investment detail panel:**
```sql
-- Source org
SELECT * FROM organizations WHERE id = [source_org_id];
-- Compounding chain
SELECT * FROM investments WHERE id = [builds_on_id]; -- parent
SELECT * FROM investments WHERE builds_on_id = [this_id]; -- children
-- Related precedent
SELECT * FROM precedents WHERE id = [precedent_id];
-- Outputs that cite this
SELECT o.* FROM outputs o
  JOIN output_references r ON r.output_id = o.id
  WHERE r.reference_id = [this_id] AND r.reference_type = 'investment';
-- Opportunity that became this
SELECT * FROM opportunities WHERE awarded_investment_id = [this_id];
```

**Decision detail panel:**
```sql
-- Stakeholder org
SELECT * FROM organizations WHERE id = [stakeholder_org_id];
-- Dependencies (this depends on)
SELECT d.* FROM decisions d
  JOIN decision_dependencies dd ON dd.depends_on_id = d.id
  WHERE dd.decision_id = [this_id];
-- Dependents (depend on this)
SELECT d.* FROM decisions d
  JOIN decision_dependencies dd ON dd.decision_id = d.id
  WHERE dd.depends_on_id = [this_id];
-- Output triggered by this
SELECT * FROM outputs WHERE triggered_by_decision_id = [this_id];
-- Related investments by same stakeholder
SELECT * FROM investments WHERE source_org_id = [stakeholder_org_id];
```

**Precedent detail panel:**
```sql
-- Related investment
SELECT * FROM investments WHERE id = [investment_id];
-- Current active decisions this might be relevant to (same stakeholder orgs)
-- This is looser — show decisions from orgs mentioned in the precedent's "involved" field
```

**Opportunity detail panel:**
```sql
-- Source org
SELECT * FROM organizations WHERE id = [source_org_id];
-- Became this investment (if awarded)
SELECT * FROM investments WHERE id = [awarded_investment_id];
```

**Narrative detail panel:**
```sql
-- Source org
SELECT * FROM organizations WHERE id = [source_org_id];
-- Related investments (from evidence)
-- Related practitioner data (from evidence)
```

**Output detail panel:**
```sql
-- All references
SELECT * FROM output_references WHERE output_id = [this_id];
-- For each reference, fetch the actual entity by reference_type and reference_id
-- Triggering decision
SELECT * FROM decisions WHERE id = [triggered_by_decision_id];
-- Target stakeholder
SELECT * FROM organizations WHERE id = [target_stakeholder_id];
```

### Section 3: Record
Metadata at the bottom: created date, last reviewed, updated. "Mark as reviewed" button that updates `last_reviewed_at`. Edit button.

---

## 4. DETAIL PANEL: INVESTMENT COMPOUNDING CHAIN VISUALIZATION

When an investment has `builds_on_id` or there are investments whose `builds_on_id` points to it, render a visual chain:

```
┌──────────────────────┐     ┌──────────────────────┐     ┌─────────┐
│ Grants Cycle 1       │ ──→ │ Grants Cycle 2       │ ──→ │   ???   │
│ $380K · Completed    │     │ $450K · Completed    │     │ Cycle 3 │
│ ● Compounding        │     │ ● Compounding        │     │         │
└──────────────────────┘     └──────────────────────┘     └─────────┘
                              ▲ YOU ARE HERE
```

Implementation:
- Horizontal flex row of compact cards connected by arrow SVGs or CSS borders
- Current investment has a highlighted border (`var(--accent-gold)`)
- Each chain node shows: title (truncated), amount, status, compounding indicator
- Nodes are clickable — navigates to that investment's detail
- If the chain is just this investment alone (no builds_on, nothing builds on it), don't show the visualization — just show the compounding assessment text
- The "???" node appears if this is the most recent in a chain and has status "completed" — suggesting a next phase could exist

---

## 5. DETAIL PANEL: DECISION DELIBERATION TIMELINE

Show a visual timeline of the decision's lifecycle:

```
Jan 15 ─────────●───────────── Feb 28 ──── Mar 15
Started        TODAY          Deliberation   LOCKS
deliberating                  ends
```

Implementation:
- Horizontal bar showing the full deliberation → lock window
- "Today" marker positioned proportionally
- Color: bar fills green up to today, remaining is gray
- If past deliberation_end but before locks_date: bar turns orange ("Decision period ended, lock approaching")
- If within 14 days of lock: entire bar turns red

---

## 6. TYPOGRAPHY HIERARCHY — THREE LEVELS

Apply consistently across ALL cards and panels:

**Level 1 — Entity Title:**
```css
font-family: var(--font-serif); /* Instrument Serif, Fraunces, etc. */
font-size: 16px; /* on cards */
font-size: 22px; /* in detail panel header */
font-weight: 600;
color: var(--text-primary);
line-height: 1.3;
```

**Level 2 — Key Values (amounts, dates, status):**
```css
font-family: var(--font-mono); /* JetBrains Mono, IBM Plex Mono */
font-size: 14px; /* inline values */
font-size: 22px; /* dominant anchor on cards, e.g., dollar amount */
font-weight: 600;
color: var(--text-primary);
letter-spacing: -0.01em;
```

**Level 3 — Descriptions, notes, body:**
```css
font-family: var(--font-sans); /* DM Sans, Plus Jakarta Sans */
font-size: 13px;
font-weight: 400;
color: var(--text-secondary);
line-height: 1.5;
```

**Labels (PERIOD, CATEGORY, STATUS, etc.):**
```css
font-family: var(--font-sans);
font-size: 11px;
font-weight: 600;
letter-spacing: 0.06em;
text-transform: uppercase;
color: var(--text-tertiary);
margin-bottom: 2px;
```

---

## 7. DETAIL PANEL SIZING

```css
.detail-panel {
  width: 50vw;
  max-width: 720px;
  min-width: 480px;
  height: 100vh;
  position: fixed;
  top: 0;
  right: 0;
  overflow-y: auto;
  background: var(--bg-surface);
  border-left: 1px solid var(--border-subtle);
  padding: 32px;
  z-index: 50;
}

.detail-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 49;
  /* Clicking overlay closes the panel */
}
```

The list behind the panel should NOT blur — just dim via the overlay. Blur is a performance hit and makes the list unreadable. The dim overlay lets you still see enough to maintain context.

---

## 8. BUILD PRIORITY

Execute in this order:

1. **Switch all pages to single-column layout.** Remove the 2-column grid everywhere. Cards full width, tight gap.

2. **Apply typography hierarchy.** Import fonts if not already. Set the three levels (serif titles, mono values, sans body) and labels consistently.

3. **Redesign investment cards** with amount as dominant anchor, compounding chain link, source org line.

4. **Redesign decision cards** with lock date as dominant anchor, countdown color-coding, output/dependency links.

5. **Redesign opportunity cards** with amount + deadline as dual anchors, type badge prominent, eligibility always visible.

6. **Redesign narrative cards** with 4px left border gap indicator, SAYS/REALITY labels, evidence line.

7. **Redesign precedent cards** — takeaway as pull quote, remove all other content from card. Title + period + involved + takeaway + connects-to only.

8. **Redesign org cards** — add connection counts (query counts from investments, decisions, opportunities, narratives for this org), add connected orgs from relationships.

9. **Redesign practitioner cards** — retention (green) and risk (orange/red) as single-line indicators.

10. **Build "Across the Toolkit" section in detail panels.** Start with organization details (it connects to the most other tools). Use the SQL queries above. Inline reference cards with tool-colored left borders.

11. **Add compounding chain visualization** to investment detail panels.

12. **Add deliberation timeline** to decision detail panels.

13. **Redesign output detail panel** as a clean reader view — render content as formatted prose, not code. Inline citations clickable. References section at bottom.

14. **Redesign submission cards** — parse JSONB data, show type-specific content and actions.

---

## 9. WHAT NOT TO DO

- Don't add filtering yet. Get the visual hierarchy and connected data right first.
- Don't touch the dashboard yet. It changes last because it pulls from everything.
- Don't optimize for mobile yet. Get desktop right. Mobile is iteration two.
- Don't add animations beyond the panel slide-in and card hover transitions. Motion should be minimal and purposeful.
- Don't change the color palette or dark theme. The current dark palette is fine. The issue is hierarchy and structure, not color.
