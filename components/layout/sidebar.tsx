"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import type { TeamMemberRoster } from "@/lib/auth/team";

const items = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/clients", label: "Clients" },
  { href: "/cashflow", label: "Cashflow" },
  { href: "/reports", label: "Reports" },
  { href: "/settings", label: "Settings" },
];

export function Sidebar({ teamMembers = [] }: { teamMembers?: TeamMemberRoster[] }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-[260px] shrink-0 flex-col border-r border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]">
      <div className="flex h-16 items-center border-b border-[var(--color-border-subtle)] px-5">
        <Link href="/dashboard" className="text-lg font-semibold tracking-tight text-white">
          DCRM
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3" aria-label="Main">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-[10px] px-4 py-3 text-sm font-medium transition-colors",
                active
                  ? "bg-[var(--color-primary)]/20 text-white ring-1 ring-[var(--color-primary)]/40"
                  : "text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-white",
              )}
            >
              {item.label}
            </Link>
          );
        })}
        {teamMembers.length > 0 ? (
          <div className="mt-4 border-t border-[var(--color-border-subtle)] pt-4">
            <p className="mb-2 px-4 text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
              Team
            </p>
            <ul className="space-y-1">
              {teamMembers.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center gap-2 rounded-[10px] px-4 py-2 text-sm text-[var(--color-text-secondary)]"
                >
                  <span
                    className={cn(
                      "h-2 w-2 shrink-0 rounded-full",
                      m.active ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "bg-white/20",
                    )}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 truncate text-white/90" title={m.email ?? m.displayName}>
                    {m.displayName}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </nav>
      <div className="border-t border-[var(--color-border-subtle)] p-3">
        <form action={logoutAction}>
          <Button type="submit" variant="secondary" className="w-full">
            Log out
          </Button>
        </form>
      </div>
    </aside>
  );
}
