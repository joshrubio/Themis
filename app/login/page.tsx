import { Suspense } from "react";
import { signIn } from "./actions";

async function LoginForm({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const from = typeof params.from === "string" ? params.from : "/";

  return (
    <form action={signIn} className="px-4 pb-4">
      <input type="hidden" name="from" value={from} />
      <p className="text-xs text-muted-foreground mb-1">
        <span className="text-primary">$</span> themis auth login
      </p>
      <label className="block mt-3 mb-3">
        <span className="block mb-1 text-xs text-muted-foreground">--assessor-email</span>
        <input
          name="email"
          type="email"
          placeholder="you@assessment-org.gov"
          autoFocus
          className="w-full h-9 bg-input/30 border border-border px-2.5 text-sm outline-none focus:border-ring transition-colors"
        />
      </label>
      <button
        type="submit"
        className="w-full h-9 bg-primary text-primary-foreground text-xs uppercase tracking-wide hover:bg-primary/85 transition-colors"
      >
        Authenticate
      </button>
      <p className="mt-4 text-[11px] text-muted-foreground/70 leading-relaxed">
        Demo access gate — any input (or none) signs you in. This is a portfolio project; no real
        authentication, no email sent or stored.
      </p>
    </form>
  );
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <main className="flex-1 flex items-center justify-center px-6">
      <div className="w-full max-w-sm border border-border">
        <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
          <span className="size-2.5 bg-critical" />
          <span className="size-2.5 bg-medium" />
          <span className="size-2.5 bg-low" />
          <span className="ml-2 text-[11px] text-muted-foreground">themis — terminal</span>
        </div>
        <Suspense fallback={<div className="h-48" />}>
          <LoginForm searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
