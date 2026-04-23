import type { SupabaseClient } from "@supabase/supabase-js";
import { cashflowService } from "@/lib/api/cashflow";

export const dashboardService = {
  async metrics(supabase: SupabaseClient) {
    const [{ count: clientCount, error: cErr }, txs] = await Promise.all([
      supabase.from("clients").select("*", { count: "exact", head: true }),
      cashflowService.list(supabase),
    ]);
    if (cErr) throw cErr;
    const { income, expense, balance } = cashflowService.totals(txs);
    return {
      totalClients: clientCount ?? 0,
      totalIncome: income,
      totalExpense: expense,
      balance,
      recentTransactions: txs.slice(0, 8),
    };
  },
};
