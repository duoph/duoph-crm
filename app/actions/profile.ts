"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { profileService } from "@/lib/api/profile";

export async function updateProfileAction(admin_name: string) {
  const user = await getSession();
  if (!user) return { error: "Unauthorized" };
  try {
    await profileService.update(user.id, admin_name);
    revalidatePath("/settings");
    return { ok: true as const };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return { error: msg };
  }
}
