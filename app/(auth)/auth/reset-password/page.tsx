"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { validatePassword } from "@/lib/validation/password";

function ResetInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") ?? "");
    const confirm = String(fd.get("confirm") ?? "");
    if (!token) {
      toast.error("Invalid link");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    const pw = validatePassword(password);
    if (!pw.ok) {
      toast.error(pw.message);
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Reset failed");
        return;
      }
      toast.success("Password updated. Sign in.");
      router.push("/auth/login");
    } catch {
      toast.error("Network error");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="border-[var(--color-border-default)]">
      <CardTitle className="mb-1">New password</CardTitle>
      <p className="mb-6 text-sm text-[var(--color-text-secondary)]">Choose a strong password</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="mb-1 block text-sm text-[var(--color-text-secondary)]">
            Password
          </label>
          <PasswordInput id="password" name="password" autoComplete="new-password" required />
        </div>
        <div>
          <label htmlFor="confirm" className="mb-1 block text-sm text-[var(--color-text-secondary)]">
            Confirm
          </label>
          <PasswordInput id="confirm" name="confirm" autoComplete="new-password" required />
        </div>
        <Button type="submit" className="w-full" disabled={pending || !token}>
          {pending ? "Saving…" : "Update password"}
        </Button>
        <p className="text-center text-sm text-[var(--color-text-muted)]">
          <Link href="/auth/login" className="text-[var(--color-primary)] hover:underline">
            Back to login
          </Link>
        </p>
      </form>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-sm text-[var(--color-text-muted)]">Loading…</div>}>
      <ResetInner />
    </Suspense>
  );
}
