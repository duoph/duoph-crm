import { Card, CardTitle } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  const nextPath = sp.next && sp.next.startsWith("/") ? sp.next : "/dashboard";

  return (
    <Card className="border-[var(--color-border-default)]">
      <CardTitle className="mb-1">Welcome back</CardTitle>
      <p className="mb-6 text-sm text-[var(--color-text-secondary)]">Sign in to continue</p>
      <LoginForm nextPath={nextPath} />
    </Card>
  );
}
