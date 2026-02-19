# OPPORTUNITIES_PUBLIC.md — The Front Door

This is a separate surface from the practice toolkit. It has its own URL, its own design, and its own purpose. The practice surface is where the team does analytical work. This is where the ecosystem sees itself.

---

## Concept

Antiwork makes GitHub's bounty market legible. This surface makes the NWA cultural ecosystem's creative demand legible.

The demand already exists — scattered across procurement portals, foundation websites, board minutes, and word of mouth. No practitioner can see the full picture. No funder knows what other funders are offering. This surface aggregates it into one view.

One URL. One page. No login. No navigation. The entire value proposition is visible in 3 seconds.

---

## URL Structure

```
/opportunities
```

This is a public route — no authentication required. It reads from the same Supabase database as the practice surface but only exposes a subset of fields. No analytical context, no "Across the Toolkit," no internal notes.

The practice surface's Opportunities page remains at its current route behind authentication. The two surfaces share the same data but serve different audiences.

---

## Design Language

This surface does NOT use the practice surface's dark theme. It needs its own identity — lighter, more open, more inviting. The practice surface communicates "serious institutional work." This surface communicates "here's what's available to you right now."

### Color Palette

```css
:root {
  --pub-bg: #FAFAF7;            /* warm off-white */
  --pub-bg-card: #FFFFFF;        /* clean white cards */
  --pub-text-primary: #1A1A18;   /* near-black */
  --pub-text-secondary: #6B6B66; /* warm gray */
  --pub-text-tertiary: #9A9A94;  /* lighter warm gray */
  --pub-border: #E8E8E3;         /* subtle warm border */
  --pub-accent: #C4A67A;         /* gold — same as practice surface */
  --pub-accent-bg: #C4A67A12;    /* gold tint for hover */

  /* Type badge colors */
  --pub-grant: #2D7D46;
  --pub-grant-bg: #2D7D4615;
  --pub-rfp: #2D5A7D;
  --pub-rfp-bg: #2D5A7D15;
  --pub-commission: #7D6B2D;
  --pub-commission-bg: #7D6B2D15;
  --pub-residency: #6B2D7D;
  --pub-residency-bg: #6B2D7D15;
  --pub-fellowship: #7D4B2D;
  --pub-fellowship-bg: #7D4B2D15;
}
```

### Typography

```css
:root {
  --pub-font-display: 'Instrument Serif', 'Newsreader', Georgia, serif;
  --pub-font-body: 'DM Sans', 'Plus Jakarta Sans', system-ui, sans-serif;
  --pub-font-mono: 'JetBrains Mono', 'IBM Plex Mono', monospace;
}
```

Same font families as the practice surface for brand consistency. The difference is context and lightness, not typography.

---

## Page Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  HEADER                                                         │
│  Platform name + tagline                                        │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  SUMMARY LINE                                                   │
│  "8 open opportunities totaling $187K from 5 sources"           │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  FILTERS                                                        │
│  [Type ▾]  [Source ▾]  [Discipline ▾]  Sort: [Deadline ▾]      │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  CARDS (2-column grid on desktop, single column on mobile)      │
│                                                                 │
│  ┌──────────────────────┐  ┌──────────────────────┐            │
│  │ Card                 │  │ Card                 │            │
│  └──────────────────────┘  └──────────────────────┘            │
│  ┌──────────────────────┐  ┌──────────────────────┐            │
│  │ Card                 │  │ Card                 │            │
│  └──────────────────────┘  └──────────────────────┘            │
│  ┌──────────────────────┐  ┌──────────────────────┐            │
│  │ Card                 │  │ Card                 │            │
│  └──────────────────────┘  └──────────────────────┘            │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  FOOTER                                                         │
│  About + contact + submit an opportunity                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

One page. No scroll targets, no sections, no tabs. Everything on one surface. Filters narrow the cards. That's the entire interaction model.

