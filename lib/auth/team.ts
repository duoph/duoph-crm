import { createAdminClient } from "@/lib/supabase/admin";

const ACTIVE_MS = 60 * 60 * 1000;

export type TeamMemberRoster = {
  id: string;
  email: string | null;
  displayName: string;
  active: boolean;
};

export async function getTeamRoster(): Promise<TeamMemberRoster[]> {
  try {
    const admin = createAdminClient();
    const members: TeamMemberRoster[] = [];
    let page = 1;
    const perPage = 200;
    const now = Date.now();
    for (;;) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
      if (error) throw error;
      for (const u of data.users) {
        const meta = u.user_metadata as Record<string, unknown> | undefined;
        const fromMeta = typeof meta?.admin_name === "string" ? meta.admin_name.trim() : "";
        const displayName =
          fromMeta ||
          (typeof u.email === "string" ? u.email.split("@")[0]! : null) ||
          "User";
        const last = u.last_sign_in_at ? new Date(u.last_sign_in_at).getTime() : 0;
        members.push({
          id: u.id,
          email: u.email ?? null,
          displayName,
          active: last > 0 && now - last < ACTIVE_MS,
        });
      }
      if (data.users.length < perPage) break;
      page += 1;
    }
    members.sort((a, b) => a.displayName.localeCompare(b.displayName, undefined, { sensitivity: "base" }));
    return members;
  } catch {
    return [];
  }
}
