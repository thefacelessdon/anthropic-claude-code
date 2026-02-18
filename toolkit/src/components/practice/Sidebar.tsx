"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  verb: string;
  icon: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "TOOLS",
    items: [
      {
        href: "/ecosystem-map",
        label: "Ecosystem Map",
        verb: "Who\u2019s in this system",
        icon: "network",
      },
      {
        href: "/investments",
        label: "Investments",
        verb: "Where money flows",
        icon: "layers",
      },
      {
        href: "/decisions",
        label: "Decisions",
        verb: "What\u2019s being decided",
        icon: "clock",
      },
      {
        href: "/precedents",
        label: "Precedents",
        verb: "What\u2019s been tried",
        icon: "archive",
      },
      {
        href: "/opportunities",
        label: "Opportunities",
        verb: "What\u2019s available now",
        icon: "compass",
      },
      {
        href: "/narratives",
        label: "Narratives",
        verb: "Story vs. reality",
        icon: "quotes",
      },
    ],
  },
  {
    title: "SYNTHESIS",
    items: [
      {
        href: "/outputs",
        label: "Outputs",
        verb: "Intelligence we\u2019ve produced",
        icon: "document",
      },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      {
        href: "/submissions",
        label: "Submissions",
        verb: "Review queue",
        icon: "inbox",
      },
    ],
  },
];

const ICONS: Record<string, React.ReactNode> = {
  grid: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  ),
  network: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
  ),
  layers: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
    </svg>
  ),
  clock: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  archive: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  ),
  compass: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
    </svg>
  ),
  quotes: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  ),
  document: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  inbox: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />
    </svg>
  ),
  gear: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 h-screen bg-surface-card border-r border-border flex flex-col fixed left-0 top-0">
      {/* Logo area */}
      <div className="px-5 py-5 border-b border-border">
        <Link href="/dashboard" className="block">
          <span className="font-display text-accent text-base tracking-wide">
            Cultural Architecture
          </span>
          <span className="block text-dim text-[10px] mt-1 tracking-widest uppercase font-body">
            Practice Surface
          </span>
        </Link>
      </div>

      {/* Grouped navigation */}
      <nav className="flex-1 overflow-y-auto px-3 pt-4 pb-3">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="mt-5">
            <span className="block px-3 text-[10px] font-body font-semibold text-dim tracking-widest uppercase mb-2">
              {group.title}
            </span>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname?.startsWith(item.href + "/");

                return (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    verb={item.verb}
                    icon={item.icon}
                    isActive={isActive}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Settings link at bottom */}
      <div className="px-3 py-3 border-t border-border">
        <NavLink
          href="/settings"
          label="Settings"
          icon="gear"
          isActive={pathname === "/settings"}
        />
      </div>
    </aside>
  );
}

function NavLink({
  href,
  label,
  verb,
  icon,
  isActive,
}: {
  href: string;
  label: string;
  verb?: string;
  icon: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group relative flex items-start gap-2.5 px-3 py-2 rounded-md text-sm transition-all duration-card ${
        isActive
          ? "bg-accent-glow text-text"
          : "text-muted hover:text-text hover:bg-surface-elevated/50"
      }`}
    >
      {/* Active indicator bar */}
      {isActive && (
        <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full bg-accent" />
      )}

      <span className={`mt-0.5 shrink-0 ${isActive ? "text-accent" : "text-dim group-hover:text-muted"}`}>
        {ICONS[icon]}
      </span>

      <div className="min-w-0">
        <span className={`block text-sm font-medium leading-tight ${isActive ? "text-text" : ""}`}>
          {label}
        </span>
        {verb && (
          <span className="block text-[11px] text-dim leading-snug mt-0.5">
            {verb}
          </span>
        )}
      </div>
    </Link>
  );
}
