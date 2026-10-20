import { NextRequest, NextResponse } from "next/server";
import { scanContent } from "@/lib/scan";

const MAX_CONTENT_LENGTH = 8_000;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const content = typeof body?.content === "string" ? body.content.trim() : "";
  const language = typeof body?.language === "string" && body.language.trim() ? body.language.trim() : "unknown";

  if (!content) {
    return NextResponse.json({ error: "Paste some config content first." }, { status: 400 });
  }
  if (content.length > MAX_CONTENT_LENGTH) {
    return NextResponse.json({ error: `Keep it under ${MAX_CONTENT_LENGTH} characters for this demo.` }, { status: 400 });
  }

  try {
    const findings = await scanContent(content, language);
    const lines = content.split("\n");

    const result = findings.map((f, i) => {
      const lineStart = Math.max(1, Number(f.lineStart) || 1);
      const lineEnd = Math.min(lines.length, Math.max(lineStart, Number(f.lineEnd) || lineStart));
      return {
        id: `live-${i + 1}`,
        checkId: f.checkId,
        title: f.title,
        severity: f.severity,
        control: f.control,
        controlFamily: f.controlFamily,
        lineStart,
        lineEnd,
        snippet: lines.slice(lineStart - 1, lineEnd).join("\n"),
        explanation: f.explanation,
        remediation: f.remediation,
      };
    });

    return NextResponse.json({ findings: result });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "The scan failed — Groq may be rate-limited. Try again in a few seconds." }, { status: 502 });
  }
}
