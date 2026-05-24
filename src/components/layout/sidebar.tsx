"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CandlestickChart,
  Filter,
  Star,
  Briefcase,
  Bell,
  Newspaper,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/chart/AAPL", label: "Charts", icon: CandlestickChart, match: "/chart" },
  { href: "/screener", label: "Screener", icon: Filter },
  { href: "/watchlist", label: "Watchlist", icon: Star },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/news", label: "News & Calendar", icon: Newspaper },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex w-16 flex-col border-r border-border bg-bg-soft lg:w-56">
      <Link
        href="/"
        className="flex h-14 items-center gap-2 border-b border-border px-3 lg:px-4"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent">
          <TrendingUp className="h-5 w-5 text-white" />
        </span>
        <span className="hidden text-sm font-semibold text-text-bright lg:block">
          Terminal
        </span>
      </Link>
      <nav className="flex flex-1 flex-col gap-1 p-2">
        {NAV.map((item) => {
          const active = item.match
            ? pathname.startsWith(item.match)
            : pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-bg-hover text-text-bright"
                  : "text-text-muted hover:bg-bg-hover hover:text-text",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="hidden lg:block">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="hidden border-t border-border p-3 text-xs text-text-muted lg:block">
        Data via Finnhub
      </div>
    </aside>
  );
}
