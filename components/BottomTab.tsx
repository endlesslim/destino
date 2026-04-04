"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TAB_ITEMS = [
  {
    label: "교차 분석",
    href: "/analyze",
    icon: AnalyzeIcon,
  },
  {
    label: "궁합",
    href: "/compatibility",
    icon: CompatibilityIcon,
  },
  {
    label: "오늘의 운세",
    href: "/daily",
    icon: DailyIcon,
  },
  {
    label: "기록",
    href: "/history",
    icon: HistoryIcon,
  },
];

/* ── Celestial SVG icons ───────────────────────────────────────
 *  Thin 1.5px strokes evoking astronomical charts / old star maps.
 *  Astrology-themed: zodiac symbols, moon phases, stars, planetary symbols.
 * ──────────────────────────────────────────────────────────────── */

/** Compass star — 4-pointed star with cross through center (celestial navigation) */
function AnalyzeIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      {/* Cross through center */}
      <line x1="11" y1="2" x2="11" y2="20" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2" y1="11" x2="20" y2="11" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      {/* Four diamond points */}
      <path d="M11 2 L13.5 8.5 L11 5 L8.5 8.5 Z" stroke={color} strokeWidth="1" strokeLinejoin="round" fill="none" />
      <path d="M20 11 L13.5 8.5 L17 11 L13.5 13.5 Z" stroke={color} strokeWidth="1" strokeLinejoin="round" fill="none" />
      <path d="M11 20 L8.5 13.5 L11 17 L13.5 13.5 Z" stroke={color} strokeWidth="1" strokeLinejoin="round" fill="none" />
      <path d="M2 11 L8.5 13.5 L5 11 L8.5 8.5 Z" stroke={color} strokeWidth="1" strokeLinejoin="round" fill="none" />
      {/* Center dot */}
      <circle cx="11" cy="11" r="1.2" stroke={color} strokeWidth="1" />
    </svg>
  );
}

/** Twin crescent moons — ☽ ☾ facing each other (union of celestial bodies) */
function CompatibilityIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      {/* Left crescent ☽ — waning moon */}
      <path d="M9 4.5 A6 6 0 0 1 9 17.5 A4.2 4.2 0 0 0 9 4.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Right crescent ☾ — waxing moon */}
      <path d="M13 4.5 A6 6 0 0 0 13 17.5 A4.2 4.2 0 0 1 13 4.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Sun with rays — ☉ solar symbol (classic astrology) */
function DailyIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      {/* Central sun circle */}
      <circle cx="11" cy="11" r="4" stroke={color} strokeWidth="1.5" />
      {/* Inner dot */}
      <circle cx="11" cy="11" r="1" stroke={color} strokeWidth="1" />
      {/* 8 radiating rays */}
      <line x1="11" y1="2" x2="11" y2="5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="11" y1="17" x2="11" y2="20" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2" y1="11" x2="5" y2="11" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="17" y1="11" x2="20" y2="11" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="4.6" y1="4.6" x2="6.7" y2="6.7" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="15.3" y1="15.3" x2="17.4" y2="17.4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="17.4" y1="4.6" x2="15.3" y2="6.7" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="6.7" y1="15.3" x2="4.6" y2="17.4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Open book with star — celestial grimoire / record of the heavens */
function HistoryIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      {/* Open book — two curved pages */}
      <path d="M11 6 C11 6 9 4 4 4 L4 17 C9 17 11 18.5 11 18.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 6 C11 6 13 4 18 4 L18 17 C13 17 11 18.5 11 18.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Spine */}
      <line x1="11" y1="6" x2="11" y2="18.5" stroke={color} strokeWidth="1" strokeLinecap="round" />
      {/* Small 4-pointed star on right page */}
      <path d="M14.5 9 L15 10.5 L16.5 11 L15 11.5 L14.5 13 L14 11.5 L12.5 11 L14 10.5 Z" stroke={color} strokeWidth="1" strokeLinejoin="round" />
    </svg>
  );
}

export default function BottomTab() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const isLanding = pathname === "/";

  /* ── Scroll-direction hide/show (like iOS Safari tab bar) ─── */
  useEffect(() => {
    if (isLanding) return;

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        if (currentY < 10) {
          setVisible(true);
        } else if (currentY > lastScrollY.current + 8) {
          setVisible(false);
        } else if (currentY < lastScrollY.current - 8) {
          setVisible(true);
        }
        lastScrollY.current = currentY;
        ticking.current = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isLanding]);

  // Hide on landing page
  if (isLanding) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden transition-transform duration-300"
      style={{
        background: "var(--bg-paper)",
        borderTop: "1px solid var(--border)",
        transform: visible ? "translateY(0)" : "translateY(100%)",
      }}
      aria-label="하단 탐색"
    >
      <div
        className="mx-auto max-w-[440px] flex items-center justify-around"
        style={{ height: 56, paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {TAB_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          const color = active ? "var(--seal)" : "var(--ink-light)";

          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2.5 min-h-[48px] transition-colors"
              aria-current={active ? "page" : undefined}
            >
              <Icon color={color} />
              <span
                className="text-[10px] leading-tight font-medium"
                style={{
                  color,
                  fontFamily: "var(--font-display)",
                }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
