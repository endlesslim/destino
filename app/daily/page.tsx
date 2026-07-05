"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Seal from "@/components/ui/Seal";
import Divider from "@/components/ui/Divider";
import Nav from "@/components/Nav";
import ScrollReveal from "@/components/ScrollReveal";
import Button from "@/components/ui/Button";
import DailyEmailSubscribe from "@/components/DailyEmailSubscribe";
import Footer from "@/components/Footer";
import { generateDailyFortune, type DailyFortune } from "@/lib/daily-fortune";

// ━━━ 한국어 요일 ━━━

const DAY_NAMES = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

function formatKoreanDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return `${y}년 ${m}월 ${d}일 ${DAY_NAMES[date.getDay()]}`;
}

// ━━━ 점수 원형 게이지 ━━━

function ScoreGauge({ score, label }: { score: number; label: string }) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-[140px] h-[140px]">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke="var(--border)"
            strokeWidth="6"
          />
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke="var(--seal)"
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-[36px] font-black leading-none"
            style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
          >
            {score}
          </span>
          <span
            className="text-[13px] font-bold mt-1"
            style={{ fontFamily: "var(--font-display)", color: "var(--seal)" }}
          >
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}

// ━━━ 별점 (점 기반) ━━━

function DotRating({ score, max = 5 }: { score: number; max?: number }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: max }, (_, i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{
            background: i < score ? "var(--seal)" : "var(--border)",
          }}
        />
      ))}
    </div>
  );
}

// ━━━ 카테고리 카드 ━━━

