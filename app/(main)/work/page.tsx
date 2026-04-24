import { createClient } from "@/lib/supabase/server";
import { workItemService } from "@/lib/api/work-items";
import { clientService } from "@/lib/api/clients";
import { workTypeService } from "@/lib/api/work-types";
import { WorkView } from "@/components/work/work-view";

export const dynamic = "force-dynamic";

export default async function WorkPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    client_id?: string;
    work_type?: string;
    sort?: any;
    dir?: any;
    page?: string;
  }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();

  const page = Math.max(1, Number(sp.page ?? "1") || 1);

  const [{ rows, total }, clients, workTypes] = await Promise.all([
    workItemService.list(supabase, {
      q: sp.q,
      status: sp.status,
      client_id: sp.client_id,
      work_type: sp.work_type,
      sort: sp.sort,
      dir: sp.dir,
      page,
      pageSize: 20,
    }),
    clientService.list(supabase),
    workTypeService.list(supabase),
  ]);

  const clientOptions = clients.map((c) => ({ id: c.id, client_name: c.client_name }));

  return <WorkView initialRows={rows} total={total} clients={clientOptions} workTypes={workTypes} />;
}

