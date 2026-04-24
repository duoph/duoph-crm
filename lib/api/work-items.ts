import type { SupabaseClient } from "@supabase/supabase-js";
import type { WorkItemRow } from "@/lib/types/database";

export type WorkItemWithClient = WorkItemRow & {
  clients: { id: string; client_name: string } | null;
};

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

export const workItemService = {
  async list(
    supabase: SupabaseClient,
    params: WorkListParams = {},
  ): Promise<{ rows: WorkItemWithClient[]; total: number }> {
    const page = Math.max(1, Math.floor(params.page ?? 1));
    const pageSize = Math.min(100, Math.max(10, Math.floor(params.pageSize ?? 20)));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let q = supabase
      .from("work_items")
      .select("*, clients(id, client_name)", { count: "exact" })
      .is("deleted_at", null);

    if (params.q?.trim()) {
      const s = params.q.trim();
      q = q.or(`work.ilike.%${s}%,remarks.ilike.%${s}%`);
    }
    if (params.status?.trim()) q = q.eq("status", params.status.trim());
    if (params.client_id?.trim()) q = q.eq("client_id", params.client_id.trim());
    if (params.work_type?.trim()) q = q.eq("work_type", params.work_type.trim());

    const sort = params.sort ?? "created_at";
    const dir = params.dir ?? "desc";
    q = q.order(sort, { ascending: dir === "asc", nullsFirst: false }).range(from, to);

    const { data, error, count } = await q;
    if (error) {
      const code = (error as { code?: string } | null)?.code;
      if (code === "PGRST205") return { rows: [], total: 0 };
      throw error;
    }
    return { rows: (data ?? []) as WorkItemWithClient[], total: count ?? 0 };
  },

  async create(supabase: SupabaseClient, row: Omit<WorkItemRow, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase.from("work_items").insert(row).select().single();
    if (error) throw error;
    return data as WorkItemRow;
  },

  async update(supabase: SupabaseClient, id: string, patch: Partial<Omit<WorkItemRow, "id" | "created_at" | "updated_at">>) {
    const { data, error } = await supabase.from("work_items").update(patch).eq("id", id).select().single();
    if (error) throw error;
    return data as WorkItemRow;
  },

  async softDelete(supabase: SupabaseClient, id: string) {
    const { error } = await supabase.from("work_items").update({ deleted_at: new Date().toISOString() }).eq("id", id);
    if (error) throw error;
  },
};

