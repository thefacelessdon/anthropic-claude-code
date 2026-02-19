import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Open Opportunities — NWA Creative Economy",
  description:
    "Open creative opportunities in Northwest Arkansas. Grants, commissions, RFPs, residencies, and fellowships for creative practitioners.",
};

export default function PublicOpportunitiesLayout({
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
