# ECOSYSTEM_MAP_REDESIGN.md — Profiles, Cards, and Contributor Flow

Read this after DESIGN_AMENDMENT.md. This is specifically about the Ecosystem Map page — the organizational and practitioner profiles that form the spine of the toolkit.

---

## 1. FIX THE TAB BUG

The current implementation renders both Organizations and Practitioners on the same page, with a second tab set appearing after all org cards. Clicking "Practitioners" scrolls down instead of replacing content.

**Fix:** The tabs must be a true content toggle. One tab set at the top. One content area below. When "Organizations" is active, only org cards render. When "Practitioners" is active, only practitioner cards render. Clicking a tab replaces the content completely.

```tsx
// Pseudo-structure
const [activeTab, setActiveTab] = useState<'organizations' | 'practitioners'>('organizations');

return (
  <>
    <Tabs value={activeTab} onChange={setActiveTab}>
      <Tab value="organizations" label={`Organizations ${orgCount}`} />
      <Tab value="practitioners" label={`Practitioners ${practitionerCount}`} />
    </Tabs>

    {activeTab === 'organizations' && <OrganizationList />}
    {activeTab === 'practitioners' && <PractitionerList />}
  </>
);
```

Remove any duplicate tab rendering further down the page.

---

## 2. ORGANIZATION CARDS — REFRAME THE CONTENT

### Problem
The current cards show: name, mandate, "CONTROLS:" line, and connection counts. "CONTROLS" is the practice team's internal analytical frame — it shouldn't be labeled that way in the UI. It reads like a database field, not a profile.

### Redesign

The card answers three questions at a glance:
1. **What is this?** → Name + type + mandate
2. **What do they shape?** → Their influence, reframed from "controls"
3. **How connected are they?** → Cross-toolkit connection counts

```
┌─────────────────────────────────────────────────────────────┐
│ CACHE                                        Intermediary   │
│                                                             │
│ Primary intermediary between funders and creative            │
│ practitioners. Manages ~$2M in annual grants.               │
│                                                             │
│ Shapes: Grant allocation, creative economy programming,     │
│ advocacy agenda, creative economy data                      │
│                                                             │
│ 4 investments · 1 decision · 2 opportunities · 1 narrative  │
│ Partners: Walton FF, Crystal Bridges, City of Bentonville   │
└─────────────────────────────────────────────────────────────┘
```

**Specific changes:**

**Rename "CONTROLS" to "Shapes"** — or remove the label entirely and integrate the information into the mandate text. "Controls" implies a power critique that's accurate internally but reads as confrontational in a shared tool. "Shapes" communicates the same information — what this org has influence over — without the adversarial framing.

```css
.org-shapes {
  font-size: 12px;
  color: var(--text-tertiary);
  line-height: 1.4;
}
.org-shapes-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-tertiary);
}
```

**Fold the key "controls" data into the mandate line where possible.** Instead of:
- Mandate: "Advance NWA creative economy through grants, programs, and advocacy."
- CONTROLS: "Annual grant allocation (~$2M), creative economy programming, advocacy agenda..."

Do:
- "Primary intermediary between funders and creative practitioners. Manages ~$2M in annual grants."
- Shapes: Grant allocation, programming, advocacy, data/research

The mandate becomes more specific and informative. The "Shapes" line becomes a compact tag-like list.

**Rename "Connected to" to "Partners"** — "Connected to" is graph-database language. "Partners" is institutional language.

**Connection counts stay.** These are the most valuable element on the card. "4 investments · 1 decision · 2 opportunities" immediately communicates ecosystem density. But add a sort option: **sort by connection count** (most connected first) as the default, instead of alphabetical. The most connected orgs are the most important — they should appear first.

### Organization Detail Panel

When an org card is clicked, the detail panel should show:

**Section 1: Profile**
```
NAME
Type badge

MANDATE
Full mandate text (not truncated)

WHAT THEY SHAPE
Full controls text, presented as a description, not a labeled field.
"CACHE controls the primary grant mechanism for NWA creative
practitioners, manages advocacy priorities at the state level,
and produces the only systematic data on the creative economy."

CONSTRAINTS
What limits their ability to act. This stays as-is — constraints
are valuable context for intervention planning.
"Dependent on foundation funding, limited staff capacity (8 FTE),
broad mandate relative to resources."

DECISION CYCLE
When and how they make decisions.
"Annual grant cycle (applications Q1, awards Q2). Board meets
quarterly. Strategic plan review every 3 years."

CONTACTS
List of contacts linked to this org.
Each contact shows: name, title, role description, decision-maker badge.
```

**Section 2: Across the Toolkit**

This is the critical section. Show everything connected to this org:

