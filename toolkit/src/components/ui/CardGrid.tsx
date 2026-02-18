"use client";

interface CardGridProps {
  children: React.ReactNode;
  columns?: 2 | 3;
}

export function CardGrid({ children, columns = 2 }: CardGridProps) {
  return (
    <div
      className={`grid grid-cols-1 gap-4 ${
        columns === 3
          ? "sm:grid-cols-2 xl:grid-cols-3"
          : "sm:grid-cols-2"
      }`}
    >
      {children}
    </div>
  );
}

interface GridCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
  aspect?: "portrait" | "square";
  className?: string;
  accentBar?: string;
}

export function GridCard({
  children,
  onClick,
  selected = false,
  aspect = "portrait",
  className = "",
  accentBar,
}: GridCardProps) {
  return (
    <div
      onClick={onClick}
      className={`relative bg-surface-card border rounded-card overflow-hidden transition-all duration-card flex ${
        aspect === "portrait" ? "aspect-[4/5]" : "aspect-square"
      } ${
        onClick
          ? "cursor-pointer hover:border-border-medium hover:shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
          : ""
      } ${
        selected
          ? "ring-1 ring-accent border-accent"
          : "border-border"
      } ${className}`}
    >
      {/* Optional accent bar on left edge */}
      {accentBar && (
        <div className={`w-1.5 shrink-0 ${accentBar}`} />
      )}

      <div className="relative flex-1 min-w-0 overflow-hidden">
        <div className="absolute inset-0 p-5 flex flex-col overflow-hidden">
          {children}
        </div>
        {/* Bottom fade so content doesn't abruptly cut off */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-surface-card to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
