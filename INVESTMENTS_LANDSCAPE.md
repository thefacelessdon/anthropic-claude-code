# INVESTMENTS_LANDSCAPE.md — The Analytical View

Read this after INVESTMENTS_REDESIGN.md. This adds a second view to the Investments page — "Landscape" — that zooms out from individual investments to show patterns across the portfolio.

---

## Concept

The list view answers: "What are the individual investments?"
The landscape view answers: "What is the money doing?"

These are different questions. The list is for reviewing specific initiatives. The landscape is for diagnosing structural patterns — concentration, gaps, alignment with practitioner needs. Both views use the same data. The landscape just presents it analytically.

The visualizations should feel like figures in a research publication, not widgets in an analytics platform. Each chart has an editorial label that frames the finding. No generic axis labels. No chartjunk. The data speaks through simple, well-designed bar charts with narrative framing.

---

## View Toggle

Add a view toggle at the top of the Investments page, below the stats and above the content:

```
┌─────────────────────────────────────────────────────────────┐
│ Investments                                                 │
│ Where money is going, what it's producing, and whether      │
│ it's compounding.                                           │
│                                                             │
│ [Stats area — editorial format from INVESTMENTS_REDESIGN]   │
│                                                             │
│ ┌──────────┐ ┌──────────────┐                               │
│ │   List   │ │  Landscape   │                    Sort: [...] │
│ └──────────┘ └──────────────┘                               │
│                                                             │
│ [Content changes based on active view]                      │
└─────────────────────────────────────────────────────────────┘
```

Implementation:
```css
.view-toggle {
  display: inline-flex;
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 24px;
}

.view-toggle-btn {
  padding: 6px 16px;
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-tertiary);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
}

.view-toggle-btn--active {
  color: var(--text-primary);
  background: var(--bg-elevated);
}
```

When "List" is active: current investment cards (with the improvements from INVESTMENTS_REDESIGN.md).
When "Landscape" is active: the analytical visualizations below.

The stats area stays the same in both views — it's the constant context.
Sort controls only appear in List view. Landscape view has its own internal organization.

---

## Landscape View Structure

Four visualization sections, stacked vertically with generous spacing:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  1. WHERE THE MONEY COMES FROM                              │
│     Investment by source organization                       │
│                                                             │
│                     64px                                    │
│                                                             │
│  2. WHERE THE MONEY GOES                                    │
│     Investment by category                                  │
│                                                             │
│                     64px                                    │
│                                                             │
│  3. WHAT COMPOUNDS AND WHAT DOESN'T                         │
│     Compounding status by source                            │
│                                                             │
│                     64px                                    │
│                                                             │
│  4. WHERE INVESTMENT MEETS — AND MISSES —                   │
│     PRACTITIONER REALITY                                    │
│     Funding vs. practitioner need by discipline             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Visualization 1: Where the Money Comes From

**What it shows:** Total investment dollars by source organization, as horizontal bars.

**Editorial label:**
```
Where the Money Comes From
Investment by source
```

**Layout:**

```
Where the Money Comes From
Investment by source

Walton Family Foundation     ████████████████████████████  $1.9M
CACHE                        ██████████████                $830K
City of Bentonville          ████████████                  $750K
Crystal Bridges              ████████                      $525K
Walmart Foundation           ████████                      $500K
TheatreSquared               ████████████████████          $1.2M
Arkansas Arts Council        ██                            $120K
Private Donors (aggregated)  ███                           $175K
```

**Implementation:**

```typescript
// Query: aggregate investment amounts by source
const sourceData = investments.reduce((acc, inv) => {
  const source = inv.organization?.name || inv.source_name || 'Unattributed';
  acc[source] = (acc[source] || 0) + (inv.amount || 0);
  return acc;
}, {} as Record<string, number>);

// Sort by amount descending
const sorted = Object.entries(sourceData)
  .sort(([, a], [, b]) => b - a)
  .map(([name, amount]) => ({ name, amount }));
```

**Chart specs:**

```css
.landscape-chart {
  padding: 24px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
}

.landscape-label {
  font-family: var(--font-serif);
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.landscape-sublabel {
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--text-tertiary);
  margin-bottom: 24px;
}
```

**Bar chart styling (using Recharts BarChart with horizontal layout):**
- Use `<BarChart layout="vertical">` for horizontal bars
- Bar color: `var(--accent-gold)` (`#C4A67A`) — single color, not multicolor
- Bar height: 20px with 8px gap between bars
- Bar border-radius: 3px (right side only)
- Source name (Y-axis label): `font-family: var(--font-sans); font-size: 13px; color: var(--text-secondary);` left-aligned, 200px width
- Amount label: `font-family: var(--font-mono); font-size: 13px; color: var(--text-primary);` right of bar
- No gridlines. No X-axis. No legend. The bars and labels are sufficient.
- Background: transparent (inherits from card)