```
INVESTMENTS (4)
┌ Creative Economy Grants — Cycle 2      $450K  Compounding ┐
├ Creative Economy Grants — Cycle 1      $380K  Compounding ┤
├ NWA Music Initiative                   $175K  Too Early   ┤
└ NWA Creative Economy Census             $85K  Compounding ┘

DECISIONS (1)
┌ 2026 Grant Cycle Priorities    Deliberating   Locks in 25d ┐
└                                                             ┘

OPPORTUNITIES (2)
┌ Creative Economy Micro-Grants  $2.5K-$10K    Due Mar 15   ┐
└ (from awarded): Grants Cycle 2                             ┘

NARRATIVES (1)
┌ CACHE Annual Report 2025       Medium Gap                  ┐
└                                                             ┘

RELATIONSHIPS
┌ Walton Family Foundation       Funded by      Strong       ┐
├ Arkansas Arts Council          Funded by      Moderate     ┤
├ TheatreSquared                 Partners with  Moderate     ┤
├ City of Bentonville            Partners with  Moderate     ┤
└ NWA Council                    Partners with  Weak         ┘
```

Each inline reference card uses the tool-colored left border from DESIGN_AMENDMENT.md and is clickable — navigating to that item's detail in its respective tool.

**Section 3: Record**
- Created, last reviewed, updated dates
- Notes field (the internal notes, like "Key connector in the ecosystem. Grant program is the most visible direct-to-practitioner funding mechanism. Recent leadership transition.")
- [Mark as reviewed] button
- [Edit] button

---

## 3. PRACTITIONER CARDS — REFRAME AND VISUALIZE

### Problem
The cards have the right data but present everything as text. Income breakdown is a sentence when it should be visual. Retention/risk indicators are good but could be stronger.

### Redesign

```
┌─────────────────────────────────────────────────────────────┐
│ Sample: Visual Artist A            Painting / Installation  │
│ 6 years in NWA                                              │
│                                                             │
│ ██████████████░░░░░░░░░  Gallery  CACHE  UA Teaching  Comm. │
│ 30%            20%      40%        10%                      │
│                                                             │
│ ● Studio space, CB artist community, partner employed       │
│ ▲ Studio lease +15%, limited gallery infrastructure         │
│                                                             │
│ Crystal Bridges community artist · UA adjunct               │
└─────────────────────────────────────────────────────────────┘
```

**Income visualization:** Replace the text-based income line with a simple horizontal stacked bar. Each segment is a different muted color. Labels appear below or on hover.

```css
.income-bar {
  display: flex;
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
  margin: 8px 0 4px 0;
  width: 100%;
}
.income-segment {
  height: 100%;
  /* Each source gets a slightly different muted tone */
}
.income-labels {
  display: flex;
  font-size: 11px;
  color: var(--text-tertiary);
  gap: 12px;
  margin-bottom: 8px;
}
```

Income source colors (all muted, not saturated):
- Earned/sales: `#8B7E6A` (warm brown)
- Grants: `var(--accent-warm)` (gold)
- Teaching: `#6B8E9E` (muted teal)
- Freelance/commercial: `#7E8B6A` (olive)
- Other: `#8B6A8E` (muted purple)

This communicates the economic picture at a glance. A practitioner whose bar is 80% one color has a concentration risk. A practitioner with 4-5 segments has diversified income. You can see this without reading.

**Retention/risk lines** — keep the green dot / orange triangle, but limit to ONE LINE each on the card. Pick the most important factor. Full list in the detail panel.

**Institutional affiliations** — show as a subtle line at the bottom. These link to org entries.

### Practitioner Detail Panel

**Section 1: Profile**
```
NAME
Discipline · Tenure

INCOME BREAKDOWN
Larger version of the stacked bar with labeled segments and percentages.
Below the bar, list each source with its percentage:
  Gallery sales .............. 30%
  CACHE grants ............... 20%
  UA teaching ................ 40%
  Commissions ................ 10%

RETENTION FACTORS (green accent)
Full list with detail:
  • Affordable studio space in downtown Bentonville
  • Crystal Bridges artist community provides creative network
  • Partner employed at Walmart (stable household income)

RISK FACTORS (red/orange accent)
Full list with detail:
  • Studio lease increasing 15% this year
  • Limited commercial gallery infrastructure in NWA
  • No secondary market for work

INSTITUTIONAL AFFILIATIONS
  Crystal Bridges community artist → [link to CB org profile]
  UA adjunct → [link to UA org profile]
```

**Section 2: Notes**
The qualitative assessment. This is where the interview insight lives:
"Considering relocating to Kansas City if studio costs continue rising. Has shown at CB community gallery twice."

This section is internal — it's the practice team's assessment, not shared with the practitioner.

**Section 3: Record**
Created, last reviewed, [Mark as reviewed], [Edit]

---

