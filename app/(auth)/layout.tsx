import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen">
      <div className="relative hidden min-h-screen w-1/2 overflow-hidden lg:flex">
        <Image
          src="/layout-bg.jpg"
          alt=""
          fill
          className="object-cover"
          sizes="50vw"
          priority
        />
        <div
          className="absolute inset-0 bg-linear-to-br from-[#1D4ED8]/90 via-[#2563EB]/90 to-[#1e40af]/90"
          aria-hidden
        />
        <div className="relative z-10 flex min-h-screen flex-col justify-between p-12">
          <div className="flex flex-col items-start justify-center gap-2 text-2xl font-bold text-white">
            <Image src="/logo-white.png" alt="DCRM" width={200} height={200} />
          </div>
          <div className="max-w-md text-white/90">
            <p className="text-3xl font-semibold leading-tight">
              Manage Clients, Track Cashflow, and Scale Your Business — All in One
              Place
            </p>
          </div>
          <p className="text-xs text-white/60">© DCRM by duoph</p>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center bg-[var(--color-bg-base)] p-6">
        <div className="w-full max-w-[420px]">{children}</div>
      </div>
    </div>
  );
}
