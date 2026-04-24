"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { supabaseErrorMessage } from "@/lib/supabase/error-message";
import type { WorkStatus } from "@/lib/types/database";
import { workItemService } from "@/lib/api/work-items";

const STATUS: WorkStatus[] = ["ongoing", "completed", "on_hold", "pending"];

const createSchema = z.object({
  work: z.string().min(1, "Work is required"),
  client_id: z.string().uuid("Client is required"),
  work_type: z.string().min(1, "Work type is required"),
  status: z.enum(STATUS).optional(),
  committed_date: z.string().optional(),
  completed_date: z.string().optional(),
  remarks: z.string().optional(),
});

function normalizeDate(s?: string) {
  const v = (s ?? "").trim();
  return v ? v : null;
}

function validateBusiness(status: WorkStatus, committed: string | null, completed: string | null) {
  if (status === "completed" && !completed) return "Completed date is required when status is Completed";
  if (committed && completed && completed < committed) return "Completed date must be on/after committed date";
  return null;
}

function isMissingWorkItemsTable(err: unknown) {
  return !!(err as { code?: string } | null)?.code && (err as { code?: string } | null)?.code === "PGRST205";
}

export async function createWorkItemAction(input: {
  work: string;
  client_id: string;
  work_type: string;
  status?: WorkStatus;
  committed_date?: string;
  completed_date?: string;
  remarks?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid payload" };

  const status = (parsed.data.status ?? "pending") as WorkStatus;
  const committed = normalizeDate(parsed.data.committed_date);
  const completed = normalizeDate(parsed.data.completed_date);
  const bizErr = validateBusiness(status, committed, completed);
  if (bizErr) return { error: bizErr };

  try {
    const row = await workItemService.create(supabase, {
      work: parsed.data.work.trim(),
      client_id: parsed.data.client_id,
      work_type: parsed.data.work_type.trim(),
      status,
      committed_date: committed,
      completed_date: completed,
      remarks: (parsed.data.remarks ?? "").trim(),
      deleted_at: null,
    });
    revalidatePath("/work");
    revalidatePath("/dashboard");
    return { ok: true as const, id: row.id };
  } catch (e) {
    if (isMissingWorkItemsTable(e)) return { error: "Database not ready: run supabase/migrations/004_work_items.sql" };
    return { error: supabaseErrorMessage(e) };
  }
}

export async function updateWorkItemAction(
  id: string,
  patch: Partial<{
    work: string;
    client_id: string;
    work_type: string;
    status: WorkStatus;
    committed_date: string;
    completed_date: string;
    remarks: string;
  }>,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const status = (patch.status ?? "pending") as WorkStatus;
  const committed = patch.committed_date !== undefined ? normalizeDate(patch.committed_date) : null;
  const completed = patch.completed_date !== undefined ? normalizeDate(patch.completed_date) : null;
  const bizErr = validateBusiness(
    status,
    patch.committed_date !== undefined ? committed : null,
    patch.completed_date !== undefined ? completed : null,
  );
  if (bizErr) return { error: bizErr };

  try {
    await workItemService.update(supabase, id, {
      ...(patch.work !== undefined ? { work: patch.work.trim() } : null),
      ...(patch.client_id !== undefined ? { client_id: patch.client_id } : null),
      ...(patch.work_type !== undefined ? { work_type: patch.work_type.trim() } : null),
      ...(patch.status !== undefined ? { status: patch.status } : null),
      ...(patch.committed_date !== undefined ? { committed_date: committed } : null),
      ...(patch.completed_date !== undefined ? { completed_date: completed } : null),
      ...(patch.remarks !== undefined ? { remarks: patch.remarks.trim() } : null),
    });
    revalidatePath("/work");
    revalidatePath("/dashboard");
    return { ok: true as const };
  } catch (e) {
    if (isMissingWorkItemsTable(e)) return { error: "Database not ready: run supabase/migrations/004_work_items.sql" };
    return { error: supabaseErrorMessage(e) };
  }
}

export async function deleteWorkItemAction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    await workItemService.softDelete(supabase, id);
    revalidatePath("/work");
    revalidatePath("/dashboard");
    return { ok: true as const };
  } catch (e) {
    if (isMissingWorkItemsTable(e)) return { error: "Database not ready: run supabase/migrations/004_work_items.sql" };
    return { error: supabaseErrorMessage(e) };
  }
}

