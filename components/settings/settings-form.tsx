"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateProfileAction } from "@/app/actions/profile";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SettingsForm({ email, initialName }: { email: string; initialName: string }) {
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const admin_name = String(fd.get("admin_name") ?? "");
    startTransition(async () => {
      const res = await updateProfileAction(admin_name);
      if ("error" in res && res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Profile saved");
    });
  }

  return (
    <Card>
      <CardTitle className="mb-4">Profile</CardTitle>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-[var(--color-text-secondary)]">Email</label>
          <Input value={email} readOnly className="opacity-70" />
        </div>
        <div>
          <label htmlFor="admin_name" className="mb-1 block text-sm text-[var(--color-text-secondary)]">
            Display name
          </label>
          <Input id="admin_name" name="admin_name" defaultValue={initialName} required />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </Card>
  );
}
