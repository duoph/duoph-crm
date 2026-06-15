import type { CashflowRow } from "@/lib/types/database";

export function cashflowTotals(rows: Pick<CashflowRow, "income" | "expense">[]) {
  const income = rows.reduce((s, r) => s + Number(r.income), 0);
  const expense = rows.reduce((s, r) => s + Number(r.expense), 0);
  return { income, expense, balance: income - expense };
}
