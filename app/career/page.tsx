"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Divider from "@/components/ui/Divider";
import Button from "@/components/ui/Button";
import ScrollReveal from "@/components/ScrollReveal";
import Seal from "@/components/ui/Seal";
import { analyzeCareer, type CareerAnalysis } from "@/lib/career-analysis";
import Footer from "@/components/Footer";

// ━━━ Fit % 바 ━━━

function FitBar({ value }: { value: number }) {
  return (
    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-warm)" }}>
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{
          width: `${value}%`,
          background: value >= 90 ? "var(--seal)" : value >= 80 ? "var(--saju)" : "var(--astro)",
        }}
      />
    </div>
  );
}

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
        <Seal size="lg" char="職" className="animate-seal-pop" />
        <h1
          className="text-[28px] font-black leading-[1.3] tracking-[-0.01em]"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          커리어 심화 분석
        </h1>
        <p
          className="text-[15px] leading-[1.8]"
          style={{ color: "var(--ink-muted)" }}
        >
          사주 · 별자리 · 수비학 · MBTI가
          <br />
          가리키는 당신의 직업적 운명
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
            style={{ ...inputStyle, ["--tw-ring-color" as string]: "var(--saju)" }}
            min={1920}
            max={2025}
          />
          <input
            type="number"
            placeholder="1"
            value={birthMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="rounded-md px-3 py-3 text-[15px] text-center outline-none focus:ring-1"
            style={{ ...inputStyle, ["--tw-ring-color" as string]: "var(--saju)" }}
            min={1}
            max={12}
          />
          <input
            type="number"
            placeholder="15"
            value={birthDay}
            onChange={(e) => onDayChange(e.target.value)}
            className="rounded-md px-3 py-3 text-[15px] text-center outline-none focus:ring-1"
            style={{ ...inputStyle, ["--tw-ring-color" as string]: "var(--saju)" }}
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

      <Button onClick={onSubmit}>커리어 분석 시작</Button>
    </section>
  );
}

// ━━━ 결과 표시 ━━━

