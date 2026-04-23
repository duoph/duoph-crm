export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen">
      <div
        className="hidden w-1/2 flex-col justify-between p-12 lg:flex"
        style={{
          background: "linear-gradient(135deg, #1D4ED8, #2563EB)",
        }}
      >
        <div className="text-2xl font-bold text-white">DCRM</div>
        <div className="max-w-md space-y-4 text-white/90">
          <p className="text-3xl font-semibold leading-tight">Run your studio finances in one place.</p>
          <p className="text-sm text-white/80">Clients, cashflow, and reports aligned with your workflow.</p>
        </div>
        <p className="text-xs text-white/60">© DCRM</p>
      </div>
      <div className="flex flex-1 items-center justify-center bg-[var(--color-bg-base)] p-6">
        <div className="w-full max-w-[420px]">{children}</div>
      </div>
    </div>
  );
}
