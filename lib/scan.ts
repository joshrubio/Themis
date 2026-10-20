// Shared Groq prompt + call logic, used by both scripts/scan.ts (the
// offline batch scan that produced lib/findings.json) and app/api/scan
// (the live "paste a file" feature). Keeping this in one place means the
// live feature is held to exactly the same rubric as the precomputed data.
export const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
export const GROQ_MODEL = process.env.GROQ_MODEL ?? "openai/gpt-oss-20b";

export const CONTROL_REFERENCE = `
Ground every finding in one of these real NIST SP 800-171 Rev 2 controls (pick the single best fit, cite its exact number and family):
- 3.1.1 (Access Control) — Limit system access to authorized users, processes, and devices.
- 3.1.3 (Access Control) — Control the flow of CUI in accordance with approved authorizations.
- 3.1.20 (Access Control) — Verify and control/limit connections to external systems.
- 3.3.1 (Audit and Accountability) — Create and retain system audit logs and records.
- 3.4.1 (Configuration Management) — Establish and maintain baseline configurations.
- 3.4.2 (Configuration Management) — Establish and enforce security configuration settings.
- 3.5.10 (Identification and Authentication) — Store and transmit only cryptographically-protected passwords/credentials.
- 3.13.8 (System and Communications Protection) — Implement cryptographic mechanisms to prevent unauthorized disclosure of CUI during transmission.
- 3.13.11 (System and Communications Protection) — Employ FIPS-validated cryptography for protecting CUI confidentiality (at rest).
- 3.13.16 (System and Communications Protection) — Protect the confidentiality of CUI at rest.
`.trim();

export const SYSTEM_PROMPT = `You are a CMMC Level 2 / NIST SP 800-171 compliance auditor reviewing infrastructure-as-code for an assessment. Find concrete, specific misconfigurations in the file you're given — do not invent issues that aren't in the code. If the file has no real compliance issues, return an empty findings array. ${CONTROL_REFERENCE}

Respond with strict JSON only, shaped exactly like:
{"findings": [{"checkId": "THEMIS-AC-01", "title": "short title", "severity": "critical|high|medium|low", "control": "3.1.20", "controlFamily": "Access Control", "lineStart": 1, "lineEnd": 5, "explanation": "2-3 sentences on why this is a real compliance gap, written for someone preparing for an assessment", "remediation": "1-2 sentences, concrete and actionable"}]}

checkId format: "THEMIS-<2-4 letter family code>-<2-digit number>", unique per finding in this file. Severity: critical = direct CUI exposure or full compromise path; high = significant gap an assessor would flag immediately; medium = real gap, lower blast radius; low = hygiene/best-practice. Return at most 6 findings, ranked most severe first.`;

export type RawFinding = {
  checkId: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  control: string;
  controlFamily: string;
  lineStart: number;
  lineEnd: number;
  explanation: string;
  remediation: string;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function scanContent(content: string, language: string, attempt = 1): Promise<RawFinding[]> {
  const completion = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Language: ${language}\n\n\`\`\`\n${content}\n\`\`\`` },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
  });

  if (!completion.ok) {
    const text = await completion.text();
    if (completion.status === 429 && attempt <= 5) {
      await sleep(10_000);
      return scanContent(content, language, attempt + 1);
    }
    if (completion.status === 400 && attempt <= 3) {
      await sleep(3_000);
      return scanContent(content, language, attempt + 1);
    }
    throw new Error(`Groq error ${completion.status}: ${text}`);
  }

  const data = await completion.json();
  const raw = data.choices?.[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed.findings) ? parsed.findings : [];
}
