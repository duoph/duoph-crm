export const ADMIN_EMAILS = ["duophtechnologies@gmail.com"] as const;

export function isAdminEmail(email: string | null | undefined) {
  const e = (email ?? "").toLowerCase();
  return ADMIN_EMAILS.some((a) => a.toLowerCase() === e);
}

