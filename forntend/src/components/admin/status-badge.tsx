import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "destructive" | "info" | "muted";

const TONES: Record<Tone, string> = {
  success: "bg-success/12 text-success border-success/25",
  warning: "bg-warning/14 text-warning border-warning/30",
  destructive: "bg-destructive/12 text-destructive border-destructive/25",
  info: "bg-info/12 text-info border-info/25",
  muted: "bg-muted text-muted-foreground border-border",
};

const MAP: Record<string, Tone> = {
  Completed: "success",
  Paid: "success",
  Active: "success",
  Processing: "info",
  Pending: "warning",
  Cancelled: "destructive",
  Failed: "destructive",
  Inactive: "muted",
  Refunded: "muted",
  Admin: "info",
  Manager: "warning",
  User: "muted",
};

export function StatusBadge({ value, className }: { value: string; className?: string }) {
  const tone = MAP[value] ?? "muted";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        TONES[tone],
        className,
      )}
    >
      {value}
    </span>
  );
}