```tsx
<ResponsiveContainer width="100%" height={sorted.length * 44 + 16}>
  <BarChart
    layout="vertical"
    data={sorted}
    margin={{ top: 0, right: 80, left: 200, bottom: 0 }}
  >
    <YAxis
      type="category"
      dataKey="name"
      axisLine={false}
      tickLine={false}
      tick={{ fill: '#9A9590', fontSize: 13, fontFamily: 'var(--font-sans)' }}
      width={190}
    />
    <XAxis type="number" hide />
    <Bar
      dataKey="amount"
      fill="#C4A67A"
      radius={[0, 3, 3, 0]}
      barSize={20}
      label={{
        position: 'right',
        formatter: (v: number) => formatCurrency(v),
        fill: '#E8E4E0',
        fontSize: 13,
        fontFamily: 'var(--font-mono)',
      }}
    />
  </BarChart>
</ResponsiveContainer>
```

**Interaction:** Clicking a bar filters the list view to show only investments from that source. If the user clicks "Walton Family Foundation," switch to List view with a filter badge showing "Source: Walton Family Foundation" and only those investments visible. This connects the analytical view to the detailed view.

---

## Visualization 2: Where the Money Goes

**What it shows:** Total investment dollars by category.

**Editorial label:**
```
Where the Money Goes
Investment by category
```

**Layout:** Same horizontal bar chart pattern as Visualization 1.

```
Where the Money Goes
Investment by category

Education & Training         ████████████████████          $675K
Strategic Planning           ████████████████████████████  $1.5M
Direct Artist Support        ██████████████                $830K
Infrastructure               ██████████████████████████    $1.375M
Public Art                   ████████                      $520K
Cultural Events              ████████████████████          $1.2M
Research & Data              ███                           $85K
```

**Query:**
```typescript
const categoryData = investments.reduce((acc, inv) => {
  const cat = inv.category || 'Uncategorized';
  acc[cat] = (acc[cat] || 0) + (inv.amount || 0);
  return acc;
}, {} as Record<string, number>);
```

**Same chart styling as Visualization 1.** Single gold color bars.

**Interaction:** Clicking a bar filters List view to that category.

**Editorial annotation (optional but powerful):** If a category has notably low investment relative to others, add a single line below the chart:

```
Research & Data receives 1.4% of total investment — the lowest
allocation despite being the foundation for informed decision-making.
```

This annotation is hardcoded for the prototype based on the seed data. In production, it could be dynamically generated by identifying the lowest-funded category and framing it relative to the total. But for now, a static observation is fine. The point is that the visualization doesn't just show data — it offers a reading of the data.

---

## Visualization 3: What Compounds and What Doesn't

**What it shows:** For each source, their investments broken into compounding / not compounding / too early. This is the sharpest analytical view — it reveals which funders are creating conditions for the next investment and which are making isolated bets.

**Editorial label:**
```
What Compounds and What Doesn't
Compounding status by source
```

**Layout:** Stacked horizontal bars, three segments per source.

```
What Compounds and What Doesn't
Compounding status by source

Walton Family Foundation     ████████████████░░░░░░████
CACHE                        ██████████████████░░░░
Crystal Bridges              ████████████░░░░████████
City of Bentonville          ░░░░░░░░░░░░░░░░████████
Walmart Foundation           ████████████████████░░░░
...

● Compounding  ● Not compounding  ● Too early
```

**Query:**
```typescript
interface SourceCompounding {
  name: string;
  compounding: number;
  not_compounding: number;
  too_early: number;
  total: number;
}

const data: SourceCompounding[] = Object.entries(
  investments.reduce((acc, inv) => {
    const source = inv.organization?.name || inv.source_name || 'Unattributed';
    if (!acc[source]) {
      acc[source] = { compounding: 0, not_compounding: 0, too_early: 0, total: 0 };
    }
    const amount = inv.amount || 0;
    acc[source].total += amount;

    if (inv.is_compounding === true) acc[source].compounding += amount;
    else if (inv.is_compounding === false) acc[source].not_compounding += amount;
    else acc[source].too_early += amount;

    return acc;
  }, {} as Record<string, { compounding: number; not_compounding: number; too_early: number; total: number }>)
).map(([name, d]) => ({ name, ...d }))
  .sort((a, b) => b.total - a.total);
```

**Chart specs:**
- Stacked bar: `<BarChart layout="vertical">` with three `<Bar>` components stacked
- Colors:
  - Compounding: `var(--status-green)` (`#6B9E6A`)
  - Not compounding: `var(--status-red)` (`#C45B5B`)
  - Too early: `var(--status-blue)` (`#6B8EC4`)
