"use client";

import React from "react";

// ━━━ Props ━━━

export interface TarotCardVisualProps {
  number: number;       // 0-21
  name: string;         // Korean name
  nameEn: string;       // English name
  element: string;      // 원소
  size?: "lg" | "md";   // lg for birth card, md for year card
}

// ━━━ Roman numeral helper ━━━

function toRoman(n: number): string {
  if (n === 0) return "0";
  const map: [number, string][] = [
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let result = "";
  let remaining = n;
  for (const [value, numeral] of map) {
    while (remaining >= value) {
      result += numeral;
      remaining -= value;
    }
  }
  return result;
}

// ━━━ 22 Arcana SVG symbols ━━━
// Simple brush-stroke line drawings, no fill, organic strokes

function ArcanaSymbol({ number, size }: { number: number; size: number }) {
  const s = size;
  const sw = 1.5; // stroke width
  const color = "var(--tarot)";
  const props = {
    width: s,
    height: s,
    viewBox: "0 0 80 80",
    fill: "none",
    stroke: color,
    strokeWidth: sw,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (number) {
    // 0 바보 — figure walking toward edge
    case 0:
      return (
        <svg {...props}>
          <circle cx="35" cy="18" r="7" />
          <path d="M35 25 L45 55" />
          <path d="M35 35 L25 48" />
          <path d="M45 55 L38 70" />
          <path d="M45 55 L55 68" />
          <line x1="12" y1="72" x2="68" y2="72" strokeDasharray="3 4" />
        </svg>
      );

    // I 마법사 — infinity over dot
    case 1:
      return (
        <svg {...props}>
          <path d="M24 28 C24 18, 40 18, 40 28 C40 38, 56 38, 56 28" />
          <path d="M24 28 C24 38, 40 38, 40 28 C40 18, 56 18, 56 28" />
          <circle cx="40" cy="52" r="4" fill={color} />
          <line x1="40" y1="58" x2="40" y2="70" />
        </svg>
      );

    // II 여사제 — crescent between two pillars
    case 2:
      return (
        <svg {...props}>
          <line x1="20" y1="15" x2="20" y2="65" />
          <line x1="60" y1="15" x2="60" y2="65" />
          <path d="M46 30 A12 12 0 1 0 46 50" />
          <line x1="16" y1="15" x2="24" y2="15" />
          <line x1="56" y1="15" x2="64" y2="15" />
        </svg>
      );

    // III 여황제 — five-petal flower
    case 3:
      return (
        <svg {...props}>
          {[0, 72, 144, 216, 288].map((angle) => {
            const rad = (angle - 90) * (Math.PI / 180);
            const cx = 40 + Math.cos(rad) * 18;
            const cy = 40 + Math.sin(rad) * 18;
            return <ellipse key={angle} cx={cx} cy={cy} rx="8" ry="12"
              transform={`rotate(${angle}, ${cx}, ${cy})`} />;
          })}
          <circle cx="40" cy="40" r="4" fill={color} />
        </svg>
      );

    // IV 황제 — mountain/throne
    case 4:
      return (
        <svg {...props}>
          <path d="M15 62 L40 18 L65 62 Z" />
          <line x1="22" y1="48" x2="58" y2="48" />
          <line x1="30" y1="36" x2="50" y2="36" />
        </svg>
      );

    // V 교황 — three-pronged staff with cross
    case 5:
      return (
        <svg {...props}>
          <line x1="40" y1="70" x2="40" y2="20" />
          <path d="M40 20 L25 10" />
          <path d="M40 20 L55 10" />
          <path d="M40 20 L40 8" />
          <line x1="32" y1="38" x2="48" y2="38" />
        </svg>
      );

    // VI 연인 — two overlapping circles
    case 6:
      return (
        <svg {...props}>
          <circle cx="32" cy="40" r="16" />
          <circle cx="48" cy="40" r="16" />
        </svg>
      );

    // VII 전차 — two wheels connected
    case 7:
      return (
        <svg {...props}>
          <circle cx="22" cy="50" r="12" />
          <circle cx="58" cy="50" r="12" />
          <line x1="34" y1="50" x2="46" y2="50" />
          <path d="M22 38 L40 20 L58 38" />
        </svg>
      );

    // VIII 힘 — infinity over circle
    case 8:
      return (
        <svg {...props}>
          <path d="M24 25 C24 15, 40 15, 40 25 C40 35, 56 35, 56 25" />
          <path d="M24 25 C24 35, 40 35, 40 25 C40 15, 56 15, 56 25" />
          <circle cx="40" cy="55" r="13" />
        </svg>
      );

    // IX 은둔자 — lantern on a staff with radiating lines
    case 9:
      return (
        <svg {...props}>
          <line x1="40" y1="70" x2="40" y2="28" />
          <circle cx="40" cy="22" r="7" />
          <line x1="33" y1="16" x2="28" y2="11" />
          <line x1="40" y1="14" x2="40" y2="8" />
          <line x1="47" y1="16" x2="52" y2="11" />
          <line x1="34" y1="22" x2="28" y2="22" />
          <line x1="46" y1="22" x2="52" y2="22" />
        </svg>
      );

    // X 운명의 수레바퀴 — circle with cross
    case 10:
      return (
        <svg {...props}>
          <circle cx="40" cy="40" r="22" />
          <line x1="40" y1="18" x2="40" y2="62" />
          <line x1="18" y1="40" x2="62" y2="40" />
          <circle cx="40" cy="40" r="6" fill={color} />
        </svg>
      );

    // XI 정의 — balanced scales
    case 11:
      return (
        <svg {...props}>
          <line x1="40" y1="12" x2="40" y2="68" />
          <line x1="18" y1="30" x2="62" y2="30" />
          <path d="M14 30 L18 48 L30 48 L26 30" />
          <path d="M54 30 L50 48 L62 48 L66 30" />
          <line x1="32" y1="68" x2="48" y2="68" />
        </svg>
      );

    // XII 매달린 사람 — inverted triangle with dot
    case 12:
      return (
        <svg {...props}>
          <path d="M20 18 L60 18 L40 58 Z" />
          <circle cx="40" cy="35" r="5" fill={color} />
          <line x1="40" y1="58" x2="40" y2="72" />
        </svg>
      );

    // XIII 죽음 — butterfly/chrysalis transformation
    case 13:
      return (
        <svg {...props}>
          <path d="M40 40 C28 25, 12 30, 18 42 C22 52, 36 48, 40 40" />
          <path d="M40 40 C52 25, 68 30, 62 42 C58 52, 44 48, 40 40" />
          <line x1="40" y1="40" x2="40" y2="65" />
          <path d="M36 55 Q40 62, 44 55" />
        </svg>
      );

    // XIV 절제 — two triangles pouring
    case 14:
      return (
        <svg {...props}>
          <path d="M18 18 L38 55 L58 18 Z" />
          <path d="M22 62 L42 25 L62 62 Z" />
        </svg>
      );

    // XV 악마 — inverted star
    case 15:
      return (
        <svg {...props}>
          {[0, 1, 2, 3, 4].map((i) => {
            const outerAngle = (i * 72 + 180) * (Math.PI / 180);
            const innerAngle = ((i * 72) + 216) * (Math.PI / 180);
            const ox = 40 + Math.cos(outerAngle) * 24;
            const oy = 40 + Math.sin(outerAngle) * 24;
            const ix = 40 + Math.cos(innerAngle) * 10;
            const iy = 40 + Math.sin(innerAngle) * 10;
            return (
              <React.Fragment key={i}>
                <line x1={ox} y1={oy} x2={ix} y2={iy} />
                <line x1={ix} y1={iy} x2={
                  40 + Math.cos(((i + 1) * 72 + 180) * (Math.PI / 180)) * 24
                } y2={
                  40 + Math.sin(((i + 1) * 72 + 180) * (Math.PI / 180)) * 24
                } />
              </React.Fragment>
            );
          })}
        </svg>
      );

    // XVI 탑 — lightning bolt hitting rectangle
    case 16:
      return (
        <svg {...props}>
          <rect x="25" y="30" width="30" height="40" rx="2" />
          <path d="M45 8 L35 28 L45 28 L32 48" strokeWidth="2" />
          <line x1="30" y1="45" x2="25" y2="52" strokeDasharray="2 3" />
          <line x1="50" y1="42" x2="56" y2="50" strokeDasharray="2 3" />
        </svg>
      );

    // XVII 별 — eight-pointed star
    case 17:
      return (
        <svg {...props}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
            const rad = angle * (Math.PI / 180);
            const len = angle % 90 === 0 ? 26 : 16;
            return (
              <line
                key={angle}
                x1="40" y1="40"
                x2={40 + Math.cos(rad) * len}
                y2={40 + Math.sin(rad) * len}
              />
            );
          })}
          <circle cx="40" cy="40" r="4" fill={color} />
        </svg>
      );

    // XVIII 달 — crescent with wavy reflection
    case 18:
      return (
        <svg {...props}>
          <path d="M48 15 A18 18 0 1 0 48 55" />
          <path d="M38 15 A14 14 0 1 1 38 55" stroke="var(--bg-white)" strokeWidth="3" />
          <path d="M15 65 Q25 58, 35 65 Q45 72, 55 65 Q65 58, 75 65"
            strokeWidth="1.2" />
        </svg>
      );

    // XIX 태양 — circle with rays
    case 19:
      return (
        <svg {...props}>
          <circle cx="40" cy="40" r="14" />
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => {
            const rad = angle * (Math.PI / 180);
            return (
              <line
                key={angle}
                x1={40 + Math.cos(rad) * 18}
                y1={40 + Math.sin(rad) * 18}
                x2={40 + Math.cos(rad) * 28}
                y2={40 + Math.sin(rad) * 28}
              />
            );
          })}
        </svg>
      );

    // XX 심판 — trumpet/horn
    case 20:
      return (
        <svg {...props}>
          <path d="M30 60 Q30 35, 40 20 Q50 35, 50 60" />
          <path d="M24 60 Q40 52, 56 60" />
          <line x1="40" y1="20" x2="40" y2="10" />
          <line x1="34" y1="14" x2="46" y2="14" />
          <path d="M32 8 L40 3 L48 8" />
        </svg>
      );

    // XXI 세계 — circle with four corner dots
    case 21:
      return (
        <svg {...props}>
          <circle cx="40" cy="40" r="22" />
          <circle cx="14" cy="14" r="4" fill={color} />
          <circle cx="66" cy="14" r="4" fill={color} />
          <circle cx="14" cy="66" r="4" fill={color} />
          <circle cx="66" cy="66" r="4" fill={color} />
        </svg>
      );

    default:
      return (
        <svg {...props}>
          <circle cx="40" cy="40" r="20" />
        </svg>
      );
  }
}

