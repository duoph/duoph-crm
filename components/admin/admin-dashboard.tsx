"use client";

import { useMemo, useState } from "react";
import type { WorkTypeRow } from "@/lib/types/database";
import { cn } from "@/lib/utils/cn";
import { Card } from "@/components/ui/card";
import { AdminCreateUser } from "@/components/settings/admin-create-user";
import { WorkTypesManager } from "@/components/admin/work-types-manager";

type Tab = "users" | "work_types";

export function AdminDashboard({ workTypes }: { workTypes: WorkTypeRow[] }) {
  const [tab, setTab] = useState<Tab>("users");

  const items = useMemo(
    () =>
      [
        { id: "users" as const, label: "Users" },
        { id: "work_types" as const, label: "Work types" },
      ] satisfies { id: Tab; label: string }[],
    [],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <Card className="border-(--color-border-default) p-2">
        <p className="px-3 pb-2 pt-2 text-xs font-medium uppercase tracking-wide text-(--color-text-muted)">
          Admin
        </p>
        <div className="space-y-1">
          {items.map((i) => (
            <button
              key={i.id}
              type="button"
              onClick={() => setTab(i.id)}
              className={cn(
                "w-full rounded-[10px] px-3 py-2 text-left text-sm font-medium transition-colors",
                tab === i.id
                  ? "bg-(--color-primary)/20 text-white ring-1 ring-(--color-primary)/40"
                  : "text-(--color-text-secondary) hover:bg-white/5 hover:text-white",
              )}
            >
              {i.label}
            </button>
          ))}
        </div>
      </Card>

      <div className="min-w-0">
        {tab === "users" ? <AdminCreateUser /> : null}
        {tab === "work_types" ? <WorkTypesManager initial={workTypes} /> : null}
      </div>
    </div>
  );
}

