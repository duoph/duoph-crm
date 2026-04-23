import { createClient } from "@/lib/supabase/server";
import { reportsService } from "@/lib/api/reports";
import { ReportCharts } from "@/components/reports/report-charts";

export default async function ReportsPage() {
  const supabase = await createClient();
  const rows = await reportsService.raw(supabase);
  const monthly = reportsService.monthlySeries(rows, 6);
  const weekly = reportsService.weeklySeries(rows, 8);
  const byClient = reportsService.revenueByClient(rows);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Reports</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">Income vs expense and client mix</p>
      </div>
      <ReportCharts monthly={monthly} weekly={weekly} byClient={byClient} />
    </div>
  );
}
