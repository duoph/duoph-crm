import { createHash } from "crypto";

export function hashResetToken(token: string): string {
  const pepper = process.env.OTP_PEPPER ?? "dev-pepper-change-in-production";
  return createHash("sha256").update(`${pepper}:reset:${token}`).digest("hex");
}
