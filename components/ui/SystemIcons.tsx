import { type ReactNode } from "react";

/* ━━━ System-specific celestial icons ━━━
 *
 * Each icon maps to one of DESTINO's analysis systems.
 * Use these throughout all pages for visual consistency
 * instead of plain colored dots (Dot component).
 *
 * Color defaults reference CSS custom properties from globals.css.
 */

/** Yin-Yang -- saju (사주명리학) */
export function SajuIcon({ size = 16, color = "var(--saju)" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="6" stroke={color} strokeWidth="1.2" />
      <path d="M7 1 A3 3 0 0 1 7 7 A3 3 0 0 0 7 13" stroke={color} strokeWidth="1.2" />
      <circle cx="7" cy="4" r="0.9" stroke={color} strokeWidth="0.8" />
      <circle cx="7" cy="10" r="0.9" stroke={color} strokeWidth="0.8" />
    </svg>
  );
}

/** Zodiac Wheel -- western astrology (서양 점성술) */
export function AstroIcon({ size = 16, color = "var(--astro)" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="6" stroke={color} strokeWidth="1.2" />
      <circle cx="7" cy="7" r="3" stroke={color} strokeWidth="0.8" />
      <line x1="7" y1="1" x2="7" y2="13" stroke={color} strokeWidth="0.8" />
      <line x1="1" y1="7" x2="13" y2="7" stroke={color} strokeWidth="0.8" />
    </svg>
  );
}

/** Spiral / Fibonacci -- numerology (수비학) */
export function NumeroIcon({ size = 16, color = "var(--numero)" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 7 A1.2 1.2 0 0 1 8.2 5.8 A2.4 2.4 0 0 1 9.4 8.2 A3.6 3.6 0 0 1 4.6 9.4 A4.8 4.8 0 0 1 3.4 3.4 A6 6 0 0 1 12 5" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/** Brain / Mind waves -- MBTI (성격유형론) */
export function MBTIIcon({ size = 16, color = "var(--mbti)" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="6" stroke={color} strokeWidth="1.2" />
      <path d="M4 5.5 C5 4.5 6 6 7 5 C8 4 9 5.5 10 5" stroke={color} strokeWidth="1" strokeLinecap="round" fill="none" />
      <path d="M4 8 C5 7 6 8.5 7 7.5 C8 6.5 9 8 10 7.5" stroke={color} strokeWidth="1" strokeLinecap="round" fill="none" />
      <path d="M5 10.5 C6 9.5 7 10.5 8 10 C8.5 9.5 9 10 9.5 10" stroke={color} strokeWidth="1" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/** All-seeing Eye -- face reading (관상) */
export function FaceIcon({ size = 16, color = "var(--face)" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M1 7 C3 3.5 5 2.5 7 2.5 C9 2.5 11 3.5 13 7 C11 10.5 9 11.5 7 11.5 C5 11.5 3 10.5 1 7 Z" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx="7" cy="7" r="2" stroke={color} strokeWidth="1" />
      <circle cx="7" cy="7" r="0.7" stroke={color} strokeWidth="0.7" />
    </svg>
  );
}

/** Card with Star -- tarot (타로) */
export function TarotIcon({ size = 16, color = "var(--tarot)" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="2.5" y="1" width="9" height="12" rx="1" stroke={color} strokeWidth="1.2" />
      <path d="M7 3.5 L7.8 5.8 L10 6 L8.3 7.5 L8.8 9.8 L7 8.5 L5.2 9.8 L5.7 7.5 L4 6 L6.2 5.8 Z" stroke={color} strokeWidth="0.8" strokeLinejoin="round" />
    </svg>
  );
}

/* ━━━ Feature / Service icons (larger, 16px default) ━━━ */

/** 4-pointed star -- cross-analysis */
export function StarIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 1 L9.5 6.5 L15 8 L9.5 9.5 L8 15 L6.5 9.5 L1 8 L6.5 6.5 Z" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

/** Twin crescents -- compatibility / union */
export function TwinMoonsIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6.5 3 A4.5 4.5 0 0 1 6.5 13 A3.2 3.2 0 0 0 6.5 3" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 3 A4.5 4.5 0 0 0 9.5 13 A3.2 3.2 0 0 1 9.5 3" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Sun symbol -- daily fortune */
export function SunIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="3" stroke={color} strokeWidth="1.2" />
      <circle cx="8" cy="8" r="0.8" stroke={color} strokeWidth="0.8" />
      <line x1="8" y1="1.5" x2="8" y2="3.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="8" y1="12.5" x2="8" y2="14.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="1.5" y1="8" x2="3.5" y2="8" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="12.5" y1="8" x2="14.5" y2="8" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="3.4" y1="3.4" x2="4.8" y2="4.8" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="11.2" y1="11.2" x2="12.6" y2="12.6" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="12.6" y1="3.4" x2="11.2" y2="4.8" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="4.8" y1="11.2" x2="3.4" y2="12.6" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/** Pentagram -- 5-pointed star in circle */
export function PentagramIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke={color} strokeWidth="1.2" />
      <path d="M8 1.5 L9.9 6.2 L14.5 6.2 L10.8 9.2 L12.2 14 L8 11.2 L3.8 14 L5.2 9.2 L1.5 6.2 L6.1 6.2 Z" stroke={color} strokeWidth="1" strokeLinejoin="round" />
    </svg>
  );
}

/** Full-size eye -- face reading (larger variant) */
export function EyeIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M1 8 C3 4 6 2.5 8 2.5 C10 2.5 13 4 15 8 C13 12 10 13.5 8 13.5 C6 13.5 3 12 1 8 Z" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx="8" cy="8" r="2.5" stroke={color} strokeWidth="1.2" />
      <circle cx="8" cy="8" r="0.8" stroke={color} strokeWidth="0.8" />
    </svg>
  );
}

