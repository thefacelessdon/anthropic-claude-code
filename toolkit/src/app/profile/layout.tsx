export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="pub-theme"
      style={{
        ["--font-display" as string]: "'DM Serif Display', serif",
        ["--font-body" as string]: "'DM Sans', sans-serif",
        ["--font-mono" as string]: "'JetBrains Mono', monospace",
      }}
    >
      {children}
    </div>
  );
}
