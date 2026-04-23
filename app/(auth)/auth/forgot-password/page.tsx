"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "");
    setPending(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Request failed");
        return;
      }
      setSent(true);
      toast.success("If an account exists, we sent reset instructions.");
    } catch {
      toast.error("Network error");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="border-[var(--color-border-default)]">
      <CardTitle className="mb-1">Forgot password</CardTitle>
      <p className="mb-6 text-sm text-[var(--color-text-secondary)]">
        We’ll email you a link to choose a new password
      </p>
      {sent ? (
        <p className="text-sm text-[var(--color-text-secondary)]">
          Check your inbox. <Link href="/auth/login" className="text-[var(--color-primary)] hover:underline">Back to login</Link>
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm text-[var(--color-text-secondary)]">
              Email
            </label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Sending…" : "Send reset link"}
          </Button>
          <p className="text-center text-sm text-[var(--color-text-muted)]">
            <Link href="/auth/login" className="text-[var(--color-primary)] hover:underline">
              Back to login
            </Link>
          </p>
        </form>
      )}
    </Card>
  );
}
