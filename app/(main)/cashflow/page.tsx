import { cashflowService } from "@/lib/api/cashflow";
import { clientService } from "@/lib/api/clients";
import { workTypeService } from "@/lib/api/work-types";
import { CashflowView } from "@/components/cashflow/cashflow-view";

export default async function CashflowPage() {
  const [rows, clients, workTypes] = await Promise.all([
    cashflowService.list(),
    clientService.list(),
    workTypeService.list(),
  ]);
  const clientOptions = clients.map((c) => ({ id: c.id, client_name: c.client_name }));
  return <CashflowView initialRows={rows} clients={clientOptions} workTypes={workTypes} />;
}
