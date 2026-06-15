"use server";

import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { createUser, findUserByEmail } from "@/lib/auth/users";
import { validatePassword } from "@/lib/validation/password";
import { isAdminEmail } from "@/lib/auth/admin";

const createUserSchema = z.object({
  email: z.string().email(),
  admin_name: z.string().min(1, "Name required"),
  password: z.string(),
});

export async function adminCreateUserAction(_prev: { error?: string; ok?: boolean } | null, formData: FormData) {
  const user = await getSession();

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

  const existing = await findUserByEmail(parsed.data.email);
  if (existing) return { error: "Email already registered" };

  try {
    await createUser({
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      admin_name: parsed.data.admin_name,
    });
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return { error: msg };
  }
}
