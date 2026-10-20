import { SEVERITY_LABEL, type Severity } from "@/lib/findings";
import { cn } from "@/lib/utils";

const SEVERITY_BG: Record<Severity, string> = {
  critical: "bg-critical text-black",
  high: "bg-high text-black",
  medium: "bg-medium text-black",
  low: "bg-low text-black",
};

export default function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 text-[10px] uppercase tracking-wide font-semibold",
        SEVERITY_BG[severity],
        className
      )}
    >
      {SEVERITY_LABEL[severity]}
    </span>
  );
}
