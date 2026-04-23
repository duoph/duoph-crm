import type { SupabaseClient } from "@supabase/supabase-js";
import type { CashflowRow, CashflowWithClient, WorkType } from "@/lib/types/database";

export type CashflowFilters = {
  from?: string;
  to?: string;
  client_id?: string;
  work_type?: WorkType;
};

export const cashflowService = {
  async list(supabase: SupabaseClient, filters?: CashflowFilters): Promise<CashflowWithClient[]> {
    let q = supabase
      .from("cashflow")
      .select("*, clients(id, client_name, email)")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (filters?.from) {
      q = q.gte("date", filters.from);
    }
    if (filters?.to) {
      q = q.lte("date", filters.to);
    }
    if (filters?.client_id) {
      q = q.eq("client_id", filters.client_id);
    }
    if (filters?.work_type) {
      q = q.eq("work_type", filters.work_type);
    }

    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as CashflowWithClient[];
  },

  async create(
    supabase: SupabaseClient,
    row: Omit<CashflowRow, "id" | "created_at">,
  ): Promise<CashflowRow> {
    const { data, error } = await supabase.from("cashflow").insert(row).select().single();
    if (error) throw error;
    return data as CashflowRow;
  },

  async update(
    supabase: SupabaseClient,
    id: string,
    patch: Partial<Omit<CashflowRow, "id" | "created_at">>,
  ): Promise<CashflowRow> {
    const { data, error } = await supabase.from("cashflow").update(patch).eq("id", id).select().single();
    if (error) throw error;
    return data as CashflowRow;
  },

  async remove(supabase: SupabaseClient, id: string): Promise<void> {
    const { error } = await supabase.from("cashflow").delete().eq("id", id);
    if (error) throw error;
  },

  totals(rows: Pick<CashflowRow, "income" | "expense">[]) {
    const income = rows.reduce((s, r) => s + Number(r.income), 0);
    const expense = rows.reduce((s, r) => s + Number(r.expense), 0);
    return { income, expense, balance: income - expense };
  },
};
