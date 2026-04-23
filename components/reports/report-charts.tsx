"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PeriodPoint } from "@/lib/api/reports";
import { Card, CardTitle } from "@/components/ui/card";

export function ReportCharts({
  monthly,
  weekly,
  byClient,
}: {
  monthly: PeriodPoint[];
  weekly: PeriodPoint[];
  byClient: { name: string; revenue: number }[];
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardTitle className="mb-4">Monthly income vs expense</CardTitle>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="label" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "#1f2937",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 8,
                }}
              />
              <Legend />
              <Bar dataKey="income" fill="#22c55e" name="Income" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="#ef4444" name="Expense" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <CardTitle className="mb-4">Weekly trend</CardTitle>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="label" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "#1f2937",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 8,
                }}
              />
              <Legend />
              <Bar dataKey="income" fill="#2563eb" name="Income" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="#f59e0b" name="Expense" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <CardTitle className="mb-4">Client revenue</CardTitle>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={byClient.map((c) => ({ name: c.name.slice(0, 18), revenue: c.revenue }))}
              layout="vertical"
              margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis type="number" stroke="#9ca3af" fontSize={12} />
              <YAxis type="category" dataKey="name" width={120} stroke="#9ca3af" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "#1f2937",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 8,
                }}
              />
              <Bar dataKey="revenue" fill="#8b5cf6" name="Revenue" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
