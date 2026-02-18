"use client";

import { useEffect, useCallback } from "react";

interface DetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  subtitle?: React.ReactNode;
  backLabel?: string;
  actions?: React.ReactNode;
}

export function DetailPanel({
  isOpen,
  onClose,
  children,
  title,
  subtitle,
  backLabel = "Back to list",
  actions,
}: DetailPanelProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 animate-overlay-in"
        onClick={onClose}
      />

      {/* Panel — full width on mobile, 55% on desktop */}
      <div className="relative w-full sm:w-[70%] md:w-[55%] sm:min-w-[400px] md:min-w-[500px] max-w-[800px] h-full bg-surface-card border-l border-border animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="shrink-0 px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-[13px] text-muted hover:text-text transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
              {backLabel}
            </button>
            {actions}
          </div>
          {title && (
            <h2 className="font-display text-xl font-semibold text-text">
              {title}
            </h2>
          )}
          {subtitle && <div className="mt-1.5">{subtitle}</div>}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
      </div>
    </div>
  );
}

/* ── Inline Reference Card ───────────────────────── */

interface InlineRefCardProps {
  title: string;
  subtitle?: string;
  accentColor?: "gold" | "blue" | "green" | "orange" | "red" | "purple";
  onClick?: () => void;
  children?: React.ReactNode;
}

const accentColorMap = {
  gold: "border-l-accent",
  blue: "border-l-status-blue",
  green: "border-l-status-green",
  orange: "border-l-status-orange",
  red: "border-l-status-red",
  purple: "border-l-status-purple",
};

export function InlineRefCard({
  title,
  subtitle,
  accentColor = "gold",
  onClick,
  children,
}: InlineRefCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-surface-inset rounded-md px-4 py-3 border-l-2 ${
        accentColorMap[accentColor]
      } ${onClick ? "cursor-pointer hover:bg-surface-elevated/50 transition-colors" : ""}`}
    >
      <p className="text-[13px] font-semibold text-text">{title}</p>
      {subtitle && (
        <p className="text-[12px] text-muted mt-0.5">{subtitle}</p>
      )}
      {children}
    </div>
  );
}

/* ── Detail Section ──────────────────────────────── */

interface DetailSectionProps {
  title: string;
  subtitle?: string;
  count?: number;
  children: React.ReactNode;
}

export function DetailSection({
  title,
  subtitle,
  count,
  children,
}: DetailSectionProps) {
  return (
    <div className="mt-8 first:mt-0">
      <div className="mb-3 pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-base font-semibold text-text">
            {title}
          </h3>
          {count !== undefined && (
            <span className="text-[11px] text-dim bg-surface-inset px-1.5 py-0.5 rounded font-mono">
              {count}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-[13px] text-muted mt-0.5">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}
