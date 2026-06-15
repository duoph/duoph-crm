import "server-only";

import { COL, getDb } from "@/lib/db/mongodb";
import { toIso } from "@/lib/db/serialize";
import type { WorkTypeRow } from "@/lib/types/database";

const FALLBACK: WorkTypeRow[] = [
  { key: "website", label: "Website", created_at: "" },
  { key: "social_media", label: "Social Media", created_at: "" },
  { key: "branding", label: "Branding", created_at: "" },
  { key: "other", label: "Other", created_at: "" },
];

type WorkTypeDoc = {
  key: string;
  label: string;
  created_at: Date;
};

export const workTypeService = {
  async list(): Promise<WorkTypeRow[]> {
    try {
      const db = await getDb();
      const docs = await db.collection<WorkTypeDoc>(COL.work_types).find().sort({ label: 1 }).toArray();
      return docs.map((d) => ({ key: d.key, label: d.label, created_at: toIso(d.created_at) ?? "" }));
    } catch {
      return FALLBACK;
    }
  },

  async upsert(key: string, label: string) {
    const db = await getDb();
    await db
      .collection(COL.work_types)
      .updateOne({ key }, { $set: { label }, $setOnInsert: { key, created_at: new Date() } }, { upsert: true });
  },

  async remove(key: string) {
    const db = await getDb();
    await db.collection(COL.work_types).deleteOne({ key });
  },
};
