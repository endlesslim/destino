"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Seal from "@/components/ui/Seal";
import Divider from "@/components/ui/Divider";
import Nav from "@/components/Nav";
import ScrollReveal from "@/components/ScrollReveal";
import { analyzeCompatibility, type CompatibilityResult } from "@/lib/compatibility";
import { OHANG_INFO, type Ohang } from "@/lib/saju";
import { playStampSound } from "@/lib/sound";
import Dot from "@/components/ui/Dot";
import StaggerSection from "@/components/ui/StaggerSection";
import SectionHeader from "@/components/ui/SectionHeader";
import { useCountUp } from "@/hooks/useCountUp";

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

// ━━━ 타임라인 단계 아이콘 ━━━
const TIMELINE_ICONS: Record<string, string> = {
  "만남": "🌱",
  "연애 초기": "🌸",
  "깊어지는 시기": "🌳",
  "위기": "🌊",
  "성숙": "🏔",
};

// ━━━ 시스템 컬러 ━━━
const SYSTEM_COLORS: Record<string, string> = {
  saju: "var(--saju)",
  western: "var(--astro)",
  numerology: "var(--numero)",
  mbti: "var(--mbti)",
};

const SYSTEM_LABELS: Record<string, string> = {
  saju: "사주 오행",
  western: "서양 별자리",
  numerology: "수비학",
  mbti: "MBTI",
};

const SYSTEM_ORIGIN_LABELS: Record<string, string> = {
  saju: "사주명리학 기반",
  western: "서양 점성술 기반",
  numerology: "수비학 기반",
  mbti: "성격유형론 기반",
};

