import type { SupabaseClient } from "@supabase/supabase-js";
import type { ClientRow, WorkType } from "@/lib/types/database";

export const clientService = {
  async list(
    supabase: SupabaseClient,
    filters?: { work_type?: WorkType; country?: string },
  ): Promise<ClientRow[]> {
    let q = supabase.from("clients").select("*").order("created_at", { ascending: false });
    if (filters?.work_type) {
      q = q.eq("work_type", filters.work_type);
    }
    if (filters?.country) {
      q = q.ilike("country", `%${filters.country}%`);
    }
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as ClientRow[];
  },

  async getById(supabase: SupabaseClient, id: string): Promise<ClientRow | null> {
    const { data, error } = await supabase.from("clients").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as ClientRow) ?? null;
  },

  async create(
    supabase: SupabaseClient,
    row: Omit<ClientRow, "id" | "created_at">,
  ): Promise<ClientRow> {
    const { data, error } = await supabase.from("clients").insert(row).select().single();
    if (error) throw error;
    return data as ClientRow;
  },

  async update(
    supabase: SupabaseClient,
    id: string,
    patch: Partial<Omit<ClientRow, "id" | "created_at">>,
  ): Promise<ClientRow> {
    const { data, error } = await supabase.from("clients").update(patch).eq("id", id).select().single();
    if (error) throw error;
    return data as ClientRow;
  },

  async remove(supabase: SupabaseClient, id: string): Promise<void> {
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) throw error;
  },
};
