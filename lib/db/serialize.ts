import { ObjectId } from "mongodb";

export function toId(value: string | ObjectId): string {
  return typeof value === "string" ? value : value.toString();
}

export function toIso(d: Date | string | null | undefined): string | null {
  if (!d) return null;
  return d instanceof Date ? d.toISOString() : d;
}

export function toDateOnly(d: Date | string | null | undefined): string | null {
  if (!d) return null;
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  return d.length >= 10 ? d.slice(0, 10) : d;
}
