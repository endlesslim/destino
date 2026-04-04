"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Divider from "@/components/ui/Divider";
import Button from "@/components/ui/Button";
import ScrollReveal from "@/components/ScrollReveal";
import Seal from "@/components/ui/Seal";
import { analyzeLove, type LoveAnalysis } from "@/lib/love-analysis";

// ━━━ 칩 컴포넌트 ━━━

function Chip({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="text-[12px] font-medium px-3 py-1.5 rounded-full"
      style={{
        background: "var(--bg-white)",
        border: `1px solid ${color}`,
        color,
      }}
    >
      {label}
    </span>
  );
}

// ━━━ 월 배지 ━━━

function MonthBadge({ month }: { month: number }) {
  return (
    <span
      className="inline-flex items-center justify-center w-10 h-10 rounded-full text-[14px] font-bold"
      style={{
        background: "var(--seal-bg)",
        color: "var(--seal)",
        border: "1.5px solid var(--seal)",
      }}
    >
      {month}월
    </span>
  );
}

// ━━━ 패턴 카드 ━━━

function PatternCard({
  label,
  title,
  text,
  delay,
}: {
  label: string;
  title: string;
  text: string;
  delay: number;
}) {
  return (
    <ScrollReveal delay={delay}>
      <div
        className="rounded-lg p-5 flex flex-col gap-2"
        style={{ background: "var(--bg-white)", border: "1px solid var(--border)" }}
      >
        <p
          className="text-[11px] tracking-[0.08em] uppercase font-medium"
          style={{ color: "var(--seal)" }}
        >
          {label}
        </p>
        <p className="text-[14px] font-bold" style={{ color: "var(--ink)" }}>
          {title}
        </p>
        <p className="text-[13px] leading-[1.8]" style={{ color: "var(--ink-muted)" }}>
          {text}
        </p>
      </div>
    </ScrollReveal>
  );
}

// ━━━ 플래그 아이템 ━━━

