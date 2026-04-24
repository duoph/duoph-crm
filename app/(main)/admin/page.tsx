import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/auth/admin";
import { workTypeService } from "@/lib/api/work-types";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export default async function AdminHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) return null;
  const workTypes = await workTypeService.list(supabase);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Admin dashboard</h1>
        <p className="text-sm text-(--color-text-secondary)">Admin-only tools</p>
      </div>
      <AdminDashboard workTypes={workTypes} />
    </div>
  );
}