## 4. HOW PROFILES GET CREATED AND UPDATED

### Governing Principle: The Toolkit Is Not a Directory

The toolkit is the practice team's analytical view of the ecosystem. Profiles are intelligence, not self-descriptions. Organizations don't fill out their own profiles. Practitioners don't submit their own data. The practice team builds profiles from research, and stakeholders validate them.

### Organization Profile Creation Flow

**Step 1: Practice team creates profiles from public sources.**
- Websites, annual reports, 990 filings, grant databases, news coverage, board minutes
- The practice team fills in: name, type, mandate, controls/shapes, constraints, decision cycle, contacts, relationships
- This is research work, done in the practice surface via the [+ Add New] button on the Ecosystem Map

**Step 2: Stakeholder verification (optional, via contributor surface).**
- When the practice team has a relationship with a stakeholder, they send a verification link
- URL pattern: `/submit/verify?type=organization&id=[org-id]`
- The verification form shows a READ-ONLY view of the current profile with an option to suggest corrections or additions
- The stakeholder sees: "We're mapping the NWA cultural ecosystem. Here's what we have on [Organization]. Is this accurate?"
- They can:
  - Confirm: "This is accurate"
  - Correct: "Our grant allocation is actually $2.5M, not $2M"
  - Add: "We're also launching a new fellowship program in Q3"
- Their response enters the submissions queue as an `investment_verification` type
- Practice team reviews and applies corrections

