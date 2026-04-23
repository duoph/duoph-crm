import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "At least 8 characters")
  .regex(/[A-Z]/, "At least one uppercase letter")
  .regex(/[0-9]/, "At least one number")
  .regex(/[^A-Za-z0-9]/, "At least one special character");

export function validatePassword(password: string): { ok: true } | { ok: false; message: string } {
  const r = passwordSchema.safeParse(password);
  if (r.success) return { ok: true };
  return { ok: false, message: r.error.issues[0]?.message ?? "Invalid password" };
}
