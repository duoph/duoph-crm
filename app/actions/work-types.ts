"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/auth/admin";
import { supabaseErrorMessage } from "@/lib/supabase/error-message";

const upsertSchema = z.object({
  key: z
    .string()
    .min(2)
    .max(32)
    .regex(/^[a-z0-9_]+$/, "Use lowercase letters, numbers, underscore"),
  label: z.string().min(2).max(64),
});

export async function upsertWorkTypeAction(_prev: { error?: string; ok?: boolean } | null, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) return { error: "Forbidden" };

  const parsed = upsertSchema.safeParse({
    key: String(formData.get("key") ?? "").trim(),
    label: String(formData.get("label") ?? "").trim(),
  });
  if (!parsed.success) return { error: "Invalid payload" };

  try {
    const admin = createAdminClient();
    const { error } = await admin.from("work_types").upsert(parsed.data, { onConflict: "key" });
    if (error) throw error;
    return { ok: true as const };
  } catch (e) {
    return { error: supabaseErrorMessage(e) };
  }
}

export async function deleteWorkTypeAction(key: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) return { error: "Forbidden" };

  const k = String(key ?? "").trim();
  if (!k) return { error: "Invalid key" };

  try {
    const admin = createAdminClient();
    const { error } = await admin.from("work_types").delete().eq("key", k);
    if (error) throw error;
    return { ok: true as const };
  } catch (e) {
    return { error: supabaseErrorMessage(e) };
  }
}

