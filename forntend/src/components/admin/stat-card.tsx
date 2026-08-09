import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
}

export function StatCard({ label, value, hint, icon: Icon }: StatCardProps) {
  return (
    <div className="card-surface flex items-start justify-between gap-3 p-5">
      <div>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
        <p className="mt-2 font-display text-3xl font-semibold tracking-tight">{value}</p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/8 text-primary">
        <Icon className="size-5" />
      </span>
    </div>
  );
}
