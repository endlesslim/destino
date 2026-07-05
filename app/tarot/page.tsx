"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Divider from "@/components/ui/Divider";
import Button from "@/components/ui/Button";
import ScrollReveal from "@/components/ScrollReveal";
import Seal from "@/components/ui/Seal";
import TarotCardVisual from "@/components/TarotCardVisual";
import Footer from "@/components/Footer";
import {
  generateTarotReading,
  toRomanNumeral,
  drawDailySpread,
  type TarotCard,
  type TarotReading,
} from "@/lib/tarot";

// ━━━ 타로 카드 비주얼 (wrapper) ━━━

function CardVisual({
  card,
  size = "lg",
}: {
  card: TarotCard;
  size?: "lg" | "sm";
}) {
  // Map "sm" to "md" for TarotCardVisual
  const visualSize = size === "lg" ? "lg" : "md";
  // Slight random-feeling rotation based on card number
  const rotation = card.number % 2 === 0 ? -0.8 : 0.7;

  return (
    <div
      style={{
        transform: `rotate(${rotation}deg)`,
        filter: "drop-shadow(0 4px 12px var(--shadow-lift)) drop-shadow(0 1px 3px var(--shadow-lift))",
        transition: "transform 0.3s ease",
      }}
    >
      <TarotCardVisual
        number={card.number}
        name={card.name}
        nameEn={card.nameEn}
        element={card.element}
        size={visualSize}
      />
    </div>
  );
}

// ━━━ 키워드 칩 ━━━

function KeywordChips({
  label,
  keywords,
  color,
}: {
  label: string;
  keywords: string[];
  color: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span
        className="text-[10px] tracking-[0.1em] uppercase font-medium"
        style={{ color: "var(--ink-light)" }}
      >
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {keywords.map((kw) => (
          <span
            key={kw}
            className="text-[12px] font-medium px-3 py-1.5 rounded-full"
            style={{
              background: "var(--bg-white)",
              border: `1px solid ${color}`,
              color,
            }}
          >
            {kw}
          </span>
        ))}
      </div>
    </div>
  );
}

// ━━━ 카드 상세 섹션 ━━━

function CardSection({
  sectionLabel,
  sectionSub,
  card,
  cardSize,
  delay,
}: {
  sectionLabel: string;
  sectionSub: string;
  card: TarotCard;
  cardSize: "lg" | "sm";
  delay: number;
}) {
  return (
    <>
      <ScrollReveal delay={delay}>
        <div className="flex flex-col gap-2">
          <p
            className="text-[11px] tracking-[0.1em] uppercase font-medium"
            style={{ color: "var(--tarot)" }}
          >
            {sectionLabel}
          </p>
          <p
            className="text-[13px]"
            style={{ color: "var(--ink-muted)" }}
          >
            {sectionSub}
          </p>
        </div>
      </ScrollReveal>

      {/* Card visual */}
      <ScrollReveal delay={delay + 80}>
        <div className="flex justify-center">
          <CardVisual card={card} size={cardSize} />
        </div>
      </ScrollReveal>

      {/* Keywords */}
      <ScrollReveal delay={delay + 160}>
        <div className="flex flex-col gap-4">
          <KeywordChips
            label="정방향"
            keywords={card.upright}
            color="var(--tarot)"
          />
          <KeywordChips
            label="역방향"
            keywords={card.reversed}
            color="var(--ink-light)"
          />
        </div>
      </ScrollReveal>

      {/* Interpretation */}
      <ScrollReveal delay={delay + 240}>
        <blockquote
          className="border-l-2 pl-4 py-2"
          style={{ borderColor: "var(--tarot)" }}
        >
          <p
            className="text-[14px] leading-[1.9]"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--ink-medium)",
            }}
          >
            {card.description}
          </p>
        </blockquote>
      </ScrollReveal>

      {/* Advice */}
      <ScrollReveal delay={delay + 320}>
        <div
          className="rounded-lg p-5 flex flex-col gap-2"
          style={{
            background: "var(--bg-white)",
            border: "1px solid var(--border)",
          }}
        >
          <p
            className="text-[11px] tracking-[0.1em] uppercase font-medium"
            style={{ color: "var(--ink-light)" }}
          >
            조언
          </p>
          <p
            className="text-[14px] leading-[1.8]"
            style={{ color: "var(--ink-muted)" }}
          >
            {card.advice}
          </p>
        </div>
      </ScrollReveal>

      {/* Saju connection */}
      <ScrollReveal delay={delay + 400}>
        <div
          className="rounded-lg p-5 flex flex-col gap-2"
          style={{
            background: "var(--bg-warm)",
            border: "1px solid var(--border)",
          }}
        >
          <p
            className="text-[11px] tracking-[0.1em] uppercase font-medium"
            style={{ color: "var(--saju)" }}
          >
            사주 연결
          </p>
          <p
            className="text-[13px] leading-[1.8]"
            style={{ color: "var(--ink-muted)" }}
          >
            {card.sajuConnection}
          </p>
        </div>
      </ScrollReveal>
    </>
  );
}

