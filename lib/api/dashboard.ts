import "server-only";

import { cashflowService } from "@/lib/api/cashflow";
import { cashflowTotals } from "@/lib/utils/cashflow";
import { COL, getDb } from "@/lib/db/mongodb";

export const dashboardService = {
  async metrics() {
    const db = await getDb();
    const [clientCount, txs] = await Promise.all([
      db.collection(COL.clients).countDocuments(),
      cashflowService.list(),
    ]);
    const { income, expense, balance } = cashflowTotals(txs);
    return {
      totalClients: clientCount,
      totalIncome: income,
      totalExpense: expense,
      balance,
      recentTransactions: txs.slice(0, 8),
    };
  },
};
