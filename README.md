# Themis

Named for the Greek goddess of divine law and justice — the scales, a classic symbol of audit.
An interpretation layer over LLM-generated CMMC / NIST SP 800-171 compliance findings on
infrastructure-as-code: a terminal-style scan log, Wiz-style finding detail pages, and a live
"paste a file, get findings" feature. Built as a standalone portfolio project.

This project is deliberately **not** trying to be a real compliance scanner. It has no AST parser,
no policy-as-code rule engine, and no access to live cloud infrastructure — unlike
[Checkov](https://checkov.io) or [tfsec](https://github.com/aquasecurity/tfsec). It's the
UX/interpretation layer on top of whatever an LLM flags, held to the honesty discipline used
throughout this portfolio: [Janus](https://github.com/joshrubio/Janus)'s RAG assistant and
[Siren](https://github.com/joshrubio/Siren)'s classifier dashboard both say plainly where the
model works and where it doesn't — this one says plainly that it isn't a certified assessment
tool at all. See `/docs` in the app for the full "what this is / isn't" writeup.

## What's real here

- **Example findings**: five deliberately-misconfigured infrastructure files (Terraform S3
  bucket, Terraform security group, Terraform IAM policy, a Dockerfile, a Kubernetes deployment)
  under `examples/`, scanned once by Groq (`openai/gpt-oss-20b`, free tier) with a system prompt
  that includes real **NIST SP 800-171 Rev 2** control numbers and families — so findings cite
  actual controls like `3.1.20` or `3.13.16` instead of invented ones.
- **Scoring**: severity (critical/high/medium/low) is the model's judgment against an explicit
  rubric given in the prompt, not a canned lookup table.
- **Live scan**: `/scan` runs the same Groq pipeline live against whatever Terraform, Dockerfile,
  or Kubernetes config you paste in — nothing is stored.

The 16 findings in the scan log were generated once by `scripts/scan.ts` and committed as static
data (`lib/findings.json`), the same "precompute the default content, keep one real live feature"
split used by Janus's RAG chat and Siren's classifier.

## Stack

Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind v4 · shadcn/ui (`@base-ui/react`)
· Groq (`openai/gpt-oss-20b`).

## Identity

Benchmarked against real cloud-security tool UIs — [Wiz](https://wiz.io/platform)'s finding-card
metadata grid, [Checkov](https://checkov.io)'s terminal scan-log format (`Check: CKV_AWS_130:
"..."` / `FAILED for resource:` / file:line / snippet) — rather than reskinned from the other
projects: a single monospace typeface (JetBrains Mono) used everywhere, zero corner radius, a
violet accent reserved for functional signals, and severity colors (critical/high/medium/low) as
domain-accurate data encoding, not brand decoration — the same exception class as Siren's magma
spectrogram colormap.

## Running it locally

```bash
npm install
npm run dev
```

To regenerate `lib/findings.json` from scratch (requires a `GROQ_API_KEY` in `.env.local`):

```bash
npx tsx scripts/scan.ts
```
