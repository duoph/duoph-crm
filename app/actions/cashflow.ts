"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { cashflowService } from "@/lib/api/cashflow";
import type { WorkType } from "@/lib/types/database";

export async function createCashflowAction(input: {
  date: string;
  income: number;
  expense: number;
  details: string;
  client_id: string | null;
  work_type: WorkType;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  try {
    await cashflowService.create(supabase, {
      date: input.date,
      income: input.income,
      expense: input.expense,
      details: input.details || null,
      client_id: input.client_id,
      work_type: input.work_type,
    });
    revalidatePath("/cashflow");
    revalidatePath("/dashboard");
    revalidatePath("/reports");
    return { ok: true as const };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return { error: msg };
  }
}

export async function updateCashflowAction(
  id: string,
  input: Partial<{
    date: string;
    income: number;
    expense: number;
    details: string;
    client_id: string | null;
    work_type: WorkType;
  }>,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  try {
    await cashflowService.update(supabase, id, input);
    revalidatePath("/cashflow");
    revalidatePath("/dashboard");
    revalidatePath("/reports");
    return { ok: true as const };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return { error: msg };
  }
}

export async function deleteCashflowAction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  try {
    await cashflowService.remove(supabase, id);
    revalidatePath("/cashflow");
    revalidatePath("/dashboard");
    revalidatePath("/reports");
    return { ok: true as const };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return { error: msg };
  }
}
