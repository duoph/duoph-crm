import { createHash } from "crypto";

export function hashOtp(code: string): string {
  const pepper = process.env.OTP_PEPPER ?? "dev-pepper-change-in-production";
  return createHash("sha256").update(`${pepper}:${code}`).digest("hex");
}

export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function hashResetToken(token: string): string {
  const pepper = process.env.OTP_PEPPER ?? "dev-pepper-change-in-production";
  return createHash("sha256").update(`${pepper}:reset:${token}`).digest("hex");
}