// ━━━ 입력 섹션 ━━━

function InputSection({
  birthYear,
  birthMonth,
  birthDay,
  onYearChange,
  onMonthChange,
  onDayChange,
  onSubmit,
}: {
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  onYearChange: (v: string) => void;
  onMonthChange: (v: string) => void;
  onDayChange: (v: string) => void;
  onSubmit: () => void;
}) {
  const inputStyle = {
    background: "var(--bg-white)",
    border: "1px solid var(--border)",
    color: "var(--ink)",
    fontFamily: "var(--font-body)",
  };

  return (
    <section className="flex flex-col gap-6 animate-fade-up">
      <div className="flex flex-col items-center gap-4 text-center">
        <Seal size="lg" char="卜" className="animate-seal-pop" />
        <h1
          className="text-[28px] font-black leading-[1.3] tracking-[-0.01em]"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--ink)",
          }}
        >
          타로 카드 리딩
        </h1>
        <p
          className="text-[15px] leading-[1.8]"
          style={{ color: "var(--ink-muted)" }}
        >
          생년월일로 당신의 탄생 카드와
          <br />
          올해의 카드를 읽어드립니다
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <p
          className="text-[11px] tracking-[0.1em] uppercase font-medium"
          style={{ color: "var(--ink-light)" }}
        >
          생년월일
        </p>
        <div className="grid grid-cols-3 gap-3">
          <input
            type="number"
            placeholder="1990"
            value={birthYear}
            onChange={(e) => onYearChange(e.target.value)}
            className="rounded-md px-3 py-3 text-[15px] text-center outline-none focus:ring-1"
            style={{
              ...inputStyle,
              ["--tw-ring-color" as string]: "var(--tarot)",
            }}
            min={1920}
            max={new Date().getFullYear()}
          />
          <input
            type="number"
            placeholder="1"
            value={birthMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="rounded-md px-3 py-3 text-[15px] text-center outline-none focus:ring-1"
            style={{
              ...inputStyle,
              ["--tw-ring-color" as string]: "var(--tarot)",
            }}
            min={1}
            max={12}
          />
          <input
            type="number"
            placeholder="15"
            value={birthDay}
            onChange={(e) => onDayChange(e.target.value)}
            className="rounded-md px-3 py-3 text-[15px] text-center outline-none focus:ring-1"
            style={{
              ...inputStyle,
              ["--tw-ring-color" as string]: "var(--tarot)",
            }}
            min={1}
            max={31}
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <span
            className="text-[11px] text-center"
            style={{ color: "var(--ink-faint)" }}
          >
            년
          </span>
          <span
            className="text-[11px] text-center"
            style={{ color: "var(--ink-faint)" }}
          >
            월
          </span>
          <span
            className="text-[11px] text-center"
            style={{ color: "var(--ink-faint)" }}
          >
            일
          </span>
        </div>
      </div>

      <Button onClick={onSubmit}>타로 카드 리딩 시작</Button>
    </section>
  );
}

// ━━━ 결과 표시 ━━━

