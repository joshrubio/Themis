import findingsData from "./findings.json";

export type Severity = "critical" | "high" | "medium" | "low";

export type Finding = {
  id: string;
  file: string;
  language: string;
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

export const findings = findingsData as Finding[];

export const SEVERITY_ORDER: Severity[] = ["critical", "high", "medium", "low"];

export const SEVERITY_LABEL: Record<Severity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export function getFinding(id: string): Finding | undefined {
  return findings.find((f) => f.id === id);
}

export function severityCounts(): Record<Severity, number> {
  const counts: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const f of findings) counts[f.severity]++;
  return counts;
}

export function filesScanned(): string[] {
  return Array.from(new Set(findings.map((f) => f.file)));
}