function CategoryCard({ cat }: { cat: DailyFortune["categories"][0] }) {
  return (
    <div
      className="rounded-lg p-4 flex flex-col gap-2"
      style={{ background: "var(--bg-white)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-[14px] font-bold"
          style={{ fontFamily: "var(--font-display)", color: cat.color }}
        >
          {cat.name}
        </span>
        <DotRating score={cat.score} />
      </div>
      <p className="text-[14px] leading-[1.6]" style={{ color: "var(--ink-muted)" }}>
        {cat.advice}
      </p>
    </div>
  );
}

// ━━━ 오행 비교 카드 ━━━

function ElementComparison({ fortune }: { fortune: DailyFortune }) {
  return (
    <div
      className="rounded-lg p-5 flex flex-col gap-3"
      style={{ background: "var(--bg-white)", border: "1px solid var(--border)" }}
    >
      <p
        className="text-[11px] tracking-[0.1em] uppercase font-medium"
        style={{ color: "var(--ink-light)" }}
      >
        오행 관계
      </p>
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center gap-1">
          <span
            className="text-[11px] tracking-[0.05em] font-medium"
            style={{ color: "var(--ink-light)" }}
          >
            오늘의 기운
          </span>
          <span
            className="text-[20px] font-black"
            style={{ fontFamily: "var(--font-display)", color: "var(--astro)" }}
          >
            {fortune.todayElement}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div
            className="w-8 h-px"
            style={{ background: "var(--border-strong)" }}
          />
          <span
            className="text-[11px] font-medium"
            style={{ color: "var(--ink-faint)" }}
          >
            vs
          </span>
          <div
            className="w-8 h-px"
            style={{ background: "var(--border-strong)" }}
          />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span
            className="text-[11px] tracking-[0.05em] font-medium"
            style={{ color: "var(--ink-light)" }}
          >
            나의 기운
          </span>
          <span
            className="text-[20px] font-black"
            style={{ fontFamily: "var(--font-display)", color: "var(--saju)" }}
          >
            {fortune.userElement}
          </span>
        </div>
      </div>
      <p
        className="text-[14px] text-center font-medium"
        style={{ color: "var(--ink-medium)" }}
      >
        {fortune.elementRelation}
      </p>
    </div>
  );
}

// ━━━ 메인 페이지 ━━━

export default function DailyPage() {
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [fortune, setFortune] = useState<DailyFortune | null>(null);
  const [hasSaved, setHasSaved] = useState(false);

  // localStorage에서 저장된 프로필 로드 (daily 전용 또는 analyze에서 저장한 정보)
  useEffect(() => {
    const saved = localStorage.getItem("destino_daily_birth") || localStorage.getItem("destino_my_info");
    if (saved) {
      try {
        const { year, month, day } = JSON.parse(saved);
        setBirthYear(String(year));
        setBirthMonth(String(month));
        setBirthDay(String(day));
        setHasSaved(true);

        // 자동으로 운세 생성
        const today = new Date().toISOString().split("T")[0];
        const result = generateDailyFortune(year, month, day, today);
        setFortune(result);
      } catch {
        // 잘못된 데이터 무시
      }
    }
  }, []);

  function handleSubmit() {
    const y = parseInt(birthYear);
    const m = parseInt(birthMonth);
    const d = parseInt(birthDay);

    if (!y || !m || !d || y < 1920 || y > new Date().getFullYear() || m < 1 || m > 12 || d < 1 || d > 31) {
      return;
    }

    // localStorage에 저장
    localStorage.setItem("destino_daily_birth", JSON.stringify({ year: y, month: m, day: d }));
    setHasSaved(true);

    const today = new Date().toISOString().split("T")[0];
    const result = generateDailyFortune(y, m, d, today);
    setFortune(result);
  }

  function handleReset() {
    localStorage.removeItem("destino_daily_birth");
    setHasSaved(false);
    setFortune(null);
    setBirthYear("");
    setBirthMonth("");
    setBirthDay("");
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center px-6 py-12"
      style={{ background: "var(--bg-paper)" }}
    >
      <Nav />
      <div className="w-full max-w-[440px] flex flex-col gap-8 pt-14">

        {/* 헤더 부가 */}
        {hasSaved && (
          <div className="flex justify-end -mb-4">
            <button
              onClick={handleReset}
              className="text-[12px] font-medium hover:underline cursor-pointer"
              style={{ color: "var(--ink-faint)" }}
            >
              초기화
            </button>
          </div>
        )}

        <Divider />

        {/* 입력 or 결과 */}
        {!fortune ? (
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
          <FortuneDisplay fortune={fortune} />
        )}

        <Footer />
      </div>
    </main>
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
      <div className="flex flex-col gap-3">
        <h1
          className="text-[28px] font-black leading-[1.3] tracking-[-0.01em]"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          오늘의 운세를<br />확인해보세요
        </h1>
        <p className="text-[15px] leading-[1.8]" style={{ color: "var(--ink-muted)" }}>
          생년월일을 입력하면, 사주 오행과 오늘의 기운을<br />
          비교해서 맞춤 운세를 알려드립니다.
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
            max={new Date().getFullYear()}
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

      <Button onClick={onSubmit}>
        오늘의 운세 보기
      </Button>
    </section>
  );
}

// ━━━ 운세 표시 ━━━

function FortuneDisplay({ fortune }: { fortune: DailyFortune }) {
  return (
    <div className="flex flex-col gap-8 animate-fade-up">

      {/* 날짜 */}
      <ScrollReveal delay={0}>
        <div className="flex flex-col items-center gap-2">
          <p
            className="text-[11px] tracking-[0.1em] uppercase font-medium"
            style={{ color: "var(--ink-light)" }}
          >
            오늘의 운세
          </p>
          <h2
            className="text-[20px] font-bold"
            style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
          >
            {formatKoreanDate(fortune.date)}
          </h2>
          <p className="text-[12px]" style={{ color: "var(--ink-faint)" }}>
            일주: {fortune.dayPillar.cheongan}{fortune.dayPillar.jiji} ({fortune.dayPillar.ohang})
          </p>
        </div>
      </ScrollReveal>

      {/* 종합 점수 */}
      <ScrollReveal delay={80}>
        <div className="flex flex-col items-center gap-3">
          <ScoreGauge score={fortune.overall.score} label={fortune.overall.label} />
          <p
            className="text-[14px] text-center leading-[1.7] max-w-[320px]"
            style={{ color: "var(--ink-muted)" }}
          >
            {fortune.overall.description}
          </p>
        </div>
      </ScrollReveal>

      <Divider />

      {/* 4 카테고리 */}
      <ScrollReveal delay={160}>
        <div className="flex flex-col gap-3">
          <p
            className="text-[11px] tracking-[0.1em] uppercase font-medium"
            style={{ color: "var(--ink-light)" }}
          >
            분야별 운세
          </p>
          <div className="grid grid-cols-2 gap-3">
            {fortune.categories.map((cat) => (
              <CategoryCard key={cat.name} cat={cat} />
            ))}
          </div>
        </div>
      </ScrollReveal>

      <Divider />

      {/* 행운 스트립 */}
      <ScrollReveal delay={240}>
        <div className="flex flex-col gap-3">
          <p
            className="text-[11px] tracking-[0.1em] uppercase font-medium"
            style={{ color: "var(--ink-light)" }}
          >
            오늘의 행운
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "행운의 숫자", value: String(fortune.luckyNumber) },
              { label: "행운의 방향", value: fortune.luckyDirection },
              { label: "행운의 아이템", value: fortune.luckyItem },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-lg p-3 flex flex-col items-center gap-1.5 text-center"
                style={{ background: "var(--bg-white)", border: "1px solid var(--border)" }}
              >
                <span
                  className="text-[12px] tracking-[0.05em] font-medium"
                  style={{ color: "var(--ink-faint)" }}
                >
                  {label}
                </span>
                <span
                  className="text-[14px] font-bold leading-snug"
                  style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      <Divider />

      {/* 오행 비교 */}
      <ScrollReveal delay={320}>
        <ElementComparison fortune={fortune} />
      </ScrollReveal>

      {/* 종합 해석 블록쿼트 */}
      <ScrollReveal delay={400}>
        <blockquote
          className="border-l-2 pl-4 py-2"
          style={{ borderColor: "var(--seal)", background: "transparent" }}
        >
          <p
            className="text-[14px] leading-[1.8]"
            style={{ fontFamily: "var(--font-display)", color: "var(--ink-medium)" }}
          >
            {fortune.crossMessage}
          </p>
        </blockquote>
      </ScrollReveal>

      <Divider />

      {/* 이메일 구독 CTA */}
      <ScrollReveal delay={480}>
        <DailyEmailSubscribe />
      </ScrollReveal>

      {/* 전체 분석 링크 */}
      <ScrollReveal delay={560}>
        <Link href="/analyze" className="block">
          <div
            className="rounded-md py-4 text-center text-[15px] font-bold tracking-wider transition-opacity hover:opacity-80"
            style={{
              background: "transparent",
              color: "var(--ink)",
              border: "1.5px solid var(--border-strong)",
              fontFamily: "var(--font-display)",
            }}
          >
            전체 분석 보기
          </div>
        </Link>
      </ScrollReveal>
    </div>
  );
}
