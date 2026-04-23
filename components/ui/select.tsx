import { cn } from "@/lib/utils/cn";
import type { SelectHTMLAttributes } from "react";

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-[var(--radius-control)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-3.5 py-2.5 text-sm text-white focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-500/40",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