const SYSTEM_BORDER_COLORS: Record<string, string> = {
  saju: "var(--saju)",
  western: "var(--astro)",
  numerology: "var(--numero)",
  mbti: "var(--mbti)",
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

  // Load my info from localStorage + read share URL params
  useEffect(() => {
    // 1. 내 정보 자동 불러오기
    try {
      const saved = localStorage.getItem("destino_my_info");
      if (saved) {
        const my = JSON.parse(saved);
        if (my.year && my.month && my.day) {
          setYear1(String(my.year));
          setMonth1(String(my.month));
          setDay1(String(my.day));
          if (my.name) setName1(my.name);
        }
      }
    } catch {}

    // 2. URL 파라미터 (공유 링크) — URL이 있으면 localStorage보다 우선
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
            playStampSound();
          }, 2400);
        }
      }, 300);
    }
  }, []);

  const analyze = () => {
    const y1 = parseInt(year1), m1 = parseInt(month1), d1 = parseInt(day1);
    const y2 = parseInt(year2), m2 = parseInt(month2), d2 = parseInt(day2);

    const currentYear = new Date().getFullYear();
    if (!y1 || y1 < 1924 || y1 > currentYear || !y2 || y2 < 1924 || y2 > currentYear) {
      setValidationError(`1924~${currentYear}년 사이를 입력해주세요`);
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
      playStampSound();
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

  const shareToKakao = async () => {
    const title = "DESTINO 궁합 분석";
    const text = `두 사람의 궁합 점수: ${result?.overallScore}% — ${result?.archetype}`;
    const url = `${window.location.origin}/compatibility?y1=${year1}&m1=${month1}&d1=${day1}&y2=${year2}&m2=${month2}&d2=${day2}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(`${title}\n${text}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const [instaSaved, setInstaSaved] = useState(false);

  const downloadResultCard = () => {
    if (!result) return;
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d")!;

    // Canvas drawing uses hardcoded hex colors because the Canvas 2D API
    // cannot resolve CSS custom properties (var(--xxx)). These colors are
    // intentionally fixed for the downloadable Instagram card image.
    // Background
    ctx.fillStyle = "#F5F0E8";
    ctx.fillRect(0, 0, 1080, 1920);

    // Top decoration line
    ctx.fillStyle = "#C53D43";
    ctx.fillRect(440, 120, 200, 3);

    // Brand
    ctx.fillStyle = "#1C1917";
    ctx.font = "bold 48px serif";
    ctx.textAlign = "center";
    ctx.fillText("DESTINO", 540, 200);

    // Subtitle
    ctx.fillStyle = "#8B7E74";
    ctx.font = "24px sans-serif";
    ctx.fillText("궁합 분석", 540, 260);

    // Overall score
    ctx.fillStyle = "#1C1917";
    ctx.font = "bold 160px serif";
    ctx.fillText(`${result.overallScore}%`, 540, 680);

    // Score label
    ctx.fillStyle = "#8B7E74";
    ctx.font = "28px sans-serif";
    ctx.fillText("궁합 점수", 540, 740);

    // Archetype
    ctx.fillStyle = "#C53D43";
    ctx.font = "bold 56px serif";
    ctx.fillText(result.archetype, 540, 880);

    // Person info
    ctx.fillStyle = "#6B5E53";
    ctx.font = "32px sans-serif";
    ctx.fillText(
      `${result.person1.saju.day.ohang} · ${result.person1.western.sunSign.name}  &  ${result.person2.saju.day.ohang} · ${result.person2.western.sunSign.name}`,
      540,
      1000
    );

    // Divider
    ctx.fillStyle = "#D4C9BC";
    ctx.fillRect(390, 1080, 300, 1);

    // Brand footer
    ctx.fillStyle = "#8B7E74";
    ctx.font = "26px sans-serif";
    ctx.fillText("destino.kr", 540, 1700);

    // Bottom decoration line
    ctx.fillStyle = "#C53D43";
    ctx.fillRect(440, 1750, 200, 3);

    // Download
    const link = document.createElement("a");
    link.download = "destino-compatibility.png";
    link.href = canvas.toDataURL("image/png");
    link.click();

    setInstaSaved(true);
    setTimeout(() => setInstaSaved(false), 3000);
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
                두 사람의 생년월일을 입력하면<br />동서양 4개 체계가 궁합을 분석합니다

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
                ["var(--saju)", "오행"],
                ["var(--astro)", "별자리"],
                ["var(--numero)", "수비학"],
                ["var(--mbti)", "MBTI"],
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
              {(["오행", "별자리", "수비학", "MBTI"] as const).map((sys, i) => (
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
            <ScrollReveal delay={0} className="flex justify-end items-center mb-5">
              <span className="text-sm font-semibold" style={{ color: "var(--ink-muted)" }}>
                궁합 분석
              </span>
            </ScrollReveal>

            {/* ━━━ 1. Overall Score Hero ━━━ */}
            <ScrollReveal delay={80}>
              <div
                className="rounded-[14px] p-6 mb-3.5"
                style={{ background: "var(--bg-white)", border: "1.5px solid var(--border)" }}
              >
                <div className="flex items-center gap-2 mb-5">
                  <Dot color="var(--seal)" size={10} />
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
            </ScrollReveal>

            {/* ━━━ Archetype ━━━ */}
            <ScrollReveal delay={160}>
              <div
                className="rounded-[14px] p-6 mb-3.5"
                style={{ background: "var(--seal-bg)", border: "1.5px solid var(--seal-light)" }}
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
            </ScrollReveal>

            {/* ━━━ 2. 두 사람의 프로파일 비교 ━━━ */}
            <ScrollReveal delay={240}>
              <div
                className="rounded-[14px] p-6 mb-3.5"
                style={{ background: "var(--bg-white)", border: "1.5px solid var(--border)" }}
              >
                <SectionHeader
                  color="var(--seal)"
                  title="두 사람의 프로파일 비교"
                  subtitle="동서양 4개 체계로 본 각자의 성격"
                />

                {/* Side by side detailed profiles */}
                <div className="flex flex-col gap-3">
                  {/* Person 1 Detail Card */}
                  <div className="p-4 rounded-[10px]" style={{ background: "var(--bg-paper)" }}>
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black"
                        style={{ background: "var(--seal)", color: "#fff" }}
                      >
                        1
                      </div>
                      <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>
                        {p1Name}
                      </span>
                    </div>

                    {/* 4 system badges */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: "var(--saju)" + "15", color: "var(--saju)" }}>
                        {OHANG_INFO[result.person1.saju.day.ohang].kr}({result.person1.saju.day.ohang})
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: "var(--astro)" + "15", color: "var(--astro)" }}>
                        {result.person1.western.sunSign.name} ({result.person1.western.element})
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: "var(--numero)" + "15", color: "var(--numero)" }}>
                        LP {result.person1.numerology.lifePath} ({result.person1.numerology.lifePathInfo.name})
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: "var(--mbti)" + "15", color: "var(--mbti)" }}>
                        {result.person1.mbti.primaryType}
                      </span>
                    </div>

                    {/* Archetype */}
                    <div
                      className="text-sm font-bold mb-2"
                      style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
                    >
                      {result.person1.archetype}
                    </div>

                    {/* Personality Detail */}
                    <p className="text-[14px] leading-[1.9]" style={{ color: "var(--ink-muted)" }}>
                      {result.person1Detail}
                    </p>

                    {/* Top traits */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {result.person1.matches.slice(0, 4).map((m) => (
                        <span
                          key={m.trait}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: "var(--bg-white)", color: "var(--ink-muted)" }}
                        >
                          {m.trait} ({m.strength})
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-3 px-4">
                    <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                    <span className="text-[10px] font-bold tracking-widest" style={{ color: "var(--ink-faint)" }}>VS</span>
                    <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                  </div>

                  {/* Person 2 Detail Card */}
                  <div className="p-4 rounded-[10px]" style={{ background: "var(--bg-paper)" }}>
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black"
                        style={{ background: "var(--ink)", color: "var(--bg-paper)" }}
                      >
                        2
                      </div>
                      <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>
                        {p2Name}
                      </span>
                    </div>

                    {/* 4 system badges */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: "var(--saju)" + "15", color: "var(--saju)" }}>
                        {OHANG_INFO[result.person2.saju.day.ohang].kr}({result.person2.saju.day.ohang})
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: "var(--astro)" + "15", color: "var(--astro)" }}>
                        {result.person2.western.sunSign.name} ({result.person2.western.element})
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: "var(--numero)" + "15", color: "var(--numero)" }}>
                        LP {result.person2.numerology.lifePath} ({result.person2.numerology.lifePathInfo.name})
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: "var(--mbti)" + "15", color: "var(--mbti)" }}>
                        {result.person2.mbti.primaryType}
                      </span>
                    </div>

                    {/* Archetype */}
                    <div
                      className="text-sm font-bold mb-2"
                      style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
                    >
                      {result.person2.archetype}
                    </div>

                    {/* Personality Detail */}
                    <p className="text-[14px] leading-[1.9]" style={{ color: "var(--ink-muted)" }}>
                      {result.person2Detail}
                    </p>

                    {/* Top traits */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {result.person2.matches.slice(0, 4).map((m) => (
                        <span
                          key={m.trait}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: "var(--bg-white)", color: "var(--ink-muted)" }}
                        >
                          {m.trait} ({m.strength})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* ━━━ 3. Dimension Cards ━━━ */}
            <ScrollReveal delay={320}>
              <div
                className="rounded-[14px] p-6 mb-3.5"
                style={{ background: "var(--bg-white)", border: "1.5px solid var(--border)" }}
              >
                <SectionHeader
                  color="var(--seal)"
                  title="차원별 궁합"
                  subtitle="동양 사주, 서양 별자리, 수비학, MBTI 각각의 시선"
                />

                <div className="flex flex-col gap-5">
                  {result.dimensions.map((dim, i) => (
                    <div
                      key={dim.system}
                      className="rounded-lg overflow-hidden"
                      style={{
                        borderLeft: `3px solid ${SYSTEM_BORDER_COLORS[dim.system] || "var(--ink-muted)"}`,
                        background: "var(--bg-paper)",
                        padding: "16px",
                      }}
                    >
                      {/* System origin label */}
                      <div
                        className="text-[12px] font-semibold tracking-wider mb-2"
                        style={{ color: SYSTEM_COLORS[dim.system] || "var(--ink-light)" }}
                      >
                        {SYSTEM_ORIGIN_LABELS[dim.system] || dim.system}
                      </div>

                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Dot color={SYSTEM_COLORS[dim.system] || "var(--ink-muted)"} />
                          <span className="text-[15px] font-bold" style={{ color: "var(--ink)" }}>
                            {dim.name}
                          </span>
                        </div>
                        <span
                          className="text-[15px] font-black"
                          style={{ fontFamily: "var(--font-display)", color: SYSTEM_COLORS[dim.system] || "var(--ink)" }}
                        >
                          {dim.score}%
                        </span>
                      </div>
                      <ScoreBar score={dim.score} color={SYSTEM_COLORS[dim.system] || "var(--ink-muted)"} delay={i * 200} />

                      {/* Short description */}
                      <p className="text-[14px] leading-[1.8] mt-3" style={{ color: "var(--ink-muted)" }}>
                        {dim.description}
                      </p>

                      {/* Detail text — serif, smaller */}
                      {dim.detail && (
                        <p
                          className="text-[14px] leading-[1.9] mt-3 pt-3"
                          style={{
                            fontFamily: "var(--font-display)",
                            color: "var(--ink-medium)",
                            borderTop: "1px solid var(--border)",
                          }}
                        >
                          {dim.detail}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* ━━━ 4. 원소 이야기 ━━━ */}
            <ScrollReveal delay={400}>
              <div
                className="rounded-[14px] p-6 mb-3.5"
                style={{ background: "var(--bg-white)", border: "1.5px solid var(--border)" }}
              >
                <SectionHeader
                  color="var(--saju)"
                  title="원소 이야기"
                  subtitle="두 사람의 원소가 만나 빚어내는 서사"
                />

                {/* Element visual */}
                <div className="flex items-center justify-center gap-3 mb-5">
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

                {/* Literary blockquote */}
                <blockquote
                  className="text-sm leading-[2.1] italic"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--ink-medium)",
                    borderLeft: "3px solid var(--saju)",
                    paddingLeft: "16px",
                    margin: 0,
                  }}
                >
                  {result.elementStory}
                </blockquote>

                {/* Basic relation description */}
                <div
                  className="mt-4 p-3.5 rounded-lg text-[14px] leading-relaxed"
                  style={{ background: "var(--bg-paper)", color: "var(--ink-muted)" }}
                >
                  {result.elementRelation.description}
                </div>
              </div>
            </ScrollReveal>

            {/* ━━━ 5. 관계 타임라인 ━━━ */}
            <ScrollReveal delay={480}>
              <div
                className="rounded-[14px] p-6 mb-3.5"
                style={{ background: "var(--bg-white)", border: "1.5px solid var(--border)" }}
              >
                <SectionHeader
                  color="var(--seal)"
                  title="관계 타임라인"
                  subtitle="관계의 다섯 단계, 각 시기에 필요한 지혜"
                />

                {/* Timeline */}
                <div className="relative">
                  {/* Vertical line */}
                  <div
                    className="absolute left-[15px] top-[24px] bottom-[24px] w-px"
                    style={{ background: "var(--border-strong)" }}
                  />

                  <div className="flex flex-col gap-0">
                    {result.timelineAdvice.map((item, i) => (
                      <div key={item.phase} className="relative pl-10 pb-5">
                        {/* Dot on timeline */}
                        <div
                          className="absolute left-[8px] top-[2px] w-[15px] h-[15px] rounded-full border-2 flex items-center justify-center"
                          style={{
                            borderColor: i === 0 ? "var(--seal)" : i === result.timelineAdvice.length - 1 ? "var(--saju)" : "var(--border-strong)",
                            background: i === 0 ? "var(--seal)" : i === result.timelineAdvice.length - 1 ? "var(--saju)" : "var(--bg-white)",
                          }}
                        >
                          {(i === 0 || i === result.timelineAdvice.length - 1) && (
                            <div className="w-[5px] h-[5px] rounded-full" style={{ background: "#fff" }} />
                          )}
                        </div>

                        {/* Phase label */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[11px] font-black tracking-wider" style={{ color: "var(--ink)" }}>
                            {item.phase}
                          </span>
                          <span className="text-sm">{TIMELINE_ICONS[item.phase] || ""}</span>
                        </div>

                        {/* Advice */}
                        <div
                          className="p-3.5 rounded-lg"
                          style={{ background: "var(--bg-paper)" }}
                        >
                          <p className="text-[14px] leading-[1.9]" style={{ color: "var(--ink-muted)" }}>
                            {item.advice}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* ━━━ 6. 소통 스타일 ━━━ */}
            <ScrollReveal delay={560}>
              <div
                className="rounded-[14px] p-6 mb-3.5"
                style={{ background: "var(--bg-white)", border: "1.5px solid var(--border)" }}
              >
                <SectionHeader
                  color="var(--astro)"
                  title="소통 스타일"
                  subtitle="두 사람은 어떻게 다르게 말하고, 어떻게 연결될 수 있는가"
                />

                {/* Person 1 communication */}
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black"
                      style={{ background: "var(--seal)", color: "#fff" }}
                    >
                      1
                    </div>
                    <span className="text-[11px] font-bold tracking-wider" style={{ color: "var(--ink-light)" }}>
                      {p1Name}의 소통 방식
                    </span>
                  </div>
                  <div className="p-3.5 rounded-lg" style={{ background: "var(--bg-paper)" }}>
                    <p className="text-[14px] leading-[1.9]" style={{ color: "var(--ink-muted)" }}>
                      {result.communicationStyle.person1}
                    </p>
                  </div>
                </div>

                {/* Person 2 communication */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black"
                      style={{ background: "var(--ink)", color: "var(--bg-paper)" }}
                    >
                      2
                    </div>
                    <span className="text-[11px] font-bold tracking-wider" style={{ color: "var(--ink-light)" }}>
                      {p2Name}의 소통 방식
                    </span>
                  </div>
                  <div className="p-3.5 rounded-lg" style={{ background: "var(--bg-paper)" }}>
                    <p className="text-[14px] leading-[1.9]" style={{ color: "var(--ink-muted)" }}>
                      {result.communicationStyle.person2}
                    </p>
                  </div>
                </div>

                {/* Communication tip */}
                <div
                  className="p-4 rounded-[10px]"
                  style={{ background: "var(--astro)" + "08", border: "1px solid var(--astro)" + "20" }}
                >
                  <div className="text-[12px] font-bold tracking-wider mb-2" style={{ color: "var(--astro)" }}>
                    소통 팁
                  </div>
                  <p className="text-[14px] leading-[1.9]" style={{ color: "var(--ink-medium)" }}>
                    {result.communicationStyle.tip}
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* ━━━ 7. 갈등 패턴 ━━━ */}
            <ScrollReveal delay={640}>
              <div
                className="rounded-[14px] p-6 mb-3.5"
                style={{ background: "var(--bg-white)", border: "1.5px solid var(--border)" }}
              >
                <SectionHeader
                  color="var(--face)"
                  title="갈등 패턴"
                  subtitle="무엇이 충돌을 만들고, 어떻게 풀어갈 수 있는가"
                />

                {/* Trigger */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="6" stroke="var(--seal)" strokeWidth="1.5"/>
                      <path d="M7 4v3.5M7 9.5v.5" stroke="var(--seal)" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <span className="text-[11px] font-bold tracking-wider" style={{ color: "var(--seal-dark)" }}>
                      갈등의 시작점
                    </span>
                  </div>
                  <div className="p-3.5 rounded-lg" style={{ background: "var(--seal-bg)" }}>
                    <p className="text-[14px] leading-[1.9]" style={{ color: "var(--ink-medium)" }}>
                      {result.conflictPattern.trigger}
                    </p>
                  </div>
                </div>

                {/* Resolution */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="6" stroke="var(--saju)" strokeWidth="1.5"/>
                      <path d="M4.5 7l2 2 3-3.5" stroke="var(--saju)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-[11px] font-bold tracking-wider" style={{ color: "var(--saju)" }}>
                      해결의 열쇠
                    </span>
                  </div>
                  <div className="p-3.5 rounded-lg" style={{ background: "var(--saju)" + "08" }}>
                    <p className="text-[14px] leading-[1.9]" style={{ color: "var(--ink-medium)" }}>
                      {result.conflictPattern.resolution}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* ━━━ 8. Trait Analysis ━━━ */}
            <ScrollReveal delay={720}>
              <div
                className="rounded-[14px] p-6 mb-3.5"
                style={{ background: "var(--bg-white)", border: "1.5px solid var(--border)" }}
              >
                <SectionHeader
                  color="var(--ink)"
                  title="특성 분석"
                  subtitle="공유 특성, 보완 특성, 긴장 포인트"
                />

                {/* Shared */}
                {result.sharedTraits.length > 0 && (
                  <div className="mb-4">
                    <div className="text-[11px] font-semibold tracking-wider mb-2" style={{ color: "var(--ink-light)" }}>
                      공유 특성
                    </div>
                    <p className="text-[14px] mb-2 leading-relaxed" style={{ color: "var(--ink-muted)" }}>
                      두 사람이 함께 가지고 있는 특성. 공감의 기반이자 관계의 뿌리입니다.
                    </p>
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
                    <p className="text-[14px] mb-2 leading-relaxed" style={{ color: "var(--ink-muted)" }}>
                      한쪽이 부족한 것을 다른 쪽이 채워주는 조합. 함께할 때 더 완전해집니다.
                    </p>
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
                    <p className="text-[14px] mb-2 leading-relaxed" style={{ color: "var(--ink-muted)" }}>
                      에너지가 충돌하는 지점. 갈등의 씨앗이지만, 잘 다루면 성장의 촉매가 됩니다.
                    </p>
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
            </ScrollReveal>

            {/* ━━━ 9. 관계 조언 (Expanded) ━━━ */}
            <ScrollReveal delay={800}>
              <div
                className="rounded-[14px] p-6 mb-3.5"
                style={{ background: "var(--bg-white)", border: "1.5px solid var(--border)" }}
              >
                <SectionHeader
                  color="var(--seal)"
                  title="관계 조언"
                  subtitle="동서양 4체계가 전하는 메시지"
                />

                <blockquote
                  className="text-sm leading-[2.1] italic mb-5"
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

                {/* Additional contextual advice based on score */}
                <div className="flex flex-col gap-3 mt-4">
                  <div className="p-3.5 rounded-lg" style={{ background: "var(--bg-paper)" }}>
                    <div className="text-[12px] font-bold tracking-wider mb-1.5" style={{ color: "var(--saju)" }}>
                      오행의 관점
                    </div>
                    <p className="text-[14px] leading-[1.9]" style={{ color: "var(--ink-muted)" }}>
                      {result.elementRelation.relation === "상생"
                        ? "상생의 흐름을 타고 있는 관계입니다. 이 자연스러운 에너지를 의식하고 감사하세요. 물이 나무를 기르듯, 서로에게 영양분이 되어주는 관계를 계속 유지하는 것이 중요합니다."
                        : result.elementRelation.relation === "상극"
                        ? "상극의 에너지는 강한 변화를 만듭니다. 서로를 깎아내리는 것이 아니라, 더 단단하게 만드는 과정으로 바라보세요. 대장간의 불이 명검을 만들듯, 이 관계는 두 사람을 단련시킵니다."
                        : result.elementRelation.relation === "비화"
                        ? "같은 원소의 공명은 깊은 이해를 가져오지만, 같은 약점도 공유합니다. 의식적으로 다른 경험을 추구하고, 서로의 미세한 차이에서 배움을 찾으세요."
                        : "직접적 연결이 없는 원소 관계는 오히려 자유를 줍니다. 정해진 공식 없이 두 사람만의 관계를 만들어가세요. 그 과정 자체가 이 관계의 아름다움입니다."}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg" style={{ background: "var(--bg-paper)" }}>
                    <div className="text-[12px] font-bold tracking-wider mb-1.5" style={{ color: "var(--astro)" }}>
                      별자리의 관점
                    </div>
                    <p className="text-[14px] leading-[1.9]" style={{ color: "var(--ink-muted)" }}>
                      {result.person1.western.element === result.person2.western.element
                        ? `같은 ${result.person1.western.element} 원소의 두 별자리. 직관적 이해가 깊지만, 같은 한계를 공유하기도 합니다. 다른 원소의 친구나 활동을 통해 균형을 보완하세요.`
                        : `${result.person1.western.sunSign.name}(${result.person1.western.element})과 ${result.person2.western.sunSign.name}(${result.person2.western.element})의 조합은 서로에게 새로운 시각을 선물합니다. 상대의 원소적 특성을 배우려는 열린 마음이 관계를 풍요롭게 만듭니다.`}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg" style={{ background: "var(--bg-paper)" }}>
                    <div className="text-[12px] font-bold tracking-wider mb-1.5" style={{ color: "var(--numero)" }}>
                      수비학의 관점
                    </div>
                    <p className="text-[14px] leading-[1.9]" style={{ color: "var(--ink-muted)" }}>
                      {result.person1.numerology.lifePath === result.person2.numerology.lifePath
                        ? `같은 생명경로수 ${result.person1.numerology.lifePath}을 가진 두 사람. 인생의 큰 방향이 같기에 깊은 공감이 가능하지만, 같은 도전도 함께 마주합니다. 서로의 거울이 되어주세요.`
                        : `생명경로수 ${result.person1.numerology.lifePath}(${result.person1.numerology.lifePathInfo.name})과 ${result.person2.numerology.lifePath}(${result.person2.numerology.lifePathInfo.name})의 만남. 각자의 인생 여정이 교차하는 지점에서 특별한 배움이 일어납니다. 상대의 여정을 존중하면서 함께 걷는 구간을 소중히 하세요.`}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg" style={{ background: "var(--bg-paper)" }}>
                    <div className="text-[12px] font-bold tracking-wider mb-1.5" style={{ color: "var(--mbti)" }}>
                      MBTI의 관점
                    </div>
                    <p className="text-[14px] leading-[1.9]" style={{ color: "var(--ink-muted)" }}>
                      {result.person1.mbti.primaryType === result.person2.mbti.primaryType
                        ? `같은 ${result.person1.mbti.primaryType} 유형의 두 사람. 사고방식이 같아 깊이 공감하지만, 동일한 맹점을 공유합니다. 의식적으로 다른 관점을 탐색하세요.`
                        : `${result.person1.mbti.primaryType}과 ${result.person2.mbti.primaryType}의 만남. 각자의 인지 기능이 교차하는 지점에서 서로를 보완합니다. 상대의 성격 유형을 '다름'이 아닌 '풍요'로 받아들이세요.`}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* ━━━ 10. Share ━━━ */}
            <ScrollReveal delay={880}>
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
                      onClick={shareToKakao}
                      className="flex-1 py-3 text-sm font-semibold rounded-lg border-none cursor-pointer transition-opacity hover:opacity-80"
                      style={{ background: "#FEE500", color: "#191919", fontFamily: "inherit" }}
                    >
                      카카오톡 공유
                    </button>
                  </div>
                  <button
                    onClick={downloadResultCard}
                    className="no-print w-full py-3 text-sm font-semibold rounded-lg cursor-pointer transition-opacity hover:opacity-80 flex items-center justify-center gap-1.5"
                    style={{
                      background: instaSaved ? "var(--saju)" : "transparent",
                      color: instaSaved ? "#fff" : "var(--ink-muted)",
                      border: instaSaved ? "1.5px solid transparent" : "1.5px solid var(--border)",
                      fontFamily: "inherit",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <circle cx="12" cy="12" r="5" />
                      <circle cx="17.5" cy="6.5" r="1.5" />
                    </svg>
                    {instaSaved ? "이미지가 저장되었습니다. 인스타 스토리에 업로드하세요" : "인스타 스토리용 저장"}
                  </button>
                </div>
              </div>
            </ScrollReveal>

            {/* Actions */}
            <ScrollReveal delay={960}>
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
            </ScrollReveal>

            {/* Bottom Spacer */}
            <div className="h-10" />
          </>
        )}
      </div>
    </main>
  );
}
