import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { dashboardService } from "@/lib/api/dashboard";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, Th, Td } from "@/components/ui/table";
import { formatDate, formatMoney } from "@/lib/utils/format";
import { WORK_TYPE_LABEL } from "@/lib/utils/work-type";

export default async function DashboardPage() {
  const supabase = await createClient();
  const metrics = await dashboardService.metrics(supabase);

  const statCards = [
    { label: "Total clients", value: String(metrics.totalClients) },
    { label: "Total income", value: formatMoney(metrics.totalIncome) },
    { label: "Total expense", value: formatMoney(metrics.totalExpense) },
    { label: "Current balance", value: formatMoney(metrics.balance) },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">Overview of your studio</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/clients">
            <Button type="button">Add client</Button>
          </Link>
          <Link href="/cashflow">
            <Button type="button" variant="secondary">
              Add transaction
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">{s.label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{s.value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardTitle className="mb-4">Recent transactions</CardTitle>
        {metrics.recentTransactions.length === 0 ? (
          <p className="text-sm text-[var(--color-text-secondary)]">No transactions yet.</p>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Date</Th>
                <Th>Details</Th>
                <Th>Type</Th>
                <Th className="text-right">Income</Th>
                <Th className="text-right">Expense</Th>
              </tr>
            </thead>
            <tbody>
              {metrics.recentTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-white/[0.03]">
                  <Td>{formatDate(t.date)}</Td>
                  <Td>{t.details ?? "—"}</Td>
                  <Td>{WORK_TYPE_LABEL[t.work_type]}</Td>
                  <Td className="text-right tabular-nums text-emerald-400">
                    {Number(t.income) > 0 ? formatMoney(Number(t.income)) : "—"}
                  </Td>
                  <Td className="text-right tabular-nums text-red-400">
                    {Number(t.expense) > 0 ? formatMoney(Number(t.expense)) : "—"}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