**Why 2-column grid here when the practice surface uses single-column:** Different content, different purpose. The practice surface cards have analytical text, chain links, cross-tool connections — they need full width for readability. These public cards are short and uniform — title, amount, source, deadline, eligibility. Two columns maximize the number of opportunities visible above the fold. The goal is density of options, not depth of analysis.

---

## Header

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  [Platform Name]                                                │
│  Open creative opportunities in Northwest Arkansas              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

Platform name: `font-family: var(--pub-font-display); font-size: 32px; font-weight: 500; color: var(--pub-text-primary);`

Tagline: `font-family: var(--pub-font-body); font-size: 16px; color: var(--pub-text-secondary); margin-top: 4px;`

No logo for the prototype. The name in display serif IS the brand mark. Keep it minimal.

```css
.pub-header {
  padding: 48px 0 32px 0;
  max-width: 1080px;
  margin: 0 auto;
}
```

---

## Summary Line

This is the single most important element on the page. One sentence that frames the entire market.

```
8 open opportunities totaling $187,500 from 5 sources
```

Dynamic. Computed from the database on page load:

```typescript
const openOpps = opportunities.filter(o => o.status === 'open' || o.status === 'closing_soon');
const totalAmount = openOpps.reduce((sum, o) => sum + (o.amount_max || o.amount_min || 0), 0);
const uniqueSources = new Set(openOpps.map(o => o.source_org_id || o.source_name)).size;

// "8 open opportunities totaling $187,500 from 5 sources"
```

```css
.pub-summary {
  font-family: var(--pub-font-body);
  font-size: 18px;
  font-weight: 500;
  color: var(--pub-text-primary);
  padding: 20px 0;
  border-top: 1px solid var(--pub-border);
  border-bottom: 1px solid var(--pub-border);
  margin-bottom: 24px;
}

.pub-summary-number {
  font-family: var(--pub-font-mono);
  font-weight: 700;
}
```

The numbers (8, $187,500, 5) in mono bold. The words in body font. Same editorial-sentence-as-data pattern from the dashboard, adapted for light theme.

**When filters are active, the summary updates:**
"3 grants totaling $12,500 from CACHE" — reflects the filtered view.

---

## Filters

Three filter dropdowns and one sort. Horizontal row.

```
[All types ▾]  [All sources ▾]  [All disciplines ▾]  Sort: [Deadline ▾]
```

### Type Filter
Options populated from distinct `opportunity_type` values:
- All types
- Grant
- RFP
- Commission
- Residency
- Fellowship

### Source Filter
Options populated from distinct source orgs:
- All sources
- CACHE
- City of Bentonville
- Crystal Bridges Museum
- University of Arkansas
- Arkansas Arts Council
- etc.

### Discipline Filter
This is the practitioner-facing filter. Map opportunity eligibility to disciplines:
- All disciplines
- Visual Arts
- Music
- Film
- Design
- Performance
- Literary
- Architecture
- All / Open to any discipline

This requires a `target_disciplines` field on opportunities, or a mapping from eligibility text. For the prototype, add a `disciplines` array field to the opportunities table:

```sql
ALTER TABLE opportunities ADD COLUMN target_disciplines TEXT[];
-- Example: ['visual_arts', 'design'] for the branding RFP
-- Example: ['all'] for the CACHE micro-grants (open to any discipline)
```

### Sort Options
- Deadline (default — soonest first)
- Amount (highest first)
- Recently added

### Filter Implementation

```css
.pub-filters {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.pub-filter-select {
  font-family: var(--pub-font-body);
  font-size: 13px;
  color: var(--pub-text-primary);
  background: var(--pub-bg-card);
  border: 1px solid var(--pub-border);
  border-radius: 6px;
  padding: 8px 32px 8px 12px;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,..."); /* custom dropdown arrow */
  background-repeat: no-repeat;
  background-position: right 10px center;
}

.pub-filter-select:focus {
  outline: none;
  border-color: var(--pub-accent);
}

.pub-sort-label {
  font-size: 13px;
  color: var(--pub-text-tertiary);
  margin-left: auto; /* pushes sort to the right */
}
```

