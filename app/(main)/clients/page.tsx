import { createClient } from "@/lib/supabase/server";
import { clientService } from "@/lib/api/clients";
import { profileService } from "@/lib/api/profile";
import { ClientsView } from "@/components/clients/clients-view";

export default async function ClientsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [clients, profile] = await Promise.all([
    clientService.list(supabase),
    profileService.get(supabase, user.id),
  ]);

  return <ClientsView initialClients={clients} profileName={profile?.admin_name ?? ""} />;
}
