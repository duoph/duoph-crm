import { AppShell } from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/server";
import { getTeamRoster } from "@/lib/auth/team";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const teamMembers = user ? await getTeamRoster() : [];
  return (
    <AppShell teamMembers={teamMembers} userEmail={user?.email ?? null}>
      {children}
    </AppShell>
  );
}