When a filter is active (not "All"), give the dropdown a subtle highlight:

```css
.pub-filter-select--active {
  border-color: var(--pub-accent);
  background-color: var(--pub-accent-bg);
}
```

---

## Opportunity Cards

Two-column grid. Each card is the same structure. No card is special.

```
┌───────────────────────────────────────┐
│ GRANT                       $10,000   │
│                                       │
│ CACHE Creative Economy                │
│ Micro-Grants                          │
│                                       │
│ CACHE                   Due Mar 14    │
│                             24 days   │
│                                       │
│ NWA-based practitioners               │
│ and organizations                     │
│                                       │
│ Apply →                               │
└───────────────────────────────────────┘
```

### Card anatomy (top to bottom):

**Row 1: Type badge + Amount**
- Type badge: pill, left-aligned
- Amount: mono, right-aligned

**Row 2: Title**
- Serif, 18px, primary color
- Allow 2 lines max

**Row 3: Source + Deadline**
- Source org: left-aligned, secondary color
- Deadline: right-aligned, mono
- Days remaining below deadline, color-coded

**Row 4: Eligibility**
- Tertiary color, smaller text
- 2 lines max, truncate

**Row 5: Apply link**
- Gold accent color
- Links to external application URL
- If no URL: "Details →" that opens a minimal detail overlay

### Card CSS

```css
.pub-card-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  max-width: 1080px;
  margin: 0 auto;
}

@media (max-width: 680px) {
  .pub-card-grid {
    grid-template-columns: 1fr;
  }
}

.pub-card {
  background: var(--pub-bg-card);
  border: 1px solid var(--pub-border);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 0;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.pub-card:hover {
  border-color: var(--pub-accent);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.pub-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.pub-card-type {
  font-family: var(--pub-font-body);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 4px;
  /* Colors from type-specific vars */
}

.pub-card-type--grant {
  color: var(--pub-grant);
  background: var(--pub-grant-bg);
}
.pub-card-type--rfp {
  color: var(--pub-rfp);
  background: var(--pub-rfp-bg);
}
.pub-card-type--commission {
  color: var(--pub-commission);
  background: var(--pub-commission-bg);
}
.pub-card-type--residency {
  color: var(--pub-residency);
  background: var(--pub-residency-bg);
}
.pub-card-type--fellowship {
  color: var(--pub-fellowship);
  background: var(--pub-fellowship-bg);
}

.pub-card-amount {
  font-family: var(--pub-font-mono);
  font-size: 16px;
  font-weight: 700;
  color: var(--pub-text-primary);
}

.pub-card-title {
  font-family: var(--pub-font-display);
  font-size: 18px;
  font-weight: 500;
  color: var(--pub-text-primary);
  line-height: 1.3;
  margin-bottom: 12px;
  /* 2 line clamp */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pub-card-meta {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 12px;
}

.pub-card-source {
  font-family: var(--pub-font-body);
  font-size: 13px;
  color: var(--pub-text-secondary);
}

.pub-card-deadline {
  text-align: right;
}

.pub-card-deadline-date {
  font-family: var(--pub-font-mono);
  font-size: 13px;
  color: var(--pub-text-primary);
}

.pub-card-deadline-countdown {
  font-family: var(--pub-font-mono);
  font-size: 12px;
  margin-top: 2px;
}

.pub-card-deadline-countdown--urgent {
  color: #C45B5B; /* red for ≤14 days */
}
.pub-card-deadline-countdown--soon {
  color: #C49A5B; /* orange for 15-30 days */
}
.pub-card-deadline-countdown--normal {
  color: var(--pub-text-tertiary);
}

.pub-card-eligibility {
  font-family: var(--pub-font-body);
  font-size: 13px;
  color: var(--pub-text-tertiary);
  line-height: 1.4;
  margin-bottom: 12px;
  /* 2 line clamp */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pub-card-apply {
  font-family: var(--pub-font-body);
  font-size: 13px;
  font-weight: 600;
  color: var(--pub-accent);
  text-decoration: none;
  margin-top: auto; /* pushes to bottom of card */
  transition: opacity 0.15s;
}

.pub-card-apply:hover {
  opacity: 0.8;
}
```