// ━━━ Corner decorations (L-shaped marks) ━━━

function CornerMarks({ inset, size }: { inset: number; size: number }) {
  const len = size;
  const color = "var(--border)";
  const sw = 1;

  return (
    <>
      {/* Top-left */}
      <svg
        className="absolute"
        style={{ top: inset, left: inset }}
        width={len} height={len}
        fill="none" stroke={color} strokeWidth={sw}
      >
        <path d={`M0 ${len} L0 0 L${len} 0`} />
      </svg>
      {/* Top-right */}
      <svg
        className="absolute"
        style={{ top: inset, right: inset }}
        width={len} height={len}
        fill="none" stroke={color} strokeWidth={sw}
      >
        <path d={`M0 0 L${len} 0 L${len} ${len}`} />
      </svg>
      {/* Bottom-left */}
      <svg
        className="absolute"
        style={{ bottom: inset, left: inset }}
        width={len} height={len}
        fill="none" stroke={color} strokeWidth={sw}
      >
        <path d={`M0 0 L0 ${len} L${len} ${len}`} />
      </svg>
      {/* Bottom-right */}
      <svg
        className="absolute"
        style={{ bottom: inset, right: inset }}
        width={len} height={len}
        fill="none" stroke={color} strokeWidth={sw}
      >
        <path d={`M${len} 0 L${len} ${len} L0 ${len}`} />
      </svg>
    </>
  );
}

