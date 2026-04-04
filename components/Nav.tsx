"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Seal from "@/components/ui/Seal";

const NAV_ITEMS = [
  { label: "교차 분석", href: "/analyze" },
  { label: "궁합 분석", href: "/compatibility" },
  { label: "오늘의 운세", href: "/daily" },
  { label: "카드 갤러리", href: "/cards" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [open]);

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{ background: "var(--bg-paper)", borderBottom: "1px solid var(--border)" }}
    >
      <div
        ref={menuRef}
        className="relative mx-auto w-full max-w-[440px] flex items-center justify-between px-5 h-12"
      >
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

        {/* Right: Hamburger */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="p-2 -mr-2 cursor-pointer"
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={open}
        >
          <svg
            width="18"
            height="14"
            viewBox="0 0 18 14"
            fill="none"
            aria-hidden="true"
          >
            <line x1="0" y1="1" x2="18" y2="1" stroke="var(--ink-light)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="0" y1="7" x2="18" y2="7" stroke="var(--ink-light)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="0" y1="13" x2="18" y2="13" stroke="var(--ink-light)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {/* Dropdown */}
        {open && (
          <div
            className="absolute top-full right-4 mt-1 rounded-lg py-1 min-w-[160px] shadow-md"
            style={{
              background: "var(--bg-white)",
              border: "1px solid var(--border)",
            }}
          >
            {NAV_ITEMS.map(({ label, href }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className="block px-4 py-2.5 text-sm font-medium transition-colors"
                  style={{
                    color: active ? "var(--seal)" : "var(--ink-muted)",
                    fontFamily: "var(--font-display)",
                    background: active ? "var(--seal-bg)" : undefined,
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
