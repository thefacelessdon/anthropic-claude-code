"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { INVESTMENT_CATEGORY_LABELS } from "@/lib/utils/constants";
import type { Investment, Practitioner } from "@/lib/supabase/types";

// ─── Types ──────────────────────────────────────────

interface SourceAmount {
  name: string;
  amount: number;
}

interface CategoryAmount {
  name: string;
  label: string;
  amount: number;
}

interface SourceCompounding {
  name: string;
  compounding: number;
  not_compounding: number;
  too_early: number;
  total: number;
}

interface DisciplineRow {
  name: string;
  investment: number;
  practitionerCount: number;
  atRisk: number;
}

interface InvestmentLandscapeProps {
  investments: Investment[];
  practitioners: Practitioner[];
  onFilterSource: (source: string) => void;
  onFilterCategory: (category: string) => void;
  onFilterSourceCompounding: (source: string, compounding: string) => void;
  onNavigateDiscipline?: (discipline: string) => void;
}

// ─── Constants ──────────────────────────────────────

const CATEGORY_TO_DISCIPLINE: Record<string, string> = {
  direct_artist_support: "Visual Arts",
  public_art: "Visual Arts",
  artist_development: "Visual Arts",
  programming: "Performance",
  infrastructure: "Infrastructure",
  strategic_planning: "Strategic Planning",
  education_training: "Education",
  sector_development: "Sector Development",
  institutional_capacity: "Institutional Capacity",
  communications: "Communications",
};

// ─── Data Aggregation ───────────────────────────────

function aggregateBySource(investments: Investment[]): SourceAmount[] {
  const map: Record<string, number> = {};
  investments.forEach((inv) => {
    const source = inv.source_name || "Unattributed";
    map[source] = (map[source] || 0) + (inv.amount || 0);
  });
  return Object.entries(map)
    .sort(([, a], [, b]) => b - a)
    .map(([name, amount]) => ({ name, amount }));
}

function aggregateByCategory(investments: Investment[]): CategoryAmount[] {
  const map: Record<string, number> = {};
  investments.forEach((inv) => {
    const cat = inv.category || "uncategorized";
    map[cat] = (map[cat] || 0) + (inv.amount || 0);
  });
  return Object.entries(map)
    .sort(([, a], [, b]) => b - a)
    .map(([name, amount]) => ({
      name,
      label: INVESTMENT_CATEGORY_LABELS[name] || name,
      amount,
    }));
}

function aggregateCompoundingBySource(investments: Investment[]): SourceCompounding[] {
  const map: Record<string, { compounding: number; not_compounding: number; too_early: number; total: number }> = {};
  investments.forEach((inv) => {
    const source = inv.source_name || "Unattributed";
    if (!map[source]) map[source] = { compounding: 0, not_compounding: 0, too_early: 0, total: 0 };
    const amount = inv.amount || 0;
    map[source].total += amount;
    if (inv.compounding === "compounding") map[source].compounding += amount;
    else if (inv.compounding === "not_compounding") map[source].not_compounding += amount;
    else map[source].too_early += amount;
  });
  return Object.entries(map)
    .sort(([, a], [, b]) => b.total - a.total)
    .map(([name, d]) => ({ name, ...d }));
}

function buildDisciplineData(investments: Investment[], practitioners: Practitioner[]): DisciplineRow[] {
  // Practitioner counts by discipline
  const practMap: Record<string, { count: number; atRisk: number }> = {};
  practitioners.forEach((p) => {
    const disc = p.discipline || "Other";
    if (!practMap[disc]) practMap[disc] = { count: 0, atRisk: 0 };
    practMap[disc].count++;
    if (
      p.risk_factors &&
      (p.risk_factors.toLowerCase().includes("leav") ||
        p.risk_factors.toLowerCase().includes("relocat"))
    ) {
      practMap[disc].atRisk++;
    }
  });

  // Investment amounts by category mapped to approximate discipline
  // Use category as proxy since investments don't have a discipline field
  const categoryToAmount: Record<string, number> = {};
  investments.forEach((inv) => {
    const cat = inv.category || "uncategorized";
    categoryToAmount[cat] = (categoryToAmount[cat] || 0) + (inv.amount || 0);
  });

  // Map categories to disciplines approximately
  const categoryToDiscipline = CATEGORY_TO_DISCIPLINE;

  // Build combined data from practitioner disciplines
  const allDiscs = new Set([
    ...Object.keys(practMap),
    ...Object.values(categoryToDiscipline),
  ]);

  // Investment by mapped discipline
  const investByDisc: Record<string, number> = {};
  Object.entries(categoryToAmount).forEach(([cat, amount]) => {
    const disc = categoryToDiscipline[cat] || "Other";
    investByDisc[disc] = (investByDisc[disc] || 0) + amount;
  });

  return Array.from(allDiscs)
    .map((name) => ({
      name,
      investment: investByDisc[name] || 0,
      practitionerCount: practMap[name]?.count || 0,
      atRisk: practMap[name]?.atRisk || 0,
    }))
    .filter((d) => d.investment > 0 || d.practitionerCount > 0)
    .sort((a, b) => b.investment - a.investment);
}