- Bar height: 20px, 8px gap
- No amount labels on segments (too cluttered for stacked bars)
- Total amount label to the right of each bar: `font-family: var(--font-mono); font-size: 13px;`
- Simple legend below chart: three colored dots with labels

```tsx
<ResponsiveContainer width="100%" height={data.length * 44 + 48}>
  <BarChart
    layout="vertical"
    data={data}
    margin={{ top: 0, right: 80, left: 200, bottom: 32 }}
  >
    <YAxis
      type="category"
      dataKey="name"
      axisLine={false}
      tickLine={false}
      tick={{ fill: '#9A9590', fontSize: 13 }}
      width={190}
    />
    <XAxis type="number" hide />
    <Bar dataKey="compounding" stackId="a" fill="#6B9E6A" barSize={20} radius={[0, 0, 0, 0]} />
    <Bar dataKey="not_compounding" stackId="a" fill="#C45B5B" barSize={20} />
    <Bar dataKey="too_early" stackId="a" fill="#6B8EC4" barSize={20} radius={[0, 3, 3, 0]} />
  </BarChart>
</ResponsiveContainer>
```

**Editorial annotation:**
```
City of Bentonville's investments are primarily not compounding —
public art Phases 1 and 2 produced work but didn't create conditions
for each other. The cultural district planning is too early to assess.
```

Static for the prototype. This is the kind of reading that turns a chart into intelligence.

---

## Visualization 4: Where Investment Meets — and Misses — Practitioner Reality

**What it shows:** Side-by-side comparison of investment dollars by discipline versus practitioner count and risk in that discipline. This is the finding that ties the investment ledger to the ecosystem map.

**Editorial label:**
```
Where Investment Meets — and Misses — Practitioner Reality
Funding allocation vs. practitioner presence by discipline
```

**Layout:** A paired horizontal chart — two bars per discipline, one for investment and one for practitioner count.

```
Where Investment Meets — and Misses — Practitioner Reality
Funding allocation vs. practitioner presence by discipline

                      INVESTMENT                    PRACTITIONERS
Visual Arts      ████████████████████  $2.1M         ███ 3 practitioners
Music            ██████                $175K         ██ 2 (1 leaving)
Film             ██████████            $400K         █ 1 (considering leaving)
Design           ██                    $45K          ██ 2
Performance      ████████████          $525K         ██ 2
Literary         █                     $10K          █ 1
Ceramics                               $0            █ 1
Architecture                           $0            █ 1
```

**This is the most complex visualization.** It requires mapping investments to disciplines and counting practitioners by discipline. Here's the approach:

**Mapping investments to disciplines:**
Investments don't have a "discipline" field — they have a "category" field (Strategic Planning, Direct Artist Support, etc.) which doesn't cleanly map to practitioner disciplines. The mapping needs to be approximate:

```typescript
// Some investments can be mapped to disciplines via their description or tags
// For the prototype, use a manual mapping based on seed data knowledge:
const investmentByDiscipline: Record<string, number> = {
  'Visual Arts': 2100000,   // CB programs, CACHE visual arts grants, public art
  'Music': 175000,          // NWA Music Initiative
  'Film': 400000,           // BFF-related investments
  'Design': 45000,          // Cultural district branding portion
  'Performance': 525000,    // TheatreSquared + Momentary
  'Literary': 10000,        // Small grant allocation
  'Ceramics': 0,
  'Architecture': 0,
};

// In production, this mapping would come from tags on investments
// linking them to disciplines, or from a discipline_allocation field
```

**Practitioner count by discipline:**
```typescript
const practitionersByDiscipline = practitioners.reduce((acc, p) => {
  const disc = p.primary_discipline || 'Other';
  if (!acc[disc]) acc[disc] = { count: 0, atRisk: 0 };
  acc[disc].count++;
  // Count "at risk" based on whether risk_factors has leaving/considering language
  if (p.risk_factors?.toLowerCase().includes('leav') ||
      p.risk_factors?.toLowerCase().includes('relocat')) {
    acc[disc].atRisk++;
  }
  return acc;
}, {} as Record<string, { count: number; atRisk: number }>);
```

**Chart implementation:**

This is best done as a custom layout rather than a standard Recharts component, because the paired bar + annotation pattern is non-standard.

