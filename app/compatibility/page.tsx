"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Seal from "@/components/ui/Seal";
import Divider from "@/components/ui/Divider";
import Nav from "@/components/Nav";
import { analyzeCompatibility, type CompatibilityResult } from "@/lib/compatibility";
import { OHANG_INFO, type Ohang } from "@/lib/saju";

// ━━━ 컬러 도트 ━━━
function Dot({ color, size = 8 }: { color: string; size?: number }) {
  return (
    <span
      className="inline-block rounded-full shrink-0"
      style={{ width: size, height: size, background: color }}
    />
  );
}

// ━━━ 카운트 업 훅 ━━━
function useCountUp(target: number, duration = 1800) {
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const startTime = performance.now();
    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [target, duration]);

  return value;
}

// ━━━ 스태거 섹션 래퍼 ━━━
function StaggerSection({
  children,
  index,
  className = "",
}: {
  children: React.ReactNode;
  index: number;
  className?: string;
}) {
  return (
    <div
      className={`animate-stagger-in ${className}`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {children}
    </div>
  );
}

// ━━━ 섹션 헤더 ━━━
function SectionHeader({ color, title }: { color: string; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Dot color={color} size={8} />
      <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>
        {title}
      </span>
    </div>
  );
}

// ━━━ 칩 컴포넌트 ━━━
function Chip({
  label,
  color = "var(--ink-muted)",
  bg,
}: {
  label: string;
  color?: string;
  bg?: string;
}) {
  return (
    <span
      className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
      style={{
        color,
        background: bg || `${color}12`,
      }}
    >
      {label}
    </span>
  );
}

// ━━━ 스코어 바 ━━━
function ScoreBar({ score, color, delay = 0 }: { score: number; color: string; delay?: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 300 + delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className="h-[10px] rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
      <div
        className="h-full rounded-full"
        style={{
          width: visible ? `${Math.max(score, 8)}%` : "0%",
          background: color,
          transition: "width 1.2s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />
    </div>
  );
}

// ━━━ 궁합 스코어 카운터 ━━━
function CompatScoreCounter({ score }: { score: number }) {
  const displayValue = useCountUp(score, 2000);
  return (
    <div>
      <span
        className="text-[56px] font-black leading-none tracking-tight"
        style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
      >
        {displayValue}
      </span>
      <span
        className="text-2xl font-bold"
        style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
      >
        %
      </span>
    </div>
  );
}

// ━━━ 시스템 컬러 ━━━
const SYSTEM_COLORS: Record<string, string> = {
  saju: "var(--saju)",
  western: "var(--astro)",
  numerology: "var(--numero)",
};

export default function CompatibilityPage() {
  return (
    <Suspense fallback={null}>
      <CompatibilityPageInner />
    </Suspense>
  );
}

function CompatibilityPageInner() {
  const searchParams = useSearchParams();
  // Person 1
  const [year1, setYear1] = useState("");
  const [month1, setMonth1] = useState("");
  const [day1, setDay1] = useState("");
  const [name1, setName1] = useState("");
  // Person 2
  const [year2, setYear2] = useState("");
  const [month2, setMonth2] = useState("");
  const [day2, setDay2] = useState("");
  const [name2, setName2] = useState("");

  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const valid =
    year1.length === 4 && month1 !== "" && day1 !== "" &&
    year2.length === 4 && month2 !== "" && day2 !== "";

  // Read share URL params on mount
  useEffect(() => {
    const y1 = searchParams.get("y1");
    const m1 = searchParams.get("m1");
    const d1 = searchParams.get("d1");
    const y2 = searchParams.get("y2");
    const m2 = searchParams.get("m2");
    const d2 = searchParams.get("d2");
    if (y1 && m1 && d1 && y2 && m2 && d2) {
      setYear1(y1); setMonth1(m1); setDay1(d1);
      setYear2(y2); setMonth2(m2); setDay2(d2);
      const n1 = searchParams.get("n1");
      const n2 = searchParams.get("n2");
      if (n1) setName1(n1);
      if (n2) setName2(n2);
      // Auto-analyze after a short delay
      setTimeout(() => {
        const yi1 = parseInt(y1), mi1 = parseInt(m1), di1 = parseInt(d1);
        const yi2 = parseInt(y2), mi2 = parseInt(m2), di2 = parseInt(d2);
        if (yi1 && mi1 && di1 && yi2 && mi2 && di2) {
          setLoading(true);
          setTimeout(() => {
            setResult(
              analyzeCompatibility({
                person1: { year: yi1, month: mi1, day: di1, name: n1 || undefined },
                person2: { year: yi2, month: mi2, day: di2, name: n2 || undefined },
              })
            );
            setLoading(false);
          }, 2400);
        }
      }, 300);
    }
  }, []);

  const analyze = () => {
    const y1 = parseInt(year1), m1 = parseInt(month1), d1 = parseInt(day1);
    const y2 = parseInt(year2), m2 = parseInt(month2), d2 = parseInt(day2);

    if (!y1 || y1 < 1924 || y1 > 2025 || !y2 || y2 < 1924 || y2 > 2025) {
      setValidationError("1924~2025년 사이를 입력해주세요");
      return;
    }
    if (!m1 || m1 < 1 || m1 > 12 || !m2 || m2 < 1 || m2 > 12) {
      setValidationError("1~12월 사이를 입력해주세요");
      return;
    }
    if (!d1 || d1 < 1 || d1 > 31 || !d2 || d2 < 1 || d2 > 31) {
      setValidationError("1~31일 사이를 입력해주세요");
      return;
    }

    setValidationError(null);
    setLoading(true);
    setTimeout(() => {
      setResult(
        analyzeCompatibility({
          person1: { year: y1, month: m1, day: d1, name: name1 || undefined },
          person2: { year: y2, month: m2, day: d2, name: name2 || undefined },
        })
      );
      setLoading(false);
    }, 2400);
  };

  const reset = () => {
    setResult(null);
    setYear1(""); setMonth1(""); setDay1(""); setName1("");
    setYear2(""); setMonth2(""); setDay2(""); setName2("");
    setCopied(false);
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleShare = useCallback(() => {
    const url = `${window.location.origin}/compatibility?y1=${year1}&m1=${month1}&d1=${day1}&y2=${year2}&m2=${month2}&d2=${day2}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [year1, month1, day1, year2, month2, day2]);

  const shareToThreads = () => {
    const shareUrl = `${window.location.origin}/compatibility?y1=${year1}&m1=${month1}&d1=${day1}&y2=${year2}&m2=${month2}&d2=${day2}`;
    const text = `두 사람의 궁합 점수: ${result?.overallScore}% — ${result?.archetype}. DESTINO 궁합 분석 ${shareUrl}`;
    window.open(
      `https://www.threads.net/intent/post?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  const shareToTwitter = () => {
    const text = `두 사람의 궁합 점수: ${result?.overallScore}% — ${result?.archetype}`;
    const shareUrl = `${window.location.origin}/compatibility?y1=${year1}&m1=${month1}&d1=${day1}&y2=${year2}&m2=${month2}&d2=${day2}`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  };

  const inputClass =
    "w-full px-4 py-3.5 text-lg font-bold rounded-[10px] outline-none transition-colors";

  const p1Name = name1 || "나";
  const p2Name = name2 || "상대방";

  return (
    <main
      ref={topRef}
      className="min-h-screen flex flex-col items-center px-5 py-10"
      style={{ background: "var(--bg-paper)" }}
    >
      <Nav />
      <div className="w-full max-w-[420px] flex flex-col pt-8">

        {/* ━━━ INPUT ━━━ */}
        {!result && !loading && (
          <>
            <div className="text-center mb-7 animate-fade-up">
              <Seal size="lg" char="合" className="mx-auto animate-seal-pop" />
              <h1
                className="text-2xl font-black mt-3 tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                궁합 분석
              </h1>
              <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--ink-muted)" }}>
                두 사람의 생년월일을 입력하면<br />동서양 3개 체계가 궁합을 분석합니다
              </p>
            </div>

            {/* Person 1 */}
            <div
              className="rounded-[14px] p-5 mb-3 animate-fade-up"
              style={{
                background: "var(--bg-white)",
                border: "1.5px solid var(--border)",
                animationDelay: "0.05s",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black"
                  style={{ background: "var(--seal)", color: "#fff" }}
                >
                  1
                </div>
                <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>
                  나
                </span>
              </div>

              {/* 이름 (선택) */}
              <div className="mb-3">
                <label className="flex items-center gap-2 text-sm font-semibold mb-1.5" style={{ color: "var(--ink-medium)" }}>
                  이름
                  <span
                    className="text-[10px] font-normal px-1.5 py-0.5 rounded"
                    style={{ background: "var(--bg-paper)", color: "var(--ink-light)" }}
                  >
                    선택
                  </span>
                </label>
                <input
                  className={inputClass}
                  style={{ background: "var(--bg-paper)", border: "2px solid var(--border)", color: "var(--ink)" }}
                  placeholder="예: 길동"
                  value={name1}
                  onChange={(e) => setName1(e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = "var(--seal)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>

              {/* 연도 */}
              <div className="mb-3">
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--ink-medium)" }}>
                  태어난 해
                </label>
                <input
                  className={inputClass}
                  style={{ background: "var(--bg-paper)", border: "2px solid var(--border)", color: "var(--ink)" }}
                  placeholder="예: 1990"
                  inputMode="numeric"
                  value={year1}
                  onChange={(e) => setYear1(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  onFocus={(e) => (e.target.style.borderColor = "var(--seal)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>

              {/* 월 / 일 */}
              <div className="flex gap-2.5">
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--ink-medium)" }}>월</label>
                  <input
                    className={inputClass}
                    style={{ background: "var(--bg-paper)", border: "2px solid var(--border)", color: "var(--ink)" }}
                    placeholder="3"
                    inputMode="numeric"
                    value={month1}
                    onChange={(e) => setMonth1(e.target.value.replace(/\D/g, "").slice(0, 2))}
                    onFocus={(e) => (e.target.style.borderColor = "var(--seal)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--ink-medium)" }}>일</label>
                  <input
                    className={inputClass}
                    style={{ background: "var(--bg-paper)", border: "2px solid var(--border)", color: "var(--ink)" }}
                    placeholder="15"
                    inputMode="numeric"
                    value={day1}
                    onChange={(e) => setDay1(e.target.value.replace(/\D/g, "").slice(0, 2))}
                    onFocus={(e) => (e.target.style.borderColor = "var(--seal)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                  />
                </div>
              </div>
            </div>

            {/* Connector */}
            <div className="flex justify-center py-2 animate-fade-up" style={{ animationDelay: "0.08s" }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path
                  d="M6 14h16M18 10l4 4-4 4M10 10L6 14l4 4"
                  stroke="var(--seal)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-pulse-subtle"
                />
              </svg>
            </div>

            {/* Person 2 */}
            <div
              className="rounded-[14px] p-5 mb-3.5 animate-fade-up"
              style={{
                background: "var(--bg-white)",
                border: "1.5px solid var(--border)",
                animationDelay: "0.1s",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black"
                  style={{ background: "var(--ink)", color: "var(--bg-paper)" }}
                >
                  2
                </div>
                <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>
                  상대방
                </span>
              </div>

              {/* 이름 (선택) */}
              <div className="mb-3">
                <label className="flex items-center gap-2 text-sm font-semibold mb-1.5" style={{ color: "var(--ink-medium)" }}>
                  이름
                  <span
                    className="text-[10px] font-normal px-1.5 py-0.5 rounded"
                    style={{ background: "var(--bg-paper)", color: "var(--ink-light)" }}
                  >
                    선택
                  </span>
                </label>
                <input
                  className={inputClass}
                  style={{ background: "var(--bg-paper)", border: "2px solid var(--border)", color: "var(--ink)" }}
                  placeholder="예: 영희"
                  value={name2}
                  onChange={(e) => setName2(e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = "var(--seal)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>

              {/* 연도 */}
              <div className="mb-3">
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--ink-medium)" }}>
                  태어난 해
                </label>
                <input
                  className={inputClass}
                  style={{ background: "var(--bg-paper)", border: "2px solid var(--border)", color: "var(--ink)" }}
                  placeholder="예: 1992"
                  inputMode="numeric"
                  value={year2}
                  onChange={(e) => setYear2(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  onFocus={(e) => (e.target.style.borderColor = "var(--seal)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>

              {/* 월 / 일 */}
              <div className="flex gap-2.5">
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--ink-medium)" }}>월</label>
                  <input
                    className={inputClass}
                    style={{ background: "var(--bg-paper)", border: "2px solid var(--border)", color: "var(--ink)" }}
                    placeholder="7"
                    inputMode="numeric"
                    value={month2}
                    onChange={(e) => setMonth2(e.target.value.replace(/\D/g, "").slice(0, 2))}
                    onFocus={(e) => (e.target.style.borderColor = "var(--seal)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--ink-medium)" }}>일</label>
                  <input
                    className={inputClass}
                    style={{ background: "var(--bg-paper)", border: "2px solid var(--border)", color: "var(--ink)" }}
                    placeholder="20"
                    inputMode="numeric"
                    value={day2}
                    onChange={(e) => setDay2(e.target.value.replace(/\D/g, "").slice(0, 2))}
                    onFocus={(e) => (e.target.style.borderColor = "var(--seal)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={analyze}
              disabled={!valid}
              className="w-full py-4.5 text-base font-extrabold rounded-xl border-none cursor-pointer transition-all animate-fade-up"
              style={{
                background: valid ? "var(--seal)" : "var(--ink-ghost)",
                color: valid ? "#fff" : "var(--ink-faint)",
                boxShadow: valid ? "0 4px 16px rgba(197,61,67,0.25)" : "none",
                animationDelay: "0.15s",
              }}
            >
              {valid ? "궁합 분석하기" : "두 사람의 생년월일을 입력해주세요"}
            </button>

            {validationError && (
              <p
                className="text-sm font-medium mt-3 text-center"
                style={{ color: "var(--seal)" }}
                role="alert"
              >
                {validationError}
              </p>
            )}

            <div className="flex justify-center gap-3 mt-4 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              {([
                ["#2D5A27", "오행"],
                ["#1E3A5F", "별자리"],
                ["#6B3A2A", "수비학"],
              ] as const).map(([c, v]) => (
                <span key={v} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--ink-muted)" }}>
                  <Dot color={c} />{v}
                </span>
              ))}
            </div>

            {/* 돌아가기 링크 */}
            <div className="text-center mt-6 animate-fade-up" style={{ animationDelay: "0.25s" }}>
              <Link
                href="/analyze"
                className="text-sm no-underline transition-opacity hover:opacity-70"
                style={{ color: "var(--ink-light)" }}
              >
                개인 분석으로 돌아가기
              </Link>
            </div>
          </>
        )}

        {/* ━━━ LOADING ━━━ */}
        {loading && (
          <div className="text-center py-20">
            <div className="relative inline-block mb-4">
              <Seal size="lg" char="合" className="mx-auto animate-seal-pop" />
              <div
                className="absolute inset-0 rounded-[3px] animate-pulse-ring"
                style={{ border: "2px solid var(--seal)" }}
              />
            </div>
            <p
              className="text-base font-bold mt-3"
              style={{ color: "var(--ink)", fontFamily: "var(--font-display)" }}
            >
              두 사람의 교차점 비교 중
            </p>
            <div className="flex justify-center gap-1 mt-3">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full animate-loading-dot"
                  style={{
                    background: "var(--seal)",
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
            <div className="flex justify-center gap-4 mt-6">
              {(["오행", "별자리", "수비학"] as const).map((sys, i) => (
                <span
                  key={sys}
                  className="text-xs font-semibold animate-fade-up"
                  style={{
                    color: "var(--ink-light)",
                    animationDelay: `${0.3 + i * 0.15}s`,
                  }}
                >
                  {sys}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ━━━ RESULT ━━━ */}
        {result && (
          <>
            {/* Section Label */}
            <StaggerSection index={0} className="flex justify-end items-center mb-5">
              <span className="text-sm font-semibold" style={{ color: "var(--ink-muted)" }}>
                궁합 분석
              </span>
            </StaggerSection>

            {/* Overall Score Hero */}
            <StaggerSection index={1}>
              <div
                className="rounded-[14px] p-6 mb-3.5"
                style={{ background: "var(--bg-white)", border: "1.5px solid var(--border)" }}
              >
                <div className="flex items-center gap-2 mb-5">
                  <Dot color="#C53D43" size={10} />
                  <span className="text-sm font-bold tracking-wider" style={{ color: "var(--seal)" }}>궁합</span>
                </div>

                {/* Score Counter */}
                <div className="text-center mb-5">
                  <CompatScoreCounter score={result.overallScore} />
                  <div
                    className="text-base font-bold mt-2"
                    style={{ fontFamily: "var(--font-display)", color: "var(--seal)" }}
                  >
                    {result.overallLabel}
                  </div>
                </div>

                {/* Score Bar */}
                <div className="mb-5">
                  <ScoreBar score={result.overallScore} color="var(--seal)" />
                </div>

                {/* Two people side by side */}
                <div className="flex gap-2">
                  <div className="flex-1 p-3.5 rounded-[10px] text-center" style={{ background: "var(--bg-paper)" }}>
                    <div className="flex items-center justify-center gap-1.5 mb-1.5">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black"
                        style={{ background: "var(--seal)", color: "#fff" }}
                      >
                        1
                      </div>
                      <span className="text-[11px] font-semibold tracking-wider" style={{ color: "var(--ink-light)" }}>
                        {p1Name}
                      </span>
                    </div>
                    <div
                      className="text-[26px] font-black"
                      style={{ fontFamily: "var(--font-display)", color: OHANG_INFO[result.person1.saju.day.ohang].color }}
                    >
                      {result.person1.saju.day.ohang}
                    </div>
                    <div className="text-xs font-semibold mt-0.5" style={{ color: "var(--ink-medium)" }}>
                      {result.person1.western.sunSign.name}
                    </div>
                  </div>

                  <div className="flex items-center" style={{ color: "var(--ink-ghost)" }}>
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <path
                        d="M6 14h16M18 10l4 4-4 4M10 10L6 14l4 4"
                        stroke="var(--seal)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="animate-pulse-subtle"
                      />
                    </svg>
                  </div>

                  <div className="flex-1 p-3.5 rounded-[10px] text-center" style={{ background: "var(--bg-paper)" }}>
                    <div className="flex items-center justify-center gap-1.5 mb-1.5">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black"
                        style={{ background: "var(--ink)", color: "var(--bg-paper)" }}
                      >
                        2
                      </div>
                      <span className="text-[11px] font-semibold tracking-wider" style={{ color: "var(--ink-light)" }}>
                        {p2Name}
                      </span>
                    </div>
                    <div
                      className="text-[26px] font-black"
                      style={{ fontFamily: "var(--font-display)", color: OHANG_INFO[result.person2.saju.day.ohang].color }}
                    >
                      {result.person2.saju.day.ohang}
                    </div>
                    <div className="text-xs font-semibold mt-0.5" style={{ color: "var(--ink-medium)" }}>
                      {result.person2.western.sunSign.name}
                    </div>
                  </div>
                </div>
              </div>
            </StaggerSection>

            {/* Archetype */}
            <StaggerSection index={2}>
              <div
                className="rounded-[14px] p-6 mb-3.5"
                style={{ background: "var(--seal-bg)", border: "1.5px solid #E8C5C7" }}
              >
                <div className="text-[11px] font-semibold tracking-widest mb-2" style={{ color: "var(--ink-light)" }}>
                  궁합 유형
                </div>
                <h2
                  className="text-[22px] font-black leading-snug mb-3"
                  style={{ fontFamily: "var(--font-display)", color: "var(--seal-dark)" }}
                >
                  {result.archetype}
                </h2>
                <p className="text-sm leading-[1.9]" style={{ color: "var(--ink-medium)" }}>
                  {result.archetypeDesc}
                </p>
              </div>
            </StaggerSection>

            {/* Dimension Cards */}
            <StaggerSection index={3}>
              <div
                className="rounded-[14px] p-6 mb-3.5"
                style={{ background: "var(--bg-white)", border: "1.5px solid var(--border)" }}
              >
                <SectionHeader color="var(--seal)" title="차원별 궁합" />

                <div className="flex flex-col gap-4">
                  {result.dimensions.map((dim, i) => (
                    <div key={dim.system}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Dot color={SYSTEM_COLORS[dim.system] || "var(--ink-muted)"} />
                          <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>
                            {dim.name}
                          </span>
                        </div>
                        <span
                          className="text-sm font-black"
                          style={{ fontFamily: "var(--font-display)", color: SYSTEM_COLORS[dim.system] || "var(--ink)" }}
                        >
                          {dim.score}%
                        </span>
                      </div>
                      <ScoreBar score={dim.score} color={SYSTEM_COLORS[dim.system] || "var(--ink-muted)"} delay={i * 200} />
                      <p className="text-xs leading-relaxed mt-2" style={{ color: "var(--ink-muted)" }}>
                        {dim.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </StaggerSection>

            {/* Element Relation */}
            <StaggerSection index={4}>
              <div
                className="rounded-[14px] p-6 mb-3.5"
                style={{ background: "var(--bg-white)", border: "1.5px solid var(--border)" }}
              >
                <SectionHeader color="var(--saju)" title="오행 관계" />

                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="text-center">
                    <div
                      className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-2"
                      style={{ background: OHANG_INFO[result.person1.saju.day.ohang].color + "15" }}
                    >
                      <span
                        className="text-2xl font-black"
                        style={{
                          fontFamily: "var(--font-display)",
                          color: OHANG_INFO[result.person1.saju.day.ohang].color,
                        }}
                      >
                        {result.person1.saju.day.ohang}
                      </span>
                    </div>
                    <div className="text-xs font-semibold" style={{ color: "var(--ink-muted)" }}>
                      {p1Name}
                    </div>
                  </div>

                  <div className="flex flex-col items-center px-2">
                    <span
                      className="inline-block px-3 py-1 rounded-full text-xs font-black mb-1"
                      style={{
                        background: result.elementRelation.relation === "상생" ? "var(--saju)" + "18"
                          : result.elementRelation.relation === "비화" ? "var(--face)" + "18"
                          : result.elementRelation.relation === "상극" ? "var(--seal)" + "18"
                          : "var(--astro)" + "18",
                        color: result.elementRelation.relation === "상생" ? "var(--saju)"
                          : result.elementRelation.relation === "비화" ? "var(--face)"
                          : result.elementRelation.relation === "상극" ? "var(--seal)"
                          : "var(--astro)",
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      {result.elementRelation.relation}
                    </span>
                    <svg width="40" height="12" viewBox="0 0 40 12" fill="none">
                      <path
                        d="M2 6h36M34 2l4 4-4 4M6 2L2 6l4 4"
                        stroke="var(--ink-ghost)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div className="text-center">
                    <div
                      className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-2"
                      style={{ background: OHANG_INFO[result.person2.saju.day.ohang].color + "15" }}
                    >
                      <span
                        className="text-2xl font-black"
                        style={{
                          fontFamily: "var(--font-display)",
                          color: OHANG_INFO[result.person2.saju.day.ohang].color,
                        }}
                      >
                        {result.person2.saju.day.ohang}
                      </span>
                    </div>
                    <div className="text-xs font-semibold" style={{ color: "var(--ink-muted)" }}>
                      {p2Name}
                    </div>
                  </div>
                </div>

                <div
                  className="p-3.5 rounded-lg text-sm leading-relaxed"
                  style={{ background: "var(--bg-paper)", color: "var(--ink-muted)" }}
                >
                  {result.elementRelation.description}
                </div>
              </div>
            </StaggerSection>

            {/* Trait Analysis */}
            <StaggerSection index={5}>
              <div
                className="rounded-[14px] p-6 mb-3.5"
                style={{ background: "var(--bg-white)", border: "1.5px solid var(--border)" }}
              >
                <SectionHeader color="var(--ink)" title="특성 분석" />

                {/* Shared */}
                {result.sharedTraits.length > 0 && (
                  <div className="mb-4">
                    <div className="text-[11px] font-semibold tracking-wider mb-2" style={{ color: "var(--ink-light)" }}>
                      공유 특성
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.sharedTraits.map((t) => (
                        <Chip key={t} label={t} color="var(--saju)" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Complementary */}
                {result.complementaryTraits.length > 0 && (
                  <div className="mb-4">
                    <div className="text-[11px] font-semibold tracking-wider mb-2" style={{ color: "var(--ink-light)" }}>
                      상호보완 특성
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.complementaryTraits.map((t) => (
                        <Chip key={t} label={t} color="var(--astro)" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Tension */}
                {result.tensionTraits.length > 0 && (
                  <div>
                    <div className="text-[11px] font-semibold tracking-wider mb-2" style={{ color: "var(--ink-light)" }}>
                      긴장 포인트
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.tensionTraits.map((t) => (
                        <Chip key={t} label={t} color="var(--face)" />
                      ))}
                    </div>
                  </div>
                )}

                {result.sharedTraits.length === 0 && result.complementaryTraits.length === 0 && result.tensionTraits.length === 0 && (
                  <p className="text-sm leading-relaxed" style={{ color: "var(--ink-muted)" }}>
                    두 사람의 특성이 각자의 고유한 영역에서 발현됩니다. 겹치는 부분이 적다는 것은 서로에게 새로운 시각을 줄 수 있다는 의미입니다.
                  </p>
                )}
              </div>
            </StaggerSection>

            {/* Individual Summaries */}
            <StaggerSection index={6}>
              <div
                className="rounded-[14px] p-6 mb-3.5"
                style={{ background: "var(--bg-white)", border: "1.5px solid var(--border)" }}
              >
                <SectionHeader color="var(--seal)" title="개인 프로필 비교" />

                <div className="flex gap-2.5">
                  {/* Person 1 */}
                  <div className="flex-1 p-3.5 rounded-[10px]" style={{ background: "var(--bg-paper)" }}>
                    <div className="text-[11px] font-semibold tracking-wider mb-2" style={{ color: "var(--ink-light)" }}>
                      {p1Name}
                    </div>
                    <div className="text-sm font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>
                      {result.person1.archetype}
                    </div>
                    <div className="text-xs mb-2" style={{ color: "var(--ink-muted)" }}>
                      {result.person1.saju.personality.nature}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {result.person1.matches.slice(0, 3).map((m) => (
                        <span
                          key={m.trait}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: "var(--bg-white)", color: "var(--ink-muted)" }}
                        >
                          {m.trait}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Person 2 */}
                  <div className="flex-1 p-3.5 rounded-[10px]" style={{ background: "var(--bg-paper)" }}>
                    <div className="text-[11px] font-semibold tracking-wider mb-2" style={{ color: "var(--ink-light)" }}>
                      {p2Name}
                    </div>
                    <div className="text-sm font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>
                      {result.person2.archetype}
                    </div>
                    <div className="text-xs mb-2" style={{ color: "var(--ink-muted)" }}>
                      {result.person2.saju.personality.nature}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {result.person2.matches.slice(0, 3).map((m) => (
                        <span
                          key={m.trait}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: "var(--bg-white)", color: "var(--ink-muted)" }}
                        >
                          {m.trait}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </StaggerSection>

            {/* Advice */}
            <StaggerSection index={7}>
              <div
                className="rounded-[14px] p-6 mb-3.5"
                style={{ background: "var(--bg-white)", border: "1.5px solid var(--border)" }}
              >
                <SectionHeader color="var(--seal)" title="관계 조언" />
                <blockquote
                  className="text-sm leading-[2] italic"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--ink-medium)",
                    borderLeft: "3px solid var(--seal)",
                    paddingLeft: "16px",
                    margin: 0,
                  }}
                >
                  {result.advice}
                </blockquote>
              </div>
            </StaggerSection>

            {/* Share */}
            <StaggerSection index={8}>
              <div
                className="rounded-[14px] p-5 mb-3.5"
                style={{ background: "var(--bg-white)", border: "1.5px solid var(--border)" }}
              >
                <div className="text-sm font-bold mb-3" style={{ color: "var(--ink)" }}>
                  결과 공유하기
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleShare}
                    className="w-full py-3 text-sm font-bold rounded-lg border-none cursor-pointer transition-all"
                    style={{
                      background: copied ? "var(--saju)" : "var(--bg-paper)",
                      color: copied ? "#fff" : "var(--ink)",
                      fontFamily: "inherit",
                    }}
                  >
                    {copied ? "링크가 복사되었습니다" : "링크 복사하기"}
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={shareToThreads}
                      className="flex-1 py-3 text-sm font-semibold rounded-lg border-none cursor-pointer transition-opacity hover:opacity-80"
                      style={{ background: "var(--bg-paper)", color: "var(--ink-medium)", fontFamily: "inherit" }}
                    >
                      Threads
                    </button>
                    <button
                      onClick={shareToTwitter}
                      className="flex-1 py-3 text-sm font-semibold rounded-lg border-none cursor-pointer transition-opacity hover:opacity-80"
                      style={{ background: "var(--bg-paper)", color: "var(--ink-medium)", fontFamily: "inherit" }}
                    >
                      X (Twitter)
                    </button>
                  </div>
                </div>
              </div>
            </StaggerSection>

            {/* Actions */}
            <StaggerSection index={9}>
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={reset}
                  className="w-full py-4 text-[15px] font-bold rounded-xl border-none cursor-pointer transition-opacity hover:opacity-85"
                  style={{ background: "var(--ink)", color: "var(--bg-paper)", fontFamily: "inherit" }}
                >
                  다시 분석하기
                </button>
                <Link
                  href="/analyze"
                  className="w-full py-3.5 text-sm font-semibold rounded-xl text-center no-underline transition-opacity hover:opacity-85"
                  style={{ background: "var(--bg-white)", color: "var(--ink-muted)", border: "1.5px solid var(--border)" }}
                >
                  개인 분석하기
                </Link>
              </div>
            </StaggerSection>

            {/* Bottom Spacer */}
            <div className="h-10" />
          </>
        )}
      </div>
    </main>
  );
}
