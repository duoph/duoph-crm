import "server-only";

import { findUserById, updateUserProfile } from "@/lib/auth/users";
import type { UsersProfile } from "@/lib/types/database";
import { toIso } from "@/lib/db/serialize";

export const profileService = {
  async get(userId: string): Promise<UsersProfile | null> {
    const user = await findUserById(userId);
    if (!user) return null;
    return {
      id: user._id.toString(),
      admin_name: user.admin_name,
      created_at: toIso(user.created_at)!,
    };
  },

  async update(userId: string, admin_name: string): Promise<UsersProfile> {
    await updateUserProfile(userId, admin_name);
    const profile = await this.get(userId);
    if (!profile) throw new Error("User not found");
    return profile;
  },
};
