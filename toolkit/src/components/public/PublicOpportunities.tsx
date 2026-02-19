"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { formatCurrency, daysUntil } from "@/lib/utils/formatting";
import { OPPORTUNITY_TYPE_LABELS } from "@/lib/utils/constants";

/* ── Public opportunity shape (subset of internal) ──── */

export interface PublicOpportunity {
  id: string;
  title: string;
  opportunity_type: string;
  status: string;
  deadline: string | null;
  amount_min: number | null;
  amount_max: number | null;
  amount_description: string | null;
  description: string | null;
  eligibility: string | null;
  application_url: string | null;
  contact_email: string | null;
  source_name: string | null;
}

/* ── Helpers ───────────────────────────────────────────── */

function formatAmount(
  min: number | null,
  max: number | null,
  desc: string | null
): string {
  if (min !== null && max !== null && min === max) return formatCurrency(min);
  if (min !== null && max !== null)
    return `${formatCurrency(min)} \u2013 ${formatCurrency(max)}`;
  if (min !== null) return `From ${formatCurrency(min)}`;
  if (max !== null) return `Up to ${formatCurrency(max)}`;
  if (desc) return desc;
  return "";
}

function deadlineDisplay(deadline: string | null) {
  if (!deadline) return null;
  const days = daysUntil(deadline);
  const dateStr = new Date(deadline).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  return { dateStr, days };
}

function countdownClass(days: number | null): string {
  if (days === null) return "";
  if (days <= 14) return "pub-countdown-urgent";
  if (days <= 30) return "pub-countdown-soon";
  return "pub-countdown-normal";
}

function isClosingSoon(deadline: string | null): boolean {
  if (!deadline) return false;
  const days = daysUntil(deadline);
  return days !== null && days >= 0 && days <= 14;
}

const TYPE_CLASSES: Record<string, string> = {
  grant: "pub-type-grant",
  rfp: "pub-type-rfp",
  commission: "pub-type-commission",
  residency: "pub-type-residency",
  fellowship: "pub-type-fellowship",
};

type SortKey = "deadline" | "amount" | "recent";

/* ── Main Component ────────────────────────────────────── */

