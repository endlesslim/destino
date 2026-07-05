"use client";

import Link from "next/link";
import Seal from "@/components/ui/Seal";
import Divider from "@/components/ui/Divider";
import ScrollReveal from "@/components/ScrollReveal";
import { StarIcon, TwinMoonsIcon, SunIcon, PentagramIcon, EyeIcon, SajuIcon, AstroIcon, NumeroIcon, MBTIIcon, FaceIcon, TarotIcon, SystemIcon, ServiceIcon } from "@/components/ui/SystemIcons";

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
    title: "결혼 궁합",
    description: "결혼 5대 차원 심화 분석",
    href: "/marriage",
    color: "var(--seal)",
    icon: "marriage",
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
    title: "자미두수",
    description: "명궁과 14주성이 그리는 명반",
    href: "/ziwei",
    color: "var(--saju)",
    icon: "saju",
  },
  {
    title: "커리어 심화",
    description: "TOP 5 추천 직업과 업무 성향",
    href: "/career",
    color: "var(--saju)",
    icon: "career",
  },
  {
    title: "연애 심화",
    description: "이상형과 연애 패턴 분석",
    href: "/love",
    color: "var(--seal)",
    icon: "love",
  },
  {
    title: "AI 상담",
    description: "분석 후 이용 가능 — 1:1 맞춤 상담",
    href: "/analyze",
    color: "var(--seal)",
    icon: "chat",
  },
  {
    title: "가족 분석",
    description: "가족 구성원의 관계 역학",
    href: "/family",
    color: "var(--saju)",
    icon: "compatibility",
  },
  {
    title: "이름 풀이",
    description: "획수와 오행으로 보는 이름",
    href: "/name-analysis",
    color: "var(--numero)",
    icon: "default",
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
  { label: "자미두수", sub: "명궁·14주성 명반", color: "var(--saju)", icon: "saju" },
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
            className="text-[46px] font-black leading-[1.15] tracking-[-0.02em]"
            style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
          >
            사주도 별자리도
            <br />
            <span style={{ color: "var(--seal)" }}>같은 답</span>이라면
          </h1>

          <p
            className="text-[15px] leading-[1.9] text-pretty max-w-[340px]"
            style={{ color: "var(--ink-medium)" }}
          >
            사주명리학 3,000년, 서양 점성술 4,000년, 수비학 2,500년.
            서로 다른 문명에서 독립적으로 발전한 운명 분석 체계들이
            당신에 대해 같은 결론을 내리는 지점이 있습니다.
          </p>

          <div className="flex flex-col gap-3 w-full mt-2">
            <Link
              href="/analyze"
              className="w-full py-3.5 text-center text-[15px] font-bold tracking-wide rounded-lg btn-stamp"
              style={{
                background: "var(--seal)",
                color: "#fff",
                fontFamily: "var(--font-display)",
                boxShadow: "0 4px 16px var(--shadow-btn)",
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

          {/* Scroll indicator */}
          <div className="flex justify-center mt-8 animate-bounce" style={{ opacity: 0.3 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12l7 7 7-7" stroke="var(--ink-light)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
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
              여섯 가지 운명 풀이
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
                boxShadow: "0 4px 16px var(--shadow-btn)",
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
