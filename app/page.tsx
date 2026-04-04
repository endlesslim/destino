"use client";

import Link from "next/link";
import Seal from "@/components/ui/Seal";
import Divider from "@/components/ui/Divider";
import ScrollReveal from "@/components/ScrollReveal";

/* ━━━ Celestial Icons ━━━ */

/** 4-pointed star — ✦ celestial cross-analysis */
function StarIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 1 L9.5 6.5 L15 8 L9.5 9.5 L8 15 L6.5 9.5 L1 8 L6.5 6.5 Z" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

/** Twin crescents — ☽☾ compatibility / union */
function TwinMoonsIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6.5 3 A4.5 4.5 0 0 1 6.5 13 A3.2 3.2 0 0 0 6.5 3" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 3 A4.5 4.5 0 0 0 9.5 13 A3.2 3.2 0 0 1 9.5 3" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Sun symbol — ☉ daily fortune */
function SunIcon({ color, size = 16 }: { color: string; size?: number }) {
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

/** Pentagram — 5-pointed star in circle (tarot) */
function PentagramIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke={color} strokeWidth="1.2" />
      <path d="M8 1.5 L9.9 6.2 L14.5 6.2 L10.8 9.2 L12.2 14 L8 11.2 L3.8 14 L5.2 9.2 L1.5 6.2 L6.1 6.2 Z" stroke={color} strokeWidth="1" strokeLinejoin="round" />
    </svg>
  );
}

/** All-seeing eye — simplified (face reading) */
function EyeIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M1 8 C3 4 6 2.5 8 2.5 C10 2.5 13 4 15 8 C13 12 10 13.5 8 13.5 C6 13.5 3 12 1 8 Z" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx="8" cy="8" r="2.5" stroke={color} strokeWidth="1.2" />
      <circle cx="8" cy="8" r="0.8" stroke={color} strokeWidth="0.8" />
    </svg>
  );
}

/** Yin-yang simplified — saju (14px system icon) */
function YinYangIcon({ color, size = 14 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="6" stroke={color} strokeWidth="1.2" />
      <path d="M7 1 A3 3 0 0 1 7 7 A3 3 0 0 0 7 13" stroke={color} strokeWidth="1.2" />
      <circle cx="7" cy="4" r="0.9" stroke={color} strokeWidth="0.8" />
      <circle cx="7" cy="10" r="0.9" stroke={color} strokeWidth="0.8" />
    </svg>
  );
}

/** Zodiac wheel — circle with 4 divisions (western astrology) */
function ZodiacWheelIcon({ color, size = 14 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="6" stroke={color} strokeWidth="1.2" />
      <circle cx="7" cy="7" r="3" stroke={color} strokeWidth="0.8" />
      <line x1="7" y1="1" x2="7" y2="13" stroke={color} strokeWidth="0.8" />
      <line x1="1" y1="7" x2="13" y2="7" stroke={color} strokeWidth="0.8" />
    </svg>
  );
}

