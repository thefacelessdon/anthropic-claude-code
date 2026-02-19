# OUTPUTS_REDESIGN.md — The Synthesis Layer

Read this after DESIGN_AMENDMENT.md. This refines the Outputs page — where the practice team turns toolkit intelligence into deliverables that reach decision-makers.

---

## What This Tool Does

Every other tool in the kit is about collection and analysis. Outputs is where analysis becomes action. The practice team writes briefs, frameworks, and analyses that synthesize data from across the toolkit — investments, decisions, precedents, narratives, practitioner reality — into documents delivered to specific people ahead of specific decisions.

An output is the answer to: "What does this person need to know before this decision locks?"

The CACHE Grant Cycle Brief exists because a decision is locking March 14, and the board needs to see the concentration trend before they set Cycle 3 priorities. The Public Art memory transfer exists because Phase 3 is upcoming and the City needs to see what happened in Phases 1-2. Every output should trace back to a reason it exists and a person who needs to see it.

---

## What's Working

- Published / Drafts tabs — correct separation
- Output type badges (DIRECTIONAL BRIEF, MEMORY TRANSFER, STATE OF ECOSYSTEM) — these communicate purpose
- "Triggered by: [decision]" on cards — this is the cross-tool connection that matters most
- "Delivered to: [org]" on cards — shows who the audience is
- Content in the detail panel reads well — the CACHE brief is substantive and analytical
- Date in mono on cards — temporal context

Don't break any of this. The refinements below are additions and structural improvements, not replacements.

---

## 1. FIX: Stats Bar Should Be Editorial

### Current State
No stats bar. Just the Published/Drafts tabs.

### Required State

```
3 outputs published, 0 in draft. 2 are decision-triggered — the
CACHE Grant Cycle brief (delivers before Mar 14 lock) and the
Public Art memory transfer (delivers before Aug 15 lock). 1 is
a standing ecosystem analysis.
```

This tells the practice team at a glance: how many outputs exist, how many are connected to deadlines, and what's at stake.

### How to compute

```typescript
const outputs = await supabase.from('outputs').select(`
  *, 
  triggered_by:decisions!triggered_by_decision_id(decision_title, locks_date, status),
  target:organizations!target_stakeholder_id(name)
`);

const published = outputs.filter(o => o.is_published);
const drafts = outputs.filter(o => !o.is_published);
const decisionTriggered = published.filter(o => o.triggered_by);
```

Same editorial sentence styling as other tools.

---

## 2. ENRICH: Card Information

### Current State
Cards show: type badge, published badge, title, summary, triggered by, delivered to.

### Improvements

**Add delivery status.** An output that's published but not yet delivered is incomplete. Add a simple status concept:

```
Published → Delivered → Acknowledged
```

- **Published:** The output exists and is finalized
- **Delivered:** The practice team has sent it to the target stakeholder
- **Acknowledged:** The stakeholder has confirmed receipt or engaged with it

For now, this is a manual field. The practice team marks it. But it closes the loop — without it, you publish into the void.

**Schema addition:**
```sql
ALTER TABLE outputs ADD COLUMN IF NOT EXISTS delivery_status TEXT 
  DEFAULT 'published'
  CHECK (delivery_status IN ('draft', 'published', 'delivered', 'acknowledged'));
ALTER TABLE outputs ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
ALTER TABLE outputs ADD COLUMN IF NOT EXISTS delivered_to_contact TEXT;
ALTER TABLE outputs ADD COLUMN IF NOT EXISTS delivery_notes TEXT;
```

**Card display with delivery status:**

```
┌─────────────────────────────────────────────────────────────────┐
│ DIRECTIONAL BRIEF   Published · Delivered           Feb 9, 2026 │
│                                                                 │
│ CACHE 2026 Grant Cycle — Pre-Deliberation Brief                 │
│                                                                 │
│ Pre-deliberation brief for CACHE board ahead of 2026            │
│ grant cycle priority-setting. Surfaces concentration            │
│ trend, district plan overlap, practitioner retention.           │
│                                                                 │
│ Triggered by: 2026 Grant Cycle Priorities (locks Mar 14)        │
│ Delivered to: Rachel Torres, CACHE                              │
└─────────────────────────────────────────────────────────────────┘
```

The "Delivered to" line should show the specific person when `delivered_to_contact` exists, falling back to the org name when it doesn't.

