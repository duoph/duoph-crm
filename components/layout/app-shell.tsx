import { Sidebar } from "@/components/layout/sidebar";
import type { TeamMemberRoster } from "@/lib/auth/team";

export function AppShell({
  children,
  teamMembers = [],
}: {
  children: React.ReactNode;
  teamMembers?: TeamMemberRoster[];
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar teamMembers={teamMembers} />
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-6">
          <p className="text-sm text-[var(--color-text-secondary)]">Operations</p>
        </header>
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
