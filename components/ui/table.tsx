import { cn } from "@/lib/utils/cn";

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border-subtle)]", className)}>
      <table className="w-full min-w-[640px] border-collapse text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        "h-14 border-b border-[var(--color-border-subtle)] px-4 text-left text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={cn("h-14 border-b border-[var(--color-border-subtle)] px-4 text-[var(--color-text-primary)]", className)}>
      {children}
    </td>
  );
}