function FlagItem({ text, type }: { text: string; type: "red" | "green" }) {
  const color = type === "red" ? "var(--seal)" : "var(--saju)";
  return (
    <div className="flex items-start gap-2.5 py-1.5">
      <span
        className="mt-1.5 w-2 h-2 rounded-full shrink-0"
        style={{ background: color }}
      />
      <p className="text-[13px] leading-[1.7]" style={{ color: "var(--ink-muted)" }}>
        {text}
      </p>
    </div>
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
        <Seal size="lg" char="緣" className="animate-seal-pop" />
        <h1
          className="text-[28px] font-black leading-[1.3] tracking-[-0.01em]"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          연애 심화 분석
        </h1>
        <p
          className="text-[15px] leading-[1.8]"
          style={{ color: "var(--ink-muted)" }}
        >
          사주 · 별자리 · 수비학 · MBTI가
          <br />
          말하는 당신의 사랑 이야기
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
            style={{ ...inputStyle, ["--tw-ring-color" as string]: "var(--seal)" }}
            min={1920}
            max={2025}
          />
          <input
            type="number"
            placeholder="1"
            value={birthMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="rounded-md px-3 py-3 text-[15px] text-center outline-none focus:ring-1"
            style={{ ...inputStyle, ["--tw-ring-color" as string]: "var(--seal)" }}
            min={1}
            max={12}
          />
          <input
            type="number"
            placeholder="15"
            value={birthDay}
            onChange={(e) => onDayChange(e.target.value)}
            className="rounded-md px-3 py-3 text-[15px] text-center outline-none focus:ring-1"
            style={{ ...inputStyle, ["--tw-ring-color" as string]: "var(--seal)" }}
            min={1}
            max={31}
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <span className="text-[11px] text-center" style={{ color: "var(--ink-faint)" }}>년</span>
          <span className="text-[11px] text-center" style={{ color: "var(--ink-faint)" }}>월</span>
          <span className="text-[11px] text-center" style={{ color: "var(--ink-faint)" }}>일</span>
        </div>
      </div>

      <Button onClick={onSubmit}>연애 분석 시작</Button>
    </section>
  );
}

// ━━━ 결과 표시 ━━━

function ResultDisplay({ result }: { result: LoveAnalysis }) {
  return (
    <div className="flex flex-col gap-8">
      {/* Love Type */}
      <ScrollReveal delay={0}>
        <div
          className="rounded-xl p-6 relative overflow-hidden"
          style={{ background: "var(--bg-white)", border: "1.5px solid var(--seal)" }}
        >
          <div className="absolute top-3 right-3 opacity-15">
            <Seal size="sm" char="緣" />
          </div>
          <p
            className="text-[11px] tracking-[0.1em] uppercase font-medium mb-2"
            style={{ color: "var(--seal)" }}
          >
            LOVE TYPE
          </p>
          <h2
            className="text-[22px] font-black mb-3"
            style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
          >
            {result.loveType}
          </h2>
          <p
            className="text-[14px] leading-[1.9]"
            style={{ color: "var(--ink-medium)" }}
          >
            {result.loveTypeDesc}
          </p>
        </div>
      </ScrollReveal>

      <Divider />

      {/* 나의 이상형 */}
      <ScrollReveal delay={200}>
        <p
          className="text-[11px] tracking-[0.1em] uppercase font-medium mb-1"
          style={{ color: "var(--ink-light)" }}
        >
          IDEAL PARTNER
        </p>
        <p
          className="text-[13px] mb-4"
          style={{ color: "var(--ink-muted)" }}
        >
          나의 이상형 교차 분석
        </p>
      </ScrollReveal>

      <ScrollReveal delay={280}>
        <div
          className="rounded-lg p-5 flex flex-col gap-4"
          style={{ background: "var(--bg-white)", border: "1px solid var(--border)" }}
        >
          {/* 사주 기반 */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] tracking-[0.08em] uppercase font-medium" style={{ color: "var(--saju)" }}>
              사주 궁합
            </span>
            <p className="text-[13px] leading-[1.8]" style={{ color: "var(--ink-muted)" }}>
              {result.idealPartner.saju}
            </p>
          </div>

          {/* 별자리 */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] tracking-[0.08em] uppercase font-medium" style={{ color: "var(--astro)" }}>
              잘 맞는 별자리
            </span>
            <div className="flex flex-wrap gap-2">
              {result.idealPartner.zodiac.map((z) => (
                <Chip key={z} label={z} color="var(--astro)" />
              ))}
            </div>
          </div>

          {/* MBTI */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] tracking-[0.08em] uppercase font-medium" style={{ color: "var(--mbti)" }}>
              잘 맞는 MBTI
            </span>
            <div className="flex flex-wrap gap-2">
              {result.idealPartner.mbti.map((m) => (
                <Chip key={m} label={m} color="var(--mbti)" />
              ))}
            </div>
          </div>

          {/* 종합 파트너 설명 */}
          <div className="flex flex-col gap-2 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
            <span className="text-[11px] tracking-[0.08em] uppercase font-medium" style={{ color: "var(--ink-light)" }}>
              종합 파트너상
            </span>
            <p className="text-[13px] leading-[1.8]" style={{ color: "var(--ink-muted)" }}>
              {result.idealPartner.personality}
            </p>
          </div>
        </div>
      </ScrollReveal>

      <Divider />

      {/* Love Pattern 4 Cards */}
      <ScrollReveal delay={500}>
        <p
          className="text-[11px] tracking-[0.1em] uppercase font-medium mb-1"
          style={{ color: "var(--ink-light)" }}
        >
          LOVE PATTERN
        </p>
        <p
          className="text-[13px] mb-4"
          style={{ color: "var(--ink-muted)" }}
        >
          당신의 연애 패턴 분석
        </p>
      </ScrollReveal>

      <PatternCard
        label="끌리는 포인트"
        title="어떤 사람에게 마음이 가나요?"
        text={result.lovePattern.attraction}
        delay={560}
      />
      <PatternCard
        label="사랑 표현 방식"
        title="사랑을 어떻게 표현하나요?"
        text={result.lovePattern.expression}
        delay={640}
      />
      <PatternCard
        label="갈등 패턴"
        title="어떤 상황에서 부딪히나요?"
        text={result.lovePattern.conflict}
        delay={720}
      />
      <PatternCard
        label="성장 방향"
        title="관계에서 어떻게 성장하나요?"
        text={result.lovePattern.growth}
        delay={800}
      />

      <Divider />

      {/* Current Year Love Forecast */}
      <ScrollReveal delay={900}>
        <div
          className="rounded-xl p-5 flex flex-col gap-3 relative overflow-hidden"
          style={{ background: "var(--bg-white)", border: "1.5px solid var(--seal)" }}
        >
          <div className="absolute top-3 right-3 opacity-15">
            <Seal size="sm" char="愛" />
          </div>
          <p
            className="text-[11px] tracking-[0.1em] uppercase font-medium"
            style={{ color: "var(--seal)" }}
          >
            {new Date().getFullYear()} LOVE FORECAST
          </p>
          <p
            className="text-[14px] leading-[1.9]"
            style={{ fontFamily: "var(--font-display)", color: "var(--ink-medium)" }}
          >
            {result.currentYearLove}
          </p>
        </div>
      </ScrollReveal>

      {/* Best Love Months */}
      <ScrollReveal delay={980}>
        <div
          className="rounded-lg p-5 flex flex-col gap-3"
          style={{ background: "var(--bg-warm)", border: "1px solid var(--border)" }}
        >
          <p
            className="text-[11px] tracking-[0.1em] uppercase font-medium"
            style={{ color: "var(--ink-light)" }}
          >
            인연을 만나기 좋은 달
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            {result.bestLoveMonths.map((m) => (
              <MonthBadge key={m} month={m} />
            ))}
          </div>
          <p className="text-[12px] leading-[1.6]" style={{ color: "var(--ink-muted)" }}>
            새로운 만남이나 관계 발전에 유리한 시기입니다
          </p>
        </div>
      </ScrollReveal>

      <Divider />

      {/* Red Flags / Green Flags */}
      <ScrollReveal delay={1060}>
        <p
          className="text-[11px] tracking-[0.1em] uppercase font-medium mb-1"
          style={{ color: "var(--ink-light)" }}
        >
          RELATIONSHIP SIGNALS
        </p>
        <p
          className="text-[13px] mb-4"
          style={{ color: "var(--ink-muted)" }}
        >
          당신에게 맞는 관계 신호
        </p>
      </ScrollReveal>

      <ScrollReveal delay={1120}>
        <div
          className="rounded-lg p-5 flex flex-col gap-1"
          style={{ background: "var(--bg-white)", border: "1px solid var(--border)" }}
        >
          <p
            className="text-[12px] font-bold mb-2"
            style={{ color: "var(--seal)" }}
          >
            주의할 상대 유형
          </p>
          {result.redFlags.map((flag) => (
            <FlagItem key={flag} text={flag} type="red" />
          ))}
        </div>
      </ScrollReveal>

      <ScrollReveal delay={1200}>
        <div
          className="rounded-lg p-5 flex flex-col gap-1"
          style={{ background: "var(--bg-white)", border: "1px solid var(--border)" }}
        >
          <p
            className="text-[12px] font-bold mb-2"
            style={{ color: "var(--saju)" }}
          >
            좋은 신호
          </p>
          {result.greenFlags.map((flag) => (
            <FlagItem key={flag} text={flag} type="green" />
          ))}
        </div>
      </ScrollReveal>

      <Divider />

      {/* Actions */}
      <ScrollReveal delay={1280}>
        <div className="flex flex-col gap-3">
          <Link
            href="/career"
            className="flex items-center gap-3 p-4 rounded-xl no-underline transition-opacity hover:opacity-85"
            style={{ background: "var(--bg-white)", border: "1.5px solid var(--saju)" }}
          >
            <div
              className="flex items-center justify-center w-9 h-9 rounded-full shrink-0"
              style={{ background: "rgba(45,90,39,0.08)" }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <rect x="1" y="3" width="12" height="9" rx="1.5" stroke="var(--saju)" strokeWidth="1.2" />
                <path d="M4 1v3M10 1v3" stroke="var(--saju)" strokeWidth="1.2" strokeLinecap="round" />
                <path d="M1 6.5h12" stroke="var(--saju)" strokeWidth="0.8" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold" style={{ color: "var(--ink-medium)" }}>
                커리어 심화 분석
              </div>
              <div className="text-xs mt-0.5" style={{ color: "var(--ink-light)" }}>
                직업 운명에 대한 교차 분석도 확인하기
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
              <path d="M6 4l4 4-4 4" stroke="var(--saju)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>

          <Link
            href="/analyze"
            className="w-full py-3.5 text-sm font-semibold rounded-xl text-center no-underline transition-opacity hover:opacity-85"
            style={{ background: "var(--bg-white)", color: "var(--ink-muted)", border: "1.5px solid var(--border)" }}
          >
            교차 분석 전체 보기
          </Link>
        </div>
      </ScrollReveal>

      <div className="h-10" />
    </div>
  );
}

// ━━━ 메인 페이지 ━━━

export default function LovePage() {
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [result, setResult] = useState<LoveAnalysis | null>(null);
  const [hasSaved, setHasSaved] = useState(false);

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

        const analysis = analyzeLove(year, month, day);
        setResult(analysis);
      } catch {
        // Ignore bad data
      }
    }
  }, []);

  function handleSubmit() {
    const y = parseInt(birthYear);
    const m = parseInt(birthMonth);
    const d = parseInt(birthDay);

    if (!y || !m || !d || y < 1920 || y > 2025 || m < 1 || m > 12 || d < 1 || d > 31) return;

    localStorage.setItem("destino_daily_birth", JSON.stringify({ year: y, month: m, day: d }));
    setHasSaved(true);

    const analysis = analyzeLove(y, m, d);
    setResult(analysis);
  }

  function handleReset() {
    setResult(null);
    setHasSaved(false);
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center px-6 py-12"
      style={{ background: "var(--bg-paper)" }}
    >
      <Nav />
      <div className="w-full max-w-[440px] flex flex-col gap-8 pt-14">
        {hasSaved && (
          <div className="flex justify-end -mb-4">
            <button
              onClick={handleReset}
              className="text-[12px] font-medium hover:underline cursor-pointer"
              style={{ color: "var(--ink-faint)" }}
            >
              다시 분석하기
            </button>
          </div>
        )}

        <Divider />

        {!result ? (
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
          <ResultDisplay result={result} />
        )}
      </div>
    </main>
  );
}
