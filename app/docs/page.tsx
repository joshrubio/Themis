const SECTIONS = [
  {
    title: "What this is",
    body: [
      "Themis is an interpretation layer over LLM-generated findings, not a certified CMMC/NIST assessment tool. Five small infrastructure-as-code files (Terraform, a Dockerfile, a Kubernetes deployment) are scanned once, offline, by an LLM prompted with real NIST SP 800-171 Rev 2 control numbers. The model's job is to point at concrete misconfigurations and cite the single best-fit control for each one.",
      "The findings you see in the scan log were generated this way and committed to the repo as static data — they are not re-generated on every page load. The /scan page is the one place where the model runs live, on whatever you paste in.",
    ],
  },
  {
    title: "What it isn't",
    body: [
      "It does not parse Terraform/HCL, Dockerfile, or Kubernetes YAML with a real static-analysis engine — no AST, no policy-as-code rules (unlike Checkov or tfsec). It has no access to your actual cloud account, no live resource graph, and cannot verify a finding against deployed infrastructure.",
      "A real compliance assessment is performed by a certified C3PAO assessor against the full NIST SP 800-171 control set, with evidence collection and a System Security Plan — this is a portfolio demo of the interpretation layer, not a substitute for that process.",
    ],
  },
  {
    title: "How findings are scored",
    body: [
      "Severity is the model's judgment call, guided by this rubric: critical = a direct path to CUI exposure or full compromise; high = a gap an assessor would flag immediately; medium = a real gap with smaller blast radius; low = a hygiene or best-practice item.",
      "Every finding cites one NIST SP 800-171 Rev 2 control number and family. The model is given a short reference list of real control numbers in its prompt so it anchors to actual controls instead of inventing plausible-sounding ones.",
    ],
  },
  {
    title: "Pipeline",
    body: [
      "scripts/scan.ts reads each example file, sends it to Groq (openai/gpt-oss-20b, free tier) with a system prompt that includes the control reference list and a strict JSON output shape, and writes the parsed findings to lib/findings.json.",
      "The same Groq call, made live from the browser, powers the /scan page — paste a config file and get back findings in the same shape, scored against the same rubric.",
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="flex-1 max-w-2xl w-full mx-auto px-5 py-8 flex flex-col gap-8">
      <div>
        <p className="text-xs text-muted-foreground">$ themis docs</p>
        <h1 className="text-lg mt-1">Docs</h1>
      </div>
      {SECTIONS.map((section) => (
        <div key={section.title}>
          <h2 className="text-sm text-primary">{section.title}</h2>
          <div className="mt-2 flex flex-col gap-3">
            {section.body.map((p, i) => (
              <p key={i} className="text-sm text-muted-foreground leading-relaxed">
                {p}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
