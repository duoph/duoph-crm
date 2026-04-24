export function supabaseErrorMessage(e: unknown): string {
  if (e && typeof e === "object" && "toJSON" in e && typeof (e as { toJSON: unknown }).toJSON === "function") {
    try {
      const j = (e as { toJSON: () => { message?: string; details?: string; hint?: string; code?: string } }).toJSON();
      const parts = [j.message, j.details, j.hint ? `Hint: ${j.hint}` : "", j.code ? `(${j.code})` : ""].filter(
        Boolean,
      ) as string[];
      if (parts.length) return parts.join(" — ");
    } catch {
      /* fall through */
    }
  }
  if (e instanceof Error) return e.message;
  return "Failed";
}
