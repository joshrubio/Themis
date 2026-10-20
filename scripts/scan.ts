// Usage: npx tsx scripts/scan.ts
// Reads examples/**, sends each file to Groq with a CMMC/NIST 800-171 audit
// prompt, and writes the structured findings to lib/findings.json. Real
// control references are supplied in the prompt so the model anchors to
// actual NIST SP 800-171 Rev 2 control numbers instead of inventing them.
import dotenv from "dotenv";
import path from "node:path";
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

import fs from "node:fs";
import { scanContent } from "../lib/scan";

const FILES: { path: string; language: string }[] = [
  { path: "examples/terraform/s3.tf", language: "terraform" },
  { path: "examples/terraform/security-group.tf", language: "terraform" },
  { path: "examples/terraform/iam.tf", language: "terraform" },
  { path: "examples/docker/Dockerfile", language: "dockerfile" },
  { path: "examples/kubernetes/deployment.yaml", language: "kubernetes" },
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const root = path.join(__dirname, "..");
  const allFindings: Record<string, unknown>[] = [];
  let idCounter = 1;

  for (const file of FILES) {
    const fullPath = path.join(root, file.path);
    const content = fs.readFileSync(fullPath, "utf-8");
    const lines = content.split("\n");

    console.log(`Scanning ${file.path}...`);
    const findings = await scanContent(content, file.language);

    for (const f of findings as Record<string, unknown>[]) {
      const lineStart = Math.max(1, Number(f.lineStart) || 1);
      const lineEnd = Math.min(lines.length, Math.max(lineStart, Number(f.lineEnd) || lineStart));
      const snippet = lines.slice(lineStart - 1, lineEnd).join("\n");

      allFindings.push({
        id: `finding-${idCounter++}`,
        file: file.path,
        language: file.language,
        checkId: f.checkId,
        title: f.title,
        severity: f.severity,
        control: f.control,
        controlFamily: f.controlFamily,
        lineStart,
        lineEnd,
        snippet,
        explanation: f.explanation,
        remediation: f.remediation,
      });
    }
    console.log(`  ✓ ${findings.length} findings`);
    await sleep(2_000); // light pacing between files
  }

  const outPath = path.join(root, "lib", "findings.json");
  fs.writeFileSync(outPath, JSON.stringify(allFindings, null, 2));
  console.log(`\nWrote ${allFindings.length} findings to ${outPath}`);
}

main().then(() => process.exit(0));
