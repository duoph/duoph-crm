export function dbErrorMessage(e: unknown): string {
  if (e && typeof e === "object" && "code" in e && (e as { code?: number }).code === 11000) {
    return "Duplicate entry";
  }
  if (e instanceof Error) return e.message;
  return "Failed";
}