function ResultDisplay({ result }: { result: CareerAnalysis }) {
  return (
    <div className="flex flex-col gap-8">
      {/* Career Type */}
      <ScrollReveal delay={0}>
        <div
          className="rounded-xl p-6 relative overflow-hidden"
          style={{ background: "var(--bg-white)", border: "1.5px solid var(--saju)" }}
        >
          <div className="absolute top-3 right-3 opacity-15">
            <Seal size="sm" char="職" />
          </div>
          <p
            className="text-[11px] tracking-[0.1em] uppercase font-medium mb-2"
            style={{ color: "var(--saju)" }}
          >
            CAREER TYPE
          </p>
          <h2
            className="text-[22px] font-black mb-3"
            style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
          >
            {result.careerType}
          </h2>
          <p
            className="text-[14px] leading-[1.9]"
            style={{ color: "var(--ink-medium)" }}
          >
            {result.careerTypeDesc}
          </p>
        </div>
      </ScrollReveal>

      <Divider />

      {/* TOP 5 추천 직업 */}
      <ScrollReveal delay={200}>
        <p
          className="text-[11px] tracking-[0.1em] uppercase font-medium mb-1"
          style={{ color: "var(--ink-light)" }}
        >
          TOP 5 추천 직업
        </p>
        <p
          className="text-[13px] mb-4"
          style={{ color: "var(--ink-muted)" }}
        >
          4개 체계가 교차 분석한 최적의 직업
        </p>
      </ScrollReveal>

      {result.top5Careers.map((career, i) => (
        <ScrollReveal key={career.title} delay={300 + i * 100}>
          <div
            className="rounded-xl p-5 flex flex-col gap-3"
            style={{ background: "var(--bg-white)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-3">
              <span
                className="flex items-center justify-center w-7 h-7 rounded-full text-[12px] font-black shrink-0"
                style={{
                  background: career.rank <= 2 ? "var(--seal)" : "var(--bg-warm)",
                  color: career.rank <= 2 ? "#fff" : "var(--ink-medium)",
                }}
              >
                {career.rank}
              </span>
              <div className="flex-1">
                <p className="text-[15px] font-bold" style={{ color: "var(--ink)" }}>
                  {career.title}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--ink-light)" }}>
                  {career.fromSystem}
                </p>
              </div>
              <span
                className="text-[14px] font-black shrink-0"
                style={{ color: career.fit >= 90 ? "var(--seal)" : "var(--saju)" }}
              >
                {career.fit}%
              </span>
            </div>
            <FitBar value={career.fit} />
            <p className="text-[13px] leading-[1.8]" style={{ color: "var(--ink-muted)" }}>
              {career.reason}
            </p>
          </div>
        </ScrollReveal>
      ))}

      <Divider />

      {/* Work Style */}
      <ScrollReveal delay={800}>
        <p
          className="text-[11px] tracking-[0.1em] uppercase font-medium mb-1"
          style={{ color: "var(--ink-light)" }}
        >
          WORK STYLE
        </p>
        <p
          className="text-[13px] mb-4"
          style={{ color: "var(--ink-muted)" }}
        >
          당신의 업무 성향과 강점
        </p>
      </ScrollReveal>

      <ScrollReveal delay={880}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-[11px] tracking-[0.08em] uppercase font-medium" style={{ color: "var(--saju)" }}>
              강점
            </span>
            <div className="flex flex-wrap gap-2">
              {result.workStyle.strengths.map((s) => (
                <Chip key={s} label={s} color="var(--saju)" />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[11px] tracking-[0.08em] uppercase font-medium" style={{ color: "var(--seal)" }}>
              약점
            </span>
            <div className="flex flex-wrap gap-2">
              {result.workStyle.weaknesses.map((w) => (
                <Chip key={w} label={w} color="var(--seal)" />
              ))}
            </div>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={960}>
        <div
          className="rounded-lg p-5 flex flex-col gap-3"
          style={{ background: "var(--bg-white)", border: "1px solid var(--border)" }}
        >
          <div className="flex flex-col gap-2">
            <span className="text-[11px] tracking-[0.08em] uppercase font-medium" style={{ color: "var(--ink-light)" }}>
              이상적 근무 환경
            </span>
            <p className="text-[13px] leading-[1.8]" style={{ color: "var(--ink-muted)" }}>
              {result.workStyle.idealEnvironment}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[11px] tracking-[0.08em] uppercase font-medium" style={{ color: "var(--ink-light)" }}>
              리더십 스타일
            </span>
            <p className="text-[13px] leading-[1.8]" style={{ color: "var(--ink-muted)" }}>
              {result.workStyle.leadershipStyle}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[11px] tracking-[0.08em] uppercase font-medium" style={{ color: "var(--ink-light)" }}>
              팀에서의 역할
            </span>
            <p className="text-[13px] leading-[1.8]" style={{ color: "var(--ink-muted)" }}>
              {result.workStyle.teamRole}
            </p>
          </div>
        </div>
      </ScrollReveal>

      <Divider />

      {/* Career Timeline */}
      <ScrollReveal delay={1040}>
        <p
          className="text-[11px] tracking-[0.1em] uppercase font-medium mb-1"
          style={{ color: "var(--ink-light)" }}
        >
          CAREER TIMELINE
        </p>
        <p
          className="text-[13px] mb-4"
          style={{ color: "var(--ink-muted)" }}
        >
          연대별 커리어 가이드
        </p>
      </ScrollReveal>

      {result.careerTimeline.map((phase, i) => (
        <ScrollReveal key={phase.phase} delay={1100 + i * 80}>
          <div
            className="rounded-lg p-5 flex flex-col gap-2"
            style={{
              background: i % 2 === 0 ? "var(--bg-white)" : "var(--bg-warm)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="flex items-center gap-2">
              <span
                className="text-[13px] font-black px-2.5 py-0.5 rounded"
                style={{ background: "var(--seal-bg)", color: "var(--seal)" }}
              >
                {phase.phase}
              </span>
            </div>
            <p className="text-[13px] leading-[1.8]" style={{ color: "var(--ink-muted)" }}>
              {phase.advice}
            </p>
          </div>
        </ScrollReveal>
      ))}

      <Divider />

      {/* Current Year Career Forecast */}
      <ScrollReveal delay={1420}>
        <div
          className="rounded-xl p-5 flex flex-col gap-3 relative overflow-hidden"
          style={{ background: "var(--bg-white)", border: "1.5px solid var(--astro)" }}
        >
          <div className="absolute top-3 right-3 opacity-15">
            <Seal size="sm" char="運" />
          </div>
          <p
            className="text-[11px] tracking-[0.1em] uppercase font-medium"
            style={{ color: "var(--astro)" }}
          >
            {new Date().getFullYear()} CAREER FORECAST
          </p>
          <p
            className="text-[14px] leading-[1.9]"
            style={{ fontFamily: "var(--font-display)", color: "var(--ink-medium)" }}
          >
            {result.currentYearCareer}
          </p>
        </div>
      </ScrollReveal>

      {/* Best Career Months */}
      <ScrollReveal delay={1500}>
        <div
          className="rounded-lg p-5 flex flex-col gap-3"
          style={{ background: "var(--bg-warm)", border: "1px solid var(--border)" }}
        >
          <p
            className="text-[11px] tracking-[0.1em] uppercase font-medium"
            style={{ color: "var(--ink-light)" }}
          >
            커리어 변화 최적 시기
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            {result.bestCareerMonths.map((m) => (
              <MonthBadge key={m} month={m} />
            ))}
          </div>
          <p className="text-[12px] leading-[1.6]" style={{ color: "var(--ink-muted)" }}>
            이직, 부서 이동, 새 프로젝트 시작에 유리한 시기입니다
          </p>
        </div>
      </ScrollReveal>

      <Divider />

      {/* Actions */}
      <ScrollReveal delay={1580}>
        <div className="flex flex-col gap-3">
          <Link
            href="/love"
            className="flex items-center gap-3 p-4 rounded-xl no-underline transition-opacity hover:opacity-85"
            style={{ background: "var(--bg-white)", border: "1.5px solid var(--seal)" }}
          >
            <div
              className="flex items-center justify-center w-9 h-9 rounded-full shrink-0"
              style={{ background: "var(--seal-bg)" }}
            >
              <span className="text-[14px]" style={{ color: "var(--seal)" }}>&#9829;</span>
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold" style={{ color: "var(--ink-medium)" }}>
                연애 심화 분석
              </div>
              <div className="text-xs mt-0.5" style={{ color: "var(--ink-light)" }}>
                사랑에 대한 교차 분석도 확인하기
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
              <path d="M6 4l4 4-4 4" stroke="var(--seal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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

export default function CareerPage() {
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [result, setResult] = useState<CareerAnalysis | null>(null);
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

        const analysis = analyzeCareer(year, month, day);
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

    const analysis = analyzeCareer(y, m, d);
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

        <Footer />
      </div>
    </main>
  );
}