// ─── Formatters ─────────────────────────────────────

function formatShort(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${Math.round(v / 1_000)}K`;
  return `$${v}`;
}

// ─── Component ──────────────────────────────────────

export function InvestmentLandscape({
  investments,
  practitioners,
  onFilterSource,
  onFilterCategory,
  onFilterSourceCompounding,
  onNavigateDiscipline,
}: InvestmentLandscapeProps) {
  const bySource = aggregateBySource(investments);
  const byCategory = aggregateByCategory(investments);
  const compoundingBySource = aggregateCompoundingBySource(investments);
  const disciplineData = buildDisciplineData(investments, practitioners);

  const maxInvestment = Math.max(...disciplineData.map((d) => d.investment), 1);
  const maxPractitioners = Math.max(...disciplineData.map((d) => d.practitionerCount), 1);

  // Find lowest-funded category for annotation
  const totalInvestment = investments.reduce((s, i) => s + (i.amount || 0), 0);
  const lowestCat = byCategory.length > 0 ? byCategory[byCategory.length - 1] : null;
  const lowestPct = lowestCat && totalInvestment > 0
    ? ((lowestCat.amount / totalInvestment) * 100).toFixed(1)
    : null;

  return (
    <div className="space-y-16">
      {/* ── Viz 1: Where the Money Comes From ───────────── */}
      <div className="bg-surface-card border border-border rounded-card p-6">
        <h3 className="font-display text-[18px] font-semibold text-text mb-1">
          Where the Money Comes From
        </h3>
        <p className="text-[13px] text-dim mb-6">Investment by source</p>

        <ResponsiveContainer width="100%" height={bySource.length * 44 + 16}>
          <BarChart
            layout="vertical"
            data={bySource}
            margin={{ top: 0, right: 80, left: 200, bottom: 0 }}
          >
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9A9590", fontSize: 13 }}
              width={190}
            />
            <XAxis type="number" hide />
            <Bar
              dataKey="amount"
              fill="#C4A67A"
              radius={[0, 3, 3, 0]}
              barSize={20}
              cursor="pointer"
              isAnimationActive={false}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={(_data: any) => {
                onFilterSource(_data.name);
              }}
              label={{
                position: "right" as const,
                formatter: (v: unknown) => formatShort(Number(v)),
                fill: "#E8E4E0",
                fontSize: 13,
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Viz 2: Where the Money Goes ─────────────────── */}
      <div className="bg-surface-card border border-border rounded-card p-6">
        <h3 className="font-display text-[18px] font-semibold text-text mb-1">
          Where the Money Goes
        </h3>
        <p className="text-[13px] text-dim mb-6">Investment by category</p>

        <ResponsiveContainer width="100%" height={byCategory.length * 44 + 16}>
          <BarChart
            layout="vertical"
            data={byCategory}
            margin={{ top: 0, right: 80, left: 200, bottom: 0 }}
          >
            <YAxis
              type="category"
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9A9590", fontSize: 13 }}
              width={190}
            />
            <XAxis type="number" hide />
            <Bar
              dataKey="amount"
              fill="#C4A67A"
              radius={[0, 3, 3, 0]}
              barSize={20}
              cursor="pointer"
              isAnimationActive={false}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={(_data: any) => {
                onFilterCategory(_data.name);
              }}
              label={{
                position: "right" as const,
                formatter: (v: unknown) => formatShort(Number(v)),
                fill: "#E8E4E0",
                fontSize: 13,
              }}
            />
          </BarChart>
        </ResponsiveContainer>

        {lowestCat && lowestPct && (
          <p className="text-[13px] text-muted mt-4 leading-relaxed italic">
            {lowestCat.label} receives {lowestPct}% of total investment — the lowest allocation.
          </p>
        )}
      </div>

      {/* ── Viz 3: What Compounds and What Doesn't ──────── */}
      <div className="bg-surface-card border border-border rounded-card p-6">
        <h3 className="font-display text-[18px] font-semibold text-text mb-1">
          What Compounds and What Doesn&rsquo;t
        </h3>
        <p className="text-[13px] text-dim mb-6">Compounding status by source</p>

        <ResponsiveContainer width="100%" height={compoundingBySource.length * 44 + 48}>
          <BarChart
            layout="vertical"
            data={compoundingBySource}
            margin={{ top: 0, right: 80, left: 200, bottom: 32 }}
          >
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9A9590", fontSize: 13 }}
              width={190}
            />
            <XAxis type="number" hide />
            <Bar
              dataKey="compounding"
              stackId="a"
              fill="#6B9E6A"
              barSize={20}
              cursor="pointer"
              isAnimationActive={false}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={(_data: any) => {
                onFilterSourceCompounding(_data.name, "compounding");
              }}
            />
            <Bar
              dataKey="not_compounding"
              stackId="a"
              fill="#C45B5B"
              barSize={20}
              cursor="pointer"
              isAnimationActive={false}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={(_data: any) => {
                onFilterSourceCompounding(_data.name, "not_compounding");
              }}
            />
            <Bar
              dataKey="too_early"
              stackId="a"
              fill="#6B8EC4"
              barSize={20}
              radius={[0, 3, 3, 0]}
              cursor="pointer"
              isAnimationActive={false}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={(_data: any) => {
                onFilterSourceCompounding(_data.name, "too_early");
              }}
              label={{
                position: "right" as const,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                content: (props: any) => {
                  const { x, y, width, height, value } = props;
                  // Only show label when the too_early segment has a value (last segment)
                  // Find total from the data array
                  const idx = props.index;
                  const total = compoundingBySource[idx]?.total;
                  if (value === undefined || !total) return null;
                  return (
                    <text
                      x={x + width + 8}
                      y={y + height / 2}
                      fill="#E8E4E0"
                      fontSize={13}
                      dominantBaseline="middle"
                      fontFamily="var(--font-mono)"
                    >
                      {formatShort(total)}
                    </text>
                  );
                },
              }}
            />
          </BarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex items-center gap-5 mt-2">
          <span className="flex items-center gap-1.5 text-[12px] text-muted">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-status-green" />
            Compounding
          </span>
          <span className="flex items-center gap-1.5 text-[12px] text-muted">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-status-red" />
            Not compounding
          </span>
          <span className="flex items-center gap-1.5 text-[12px] text-muted">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-status-blue" />
            Too early
          </span>
        </div>

        {/* Editorial annotation */}
        <p className="text-[13px] text-muted mt-4 leading-relaxed italic">
          City of Bentonville&rsquo;s investments are primarily not compounding &mdash;
          public art Phases 1 and 2 produced work but didn&rsquo;t create conditions
          for each other. State-level operating grants duplicate CACHE funding without
          coordination, and corporate sponsorships renew annually without evolving.
        </p>
      </div>

      {/* ── Viz 4: Investment vs. Practitioner Reality ──── */}
      {practitioners.length > 0 && (
        <div className="bg-surface-card border border-border rounded-card p-6">
          <h3 className="font-display text-[18px] font-semibold text-text mb-1">
            Where Investment Meets — and Misses — Practitioner Reality
          </h3>
          <p className="text-[13px] text-dim mb-6">
            Funding allocation vs. practitioner presence by discipline
          </p>

          {/* Column headers */}
          <div className="grid gap-4 mb-3" style={{ gridTemplateColumns: "140px 1fr 1fr" }}>
            <div />
            <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em]">Investment</p>
            <p className="text-[11px] font-semibold text-dim uppercase tracking-[0.06em]">Practitioners</p>
          </div>

          {/* Rows */}
          <div className="space-y-3">
            {disciplineData.map((d) => (
              <div
                key={d.name}
                className="grid gap-4 items-center"
                style={{ gridTemplateColumns: "140px 1fr 1fr" }}
              >
                <span className="text-[13px] text-muted text-right truncate">{d.name}</span>

                {/* Investment bar — click filters list by related category */}
                <div
                  className="flex items-center gap-2 cursor-pointer group"
                  onClick={() => {
                    // Find a category that maps to this discipline
                    const catEntry = Object.entries(CATEGORY_TO_DISCIPLINE).find(
                      ([, disc]) => disc === d.name
                    );
                    if (catEntry) onFilterCategory(catEntry[0]);
                  }}
                >
                  <div
                    className="h-4 rounded-sm bg-accent transition-all group-hover:opacity-80"
                    style={{
                      width: `${maxInvestment > 0 ? (d.investment / maxInvestment) * 100 : 0}%`,
                      minWidth: d.investment > 0 ? "2px" : "0px",
                    }}
                  />
                  <span className="text-[12px] font-mono text-muted whitespace-nowrap">
                    {d.investment > 0 ? formatShort(d.investment) : "$0"}
                  </span>
                </div>

                {/* Practitioner bar — click navigates to ecosystem map practitioners tab */}
                <div
                  className={`flex items-center gap-2 ${onNavigateDiscipline ? "cursor-pointer group" : ""}`}
                  onClick={() => {
                    if (onNavigateDiscipline && d.practitionerCount > 0) {
                      onNavigateDiscipline(d.name);
                    }
                  }}
                >
                  <div
                    className={`h-4 rounded-sm bg-dim transition-all ${onNavigateDiscipline ? "group-hover:opacity-80" : ""}`}
                    style={{
                      width: `${maxPractitioners > 0 ? (d.practitionerCount / maxPractitioners) * 100 : 0}%`,
                      minWidth: d.practitionerCount > 0 ? "2px" : "0px",
                    }}
                  />
                  <span className="text-[12px] font-mono text-muted whitespace-nowrap">
                    {d.practitionerCount}
                    {d.atRisk > 0 && (
                      <span className="text-status-red text-[11px] ml-1">
                        ({d.atRisk} at risk)
                      </span>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Editorial annotation */}
          <p className="text-[13px] text-muted mt-6 leading-relaxed italic">
            Music and film practitioners report the highest retention risk,
            yet combined investment in these disciplines is a fraction of visual arts
            allocation. Ceramics and literary arts receive no direct investment
            despite active practitioners in both fields.
          </p>
        </div>
      )}
    </div>
  );
}
