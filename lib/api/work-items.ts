import "server-only";

import { ObjectId } from "mongodb";
import { COL, getDb } from "@/lib/db/mongodb";
import { toDateOnly, toId, toIso } from "@/lib/db/serialize";
import { clientService } from "@/lib/api/clients";
import type { WorkItemWithClient, WorkItemRow } from "@/lib/types/database";

export type WorkListParams = {
  q?: string;
  status?: string;
  client_id?: string;
  work_type?: string;
  sort?: "committed_date" | "completed_date" | "status" | "created_at";
  dir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

type WorkItemDoc = {
  _id: ObjectId;
  work: string;
  client_id: string;
  work_type: string;
  status: string;
  committed_date: string | null;
  completed_date: string | null;
  remarks: string;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

function toRow(doc: WorkItemDoc): WorkItemRow {
  return {
    id: toId(doc._id),
    work: doc.work,
    client_id: doc.client_id,
    work_type: doc.work_type,
    status: doc.status as WorkItemRow["status"],
    committed_date: toDateOnly(doc.committed_date),
    completed_date: toDateOnly(doc.completed_date),
    remarks: doc.remarks,
    deleted_at: toIso(doc.deleted_at),
    created_at: toIso(doc.created_at)!,
    updated_at: toIso(doc.updated_at)!,
  };
}

export const workItemService = {
  async list(params: WorkListParams = {}): Promise<{ rows: WorkItemWithClient[]; total: number }> {
    const page = Math.max(1, Math.floor(params.page ?? 1));
    const pageSize = Math.min(100, Math.max(10, Math.floor(params.pageSize ?? 20)));
    const skip = (page - 1) * pageSize;

    const filter: Record<string, unknown> = { deleted_at: null };
    if (params.status?.trim()) filter.status = params.status.trim();
    if (params.client_id?.trim()) filter.client_id = params.client_id.trim();
    if (params.work_type?.trim()) filter.work_type = params.work_type.trim();
    if (params.q?.trim()) {
      const s = params.q.trim();
      filter.$or = [
        { work: { $regex: s, $options: "i" } },
        { remarks: { $regex: s, $options: "i" } },
      ];
    }

    const sortField = params.sort ?? "created_at";
    const sortDir = params.dir === "asc" ? 1 : -1;

    const db = await getDb();
    const col = db.collection<WorkItemDoc>(COL.work_items);
    const [docs, total] = await Promise.all([
      col.find(filter).sort({ [sortField]: sortDir }).skip(skip).limit(pageSize).toArray(),
      col.countDocuments(filter),
    ]);

    const clientIds = [...new Set(docs.map((d) => d.client_id))];
    const clients = await clientService.getManyByIds(clientIds);

    const rows = docs.map((doc) => {
      const row = toRow(doc);
      const c = clients.get(doc.client_id);
      return { ...row, clients: c ? { id: c.id, client_name: c.client_name } : null };
    });

    return { rows, total };
  },

  async create(row: Omit<WorkItemRow, "id" | "created_at" | "updated_at">) {
    const db = await getDb();
    const now = new Date();
    const result = await db.collection(COL.work_items).insertOne({
      ...row,
      created_at: now,
      updated_at: now,
      deleted_at: row.deleted_at ? new Date(row.deleted_at) : null,
    });
    return toRow({ _id: result.insertedId, ...row, created_at: now, updated_at: now, deleted_at: null } as WorkItemDoc);
  },

  async update(id: string, patch: Partial<Omit<WorkItemRow, "id" | "created_at" | "updated_at">>) {
    const db = await getDb();
    const set: Record<string, unknown> = { ...patch, updated_at: new Date() };
    if (patch.deleted_at !== undefined) {
      set.deleted_at = patch.deleted_at ? new Date(patch.deleted_at) : null;
    }
    const result = await db
      .collection<WorkItemDoc>(COL.work_items)
      .findOneAndUpdate({ _id: new ObjectId(id) }, { $set: set }, { returnDocument: "after" });
    if (!result) throw new Error("Work item not found");
    return toRow(result);
  },

  async softDelete(id: string) {
    const db = await getDb();
    await db
      .collection(COL.work_items)
      .updateOne({ _id: new ObjectId(id) }, { $set: { deleted_at: new Date(), updated_at: new Date() } });
  },
};
