"use client";

import Link from "next/link";
import Seal from "@/components/ui/Seal";
import ThemeToggle from "@/components/ThemeToggle";

export default function Nav() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{ background: "var(--bg-paper)", borderBottom: "1px solid var(--border)" }}
    >
      <div className="mx-auto w-full max-w-[440px] flex items-center justify-between px-5 h-12">
        {/* Left: Seal + DESTINO */}
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Seal size="sm" char="命" />
          <span
            className="text-[11px] font-black tracking-[0.15em] uppercase"
            style={{ color: "var(--ink-light)", fontFamily: "var(--font-display)" }}
          >
            DESTINO
          </span>
        </Link>

        {/* Right: Theme toggle */}
        <ThemeToggle />
      </div>
    </nav>
  );
}
