"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ClientRow, WorkType } from "@/lib/types/database";
import { createClientAction, deleteClientAction, updateClientAction } from "@/app/actions/clients";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Table, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { WORK_TYPE_LABEL, workTypeBadgeClass } from "@/lib/utils/work-type";
import { formatDate } from "@/lib/utils/format";

const workTypes: WorkType[] = ["website", "social_media", "branding", "other"];

type Props = { initialClients: ClientRow[]; profileName: string };

export function ClientsView({ initialClients, profileName }: Props) {
  const router = useRouter();
  const [view, setView] = useState<"table" | "cards">("table");
  const [filterType, setFilterType] = useState<WorkType | "">("");
  const [filterCountry, setFilterCountry] = useState("");
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<ClientRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ClientRow | null>(null);

  const filtered = useMemo(() => {
    return initialClients.filter((c) => {
      if (filterType && c.work_type !== filterType) return false;
      if (filterCountry && !c.country.toLowerCase().includes(filterCountry.toLowerCase())) return false;
      return true;
    });
  }, [initialClients, filterType, filterCountry]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Clients</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">Manage relationships and work types</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant={view === "table" ? "primary" : "secondary"} onClick={() => setView("table")}>
            Table
          </Button>
          <Button type="button" variant={view === "cards" ? "primary" : "secondary"} onClick={() => setView("cards")}>
            Cards
          </Button>
          <Button type="button" onClick={() => setModal("create")}>
            Add client
          </Button>
        </div>
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap gap-3">
          <div className="min-w-[140px] flex-1">
            <label className="mb-1 block text-xs text-[var(--color-text-muted)]">Work type</label>
            <Select value={filterType} onChange={(e) => setFilterType(e.target.value as WorkType | "")}>
              <option value="">All</option>
              {workTypes.map((w) => (
                <option key={w} value={w}>
                  {WORK_TYPE_LABEL[w]}
                </option>
              ))}
            </Select>
          </div>
          <div className="min-w-[140px] flex-1">
            <label className="mb-1 block text-xs text-[var(--color-text-muted)]">Country</label>
            <Input value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)} placeholder="Filter" />
          </div>
        </div>

        {view === "table" ? (
          <Table>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Phone</Th>
                <Th>Country</Th>
                <Th>Type</Th>
                <Th>Admin</Th>
                <Th>Created</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.03]">
                  <Td className="font-medium">{c.client_name}</Td>
                  <Td>{c.email}</Td>
                  <Td>{c.contact_number?.trim() ? c.contact_number : "—"}</Td>
                  <Td>{c.country || "—"}</Td>
                  <Td>
                    <Badge className={workTypeBadgeClass(c.work_type)}>{WORK_TYPE_LABEL[c.work_type]}</Badge>
                  </Td>
                  <Td>{c.admin_name ?? "—"}</Td>
                  <Td>{formatDate(c.created_at)}</Td>
                  <Td className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      className="px-2 py-1"
                      onClick={() => {
                        setEditing(c);
                        setModal("edit");
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      className="ml-2 px-2 py-1"
                      onClick={() => setDeleteTarget(c)}
                    >
                      Delete
                    </Button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <Card key={c.id} className="border-[var(--color-border-default)]">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{c.client_name}</CardTitle>
                  <Badge className={workTypeBadgeClass(c.work_type)}>{WORK_TYPE_LABEL[c.work_type]}</Badge>
                </div>
                <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{c.email}</p>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {c.contact_number?.trim() ? c.contact_number : "—"}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">{c.country || "—"}</p>
                <div className="mt-4 flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      setEditing(c);
                      setModal("edit");
                    }}
                  >
                    Edit
                  </Button>
                  <Button type="button" variant="danger" onClick={() => setDeleteTarget(c)}>
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      <ClientModal
        open={modal === "create"}
        title="New client"
        profileName={profileName}
        onClose={() => setModal(null)}
        onSaved={async () => {
          setModal(null);
          router.refresh();
        }}
      />
      <ClientModal
        open={modal === "edit"}
        title="Edit client"
        profileName={profileName}
        initial={editing ?? undefined}
        onClose={() => {
          setModal(null);
          setEditing(null);
        }}
        onSaved={async () => {
          setModal(null);
          setEditing(null);
          router.refresh();
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this client?"
        description={
          deleteTarget
            ? `“${deleteTarget.client_name}” will be removed. Cashflow entries stay, but may show no client link. This cannot be undone.`
            : ""
        }
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          const id = deleteTarget.id;
          const res = await deleteClientAction(id);
          if ("error" in res && res.error) {
            toast.error(res.error);
            router.refresh();
            throw new Error(res.error);
          }
          toast.success("Client removed");
          router.refresh();
        }}
      />
    </div>
  );
}

function ClientModal({
  open,
  title,
  profileName,
  initial,
  onClose,
  onSaved,
}: {
  open: boolean;
  title: string;
  profileName: string;
  initial?: ClientRow;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}) {
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      client_name: String(fd.get("client_name")),
      email: String(fd.get("email")),
      contact_number: String(fd.get("contact_number") ?? "").replace(/\D/g, ""),
      country: String(fd.get("country")),
      work_type: String(fd.get("work_type")) as WorkType,
      admin_name: String(fd.get("admin_name")),
    };
    startTransition(async () => {
      if (initial) {
        const res = await updateClientAction(initial.id, payload);
        if ("error" in res && res.error) {
          toast.error(res.error);
          return;
        }
        toast.success("Client updated");
      } else {
        const res = await createClientAction(payload);
        if ("error" in res && res.error) {
          toast.error(res.error);
          return;
        }
        toast.success("Client created");
      }
      await onSaved();
    });
  }

  return (
    <Modal open={open} title={title} onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-[var(--color-text-secondary)]">Name</label>
          <Input name="client_name" required defaultValue={initial?.client_name} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[var(--color-text-secondary)]">Email</label>
          <Input name="email" type="email" required defaultValue={initial?.email} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[var(--color-text-secondary)]">Contact number</label>
          <Input
            name="contact_number"
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="tel"
            placeholder="Digits only"
            maxLength={15}
            defaultValue={(initial?.contact_number ?? "").replace(/\D/g, "")}
            onInput={(e) => {
              const el = e.currentTarget;
              el.value = el.value.replace(/\D/g, "");
            }}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[var(--color-text-secondary)]">Country</label>
          <Input name="country" defaultValue={initial?.country} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[var(--color-text-secondary)]">Work type</label>
          <Select name="work_type" defaultValue={initial?.work_type ?? "website"}>
            {workTypes.map((w) => (
              <option key={w} value={w}>
                {WORK_TYPE_LABEL[w]}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-[var(--color-text-secondary)]">Admin name</label>
          <Input name="admin_name" defaultValue={initial?.admin_name ?? profileName} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
