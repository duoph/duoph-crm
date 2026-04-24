import { Sidebar } from "@/components/layout/sidebar";
import type { TeamMemberRoster } from "@/lib/auth/team";

export function AppShell({
  children,
  teamMembers = [],
  userEmail,
}: {
  children: React.ReactNode;
  teamMembers?: TeamMemberRoster[];
  userEmail?: string | null;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar teamMembers={teamMembers} userEmail={userEmail} />
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center border-b border-(--color-border-subtle) bg-(--color-bg-surface) px-6">
          <p className="text-sm text-(--color-text-secondary)">Operations</p>
        </header>
        <main className="flex-1 p-4">
          <div className="mx-auto max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