export function PublicOpportunities({
  opportunities,
}: {
  opportunities: PublicOpportunity[];
}) {
  const [typeFilter, setTypeFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [sort, setSort] = useState<SortKey>("deadline");

  /* Derive filter options from data */
  const types = useMemo(() => {
    const set = new Set(opportunities.map((o) => o.opportunity_type));
    return Array.from(set).sort();
  }, [opportunities]);

  const sources = useMemo(() => {
    const set = new Set(
      opportunities.map((o) => o.source_name).filter(Boolean) as string[]
    );
    return Array.from(set).sort();
  }, [opportunities]);

  /* Apply filters */
  const filtered = useMemo(() => {
    let result = opportunities;

    if (typeFilter !== "all") {
      result = result.filter((o) => o.opportunity_type === typeFilter);
    }
    if (sourceFilter !== "all") {
      result = result.filter((o) => o.source_name === sourceFilter);
    }

    /* Sort */
    const sorted = [...result];
    if (sort === "deadline") {
      sorted.sort((a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return (
          new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        );
      });
    } else if (sort === "amount") {
      sorted.sort((a, b) => {
        const aAmt = a.amount_max || a.amount_min || 0;
        const bAmt = b.amount_max || b.amount_min || 0;
        return bAmt - aAmt;
      });
    }
    // "recent" keeps original order (deadline asc from server)

    return sorted;
  }, [opportunities, typeFilter, sourceFilter, sort]);

  /* Summary stats — computed from filtered set */
  const summaryCount = filtered.length;
  const summaryTotal = filtered.reduce(
    (sum, o) => sum + (o.amount_max || o.amount_min || 0),
    0
  );
  const summarySources = new Set(
    filtered.map((o) => o.source_name).filter(Boolean)
  ).size;

  /* Active filter state — for dropdown highlight */
  const typeActive = typeFilter !== "all";
  const sourceActive = sourceFilter !== "all";


  /* Build summary text */
  const summaryLabel = useMemo(() => {
    const typePart =
      typeFilter !== "all"
        ? (OPPORTUNITY_TYPE_LABELS[typeFilter] || typeFilter).toLowerCase() +
          "s"
        : "open opportunities";
    const sourcePart =
      sourceFilter !== "all" ? sourceFilter : `${summarySources} sources`;
    return { typePart, sourcePart };
  }, [typeFilter, sourceFilter, summarySources]);

  return (
    <div className="pub-page">
      {/* ── Header ──────────────────────────────────────── */}
      <header className="pub-header">
        <h1 className="pub-header-title">NWA Creative Opportunities</h1>
        <p className="pub-header-tagline">
          Open creative opportunities in Northwest Arkansas
        </p>
      </header>

      {/* ── Summary Line ────────────────────────────────── */}
      <div className="pub-summary">
        <span className="pub-summary-number">{summaryCount}</span>{" "}
        {summaryLabel.typePart}
        {summaryTotal > 0 && (
          <>
            {" "}
            totaling{" "}
            <span className="pub-summary-number">
              {formatCurrency(summaryTotal)}
            </span>
          </>
        )}{" "}
        from{" "}
        <span className="pub-summary-number">{summaryLabel.sourcePart}</span>
      </div>

      {/* ── Filters ─────────────────────────────────────── */}
      <div className="pub-filters">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className={`pub-filter-select ${typeActive ? "pub-filter-select--active" : ""}`}
        >
          <option value="all">All types</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {OPPORTUNITY_TYPE_LABELS[t] || t}
            </option>
          ))}
        </select>

        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className={`pub-filter-select ${sourceActive ? "pub-filter-select--active" : ""}`}
        >
          <option value="all">All sources</option>
          {sources.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <span className="pub-sort-label">
          Sort:{" "}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="pub-filter-select pub-sort-select"
          >
            <option value="deadline">Deadline</option>
            <option value="amount">Amount</option>
            <option value="recent">Recently added</option>
          </select>
        </span>
      </div>

      {/* ── Card Grid ───────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="pub-empty">
          <p className="pub-empty-title">No opportunities match your filters</p>
          <p className="pub-empty-text">
            Try adjusting your filters, or{" "}
            <button
              className="pub-link"
              onClick={() => {
                setTypeFilter("all");
                setSourceFilter("all");
              }}
            >
              clear all filters
            </button>
          </p>
        </div>
      ) : (
        <div className="pub-card-grid">
          {filtered.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
            />
          ))}
        </div>
      )}

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="pub-footer">
        <p>
          This surface is maintained as part of ongoing cultural architecture
          work in Northwest Arkansas.
        </p>
        <p style={{ marginTop: 12 }}>
          Know of an opportunity that should be listed?{" "}
          <Link href="/opportunities/submit" className="pub-link">
            Submit it &rarr;
          </Link>
        </p>
      </footer>

    </div>
  );
}

/* ── Card Component ────────────────────────────────────── */

function OpportunityCard({
  opportunity: opp,
}: {
  opportunity: PublicOpportunity;
}) {
  const amount = formatAmount(
    opp.amount_min,
    opp.amount_max,
    opp.amount_description
  );
  const dl = deadlineDisplay(opp.deadline);
  const closing = isClosingSoon(opp.deadline);
  const typeClass = TYPE_CLASSES[opp.opportunity_type] || "pub-type-default";

  return (
    <div className={`pub-card ${closing ? "pub-card--closing-soon" : ""}`}>
      {/* Row 1: Type + Amount */}
      <div className="pub-card-header">
        <span className={`pub-card-type ${typeClass}`}>
          {OPPORTUNITY_TYPE_LABELS[opp.opportunity_type] ||
            opp.opportunity_type}
        </span>
        {amount && <span className="pub-card-amount">{amount}</span>}
      </div>

      {/* Title */}
      <h3 className="pub-card-title">{opp.title}</h3>

      {/* Source + Deadline */}
      <div className="pub-card-meta">
        <span className="pub-card-source">{opp.source_name || "\u00A0"}</span>
        {dl && (
          <div className="pub-card-deadline">
            <div className="pub-card-deadline-date">Due {dl.dateStr}</div>
            <div
              className={`pub-card-deadline-countdown ${countdownClass(dl.days)}`}
            >
              {dl.days !== null &&
                (dl.days <= 0 ? "Past deadline" : `${dl.days} days`)}
            </div>
          </div>
        )}
      </div>

      {/* Eligibility */}
      {opp.eligibility && (
        <p className="pub-card-eligibility">{opp.eligibility}</p>
      )}

      {/* Details link */}
      <Link href={`/opportunities/${opp.id}`} className="pub-card-apply">
        Details &rarr;
      </Link>
    </div>
  );
}

