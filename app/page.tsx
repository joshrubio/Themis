"use client";

import { useState } from "react";
import Link from "next/link";
import { findings, filesScanned, severityCounts, SEVERITY_ORDER, SEVERITY_LABEL, type Severity } from "@/lib/findings";
import SeverityBadge from "@/components/SeverityBadge";
import { cn } from "@/lib/utils";

export default function ScanLogPage() {
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");
  const [fileFilter, setFileFilter] = useState<string>("all");

  const counts = severityCounts();
  const files = filesScanned();

  const visible = findings.filter((f) => {
    if (severityFilter !== "all" && f.severity !== severityFilter) return false;
    if (fileFilter !== "all" && f.file !== fileFilter) return false;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col max-w-5xl w-full mx-auto px-5 py-8 gap-6">
      <div>
        <p className="text-xs text-muted-foreground">$ themis scan --path ./examples --framework nist-800-171</p>
        <h1 className="text-lg mt-1">Scan log</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {findings.length} findings across {files.length} files, scored against NIST SP 800-171 Rev 2.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterChip active={severityFilter === "all"} onClick={() => setSeverityFilter("all")}>
          All ({findings.length})
        </FilterChip>
        {SEVERITY_ORDER.map((sev) => (
          <FilterChip key={sev} active={severityFilter === sev} onClick={() => setSeverityFilter(sev)} severity={sev}>
            {SEVERITY_LABEL[sev]} ({counts[sev]})
          </FilterChip>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterChip active={fileFilter === "all"} onClick={() => setFileFilter("all")}>
          All files
        </FilterChip>
        {files.map((file) => (
          <FilterChip key={file} active={fileFilter === file} onClick={() => setFileFilter(file)}>
            {file}
          </FilterChip>
        ))}
      </div>

      <div className="border divide-y">
        {visible.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">No findings match these filters.</div>
        ) : (
          visible.map((f) => (
            <Link
              key={f.id}
              href={`/findings/${f.id}`}
              className="block p-4 hover:bg-accent/60 transition-colors group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">
                    Check: <span className="text-foreground">{f.checkId}</span>: &quot;{f.title}&quot;
                  </p>
                  <p className="text-sm mt-1">
                    <span className="text-destructive">FAILED</span> for resource:{" "}
                    <span className="text-foreground group-hover:underline">
                      {f.file}:{f.lineStart}-{f.lineEnd}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Control {f.control} · {f.controlFamily}
                  </p>
                </div>
                <SeverityBadge severity={f.severity} />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  severity,
  children,
}: {
  active: boolean;
  onClick: () => void;
  severity?: Severity;
  children: React.ReactNode;
}) {
  const SEVERITY_TEXT: Record<Severity, string> = {
    critical: "text-critical",
    high: "text-high",
    medium: "text-medium",
    low: "text-low",
  };
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-xs px-2.5 py-1 border transition-colors",
        active ? "bg-accent border-border text-foreground" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/60",
        severity && !active && SEVERITY_TEXT[severity]
      )}
    >
      {children}
    </button>
  );
}