**What the stakeholder DOES NOT see:**
- The "constraints" field (that's your analytical assessment, not something you share with the subject)
- The "notes" field (internal only)
- Connection counts or cross-toolkit data
- Other organizations' profiles

**The value exchange:** The stakeholder gets to see that someone is paying serious, structured attention to the ecosystem they operate in. They get to correct the record. They begin to understand that cultural architecture intelligence exists. This is the entry point to the relationship.

### Practitioner Profile Creation Flow

**Step 1: Practice team creates profiles from interviews and census data.**
- CACHE creative economy census provides aggregate data
- Individual profiles come from interviews, community relationships, and practitioner referrals
- The practice team fills in: name, discipline, tenure, income sources, retention factors, risk factors, institutional affiliations, notes

**Step 2: Practitioners receive value first.**
- Before any practitioner is ever asked to update their profile, they should have access to the opportunity layer
- Send them: "Here are open grants, commissions, and residencies in the NWA ecosystem" — linking to the public opportunity surface
- This is immediate, tangible value that costs nothing and establishes the toolkit as useful

**Step 3: Practitioner check-in (via contributor surface).**
- After a relationship exists, the practice team sends a check-in link
- URL pattern: `/submit/verify?type=practitioner&id=[practitioner-id]`
- The form is conversational, not bureaucratic:

```
PRACTITIONER CHECK-IN

Hey [Name] — we're keeping track of what's happening
for creative practitioners in NWA. Last time we talked,
here's what we had:

YOUR WORK
Painting / Installation · 6 years in NWA

YOUR INCOME SOURCES
  Gallery sales ........... 30%
  CACHE grants ............ 20%
  UA teaching ............. 40%
  Commissions ............. 10%

  ○ This is still roughly accurate
  ○ Things have changed: [text field]

WHAT KEEPS YOU HERE
  • Affordable studio space
  • Crystal Bridges artist community
  • Partner employed at Walmart

  ○ Still accurate
  ○ I'd update this: [text field]

WHAT CONCERNS YOU
  • Studio lease increasing 15%
  • Limited gallery infrastructure

  ○ Still accurate
  ○ I'd update this: [text field]

ANYTHING ELSE WE SHOULD KNOW?
[text field]

[Submit check-in]
```

- Response enters submissions queue as a `practitioner_verification` type
- Practice team reviews and updates the profile

**What the practitioner DOES NOT see:**
- Other practitioners' profiles
- Risk assessments or retention ratings
- Internal notes ("Considering relocating to Kansas City")
- Investment ledger data or decision calendar

**What the practitioner DOES see:**
- Their own profile data (for verification)
- The public opportunity layer (grants, commissions, residencies)
- Published outputs (state of ecosystem reports, if the practice team chooses to share them)

**The value exchange:** Practitioners get curated opportunity access and the experience of being seen and heard by someone who is paying structured attention to their situation. The practice team gets current data on retention, risk, and economic conditions.

---

## 5. CONTRIBUTOR SURFACE FORMS — BUILD SPEC

### Organization Verification Form (`/submit/verify?type=organization&id=[org-id]`)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  CULTURAL ARCHITECTURE · ECOSYSTEM VERIFICATION             │
│                                                             │
│  We're mapping the NWA cultural ecosystem to support        │
│  better coordination and investment. Here's what we         │
│  have on [Organization Name]. We'd appreciate your          │
│  review.                                                    │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ORGANIZATION: [Name]                                       │
│  TYPE: [Foundation / Government / etc.]                     │
│                                                             │
│  OUR UNDERSTANDING OF YOUR MANDATE:                         │
│  [mandate text displayed as read-only]                      │
│                                                             │
│  ○ This is accurate                                         │
│  ○ I'd adjust this: [text field]                            │
│                                                             │
│  WHAT WE UNDERSTAND YOU SHAPE:                              │
│  [controls text displayed as read-only]                     │
│                                                             │
│  ○ This is accurate                                         │
│  ○ I'd adjust this: [text field]                            │
│                                                             │
│  DECISION CYCLE:                                            │
│  [decision cycle text displayed as read-only]               │
│                                                             │
│  ○ This is accurate                                         │
│  ○ I'd adjust this: [text field]                            │
│                                                             │
│  ANYTHING WE'RE MISSING?                                    │
│  [text field — upcoming initiatives, leadership changes,    │
│   new programs, shifted priorities]                         │
│                                                             │
│  YOUR NAME: [field]                                         │
│  YOUR ROLE: [field]                                         │
│  EMAIL (optional): [field]                                  │
│                                                             │
│  [Submit verification]                                      │
│                                                             │
│  Your response will be reviewed by our team. Thank you      │
│  for helping us build a clearer picture of the ecosystem.   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Implementation notes:**
- This form requires no authentication — it's accessed via a unique link
- The form pre-populates from the organizations table using the org ID in the URL
- On submit, it creates a submission record with:
  - `submission_type`: 'organization_verification'
  - `data`: JSONB containing the org_id, each field's response (confirmed or corrected), and any additions
  - `submitter_name`, `submitter_email`, `submitter_org`
- The form should be styled differently from the practice surface — lighter, more open, editorial. This is a public-facing touchpoint. It should feel like receiving a document from a thoughtful institution, not filling out a SaaS form.

### Practitioner Check-In Form (`/submit/verify?type=practitioner&id=[practitioner-id]`)

Use the conversational format described in Section 4 above. Same implementation pattern:
- No authentication, accessed via unique link
- Pre-populates from practitioners table
- Creates submission with `submission_type`: 'practitioner_verification'
- Styled as the contributor surface (not the practice surface)

### Security Note
These verification links contain entity IDs. For the prototype, this is fine. For production, generate time-limited tokens that map to entity IDs, so URLs don't expose database IDs and links expire after use.

---

## 6. SORTING AND FILTERING (for the Ecosystem Map only)

### Organization Sort Options
- **Most connected** (default): sort by total count of investments + decisions + opportunities + narratives. Most ecosystem-dense orgs first.
- **Alphabetical**: A-Z by name
- **By type**: Group by org_type, then alphabetical within groups

### Organization Filter Options
- By type: Foundation, Government, Cultural Institution, Corporate, Education, Nonprofit, Intermediary
- By tag (if tags are applied to orgs)

### Practitioner Sort Options
- **By tenure** (default): longest tenure first — most established practitioners at top
- **By discipline**: Group by discipline alphabetically
- **By risk level**: Practitioners with the most risk factors first (this requires counting risk indicators, which is a text analysis — for now, sort alphabetically within discipline)

### Practitioner Filter Options
- By discipline: Painting, Music, Design, Film, Ceramics, Literary, Murals, Dance, Photography, Production, Theatre, Architecture
- By tenure range: <2 years, 2-5 years, 5-10 years, 10+ years

### Filter UI
Horizontal row of pill-style toggles above the card list, below the tabs:

```
[Organizations 14] [Practitioners 12]

[All types ▾]  [Sort: Most connected ▾]

┌─ Cards ──────────────────────────────────────────┐
```

---

## 7. BUILD PRIORITY

1. **Fix the tab bug** — true toggle, single content area
2. **Rename "CONTROLS" to "Shapes"** across all org cards and detail panels
3. **Rename "Connected to" to "Partners"** on org cards
4. **Default org sort: most connected first** — query connection counts and sort descending
5. **Add income visualization bar** to practitioner cards — horizontal stacked bar with muted color segments
6. **Limit retention/risk to one line each on cards** — full lists in detail panels only
7. **Build the organization detail panel "Across the Toolkit" section** — investments, decisions, opportunities, narratives, relationships, contacts for that org
8. **Build the practitioner detail panel** — expanded income bar, full retention/risk lists, institutional affiliation links, notes
9. **Add sort controls** to both tabs
10. **Build organization verification form** on contributor surface (`/submit/verify?type=organization&id=`)
11. **Build practitioner check-in form** on contributor surface (`/submit/verify?type=practitioner&id=`)
12. **Add filter controls** (lower priority — after sorting works)
