import { getSession } from "@/lib/auth/session";
import { clientService } from "@/lib/api/clients";
import { profileService } from "@/lib/api/profile";
import { workTypeService } from "@/lib/api/work-types";
import { ClientsView } from "@/components/clients/clients-view";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const user = await getSession();
  if (!user) return null;

  const [clients, profile, workTypes] = await Promise.all([
    clientService.list(),
    profileService.get(user.id),
    workTypeService.list(),
  ]);

  return <ClientsView initialClients={clients} profileName={profile?.admin_name ?? ""} workTypes={workTypes} />;
}