/** Spiral / fibonacci — numerology */
function SpiralIcon({ color, size = 14 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 7 A1.2 1.2 0 0 1 8.2 5.8 A2.4 2.4 0 0 1 9.4 8.2 A3.6 3.6 0 0 1 4.6 9.4 A4.8 4.8 0 0 1 3.4 3.4 A6 6 0 0 1 12 5" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/** Brain / mind — circle with waves inside (MBTI) */
function BrainIcon({ color, size = 14 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="6" stroke={color} strokeWidth="1.2" />
      <path d="M4 5.5 C5 4.5 6 6 7 5 C8 4 9 5.5 10 5" stroke={color} strokeWidth="1" strokeLinecap="round" fill="none" />
      <path d="M4 8 C5 7 6 8.5 7 7.5 C8 6.5 9 8 10 7.5" stroke={color} strokeWidth="1" strokeLinecap="round" fill="none" />
      <path d="M5 10.5 C6 9.5 7 10.5 8 10 C8.5 9.5 9 10 9.5 10" stroke={color} strokeWidth="1" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/** Eye with iris — face reading (14px system icon) */
function EyeSmallIcon({ color, size = 14 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M1 7 C3 3.5 5 2.5 7 2.5 C9 2.5 11 3.5 13 7 C11 10.5 9 11.5 7 11.5 C5 11.5 3 10.5 1 7 Z" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx="7" cy="7" r="2" stroke={color} strokeWidth="1" />
      <circle cx="7" cy="7" r="0.7" stroke={color} strokeWidth="0.7" />
    </svg>
  );
}

/** Card with star — tarot (14px system icon) */
function CardStarIcon({ color, size = 14 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="2.5" y="1" width="9" height="12" rx="1" stroke={color} strokeWidth="1.2" />
      <path d="M7 3.5 L7.8 5.8 L10 6 L8.3 7.5 L8.8 9.8 L7 8.5 L5.2 9.8 L5.7 7.5 L4 6 L6.2 5.8 Z" stroke={color} strokeWidth="0.8" strokeLinejoin="round" />
    </svg>
  );
}

/* Service card icon lookup */
function ServiceIcon({ type, color }: { type: string; color: string }) {
  switch (type) {
    case "compatibility": return <TwinMoonsIcon color={color} />;
    case "daily": return <SunIcon color={color} />;
    case "tarot": return <PentagramIcon color={color} />;
    case "face": return <EyeIcon color={color} />;
    default: return <StarIcon color={color} />;
  }
}

/* System grid icon lookup */
function SystemIcon({ type, color }: { type: string; color: string }) {
  switch (type) {
    case "saju": return <YinYangIcon color={color} />;
    case "astro": return <ZodiacWheelIcon color={color} />;
    case "numero": return <SpiralIcon color={color} />;
    case "mbti": return <BrainIcon color={color} />;
    case "face": return <EyeSmallIcon color={color} />;
    case "tarot": return <CardStarIcon color={color} />;
    default: return <StarIcon color={color} size={14} />;
  }
}

/* ━━━ Data ━━━ */

const howItWorksSteps = [
  {
    number: "1",
    title: "생년월일 입력",
    description: "30초면 충분합니다",
  },
  {
    number: "2",
    title: "4개 체계 동시 분석",
    description: "사주 · 별자리 · 수비학 · MBTI",
  },
  {
    number: "3",
    title: "교차점 발견",
    description: "여러 문명이 같은 답을 내린 지점",
  },
  {
    number: "4",
    title: "맞춤 리포트",
    description: "직업 · 연애 · 성격 · 인생 조언",
  },
];

const reportCards = [
  {
    color: "var(--seal)",
    title: "교차점 수렴률",
    description: "당신의 동서양 일치도",
  },
  {
    color: "var(--astro)",
    title: "아키타입",
    description: "3개 문명이 본 당신의 본질",
  },
  {
    color: "var(--saju)",
    title: "오행 밸런스",
    description: "木火土金水 에너지 분포",
  },
  {
    color: "var(--numero)",
    title: "직업/진로",
    description: "운명이 가리키는 방향",
  },
  {
    color: "var(--mbti)",
    title: "연애/관계",
    description: "사랑에 대한 교차 분석",
  },
  {
    color: "var(--tarot)",
    title: "인생 조언",
    description: "4개 체계가 전하는 메시지",
  },
];

const services = [
  {
    title: "궁합 분석",
    description: "두 사람의 교차점 비교",
    href: "/compatibility",
    color: "var(--astro)",
    icon: "compatibility",
  },
  {
    title: "오늘의 운세",
    description: "매일 달라지는 오행의 기운",
    href: "/daily",
    color: "var(--saju)",
    icon: "daily",
  },
  {
    title: "타로 리딩",
    description: "탄생 카드와 올해의 카드",
    href: "/tarot",
    color: "var(--tarot)",
    icon: "tarot",
  },
  {
    title: "관상 분석",
    description: "얼굴에서 읽는 오행",
    href: "/face",
    color: "var(--face)",
    icon: "face",
  },
];

const whyCards = [
  {
    title: "하나의 체계가 아닌, 교차 검증",
    description:
      "다른 앱은 사주 OR 별자리. DESTINO는 동시에.",
  },
  {
    title: "범용이 아닌, 개인화",
    description: "1,080가지 조합별 고유한 해석",
  },
  {
    title: "점술이 아닌, 분석",
    description: "수천 년의 데이터가 수렴하는 패턴",
  },
];

const systems = [
  { label: "사주", sub: "천간·지지·오행", color: "var(--saju)", icon: "saju" },
  { label: "서양 점성술", sub: "태양궁·상승궁·달궁", color: "var(--astro)", icon: "astro" },
  { label: "수비학", sub: "생명경로수·표현수", color: "var(--numero)", icon: "numero" },
  { label: "MBTI", sub: "16가지 성격 유형", color: "var(--mbti)", icon: "mbti" },
  { label: "관상", sub: "오관·오행 체형", color: "var(--face)", icon: "face" },
  { label: "타로", sub: "메이저 아르카나", color: "var(--tarot)", icon: "tarot" },
];

/* ━━━ Page ━━━ */

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      {/* ━━━ 1. Hero ━━━ */}
      <section
        className="w-full flex flex-col items-center px-6 pt-24 pb-24"
        style={{ background: "var(--bg-paper)" }}
      >
        <div className="w-full max-w-[440px] flex flex-col items-center text-center gap-6 animate-fade-up">
          <Seal size="lg" char="命" className="animate-seal-pop" />

          <p
            className="text-sm font-black tracking-[0.15em] uppercase"
            style={{
              color: "var(--ink-light)",
              fontFamily: "var(--font-display)",
            }}
          >
            DESTINO
          </p>

          <h1
            className="text-[36px] font-black leading-[1.2] tracking-[-0.02em]"
            style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
          >
            6개 문명이
            <br />
            내린 같은 답
          </h1>

          <p
            className="text-[15px] leading-[1.9]"
            style={{ color: "var(--ink-medium)" }}
          >
            사주명리학 3,000년, 서양 점성술 4,000년, 수비학 2,500년.
            <br />
            서로 다른 문명에서 독립적으로 발전한 운명 분석 체계들이
            <br />
            당신에 대해 같은 결론을 내리는 지점이 있습니다.
          </p>

          <div className="flex flex-col gap-3 w-full mt-2">
            <Link
              href="/analyze"
              className="w-full py-3.5 text-center text-[15px] font-bold tracking-wide rounded-lg transition-all hover:opacity-90 active:opacity-80"
              style={{
                background: "var(--seal)",
                color: "#fff",
                fontFamily: "var(--font-display)",
                boxShadow: "0 4px 16px rgba(197,61,67,0.25)",
              }}
            >
              무료로 분석하기
            </Link>
            <Link
              href="/compatibility"
              className="w-full py-3.5 text-center text-[15px] font-bold tracking-wide rounded-lg transition-colors"
              style={{
                border: "2px solid var(--ink)",
                color: "var(--ink)",
                background: "transparent",
                fontFamily: "var(--font-display)",
              }}
            >
              궁합 분석하기
            </Link>
          </div>
        </div>
      </section>

      {/* ━━━ 2. 교차점이란? ━━━ */}
      <section
        className="w-full flex flex-col items-center px-6 py-20"
        style={{ background: "var(--bg-white)" }}
      >
        <div className="w-full max-w-[440px]">
          <ScrollReveal>
            <p
              className="text-[11px] tracking-[0.1em] uppercase font-medium mb-4 flex items-center gap-2"
              style={{ color: "var(--ink-light)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "var(--seal)" }} />
              교차점이란
            </p>
            <h2
              className="text-[22px] font-black leading-[1.4] tracking-[-0.01em] mb-8"
              style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
            >
              서로 다른 문명이
              <br />
              같은 답을 내리는 지점
            </h2>
          </ScrollReveal>

          {/* Visual explainer: East ↔ Intersection ↔ West */}
          <ScrollReveal delay={100}>
            <div
              className="rounded-xl p-6"
              style={{
                background: "var(--bg-paper)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-stretch gap-0">
                {/* East */}
                <div className="flex-1 flex flex-col items-center text-center gap-2 py-3">
                  <p
                    className="text-[11px] tracking-[0.06em] uppercase font-medium"
                    style={{ color: "var(--saju)" }}
                  >
                    동양
                  </p>
                  <p
                    className="text-[20px] font-black"
                    style={{
                      fontFamily: "var(--font-display)",
                      color: "var(--ink)",
                    }}
                  >
                    甲木
                  </p>
                  <p
                    className="text-[12px]"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    사주 · 오행 木
                  </p>
                </div>

                {/* Center arrows + intersection */}
                <div className="flex flex-col items-center justify-center px-2 gap-1">
                  <span
                    className="text-[14px]"
                    style={{ color: "var(--ink-faint)" }}
                  >
                    &larr;
                  </span>
                  <span
                    className="text-[11px] font-bold px-2 py-1 rounded border-2"
                    style={{
                      borderColor: "var(--seal)",
                      color: "var(--seal)",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    교차점
                  </span>
                  <span
                    className="text-[14px]"
                    style={{ color: "var(--ink-faint)" }}
                  >
                    &rarr;
                  </span>
                </div>

                {/* West */}
                <div className="flex-1 flex flex-col items-center text-center gap-2 py-3">
                  <p
                    className="text-[11px] tracking-[0.06em] uppercase font-medium"
                    style={{ color: "var(--astro)" }}
                  >
                    서양
                  </p>
                  <p
                    className="text-[20px] font-black"
                    style={{
                      fontFamily: "var(--font-display)",
                      color: "var(--ink)",
                    }}
                  >
                    Water
                  </p>
                  <p
                    className="text-[12px]"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    게자리 · 수비학 7
                  </p>
                </div>
              </div>

              <div
                className="h-px mt-5 mb-4 opacity-15"
                style={{
                  background:
                    "repeating-linear-gradient(90deg, var(--ink) 0, var(--ink) 4px, transparent 4px, transparent 8px)",
                }}
              />

              <p
                className="text-[14px] leading-[1.8] text-center"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--ink-medium)",
                }}
              >
                서로 다른 언어로 같은 답을 내렸습니다
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ━━━ 3. 이렇게 분석합니다 ━━━ */}
      <section
        className="w-full flex flex-col items-center px-6 py-16"
        style={{ background: "var(--bg-warm)" }}
      >
        <div className="w-full max-w-[440px]">
          <ScrollReveal>
            <p
              className="text-[11px] tracking-[0.1em] uppercase font-medium mb-4 flex items-center gap-2"
              style={{ color: "var(--ink-light)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "var(--seal)" }} />
              분석 과정
            </p>
            <h2
              className="text-[22px] font-black leading-[1.4] tracking-[-0.01em] mb-8"
              style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
            >
              이렇게 분석합니다
            </h2>
          </ScrollReveal>

          <div className="flex flex-col gap-6">
            {howItWorksSteps.map(({ number, title, description }, i) => (
              <ScrollReveal key={number} delay={i * 80}>
                <div className="flex items-start gap-4">
                  <span
                    className="w-8 h-8 shrink-0 inline-flex items-center justify-center rounded-full text-[13px] font-bold"
                    style={{
                      background: "var(--bg-warm)",
                      color: "var(--ink-medium)",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {number}
                  </span>
                  <div className="flex flex-col gap-1 pt-0.5">
                    <span
                      className="text-[16px] font-bold"
                      style={{
                        fontFamily: "var(--font-display)",
                        color: "var(--ink)",
                      }}
                    >
                      {title}
                    </span>
                    <span
                      className="text-[14px]"
                      style={{ color: "var(--ink-muted)" }}
                    >
                      {description}
                    </span>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ 4. 무엇을 알 수 있나요? ━━━ */}
      <section
        className="w-full flex flex-col items-center px-6 py-20"
        style={{ background: "var(--bg-white)" }}
      >
        <div className="w-full max-w-[440px]">
          <ScrollReveal>
            <p
              className="text-[11px] tracking-[0.1em] uppercase font-medium mb-4 flex items-center gap-2"
              style={{ color: "var(--ink-light)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "var(--seal)" }} />
              리포트 구성
            </p>
            <h2
              className="text-[22px] font-black leading-[1.4] tracking-[-0.01em] mb-8"
              style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
            >
              무엇을 알 수 있나요?
            </h2>
          </ScrollReveal>

          <div className="flex flex-col gap-3">
            {reportCards.map(({ color, title, description }, i) => (
              <ScrollReveal key={title} delay={i * 60}>
                <div
                  className="rounded-lg px-5 py-4 flex items-start gap-4"
                  style={{
                    background: "var(--bg-paper)",
                    borderLeft: `3px solid ${color}`,
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[15px] font-bold leading-[1.4] mb-1"
                      style={{
                        fontFamily: "var(--font-display)",
                        color: "var(--ink)",
                      }}
                    >
                      {title}
                    </p>
                    <p
                      className="text-[13px] leading-[1.6]"
                      style={{ color: "var(--ink-muted)" }}
                    >
                      {description}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ 5. 추가 서비스 ━━━ */}
      <section
        className="w-full flex flex-col items-center px-6 py-16"
        style={{ background: "var(--bg-paper)" }}
      >
        <div className="w-full max-w-[440px]">
          <ScrollReveal>
            <p
              className="text-[11px] tracking-[0.1em] uppercase font-medium mb-4 flex items-center gap-2"
              style={{ color: "var(--ink-light)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "var(--seal)" }} />
              더 알아보기
            </p>
            <h2
              className="text-[22px] font-black leading-[1.4] tracking-[-0.01em] mb-8"
              style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
            >
              추가 서비스
            </h2>
          </ScrollReveal>

          <div className="flex flex-col gap-3">
            {services.map(({ title, description, href, color, icon }, i) => (
              <ScrollReveal key={title} delay={i * 60}>
                <Link
                  href={href}
                  className="flex items-center gap-4 rounded-lg px-5 py-4 hover-lift h-full group"
                  style={{
                    background: "var(--bg-white)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <span className="shrink-0">
                    <ServiceIcon type={icon} color={color} />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span
                      className="text-[15px] font-bold block"
                      style={{
                        fontFamily: "var(--font-display)",
                        color: "var(--ink)",
                      }}
                    >
                      {title}
                    </span>
                    <span
                      className="text-[13px] leading-[1.6] block mt-0.5"
                      style={{ color: "var(--ink-muted)" }}
                    >
                      {description}
                    </span>
                  </span>
                  <span
                    className="text-[16px] shrink-0 transition-transform group-hover:translate-x-1"
                    style={{ color: "var(--ink-faint)" }}
                  >
                    &rarr;
                  </span>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ 6. 왜 DESTINO인가? ━━━ */}
      <section
        className="w-full flex flex-col items-center px-6 py-20"
        style={{ background: "var(--bg-white)" }}
      >
        <div className="w-full max-w-[440px]">
          <ScrollReveal>
            <p
              className="text-[11px] tracking-[0.1em] uppercase font-medium mb-4 flex items-center gap-2"
              style={{ color: "var(--ink-light)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "var(--seal)" }} />
              WHY DESTINO
            </p>
            <h2
              className="text-[22px] font-black leading-[1.4] tracking-[-0.01em] mb-8"
              style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
            >
              왜 DESTINO인가?
            </h2>
          </ScrollReveal>

          <div className="flex flex-col gap-4">
            {whyCards.map(({ title, description }, i) => (
              <ScrollReveal key={title} delay={i * 80}>
                <div
                  className="rounded-lg p-5 hover-lift"
                  style={{
                    background: "var(--bg-paper)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <p
                    className="text-[16px] font-bold leading-[1.5] mb-2"
                    style={{
                      fontFamily: "var(--font-display)",
                      color: "var(--ink)",
                    }}
                  >
                    {title}
                  </p>
                  <p
                    className="text-[14px] leading-[1.8]"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    {description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ 7. 분석 체계 그리드 ━━━ */}
      <section
        className="w-full flex flex-col items-center px-6 py-16"
        style={{ background: "var(--bg-paper)" }}
      >
        <div className="w-full max-w-[440px]">
          <ScrollReveal>
            <p
              className="text-[11px] tracking-[0.1em] uppercase font-medium mb-4 flex items-center gap-2"
              style={{ color: "var(--ink-light)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "var(--seal)" }} />
              분석 체계
            </p>
            <h2
              className="text-[22px] font-black leading-[1.4] tracking-[-0.01em] mb-8"
              style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
            >
              6개 문명의 지혜
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-2 gap-3">
            {systems.map(({ label, sub, color, icon }, i) => (
              <ScrollReveal key={label} delay={i * 50}>
                <div
                  className="rounded-lg p-4 hover-lift"
                  style={{
                    background: "var(--bg-white)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div className="mb-1">
                    <SystemIcon type={icon} color={color} />
                  </div>
                  <div
                    className="text-sm font-bold"
                    style={{
                      color: "var(--ink)",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {label}
                  </div>
                  <div
                    className="text-[12px] mt-0.5"
                    style={{ color: "var(--ink-light)" }}
                  >
                    {sub}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ 8. CTA 반복 ━━━ */}
      <section
        className="w-full flex flex-col items-center px-6 py-20"
        style={{ background: "var(--bg-white)" }}
      >
        <ScrollReveal>
          <div className="w-full max-w-[440px] flex flex-col items-center text-center gap-6">
            <Seal size="lg" char="命" />
            <p
              className="text-[20px] font-black leading-[1.5]"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--ink)",
              }}
            >
              지금 무료로 분석해보세요
            </p>
            <p
              className="text-[15px] leading-[1.8]"
              style={{ color: "var(--ink-muted)" }}
            >
              생년월일만 입력하면, 30초 안에
              <br />
              당신의 교차점을 발견합니다.
            </p>
            <Link
              href="/analyze"
              className="w-full max-w-[320px] py-3.5 text-center text-[15px] font-bold tracking-wide rounded-lg transition-all hover:opacity-90 active:opacity-80"
              style={{
                background: "var(--seal)",
                color: "#fff",
                fontFamily: "var(--font-display)",
                boxShadow: "0 4px 16px rgba(197,61,67,0.25)",
              }}
            >
              무료로 분석하기
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* ━━━ 9. Footer ━━━ */}
      <section
        className="w-full flex flex-col items-center px-6 py-8"
        style={{ background: "var(--bg-paper)" }}
      >
        <footer
          className="w-full max-w-[440px] text-center flex flex-col gap-4 py-4"
          style={{ color: "var(--ink-light)" }}
        >
          <p
            className="text-[11px] tracking-[0.1em] uppercase font-medium"
            style={{ fontFamily: "var(--font-display)" }}
          >
            DESTINO
          </p>
          <div
            className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-[13px]"
            style={{ color: "var(--ink-light)" }}
          >
            <Link href="/analyze" className="py-3 hover:underline">
              교차 분석
            </Link>
            <Link href="/compatibility" className="py-3 hover:underline">
              궁합 분석
            </Link>
            <Link href="/daily" className="py-3 hover:underline">
              오늘의 운세
            </Link>
            <Link href="/tarot" className="py-3 hover:underline">
              타로
            </Link>
            <a href="mailto:hello@destino.me" className="py-3 hover:underline">
              문의
            </a>
          </div>
          <div
            className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-[13px]"
            style={{ color: "var(--ink-faint)" }}
          >
            <Link href="/about" className="py-3 hover:underline">
              분석 방법론
            </Link>
            <Link href="/terms" className="py-3 hover:underline">
              이용약관
            </Link>
            <Link href="/privacy" className="py-3 hover:underline">
              개인정보처리방침
            </Link>
          </div>
          <p className="text-[13px]" style={{ color: "var(--ink-faint)" }}>
            &copy; {new Date().getFullYear()} DESTINO. All rights reserved.
          </p>
        </footer>
      </section>
    </main>
  );
}
