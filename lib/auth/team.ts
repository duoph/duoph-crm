import { listAllUsers } from "@/lib/auth/users";

const ACTIVE_MS = 60 * 60 * 1000;

export type TeamMemberRoster = {
  id: string;
  email: string | null;
  displayName: string;
  active: boolean;
};

export async function getTeamRoster(): Promise<TeamMemberRoster[]> {
  try {
    const users = await listAllUsers();
    const now = Date.now();
    const members = users.map((u) => {
      const displayName =
        u.admin_name.trim() ||
        (typeof u.email === "string" ? u.email.split("@")[0]! : null) ||
        "User";
      const last = u.last_sign_in_at ? new Date(u.last_sign_in_at).getTime() : 0;
      return {
        id: u._id.toString(),
        email: u.email ?? null,
        displayName,
        active: last > 0 && now - last < ACTIVE_MS,
      };
    });
    members.sort((a, b) => a.displayName.localeCompare(b.displayName, undefined, { sensitivity: "base" }));
    return members;
  } catch {
    return [];
  }
}