```tsx
{disciplines.map((disc) => (
  <div key={disc.name} className="discipline-row">
    <div className="discipline-name">{disc.name}</div>

    <div className="discipline-investment">
      <div
        className="bar bar--gold"
        style={{ width: `${(disc.investment / maxInvestment) * 100}%` }}
      />
      <span className="bar-label">{formatCurrency(disc.investment)}</span>
    </div>

    <div className="discipline-practitioners">
      <div
        className="bar bar--neutral"
        style={{ width: `${(disc.practitionerCount / maxPractitioners) * 100}%` }}
      />
      <span className="bar-label">
        {disc.practitionerCount}
        {disc.atRisk > 0 && (
          <span className="at-risk"> ({disc.atRisk} at risk)</span>
        )}
      </span>
    </div>
  </div>
))}
```

```css
.discipline-row {
  display: grid;
  grid-template-columns: 140px 1fr 1fr;
  gap: 16px;
  align-items: center;
  margin-bottom: 12px;
}

.discipline-name {
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--text-secondary);
  text-align: right;
}

.discipline-investment,
.discipline-practitioners {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bar {
  height: 16px;
  border-radius: 2px;
  min-width: 2px;
  transition: width 0.3s ease;
}

.bar--gold {
  background: var(--accent-gold);
}

.bar--neutral {
  background: var(--text-tertiary);
}

.bar-label {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
}

.at-risk {
  color: var(--status-red);
  font-family: var(--font-sans);
  font-size: 11px;
}
```

**Column headers above the chart:**
```
                      INVESTMENT                    PRACTITIONERS
```
`font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-tertiary);`

**Editorial annotation:**
```
Music and film practitioners report the highest retention risk,
yet combined investment in these disciplines ($575K) is less than
a third of visual arts allocation ($2.1M). Ceramics and architecture
receive no direct investment despite active practitioners in both fields.
```

This annotation is the editorial finding. It's what someone would write in a report after looking at the chart. For the prototype, write it as static text based on the seed data. The chart shows the pattern. The annotation names it.

---

## Global Chart Styling Rules

All visualizations follow these rules:

1. **No gridlines.** Clean background, bars speak for themselves.
2. **No X-axis labels or ticks on bar charts.** The amount labels on the bars are sufficient.
3. **No chart borders or box shadows.** Each visualization lives in a card container (`.landscape-chart`) but the chart itself has no additional framing.
4. **Single gold color for single-variable bars.** Only the compounding chart uses multiple colors (because it shows multiple categories).
5. **Muted palette.** Nothing saturated. The gold accent (`#C4A67A`) for investment bars. The muted green/red/blue for compounding status. Neutral gray (`var(--text-tertiary)`) for practitioner bars.
6. **Font consistency.** Source/category names in sans-serif. Amounts in monospace. Labels in small uppercase sans.
7. **No tooltips on hover.** The data is visible in the labels. Tooltips add interaction complexity without value for charts this simple.
8. **No animation on chart load.** The bars simply appear. Animation on data visualization is decoration, not information.
9. **Responsive.** Charts fill the content width. On narrower screens, bar labels may need to move below the bar instead of beside it.

---

## How the Landscape Connects to the List

The landscape view should drive people into the list view. Interactions:

1. **Clicking a bar in Viz 1 (by source)** → switches to List view, filtered by that source org. A filter badge appears: "Source: Walton Family Foundation [×]"

2. **Clicking a bar in Viz 2 (by category)** → switches to List view, filtered by that category. Filter badge: "Category: Education & Training [×]"

3. **Clicking a segment in Viz 3 (compounding by source)** → switches to List view, filtered by that source AND that compounding status. Filter badges: "Source: City of Bentonville [×]" + "Status: Not compounding [×]"

4. **Viz 4 (funding vs. practitioners)** → clicking the investment bar for a discipline filters List view by related investments. Clicking the practitioner bar navigates to Ecosystem Map → Practitioners tab, filtered by that discipline.

These interactions are the bridge between analysis and detail. The landscape shows you the pattern. The click takes you to the specific investments behind it.

**Filter badge component:**
```css
.filter-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: var(--accent-glow);
  border: 1px solid var(--accent-gold);
  border-radius: 12px;
  font-family: var(--font-sans);
  font-size: 12px;
  color: var(--accent-gold);
  margin-right: 6px;
}

.filter-badge-close {
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.15s;
}

.filter-badge-close:hover {
  opacity: 1;
}
```

---

## Build Priority

1. **Add view toggle** (List / Landscape) below the stats area
2. **Build Viz 1** — investment by source, horizontal bars
3. **Build Viz 2** — investment by category, horizontal bars
4. **Build Viz 3** — compounding by source, stacked horizontal bars with legend
5. **Build Viz 4** — funding vs. practitioner reality, paired bars with annotations
6. **Add click-to-filter interactions** — clicking bars switches to List view with filter applied
7. **Add editorial annotations** below Viz 3 and Viz 4 (static text for prototype)
8. **Add filter badge component** for showing active filters in List view
