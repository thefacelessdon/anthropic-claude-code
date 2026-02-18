interface StatusDotProps {
  color: "green" | "red" | "blue" | "orange" | "dim";
  pulse?: boolean;
}

const colorMap = {
  green: "bg-status-green",
  red: "bg-status-red",
  blue: "bg-status-blue",
  orange: "bg-status-orange",
  dim: "bg-dim",
};

export function StatusDot({ color, pulse = false }: StatusDotProps) {
  return (
    <span className="relative inline-flex h-2 w-2">
      {pulse && (
        <span
          className={`absolute inline-flex h-full w-full rounded-full opacity-40 animate-ping ${colorMap[color]}`}
        />
      )}
      <span
        className={`relative inline-flex h-2 w-2 rounded-full ${colorMap[color]}`}
      />
    </span>
  );
}
