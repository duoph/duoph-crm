"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { validatePassword } from "@/lib/validation/password";

export default function SignupPage() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");
    const admin_name = String(fd.get("admin_name") ?? "");
    const pw = validatePassword(password);
    if (!pw.ok) {
      toast.error(pw.message);
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, admin_name }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Signup failed");
        return;
      }
      if (data.emailMocked) {
        toast.success("SMTP mock: verification code is in the server terminal.");
      } else {
        toast.success("Check your email for the verification code (and spam/junk).");
      }
      router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}`);
    } catch {
      toast.error("Network error");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="border-[var(--color-border-default)]">
      <CardTitle className="mb-1">Create account</CardTitle>
      <p className="mb-6 text-sm text-[var(--color-text-secondary)]">We’ll email you a one-time code</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="admin_name" className="mb-1 block text-sm text-[var(--color-text-secondary)]">
            Your name
          </label>
          <Input id="admin_name" name="admin_name" required autoComplete="name" />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-[var(--color-text-secondary)]">
            Email
          </label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm text-[var(--color-text-secondary)]">
            Password
          </label>
          <PasswordInput id="password" name="password" autoComplete="new-password" required />
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            8+ chars, uppercase, number, special character
          </p>
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Sending code…" : "Continue"}
        </Button>
        <p className="text-center text-sm text-[var(--color-text-muted)]">
          <Link href="/auth/login" className="text-[var(--color-primary)] hover:underline">
            Already have an account?
          </Link>
        </p>
      </form>
    </Card>
  );
}
