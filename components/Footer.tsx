"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  if (pathname === "/login") return null;

  return (
    <footer className="shrink-0 border-t px-5 py-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
      <p>themis — an interpretation layer over real LLM-generated compliance findings.</p>
      <div className="flex items-center gap-4">
        <a
          href="https://github.com/joshrubio/Themis"
          target="_blank"
          rel="noreferrer"
          className="hover:text-foreground transition-colors"
        >
          Source
        </a>
        <Link href="/docs" className="hover:text-foreground transition-colors">
          Docs
        </Link>
      </div>
    </footer>
  );
}