/* ━━━ Lookup helpers ━━━ */

/** Returns the correct system icon for a given system key */
export function SystemIcon({ type, color, size = 14 }: { type: string; color: string; size?: number }): ReactNode {
  switch (type) {
    case "saju": return <SajuIcon color={color} size={size} />;
    case "astro":
    case "western": return <AstroIcon color={color} size={size} />;
    case "numero":
    case "numerology": return <NumeroIcon color={color} size={size} />;
    case "mbti": return <MBTIIcon color={color} size={size} />;
    case "face": return <FaceIcon color={color} size={size} />;
    case "tarot": return <TarotIcon color={color} size={size} />;
    default: return <StarIcon color={color} size={size} />;
  }
}

/** Returns the correct service icon for a given service type */
export function ServiceIcon({ type, color }: { type: string; color: string }): ReactNode {
  switch (type) {
    case "compatibility": return <TwinMoonsIcon color={color} />;
    case "marriage": return (
      <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 14s-5.5-3.5-5.5-7.5C2.5 3.5 5 2 8 5c3-3 5.5-1.5 5.5 1.5S8 14 8 14z" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    );
    case "daily": return <SunIcon color={color} />;
    case "tarot": return <PentagramIcon color={color} />;
    case "face": return <EyeIcon color={color} />;
    case "chat": return (
      <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M2 3C2 2.44772 2.44772 2 3 2H13C13.5523 2 14 2.44772 14 3V10.5C14 11.0523 13.5523 11.5 13 11.5H6L3 14.5V11.5C2.44772 11.5 2 11.0523 2 10.5V3Z" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
        <circle cx="6" cy="6.8" r="0.7" fill={color} />
        <circle cx="8" cy="6.8" r="0.7" fill={color} />
        <circle cx="10" cy="6.8" r="0.7" fill={color} />
      </svg>
    );
    case "career": return (
      <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="2" y="4" width="12" height="9" rx="1.5" stroke={color} strokeWidth="1.2" />
        <path d="M5 4V2.5C5 2.22386 5.22386 2 5.5 2H10.5C10.7761 2 11 2.22386 11 2.5V4" stroke={color} strokeWidth="1.2" />
        <path d="M2 7.5h12" stroke={color} strokeWidth="0.8" />
        <circle cx="8" cy="7.5" r="1" stroke={color} strokeWidth="0.8" />
      </svg>
    );
    case "love": return (
      <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 14S2 10 2 6.5C2 4.01472 4.01472 2 6.5 2C7.26 2 7.97 2.22 8 2.5C8.03 2.22 8.74 2 9.5 2C11.9853 2 14 4.01472 14 6.5C14 10 8 14 8 14Z" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    );
    default: return <StarIcon color={color} />;
  }
}

/** Map system key to its CSS color variable */
export const SYSTEM_COLOR_MAP: Record<string, string> = {
  saju: "var(--saju)",
  astro: "var(--astro)",
  western: "var(--astro)",
  numero: "var(--numero)",
  numerology: "var(--numero)",
  mbti: "var(--mbti)",
  face: "var(--face)",
  tarot: "var(--tarot)",
};
