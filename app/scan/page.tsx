"use client";

import { useState } from "react";
import SeverityBadge from "@/components/SeverityBadge";
import { Button } from "@/components/ui/button";
import type { Severity } from "@/lib/findings";

type LiveFinding = {
  id: string;
  checkId: string;
  title: string;
  severity: Severity;
  control: string;
  controlFamily: string;
  lineStart: number;
  lineEnd: number;
  snippet: string;
  explanation: string;
  remediation: string;
};

const PLACEHOLDER = `resource "aws_security_group_rule" "ssh" {
  type        = "ingress"
  from_port   = 22
  to_port     = 22
  protocol    = "tcp"
  cidr_blocks = ["0.0.0.0/0"]
}`;

export default function ScanPage() {
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState("terraform");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [findings, setFindings] = useState<LiveFinding[] | null>(null);

  async function runScan() {
    setLoading(true);
    setError(null);
    setFindings(null);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, language }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Scan failed.");
        return;
      }
      setFindings(data.findings);
    } catch {
      setError("Scan failed — check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 max-w-3xl w-full mx-auto px-5 py-8 flex flex-col gap-6">
      <div>
        <p className="text-xs text-muted-foreground">$ themis scan --stdin</p>
        <h1 className="text-lg mt-1">Scan a file</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Paste a Terraform, Dockerfile, or Kubernetes config. This runs the same Groq pipeline that generated the
          scan log, live, against whatever you paste — nothing is stored.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <label htmlFor="language" className="text-xs text-muted-foreground">
            Language
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="text-xs border bg-background px-2 py-1"
          >
            <option value="terraform">terraform</option>
            <option value="dockerfile">dockerfile</option>
            <option value="kubernetes">kubernetes</option>
          </select>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={PLACEHOLDER}
          rows={12}
          className="border bg-card p-3 text-xs font-mono resize-y focus:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">{content.length}/8000 chars</p>
          <Button onClick={runScan} disabled={loading || !content.trim()}>
            {loading ? "Scanning…" : "Run scan"}
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {findings && (
        <div className="flex flex-col gap-4">
          <p className="text-xs text-muted-foreground">
            {findings.length} finding{findings.length === 1 ? "" : "s"}
          </p>
          {findings.length === 0 ? (
            <p className="text-sm text-muted-foreground border p-4">No compliance issues found in this snippet.</p>
          ) : (
            <div className="border divide-y">
              {findings.map((f) => (
                <div key={f.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">
                        Check: <span className="text-foreground">{f.checkId}</span>: &quot;{f.title}&quot;
                      </p>
                      <p className="text-sm mt-1">
                        <span className="text-destructive">FAILED</span> for lines {f.lineStart}-{f.lineEnd}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Control {f.control} · {f.controlFamily}
                      </p>
                    </div>
                    <SeverityBadge severity={f.severity} />
                  </div>
                  <pre className="border bg-card p-3 mt-3 text-xs overflow-x-auto whitespace-pre"><code>{f.snippet}</code></pre>
                  <p className="text-sm mt-3">{f.explanation}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    <span className="text-foreground">Remediation:</span> {f.remediation}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