/** 78장 풀덱 기반 오늘의 3카드 스프레드 (과거·현재·미래) */
function DailySpreadSection({ birth }: { birth: { year: number; month: number; day: number } }) {
  const [spread, setSpread] = useState<ReturnType<typeof drawDailySpread> | null>(null);

  useEffect(() => {
    // 오늘 날짜는 클라이언트에서 결정 (하이드레이션 불일치 방지)
    const todayISO = new Date().toISOString().slice(0, 10);
    setSpread(drawDailySpread(birth.year, birth.month, birth.day, todayISO));
  }, [birth.year, birth.month, birth.day]);

  if (!spread) return null;

  const positions = [
    { label: "과거", sub: "지나온 흐름", card: spread.past, reversed: spread.isReversed[0] },
    { label: "현재", sub: "지금의 에너지", card: spread.present, reversed: spread.isReversed[1] },
    { label: "미래", sub: "다가올 방향", card: spread.future, reversed: spread.isReversed[2] },
  ];

  return (
    <ScrollReveal delay={200}>
      <div className="flex flex-col gap-4">
        <div className="text-center">
          <p className="text-[11px] tracking-[0.1em] uppercase font-medium mb-1" style={{ color: "var(--tarot)" }}>
            TODAY&apos;S SPREAD — 78장 풀덱
          </p>
          <p className="text-[13px]" style={{ color: "var(--ink-muted)" }}>
            메이저·마이너 아르카나 78장 전체에서 뽑은 오늘의 세 장입니다. 매일 자정에 바뀝니다.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {positions.map((p) => (
            <div
              key={p.label}
              className="rounded-xl p-3 text-center flex flex-col gap-1.5"
              style={{ background: "var(--bg-white)", border: "1.5px solid var(--border)" }}
            >
              <span className="text-[11px] font-bold" style={{ color: "var(--tarot)" }}>{p.label}</span>
              <span className="text-[10px]" style={{ color: "var(--ink-faint)" }}>{p.sub}</span>
              <span className="text-[15px] font-black leading-tight" style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}>
                {p.card.name}
              </span>
              <span className="text-[10px]" style={{ color: p.reversed ? "var(--seal)" : "var(--ink-light)" }}>
                {p.reversed ? "역방향" : "정방향"}
              </span>
              <p className="text-[11px] leading-[1.6] text-left" style={{ color: "var(--ink-muted)" }}>
                {(p.reversed ? p.card.reversed : p.card.upright).slice(0, 3).join(" · ")}
              </p>
            </div>
          ))}
        </div>
        <div
          className="rounded-lg p-4 text-[13px] leading-[1.8]"
          style={{ background: "var(--bg-warm)", color: "var(--ink-muted)" }}
        >
          <span className="font-bold" style={{ color: "var(--ink-medium)" }}>오늘의 중심 — {spread.present.name}{spread.isReversed[1] ? " (역방향)" : ""}: </span>
          {spread.present.description}
        </div>
      </div>
    </ScrollReveal>
  );
}

function ReadingDisplay({ reading, birth }: { reading: TarotReading; birth?: { year: number; month: number; day: number } }) {
  const [copied, setCopied] = useState(false);

  function handleShare() {
    const text = `[DESTINO 타로] 내 탄생 카드: ${reading.birthCard.name} (${reading.birthCard.nameEn}) / 올해의 카드: ${reading.yearCard.name} (${reading.yearCard.nameEn})`;
    if (navigator.share) {
      navigator.share({ title: "DESTINO 타로 리딩", text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(text + "\n" + window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* 오늘의 3카드 — 78장 풀덱 */}
      {birth && <DailySpreadSection birth={birth} />}

      {birth && <Divider />}

      {/* Birth Card */}
      <CardSection
        sectionLabel="BIRTH CARD"
        sectionSub="당신의 생년월일이 가리키는 탄생 카드입니다. 이 카드는 평생 당신과 함께하는 원형적 에너지를 나타냅니다."
        card={reading.birthCard}
        cardSize="lg"
        delay={0}
      />

      <Divider />

      {/* Year Card */}
      <CardSection
        sectionLabel="2026 YEAR CARD"
        sectionSub="올해 당신에게 영향을 미치는 에너지입니다. 한 해의 주제와 과제를 담고 있습니다."
        card={reading.yearCard}
        cardSize="sm"
        delay={500}
      />

      <Divider />

      {/* Cross-system message */}
      <ScrollReveal delay={1000}>
        <div
          className="rounded-lg p-5 flex flex-col gap-3 relative overflow-hidden"
          style={{
            background: "var(--bg-white)",
            border: "1.5px solid var(--tarot)",
          }}
        >
          <div className="absolute top-3 right-3 opacity-15">
            <Seal size="sm" char="卜" />
          </div>
          <p
            className="text-[11px] tracking-[0.1em] uppercase font-medium"
            style={{ color: "var(--tarot)" }}
          >
            CROSS-SYSTEM MESSAGE
          </p>
          <p
            className="text-[14px] leading-[1.9]"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--ink-medium)",
            }}
          >
            {reading.crossMessage}
          </p>
        </div>
      </ScrollReveal>

      <Divider />

      {/* Share & actions */}
      <ScrollReveal delay={1100}>
        <div className="flex flex-col gap-3">
          <button
            onClick={handleShare}
            className="w-full py-3.5 text-[14px] font-bold rounded-lg border-2 cursor-pointer transition-opacity hover:opacity-80"
            style={{
              borderColor: "var(--tarot)",
              color: "var(--tarot)",
              background: "transparent",
              fontFamily: "var(--font-display)",
            }}
          >
            {copied ? "복사 완료" : "결과 공유하기"}
          </button>
          <Link
            href="/analyze"
            className="w-full py-3.5 text-[14px] font-bold rounded-lg text-center no-underline transition-opacity hover:opacity-80"
            style={{
              background: "var(--seal)",
              color: "#fff",
              fontFamily: "var(--font-display)",
              boxShadow: "0 4px 16px var(--shadow-btn)",
            }}
          >
            교차 분석도 해보기
          </Link>
        </div>
      </ScrollReveal>
    </div>
  );
}

