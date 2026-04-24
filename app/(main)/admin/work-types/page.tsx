import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/auth/admin";
import { workTypeService } from "@/lib/api/work-types";
import { WorkTypesManager } from "@/components/admin/work-types-manager";

export default async function AdminWorkTypesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) return null;

  const workTypes = await workTypeService.list(supabase);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Work types</h1>
        <p className="text-sm text-(--color-text-secondary)">Add new work types for clients and cashflow</p>
      </div>
      <WorkTypesManager initial={workTypes} />
    </div>
  );
}

