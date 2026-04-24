"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { validatePassword } from "@/lib/validation/password";

function VerifyOtpInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [pending, setPending] = useState(false);
  const [otp, setOtp] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const otpVal = String(fd.get("otp") ?? otp ?? "");
    const password = String(fd.get("password") ?? "");
    if (!email) {
      toast.error("Missing email. Start signup again.");
      return;
    }
    const pw = validatePassword(password);
    if (!pw.ok) {
      toast.error(pw.message);
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpVal, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Verification failed");
        return;
      }
      toast.success("Account verified.");
      if (data.needsLogin) {
        router.push("/auth/login");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      toast.error("Network error");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="border-[var(--color-border-default)]">
      <CardTitle className="mb-1">Verify email</CardTitle>
      <p className="mb-6 text-sm text-[var(--color-text-secondary)]">
        Enter the code sent to {email || "your inbox"}
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="otp" className="mb-1 block text-sm text-[var(--color-text-secondary)]">
            One-time code
          </label>
          <Input
            id="otp"
            name="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            inputMode="numeric"
            autoComplete="one-time-code"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm text-[var(--color-text-secondary)]">
            Password (same as signup)
          </label>
          <PasswordInput id="password" name="password" autoComplete="new-password" required />
        </div>
        <Button type="submit" className="w-full" disabled={pending || !email}>
          {pending ? "Verifying…" : "Activate account"}
        </Button>
        <p className="text-center text-sm text-[var(--color-text-muted)]">
          <Link href="/auth/signup" className="text-[var(--color-primary)] hover:underline">
            Wrong email? Go back
          </Link>
        </p>
      </form>
    </Card>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="text-sm text-[var(--color-text-muted)]">Loading…</div>}>
      <VerifyOtpInner />
    </Suspense>
  );
}