// ━━━ 메인 페이지 ━━━

export default function TarotPage() {
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [reading, setReading] = useState<TarotReading | null>(null);
  const [hasSaved, setHasSaved] = useState(false);

  // localStorage에서 저장된 프로필 로드
  useEffect(() => {
    const saved =
      localStorage.getItem("destino_daily_birth") ||
      localStorage.getItem("destino_my_info");
    if (saved) {
      try {
        const { year, month, day } = JSON.parse(saved);
        setBirthYear(String(year));
        setBirthMonth(String(month));
        setBirthDay(String(day));
        setHasSaved(true);

        // Auto-generate reading
        const result = generateTarotReading(year, month, day);
        setReading(result);
      } catch {
        // Ignore bad data
      }
    }
  }, []);

  function handleSubmit() {
    const y = parseInt(birthYear);
    const m = parseInt(birthMonth);
    const d = parseInt(birthDay);

    if (
      !y ||
      !m ||
      !d ||
      y < 1920 ||
      y > new Date().getFullYear() ||
      m < 1 ||
      m > 12 ||
      d < 1 ||
      d > 31
    ) {
      return;
    }

    // Save to localStorage
    localStorage.setItem(
      "destino_daily_birth",
      JSON.stringify({ year: y, month: m, day: d })
    );
    setHasSaved(true);

    const result = generateTarotReading(y, m, d);
    setReading(result);
  }

  function handleReset() {
    setReading(null);
    setHasSaved(false);
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center px-6 pb-12"
      style={{ background: "var(--bg-paper)" }}
    >
      <Nav />
      <div className="w-full max-w-[440px] flex flex-col gap-8 pt-16">
        {/* Reset button */}
        {hasSaved && (
          <div className="flex justify-end -mb-4">
            <button
              onClick={handleReset}
              className="text-[12px] font-medium hover:underline cursor-pointer"
              style={{ color: "var(--ink-faint)" }}
            >
              다시 리딩하기
            </button>
          </div>
        )}

        <Divider />

        {/* Input or result */}
        {!reading ? (
          <InputSection
            birthYear={birthYear}
            birthMonth={birthMonth}
            birthDay={birthDay}
            onYearChange={setBirthYear}
            onMonthChange={setBirthMonth}
            onDayChange={setBirthDay}
            onSubmit={handleSubmit}
          />
        ) : (
          <ReadingDisplay
            reading={reading}
            birth={
              birthYear && birthMonth && birthDay
                ? { year: parseInt(birthYear), month: parseInt(birthMonth), day: parseInt(birthDay) }
                : undefined
            }
          />
        )}

        <Footer />
      </div>
    </main>
  );
}
