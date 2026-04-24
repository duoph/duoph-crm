"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validatePassword } from "@/lib/validation/password";
import { findAuthUserByEmail } from "@/lib/auth/admin-users";
import { isAdminEmail } from "@/lib/auth/admin";

const createUserSchema = z.object({
  email: z.string().email(),
  admin_name: z.string().min(1, "Name required"),
  password: z.string(),
});

export async function adminCreateUserAction(_prev: { error?: string; ok?: boolean } | null, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    return { error: "Forbidden" };
  }

  const email = String(formData.get("email") ?? "");
  const admin_name = String(formData.get("admin_name") ?? "");
  const password = String(formData.get("password") ?? "");
  const parsed = createUserSchema.safeParse({ email, admin_name, password });
  if (!parsed.success) return { error: "Invalid payload" };

  const pw = validatePassword(password);
  if (!pw.ok) return { error: pw.message };

  const admin = createAdminClient();
  const existing = await findAuthUserByEmail(admin, parsed.data.email);
  if (existing) return { error: "Email already registered" };

  const { error } = await admin.auth.admin.createUser({
    email: parsed.data.email.toLowerCase(),
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { admin_name: parsed.data.admin_name },
  });

  if (error) return { error: error.message };
  return { ok: true };
}

