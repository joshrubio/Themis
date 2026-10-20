import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getFinding, SEVERITY_LABEL } from "@/lib/findings";
import SeverityBadge from "@/components/SeverityBadge";

export default function FindingPage({ params }: PageProps<"/findings/[id]">) {
  return (
    <Suspense fallback={<div className="flex-1 p-8 text-sm text-muted-foreground">Loading finding…</div>}>
      <FindingDetail params={params} />
    </Suspense>
  );
}

async function FindingDetail({ params }: { params: PageProps<"/findings/[id]">["params"] }) {
  const { id } = await params;
  const finding = getFinding(id);
  if (!finding) notFound();

  return (
    <div className="flex-1 max-w-3xl w-full mx-auto px-5 py-8 flex flex-col gap-6">
      <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
        ← Back to scan log
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground">{finding.checkId}</p>
          <h1 className="text-lg mt-1">{finding.title}</h1>
        </div>
        <SeverityBadge severity={finding.severity} className="text-xs px-2 py-1" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 border divide-x">
        <MetaCell label="Severity" value={SEVERITY_LABEL[finding.severity]} />
        <MetaCell label="Control" value={finding.control} />
        <MetaCell label="Family" value={finding.controlFamily} />
        <MetaCell label="Language" value={finding.language} />
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-1">
          {finding.file}:{finding.lineStart}-{finding.lineEnd}
        </p>
        <pre className="border bg-card p-4 text-xs overflow-x-auto whitespace-pre"><code>{finding.snippet}</code></pre>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-1">Explanation</p>
        <p className="text-sm">{finding.explanation}</p>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-1">Remediation</p>
        <p className="text-sm">{finding.remediation}</p>
      </div>
    </div>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 border-t sm:border-t-0 first:border-t-0">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm mt-0.5">{value}</p>
    </div>
  );
}