### Amount display rules (same as practice surface):

```typescript
function formatPublicAmount(min: number | null, max: number | null, desc: string | null): string {
  if (min !== null && max !== null && min === max) return formatCurrency(min);
  if (min !== null && max !== null) return `${formatCurrency(min)} – ${formatCurrency(max)}`;
  if (min !== null) return `From ${formatCurrency(min)}`;
  if (max !== null) return `Up to ${formatCurrency(max)}`;
  if (desc) return desc; // "Stipend + materials"
  return '';
}
```

---

## Closing Soon Signal

Cards for opportunities closing within 14 days get a subtle visual signal:

```css
.pub-card--closing-soon {
  border-left: 3px solid #C45B5B;
}
```

That's it. A red left border. The countdown text is already red. The border reinforces urgency without being aggressive.

---

## Detail Overlay (Optional)

When a card has an application URL, "Apply →" links directly to it (opens in new tab). No detail view needed.

When a card has no application URL, "Details →" opens a minimal overlay with:
- Full title
- Full description (not truncated)
- Full eligibility
- Amount details
- Source org
- Deadline
- Contact information (if available)
- "Submit interest" link (goes to a simple form — see below)

The overlay is a centered modal, not a slide-over panel. Light background, no dark overlay. Simple close button.

```css
.pub-detail-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  z-index: 100;
}

.pub-detail-card {
  background: var(--pub-bg-card);
  border-radius: 12px;
  padding: 32px;
  max-width: 560px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}
```

---

## Footer

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  This surface is maintained by [Practice Name] as part of       │
│  ongoing cultural architecture work in Northwest Arkansas.       │
│                                                                 │
│  Know of an opportunity that should be listed?                   │
│  Submit it →                                                     │
│                                                                 │
│  Contact: [email]                                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

```css
.pub-footer {
  max-width: 1080px;
  margin: 64px auto 48px auto;
  padding-top: 24px;
  border-top: 1px solid var(--pub-border);
  font-family: var(--pub-font-body);
  font-size: 14px;
  color: var(--pub-text-tertiary);
  line-height: 1.6;
}

.pub-footer a {
  color: var(--pub-accent);
  font-weight: 600;
}
```

"Submit it →" links to the contributor surface's opportunity submission form (existing `/submit` route).

---

## Opportunity Submission Form

Accessible from the footer "Submit it →" link. Simple form for anyone to submit an opportunity the practice team might not have found.

Route: `/opportunities/submit`

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  SUBMIT AN OPPORTUNITY                                          │
│                                                                 │
│  Know of a grant, RFP, commission, residency, or fellowship     │
│  available to creative practitioners in NWA? Let us know.       │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Opportunity title *                                             │
│  [_______________________________________________]              │
│                                                                 │
│  Type *                                                          │
│  [Grant ▾]                                                       │
│                                                                 │
│  Source organization                                             │
│  [_______________________________________________]              │
│                                                                 │
│  Amount or range                                                 │
│  [_______________________________________________]              │
│                                                                 │
│  Deadline                                                        │
│  [_______________________________________________]              │
│                                                                 │
│  Description                                                     │
│  [_______________________________________________]              │
│  [_______________________________________________]              │
│  [_______________________________________________]              │
│                                                                 │
│  Eligibility                                                     │
│  [_______________________________________________]              │
│                                                                 │
│  Link (application page, announcement, etc.)                     │
│  [_______________________________________________]              │
│                                                                 │
│  Your name (optional)                                            │
│  [_______________________________________________]              │
│                                                                 │
│  Your email (optional, in case we have questions)                │
│  [_______________________________________________]              │
│                                                                 │
│  [Submit]                                                        │
│                                                                 │
│  Submissions are reviewed before appearing on the site.          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

