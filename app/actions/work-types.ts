"use server";

import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { isAdminEmail } from "@/lib/auth/admin";
import { dbErrorMessage } from "@/lib/db/error-message";
import { workTypeService } from "@/lib/api/work-types";

const upsertSchema = z.object({
  key: z
    .string()
    .min(2)
    .max(32)
    .regex(/^[a-z0-9_]+$/, "Use lowercase letters, numbers, underscore"),
  label: z.string().min(2).max(64),
});

export async function upsertWorkTypeAction(_prev: { error?: string; ok?: boolean } | null, formData: FormData) {
  const user = await getSession();
  if (!user || !isAdminEmail(user.email)) return { error: "Forbidden" };

  const parsed = upsertSchema.safeParse({
    key: String(formData.get("key") ?? "").trim(),
    label: String(formData.get("label") ?? "").trim(),
  });
  if (!parsed.success) return { error: "Invalid payload" };

  try {
    await workTypeService.upsert(parsed.data.key, parsed.data.label);
    return { ok: true as const };
  } catch (e) {
    return { error: dbErrorMessage(e) };
  }
}

export async function deleteWorkTypeAction(key: string) {
  const user = await getSession();
  if (!user || !isAdminEmail(user.email)) return { error: "Forbidden" };

  const k = String(key ?? "").trim();
  if (!k) return { error: "Invalid key" };

  try {
    await workTypeService.remove(k);
    return { ok: true as const };
  } catch (e) {
    return { error: dbErrorMessage(e) };
  }
}
