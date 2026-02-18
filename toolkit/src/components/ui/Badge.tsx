interface BadgeProps {
  children: React.ReactNode;
  color?: string; // Tailwind color name (e.g., "status-green")
  className?: string;
}

export function Badge({
  children,
  color = "dim",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full border ${className}`}
      style={{
        color: `var(--badge-color)`,
        borderColor: `var(--badge-color)`,
        opacity: 0.9,
      }}
    >
      <style>{`
        .badge-${color} {
          --badge-color: ${getColorValue(color)};
        }
      `}</style>
      <span className={`badge-${color}`}>{children}</span>
    </span>
  );
}

// Direct color mapping for server rendering
function getColorValue(color: string): string {
  const map: Record<string, string> = {
    "status-green": "#5B8C5A",
    "status-red": "#C45B5B",
    "status-blue": "#5B7FC4",
    "status-orange": "#C4885B",
    accent: "#C4A67A",
    dim: "#666666",
    muted: "#999999",
  };
  return map[color] || map.dim;
}

// Simpler variant for use in server components
interface StatusBadgeProps {
  label: string;
  color: "green" | "red" | "blue" | "orange" | "dim";
}

export function StatusBadge({ label, color }: StatusBadgeProps) {
  const colorMap = {
    green: "border-status-green text-status-green",
    red: "border-status-red text-status-red",
    blue: "border-status-blue text-status-blue",
    orange: "border-status-orange text-status-orange",
    dim: "border-dim text-dim",
  };

  return (
    <span
      className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full border ${colorMap[color]}`}
    >
      {label}
    </span>
  );
}
