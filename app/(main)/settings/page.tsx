import { createClient } from "@/lib/supabase/server";
import { profileService } from "@/lib/api/profile";
import { SettingsForm } from "@/components/settings/settings-form";
import { AdminCreateUser } from "@/components/settings/admin-create-user";
import { isAdminEmail } from "@/lib/auth/admin";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await profileService.get(supabase, user.id);
  const isAdmin = isAdminEmail(user.email);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Settings</h1>
        <p className="text-sm text-(--color-text-secondary)">Profile preferences</p>
      </div>
      <SettingsForm email={user.email ?? ""} initialName={profile?.admin_name ?? ""} />
      {isAdmin ? <AdminCreateUser /> : null}
    </div>
  );
}
