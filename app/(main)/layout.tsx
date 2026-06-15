import { getSession } from "@/lib/auth/session";
import { getTeamRoster } from "@/lib/auth/team";
import { AppShell } from "@/components/layout/app-shell";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  const teamMembers = user ? await getTeamRoster() : [];
  return (
    <AppShell teamMembers={teamMembers} userEmail={user?.email ?? null}>
      {children}
    </AppShell>
  );
}