On submit, creates a record in the `submissions` table with:
- `submission_type`: 'opportunity'
- `data`: JSONB containing all form fields
- `submitter_name`, `submitter_email`
- `status`: 'pending'

The practice team reviews in the Submissions page and either approves (creates an opportunity entry) or dismisses.

Same light-theme styling as the main public page.

---

## Data Query

The public surface queries the same `opportunities` table but only selects public fields:

```typescript
const { data: opportunities } = await supabase
  .from('opportunities')
  .select(`
    id,
    title,
    opportunity_type,
    status,
    deadline,
    amount_min,
    amount_max,
    amount_description,
    description,
    eligibility,
    application_url,
    source_name,
    target_disciplines,
    source_org:organizations!source_org_id (
      name
    )
  `)
  .in('status', ['open', 'closing_soon'])
  .order('deadline', { ascending: true });
```

Fields NOT exposed to the public surface:
- `internal_notes`
- `awarded_investment_id`
- `source_org_id` (the org name is exposed via the join, but not the internal ID)
- `created_at`, `updated_at`, `last_reviewed_at`
- Any "Across the Toolkit" connections

---

## Mobile Responsiveness

```css
/* Cards go single column below 680px */
@media (max-width: 680px) {
  .pub-card-grid {
    grid-template-columns: 1fr;
  }

  .pub-header {
    padding: 32px 20px 24px 20px;
  }

  .pub-filters {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .pub-filter-select {
    width: 100%;
  }

  .pub-sort-label {
    margin-left: 0;
  }
}

/* Tighter padding on small screens */
@media (max-width: 480px) {
  .pub-card {
    padding: 16px;
  }

  .pub-card-title {
    font-size: 16px;
  }
}
```

The page should work well on mobile because practitioners will share it via text and social — they'll open it on their phone.

---

## What This Surface Does for the Practice

1. **Demonstrates value immediately.** "Here are 8 things you can apply to" is tangible value. No explanation of cultural architecture needed.

2. **Creates the summary stat.** "8 open opportunities totaling $187K from 5 sources" — this number goes in stakeholder emails, presentations, and reports. It's proof that the creative economy has operational demand.

3. **Drives the contributor relationship.** Practitioners who use this surface to find opportunities have a reason to engage when the practice team later asks for profile verification or check-in data. Value was delivered first.

4. **Makes the practice team visible.** The footer says "maintained by [Practice Name] as part of ongoing cultural architecture work." Every practitioner who uses this surface knows who's doing the work.

5. **Generates submissions.** The "Submit an opportunity" form turns practitioners and stakeholders into contributors. They're improving the surface they use — a virtuous cycle.

6. **Establishes the practice surface's data.** Every opportunity on the public surface exists in the practice toolkit with full analytical context — source org connections, lifecycle tracking, compounding potential. The public surface is the tip of the iceberg.

---

## Build Priority

1. **Create the public route** (`/opportunities`) with light theme layout
2. **Build the header** — platform name in display serif, tagline
3. **Build the summary line** — dynamic count, total, and source count
4. **Build the card grid** — 2-column, responsive to single column on mobile
5. **Build the card component** — type badge, amount, title, source, deadline, eligibility, apply link
6. **Build the filters** — type, source, discipline dropdowns + sort
7. **Wire filters to card grid** — client-side filtering, summary line updates with filter
8. **Build the footer** — about text, submit link, contact
9. **Build the submission form** (`/opportunities/submit`) — light theme, creates submission record
10. **Fix amount display** — same logic as practice surface (no "$X – $X" when equal)
11. **Add closing-soon left border** — red border on cards within 14 days of deadline
12. **Test mobile** — verify single column, full-width filters, card readability on phone
