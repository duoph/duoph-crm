"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { clientService } from "@/lib/api/clients";
import { supabaseErrorMessage } from "@/lib/supabase/error-message";
import type { WorkType } from "@/lib/types/database";

export async function createClientAction(input: {
  client_name: string;
  email: string;
  contact_number: string;
  country: string;
  work_type: WorkType;
  admin_name: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  try {
    const row = await clientService.create(supabase, {
      client_name: input.client_name,
      email: input.email,
      contact_number: input.contact_number,
      country: input.country,
      work_type: input.work_type,
      admin_name: input.admin_name,
    });
    revalidatePath("/clients", "page");
    revalidatePath("/dashboard");
    revalidatePath("/cashflow");
    return { ok: true as const, id: row.id };
  } catch (e) {
    console.error("[createClientAction]", e);
    return { error: supabaseErrorMessage(e) };
  }
}

export async function updateClientAction(
  id: string,
  input: Partial<{
    client_name: string;
    email: string;
    contact_number: string;
    country: string;
    work_type: WorkType;
    admin_name: string;
  }>,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  try {
    await clientService.update(supabase, id, input);
    revalidatePath("/clients");
    revalidatePath("/dashboard");
    return { ok: true as const };
  } catch (e) {
    console.error("[updateClientAction]", e);
    return { error: supabaseErrorMessage(e) };
  }
}

export async function deleteClientAction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  try {
    await clientService.remove(supabase, id);
    revalidatePath("/clients");
    revalidatePath("/dashboard");
    revalidatePath("/cashflow");
    return { ok: true as const };
  } catch (e) {
    console.error("[deleteClientAction]", e);
    return { error: supabaseErrorMessage(e) };
  }
}
