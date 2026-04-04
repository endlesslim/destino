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

/* ── Brush-stroke SVG icons ────────────────────────────────────
 *  Thin 1.5px strokes evoking calligraphy / traditional 東洋 forms.
 *  "과거와 현대를 연결하는 느낌" — classical shapes, modern precision.
 * ──────────────────────────────────────────────────────────────── */

/** 四柱 — four pillars forming a grid */
function AnalyzeIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      {/* Vertical strokes */}
      <line x1="7" y1="3" x2="7" y2="19" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="15" y1="3" x2="15" y2="19" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      {/* Horizontal strokes */}
      <line x1="3" y1="7" x2="19" y2="7" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="3" y1="15" x2="19" y2="15" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** 合 — two shapes meeting, overlapping circles */
function CompatibilityIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle cx="8.5" cy="11" r="5.5" stroke={color} strokeWidth="1.5" />
      <circle cx="13.5" cy="11" r="5.5" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

/** 日 — sun, simplified from the character form */
function DailyIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      {/* Outer rectangle — 日 */}
      <rect x="5" y="3" width="12" height="16" rx="1" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Middle horizontal — dividing line */}
      <line x1="5" y1="11" x2="17" y2="11" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** 竹簡 — bamboo scroll / record */
function HistoryIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      {/* Three vertical bamboo strips */}
      <line x1="7" y1="3" x2="7" y2="19" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="11" y1="3" x2="11" y2="19" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="15" y1="3" x2="15" y2="19" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      {/* Binding threads */}
      <line x1="5" y1="6" x2="17" y2="6" stroke={color} strokeWidth="1" strokeLinecap="round" />
      <line x1="5" y1="16" x2="17" y2="16" stroke={color} strokeWidth="1" strokeLinecap="round" />
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
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-colors"
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