**Delivery status badge colors:**
- Draft: no badge (it's in the Drafts tab)
- Published: green outline badge
- Delivered: solid green badge
- Acknowledged: solid green badge with checkmark

---

## 3. REDESIGN: Detail Panel

### Current State
Shows: title, type + status + date, Summary, Content. The content section is plain text.

### Required State

The detail panel should show the output as a document with clear provenance — what triggered it, what data informed it, who it's for, and whether it landed.

```
← Back to outputs

CACHE 2026 Grant Cycle — Pre-Deliberation Brief
DIRECTIONAL BRIEF  ·  Published  ·  Delivered  ·  Feb 9, 2026

────────────────────────────────────────

Context

  ┌─ Decision ────────────────────────────────────────────┐
  │ CACHE 2026 Grant Cycle Priorities                      │
  │ CACHE · Deliberating · Locks Mar 14                    │
  │ "Directional brief needed before Feb board meeting"   │
  └────────────────────────────────────────────────────────┘

  Delivered to: Rachel Torres, Executive Director, CACHE
  Delivered: Feb 10, 2026
  Status: Acknowledged — discussed in Feb 12 board prep meeting

  This section makes the output's purpose immediately clear.
  It exists because of this decision. It was delivered to this
  person. Here's whether it landed.

Summary

  Pre-deliberation brief for CACHE board ahead of 2026 grant
  cycle priority-setting. Surfaces concentration trend, district
  plan overlap risk, and practitioner retention signal.

Content

  [Full output text — this is the actual brief]

  CACHE's board meets in February to set 2026 grant priorities.
  Three things they should see before that conversation:

  1. THE CONCENTRATION PROBLEM
  ...

  [This section should render markdown if the content
  field contains markdown formatting. Headers, bold,
  lists should all render properly.]

Sources Referenced

  This section replaces generic "references." It shows the
  specific toolkit entries that informed this output, pulled
  from the output_references junction table.

  ┌─ Investment ──────────────────────────────────────────┐
  │ Creative Economy Grants - Cycle 1 · $450K              │
  │ CACHE · Completed · Compounding                        │
  └────────────────────────────────────────────────────────┘

  ┌─ Investment ──────────────────────────────────────────┐
  │ Creative Economy Grants - Cycle 2 · $520K              │
  │ CACHE · Completed · Not compounding                    │
  └────────────────────────────────────────────────────────┘

  ┌─ Precedent ───────────────────────────────────────────┐
  │ CACHE Grant Cycle Evolution (Cycles 1-2)               │
  │ 2024-2025 · Grant programs that increase total...     │
  └────────────────────────────────────────────────────────┘

  ┌─ Narrative ───────────────────────────────────────────┐
  │ CACHE Annual Report 2025                               │
  │ Medium Gap · "Record investment" vs. concentration    │
  └────────────────────────────────────────────────────────┘

  ┌─ Practitioner ────────────────────────────────────────┐
  │ Practitioner Interviews (Aggregated)                   │
  │ Aligned · Income declining despite rising investment  │
  └────────────────────────────────────────────────────────┘

  These are clickable inline reference cards. Each navigates
  to the referenced entity's detail panel in its own tool.

  Query:
  ```sql
  SELECT or.*, or.reference_type, or.reference_id, or.context_note
  FROM output_references or
  WHERE or.output_id = [this_output_id];
  ```

  Then fetch the actual entity for each reference to get
  display data (title, amount, status, etc.).

Record

  Created: Feb 5, 2026
  Published: Feb 9, 2026
  Delivered: Feb 10, 2026
  Last reviewed: Feb 19, 2026
  [Mark as reviewed]  [Edit]
```

### Section order in detail panel:

1. **Title + badges** (type, status, delivery status, date)
2. **Context** — triggered-by decision card + delivery info
3. **Summary** — 2-3 sentence overview
4. **Content** — full text, rendered as markdown
5. **Sources Referenced** — inline reference cards for each toolkit entry used
6. **Record** — dates, review, edit actions

---

## 4. THE DRAFTING WORKFLOW

This is the biggest gap. Where does the practice team write an output? Right now, there's no visible creation flow.

### How It Should Work

**Step 1: Trigger.** The practice team sees a decision approaching and decides an output is needed. They can initiate from two places:

- **From the Decisions page:** A decision card has "Intervention needed: Directional brief needed before Feb board meeting." A button on the decision detail panel: `[Draft output for this decision →]`
- **From the Outputs page:** A `[New output]` button in the top right, next to the Published/Drafts tabs.

**Step 2: Setup.** A creation form collects the output's metadata before writing begins:

```
New Output

Type:  [Directional Brief ▾]
Title: [CACHE 2026 Grant Cycle — Pre-Deliberation Brief    ]

Triggered by decision:  [2026 Grant Cycle Priorities ▾]
  (auto-populates if initiated from a decision)

Target stakeholder:  [CACHE ▾]
Deliver to:  [Rachel Torres, Executive Director            ]

[Start drafting →]
```

**Step 3: The Drafting View.** This is where the work happens. It should be a split-panel view:

```
┌─────────────────────────────────┬────────────────────────────────┐
│                                 │                                │
│    REFERENCE PANEL              │    WRITING PANEL               │
│                                 │                                │
│    Pin references from the      │    Write the output here.      │
│    toolkit to use while         │    Markdown supported.         │
│    drafting.                    │                                │
│                                 │                                │
│    ┌─ Investment ─────────────┐ │    CACHE's board meets in      │
│    │ Grants Cycle 1 · $450K  │ │    February to set 2026 grant  │
│    │ 32 grants · Compounding │ │    priorities. Three things     │
│    └─────────────────────────┘ │    they should see...           │
│                                 │                                │
│    ┌─ Investment ─────────────┐ │                                │
│    │ Grants Cycle 2 · $520K  │ │                                │
│    │ 28 grants · Not comp.   │ │                                │
│    └─────────────────────────┘ │                                │
│                                 │                                │
│    ┌─ Narrative ──────────────┐ │                                │
│    │ CACHE Annual Report      │ │                                │
│    │ Medium gap · "Record..." │ │                                │
│    └─────────────────────────┘ │                                │
│                                 │                                │
│    [+ Add reference]            │                                │
│                                 │                                │
│    The "Add reference" button   │                                │
│    opens a search/browse modal  │                                │
│    across all toolkit entities. │                                │
│                                 │                                │
└─────────────────────────────────┴────────────────────────────────┘

                    [Save draft]  [Preview]  [Publish]
```

The reference panel serves two purposes:
1. **While writing:** It's your research sidebar. Pin the data you need to reference.
2. **After publishing:** Those pinned references become the "Sources Referenced" section in the detail panel. They're saved to the `output_references` table.

### Reference Panel: Adding References

The `[+ Add reference]` button opens a modal that lets you browse or search across all toolkit entities:

```
Add Reference

Search: [crystal bridges                    ]

Results:
  ○ Organization: Crystal Bridges Museum of American Art
  ○ Investment: Artist Residency Expansion · $350K
  ○ Investment: Community Wayfinding Signage · $12K
  ○ Decision: 2027 Community Programming Slate
  ○ Narrative: Crystal Bridges Impact Report
  ○ Precedent: Public Art Phases 1 & 2

[Add selected]
```

Each added reference appears in the reference panel with its key data visible. The practice team can add a `context_note` to each reference explaining why it's relevant to this output.

### The Writing Panel

A textarea or simple rich-text editor. Markdown support is sufficient — headers, bold, lists, links. The content doesn't need to be a full WYSIWYG document. These outputs are analytical texts, not designed documents.

The writing panel should auto-save drafts. Every 30 seconds or on blur, save to the `content` field with `is_published = false`.

### Publishing Flow

1. **Save draft** — saves content, keeps `is_published = false`
2. **Preview** — shows the output as it will appear in the detail panel (with rendered markdown and reference cards)
3. **Publish** — sets `is_published = true`, records `published_at`, output appears in Published tab

### Post-Publish: Delivery Tracking

After publishing, the detail panel shows delivery fields:

```
DELIVERY

Status: Published — not yet delivered
[Mark as delivered →]

  When was it delivered?  [Feb 10, 2026        ]
  Delivered to whom?      [Rachel Torres        ]
  How?                    [Email + discussed in board prep meeting]

[Save delivery status]
```

This closes the loop. The output isn't done when it's written. It's done when the person who needs to see it has seen it.

---

## 5. CARD REFINEMENTS

### Left-border color by output type

Same pattern as other tools. Color indicates type:
- Directional Brief: blue (tactical, decision-specific)
- Memory Transfer: gold (institutional knowledge)
- State of Ecosystem: green (comprehensive assessment)
- Orientation Framework: purple (foundational methodology)
- Field Note: neutral gray (observation, informal)
- Foundational Text: gold (core practice documents)

```css
.output-card[data-type="directional_brief"] { border-left-color: var(--status-blue); }
.output-card[data-type="memory_transfer"] { border-left-color: var(--accent-gold); }
.output-card[data-type="state_of_ecosystem"] { border-left-color: var(--status-green); }
.output-card[data-type="orientation_framework"] { border-left-color: var(--status-purple); }
.output-card[data-type="field_note"] { border-left-color: var(--text-tertiary); }
.output-card[data-type="foundational_text"] { border-left-color: var(--accent-gold); }
```

### Decision deadline on triggered cards

If the output is triggered by a decision, show the lock date:

```
Triggered by: 2026 Grant Cycle Priorities (locks Mar 14 — 23d)
```

The countdown tells you whether this output was delivered in time. If the lock date has passed and the delivery status is still "published," that's a miss.

### Delivery status indicator

A small status indicator next to the Published badge:

```
Published · Delivered ✓          Feb 9, 2026
Published · Not yet delivered    Feb 4, 2026
```

"Not yet delivered" in orange if the triggered decision locks within 30 days.

---

## 6. OUTPUT TYPES EXPLAINED

The output types aren't just labels — they signal purpose and audience:

**Directional Brief** — Written for a specific decision-maker ahead of a specific decision. Contains: the decision context, 2-3 key findings from the toolkit, a recommended direction. Length: 1-2 pages. Example: CACHE Grant Cycle Brief.

**Memory Transfer** — Written to transfer institutional knowledge to someone who needs it. Prevents repeated mistakes. Contains: what happened, what worked, what didn't, what to do differently. Length: 2-3 pages. Example: Public Art Phases 1-2 memory transfer for Phase 3 decision-makers.

**State of Ecosystem** — Comprehensive snapshot drawing from all toolkit tools. Not tied to a single decision — it's a periodic assessment. Contains: investment landscape, practitioner reality, narrative gaps, upcoming decisions, compounding analysis. Length: 5-10 pages. Example: NWA Cultural Ecosystem — State of the System.

**Orientation Framework** — Defines methodology or approach. For the practice team and close partners. Contains: how the practice works, what terms mean, what the tools measure. Length: varies. Example: Operating Doctrine for Cultural Architecture.

**Field Note** — Informal observation from a meeting, site visit, or conversation. Contains: what was observed, what it means, what to watch. Length: <1 page. Not always published — sometimes just a draft for internal reference.

**Foundational Text** — Core practice documents that define the work. Rarely updated. Contains: theory, diagnosis, positioning. Example: A Cultural Diagnosis of Northwest Arkansas.

---

## 7. GOVERNING PRINCIPLES FOR OUTPUTS

### What warrants an output

Not every insight needs a formal document. An output is warranted when:

1. **A decision is approaching and the decision-maker lacks context.** This is the most common trigger. The decision calendar flags it, the practice team writes it.
2. **A pattern has emerged that needs to be documented.** The grant cycle concentration trend isn't going to surface itself — someone has to write it down and present it.
3. **Institutional knowledge is at risk of being lost.** If the practice team knows something that no one else has documented, it should become a memory transfer.
4. **A stakeholder has asked for analysis.** Direct requests from funders, institutions, or civic leaders.

### What doesn't need an output

- Data that's already visible in the toolkit (don't write a brief that just restates what the investment ledger shows — the toolkit IS the brief)
- Internal notes and observations (those are field notes — keep them in drafts unless they're worth publishing)
- Generic recommendations not tied to specific decisions or stakeholders

### The output is not the work

The brief doesn't change CACHE's grant priorities. The conversation where you present the brief — where you sit across from Rachel Torres and walk her through the concentration data — that's where the work happens. The output is the preparation for that conversation and the artifact that persists after it.

This means the drafting process matters less than the delivery. A mediocre brief that gets delivered and discussed before the lock date is more valuable than a brilliant brief that sits in the Drafts tab.

### Outputs should cite their sources

Every claim in an output should be traceable to a toolkit entry. "Individual practitioner grants averaged $6K in Cycle 2" should link to the Cycle 2 investment record. "Practitioners report income declining" should link to the aggregated practitioner interviews narrative entry.

This is what the reference panel in the drafting view enables. If you can't pin a reference for a claim, the claim is unsupported opinion, not toolkit-backed analysis.

---

## 8. PUBLIC-FACING OUTPUTS (Future)

Some outputs are internal (directional briefs, field notes). Others could be public (state of ecosystem, foundational texts). The `is_published` flag currently means "finalized" — in the future, a separate `is_public` flag could control whether an output appears on the public surface.

Public outputs would be accessible at `/outputs/[id]` — the same URL structure but on the light-theme public surface. This is how the practice's intellectual product becomes visible to the ecosystem. A published "State of the System" report is a credibility artifact — it shows funders and practitioners that the practice is doing rigorous work.

Don't build this now. But the schema supports it — the `is_published` field on outputs already has a public read policy in the RLS rules.

---

## 9. SCHEMA ADDITIONS

```sql
-- Delivery tracking
ALTER TABLE outputs ADD COLUMN IF NOT EXISTS delivery_status TEXT
  DEFAULT 'draft'
  CHECK (delivery_status IN ('draft', 'published', 'delivered', 'acknowledged'));
ALTER TABLE outputs ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
ALTER TABLE outputs ADD COLUMN IF NOT EXISTS delivered_to_contact TEXT;
ALTER TABLE outputs ADD COLUMN IF NOT EXISTS delivery_notes TEXT;
```

---

## 10. SEED DATA UPDATE

Update the existing outputs with delivery tracking and add references:

```sql
-- CACHE Brief: delivered
UPDATE outputs SET
  delivery_status = 'delivered',
  delivered_at = '2026-02-10',
  delivered_to_contact = 'Rachel Torres, Executive Director',
  delivery_notes = 'Emailed Feb 10. Discussed in Feb 12 board prep meeting. Rachel confirmed the concentration data was new to the board.'
WHERE title ILIKE '%CACHE 2026 Grant Cycle%';

-- Public Art memory transfer: delivered
UPDATE outputs SET
  delivery_status = 'delivered',
  delivered_at = '2026-02-05',
  delivered_to_contact = 'Sarah Collins, Cultural Affairs Liaison',
  delivery_notes = 'Hand-delivered at City Hall meeting. Sarah requested additional data on local vs. non-local artist economic impact.'
WHERE title ILIKE '%Public Art Phases%';

-- State of Ecosystem: published but broader audience
UPDATE outputs SET
  delivery_status = 'published',
  delivery_notes = 'Standing document. Shared with CACHE and Crystal Bridges leadership. Not decision-specific.'
WHERE title ILIKE '%State of the System%';

-- Add output references for the CACHE brief
INSERT INTO output_references (output_id, reference_type, reference_id, context_note) VALUES
(
  (SELECT id FROM outputs WHERE title ILIKE '%CACHE 2026 Grant Cycle%'),
  'investment',
  (SELECT id FROM investments WHERE initiative_name ILIKE '%Grants - Cycle 1%'),
  'Cycle 1 baseline: 32 grants, $14K average, broader distribution'
),
(
  (SELECT id FROM outputs WHERE title ILIKE '%CACHE 2026 Grant Cycle%'),
  'investment',
  (SELECT id FROM investments WHERE initiative_name ILIKE '%Grants - Cycle 2%'),
  'Cycle 2 comparison: 28 grants, $18.5K average, concentration in institutions'
),
(
  (SELECT id FROM outputs WHERE title ILIKE '%CACHE 2026 Grant Cycle%'),
  'precedent',
  (SELECT id FROM precedents WHERE name ILIKE '%Grant Cycle Evolution%'),
  'Pattern analysis: total funding up, unique recipients down'
),
(
  (SELECT id FROM outputs WHERE title ILIKE '%CACHE 2026 Grant Cycle%'),
  'narrative',
  (SELECT id FROM narratives WHERE source_name ILIKE '%CACHE%Annual%'),
  'CACHE claims "record investment" — true by total, misleading by distribution'
),
(
  (SELECT id FROM outputs WHERE title ILIKE '%CACHE 2026 Grant Cycle%'),
  'narrative',
  (SELECT id FROM narratives WHERE source_name ILIKE '%Practitioner%'),
  'Practitioner interviews confirm income declining despite rising total investment'
);
```

---

## 11. BUILD PRIORITY

1. **Add delivery tracking columns** to outputs table
2. **Add editorial stats bar** — sentence format with decision-triggered count
3. **Add left-border color coding** by output type
4. **Add delivery status indicator** to cards (Published · Delivered ✓)
5. **Show lock date countdown** on triggered-by decision line
6. **Restructure detail panel:**
   - Context (triggered-by decision card + delivery info)
   - Summary
   - Content (rendered markdown)
   - Sources Referenced (inline reference cards from output_references)
   - Record
7. **Add "New output" button** — creation form with type, title, trigger, target
8. **Build drafting view** — split panel: reference panel (left) + writing panel (right)
9. **Add reference browser** — search/browse modal across all toolkit entities
10. **Add "Draft output for this decision" button** on Decision detail panels
11. **Populate output_references** for seed data
12. **Update seed outputs** with delivery status and contact info

### Drafting View Priority

The split-panel drafting view (Step 8-9) is the most complex piece. For the demo, a simpler version is acceptable:

**Demo version:** Single-panel writing view with a textarea for content. References can be added after writing via the detail panel edit mode. The full split-panel synthesis workspace is the production version.

**Production version:** The split-panel view described in Section 4, with real-time reference pinning, auto-save, and preview.

Build the demo version first. The intellectual work is in the content, not the interface — the practice team can write a brief in a textarea and add references after.