// ━━━ Main component ━━━

export default function TarotCardVisual({
  number,
  name,
  nameEn,
  element,
  size = "lg",
}: TarotCardVisualProps) {
  const isLg = size === "lg";
  const w = isLg ? 200 : 150;
  const h = isLg ? 300 : 225;
  const symbolSize = isLg ? 80 : 60;
  const cornerInset = isLg ? 10 : 7;
  const cornerSize = isLg ? 14 : 10;

  return (
    <div
      className="relative flex flex-col items-center justify-between rounded-lg select-none"
      style={{
        width: w,
        height: h,
        background: "var(--bg-white)",
        padding: isLg ? "20px 16px 16px" : "14px 12px 12px",
      }}
    >
      {/* Outer border — thin */}
      <div
        className="absolute inset-0 rounded-lg pointer-events-none"
        style={{
          border: "1px solid var(--border-strong)",
        }}
      />

      {/* Inner border — thick */}
      <div
        className="absolute pointer-events-none rounded"
        style={{
          inset: isLg ? 6 : 4,
          border: `2px solid var(--tarot)`,
        }}
      />

      {/* Corner marks */}
      <CornerMarks inset={cornerInset} size={cornerSize} />

      {/* Top — Roman numeral */}
      <span
        style={{
          fontSize: isLg ? 28 : 20,
          fontFamily: "var(--font-display)",
          color: "var(--tarot)",
          fontWeight: 700,
          letterSpacing: "0.12em",
          lineHeight: 1,
          position: "relative",
          zIndex: 1,
        }}
      >
        {toRoman(number)}
      </span>

      {/* Center — SVG symbol */}
      <div
        className="flex items-center justify-center"
        style={{
          position: "relative",
          zIndex: 1,
          opacity: 0.85,
        }}
      >
        <ArcanaSymbol number={number} size={symbolSize} />
      </div>

      {/* Bottom — Name and element */}
      <div
        className="flex flex-col items-center gap-0.5"
        style={{ position: "relative", zIndex: 1 }}
      >
        {/* Korean name */}
        <span
          style={{
            fontSize: isLg ? 18 : 14,
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            color: "var(--ink)",
            lineHeight: 1.3,
            letterSpacing: "-0.01em",
          }}
        >
          {name}
        </span>

        {/* English name */}
        <span
          style={{
            fontSize: isLg ? 10 : 8,
            fontFamily: "var(--font-body)",
            fontWeight: 500,
            color: "var(--ink-light)",
            letterSpacing: "0.06em",
            textTransform: "uppercase" as const,
          }}
        >
          {nameEn}
        </span>

        {/* Element badge */}
        <span
          className="rounded-sm"
          style={{
            marginTop: isLg ? 6 : 4,
            fontSize: isLg ? 9 : 8,
            fontFamily: "var(--font-body)",
            fontWeight: 500,
            color: "var(--ink-faint)",
            letterSpacing: "0.05em",
            padding: "1px 6px",
            background: "var(--bg-warm)",
          }}
        >
          {element}
        </span>
      </div>
    </div>
  );
}
