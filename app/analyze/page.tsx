"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Seal from "@/components/ui/Seal";
import Divider from "@/components/ui/Divider";
import Nav from "@/components/Nav";
import ScrollReveal from "@/components/ScrollReveal";

import { analyzeCrosspoint, type CrosspointResult } from "@/lib/cross-engine";
import { OHANG_INFO, OHANG_LIST, type Ohang } from "@/lib/saju";
import { playStampSound } from "@/lib/sound";
import { saveAnalysis } from "@/lib/history";

// ━━━ 컬러 도트 ━━━
function Dot({ color, size = 8 }: { color: string; size?: number }) {
  return (
    <span
      className="inline-block rounded-full shrink-0"
      style={{ width: size, height: size, background: color }}
    />
  );
}

// ━━━ 탭 아이콘 (SVG) ━━━
function TabIcon({ type, active }: { type: string; active: boolean }) {
  const color = active ? "#C53D43" : "#8B7E74";
  const s = 16;
  const icons: Record<string, React.ReactNode> = {
    saju: (
      <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
        <rect x="2" y="2" width="5" height="5" rx="1" stroke={color} strokeWidth="1.5" />
        <rect x="9" y="2" width="5" height="5" rx="1" stroke={color} strokeWidth="1.5" />
        <rect x="2" y="9" width="5" height="5" rx="1" stroke={color} strokeWidth="1.5" />
        <rect x="9" y="9" width="5" height="5" rx="1" stroke={color} strokeWidth="1.5" />
      </svg>
    ),
    star: (
      <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="5.5" stroke={color} strokeWidth="1.5" />
        <circle cx="8" cy="8" r="1.5" fill={color} />
      </svg>
    ),
    num: (
      <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
        <path d="M5 3v10M11 3v10M2 6h12M2 10h12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    person: (
      <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="5" r="3" stroke={color} strokeWidth="1.5" />
        <path d="M2.5 14c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  };
  return <>{icons[type]}</>;
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
      // easeOutExpo for premium feel
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
  style = {},
}: {
  children: React.ReactNode;
  index: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`animate-stagger-in ${className}`}
      style={{
        ...style,
        animationDelay: `${index * 0.1}s`,
      }}
    >
      {children}
    </div>
  );
}

// ━━━ 오행 바 차트 ━━━
const OHANG_BAR_COLORS: Record<Ohang, string> = {
  "木": "var(--saju)",
  "火": "var(--seal)",
  "土": "var(--face)",
  "金": "#6B6B6B",
  "水": "var(--astro)",
};

function OhangBars({ balance }: { balance: Record<Ohang, number> }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const max = Math.max(...Object.values(balance), 1);

  return (
    <div ref={ref} className="flex flex-col gap-3">
      {OHANG_LIST.map((ohang) => {
        const val = balance[ohang];
        const pct = (val / max) * 100;
        return (
          <div key={ohang} className="flex items-center gap-3">
            <div className="w-8 text-center shrink-0">
              <span
                className="text-lg font-black"
                style={{
                  fontFamily: "var(--font-display)",
                  color: OHANG_BAR_COLORS[ohang],
                }}
              >
                {ohang}
              </span>
            </div>
            <div className="flex-1 flex items-center gap-2.5">
              <div
                className="h-[10px] rounded-full overflow-hidden flex-1"
                style={{ background: "var(--border)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: visible ? `${Math.max(pct, 8)}%` : "0%",
                    background: OHANG_BAR_COLORS[ohang],
                    transition: "width 1.2s cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                />
              </div>
              <span
                className="text-xs font-semibold w-14 text-right shrink-0"
                style={{ color: "var(--ink-muted)" }}
              >
                {OHANG_INFO[ohang].kr}
              </span>
            </div>
          </div>
        );
      })}
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

// ━━━ AI 해석 로딩 스켈레톤 ━━━
function InterpretationSkeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      <div className="h-4 rounded-full" style={{ background: "var(--border)", width: "100%" }} />
      <div className="h-4 rounded-full" style={{ background: "var(--border)", width: "92%" }} />
      <div className="h-4 rounded-full" style={{ background: "var(--border)", width: "85%" }} />
      <div className="h-4 rounded-full" style={{ background: "var(--border)", width: "70%" }} />
    </div>
  );
}

// ━━━ AI 해석 컴포넌트 ━━━
function AIInterpretation({ result }: { result: CrosspointResult }) {
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    async function fetchInterpretation() {
      try {
        const res = await fetch("/api/interpret", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(result),
        });
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        setInterpretation(data.interpretation);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchInterpretation();
  }, [result]);

  return (
    <div
      className="rounded-[14px] p-6 mb-3.5"
      style={{ background: "var(--bg-white)", border: "1.5px solid var(--border)" }}
    >
      <SectionHeader color="var(--seal)" title="AI 맞춤 해석" />
      {loading && <InterpretationSkeleton />}
      {error && (
        <p className="text-sm leading-[1.8]" style={{ color: "var(--ink-muted)" }}>
          해석을 불러올 수 없습니다. 잠시 후 다시 시도해주세요.
        </p>
      )}
      {interpretation && (
        <p className="text-[15px] leading-[1.9]" style={{ fontFamily: "var(--font-display)", color: "var(--ink-medium)" }}>
          {interpretation}
        </p>
      )}
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={null}>
      <AnalyzePageInner />
    </Suspense>
  );
}

function AnalyzePageInner() {
  const searchParams = useSearchParams();
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [hour, setHour] = useState("");
  const [name, setName] = useState("");
  const [result, setResult] = useState<CrosspointResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const valid = year.length === 4 && month !== "" && day !== "";

  const loadingSteps = ["사주 분석 중", "별자리 확인 중", "수비학 계산 중", "교차점 발견 중"];

  // Read share URL params on mount
  useEffect(() => {
    const y = searchParams.get("y");
    const m = searchParams.get("m");
    const d = searchParams.get("d");
    const n = searchParams.get("n");
    if (y && m && d) {
      setYear(y);
      setMonth(m);
      setDay(d);
      if (n) setName(n);
      // Auto-analyze after a short delay
      setTimeout(() => {
        const yi = parseInt(y), mi = parseInt(m), di = parseInt(d);
        if (yi && mi && di) {
          setLoading(true);
          setTimeout(() => {
            const r = analyzeCrosspoint(yi, mi, di, n || undefined);
            setResult(r);
            setLoading(false);
            playStampSound();
            try {
              saveAnalysis({
                id: `${yi}-${mi}-${di}-${Date.now()}`,
                date: new Date().toISOString(),
                year: yi,
                month: mi,
                day: di,
                name: n || undefined,
                convergenceRate: r.convergence_rate,
                archetype: r.archetype,
                elementHarmony: r.element_harmony.relation,
              });
            } catch {}
          }, 2000);
        }
      }, 300);
    }
  }, []);

  // Animate loading steps
  useEffect(() => {
    if (!loading) {
      setLoadingStep(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 600);
    return () => clearInterval(interval);
  }, [loading]);

  const analyze = () => {
    const y = parseInt(year);
    const m = parseInt(month);
    const d = parseInt(day);

    if (!y || y < 1924 || y > 2025) {
      setValidationError("1924~2025년 사이를 입력해주세요");
      return;
    }
    if (!m || m < 1 || m > 12) {
      setValidationError("1~12월 사이를 입력해주세요");
      return;
    }
    if (!d || d < 1 || d > 31) {
      setValidationError("1~31일 사이를 입력해주세요");
      return;
    }

    setValidationError(null);
    setLoading(true);

    // 내 정보를 localStorage에 저장 (궁합 페이지에서 자동 불러오기용)
    try {
      localStorage.setItem("destino_my_info", JSON.stringify({ year: y, month: m, day: d, name: name || "" }));
    } catch {}

    setTimeout(() => {
      const r = analyzeCrosspoint(y, m, d, name || undefined);
      setResult(r);
      setLoading(false);
      playStampSound();
      // Save to history
      try {
        saveAnalysis({
          id: `${y}-${m}-${d}-${Date.now()}`,
          date: new Date().toISOString(),
          year: y,
          month: m,
          day: d,
          name: name || undefined,
          convergenceRate: r.convergence_rate,
          archetype: r.archetype,
          elementHarmony: r.element_harmony.relation,
        });
      } catch {}
    }, 2000);
  };

  const reset = () => {
    setResult(null);
    setYear("");
    setMonth("");
    setDay("");
    setHour("");
    setName("");
    setCopied(false);
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleShare = useCallback(() => {
    const url = `${window.location.origin}/analyze?y=${year}&m=${month}&d=${day}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [year, month, day]);

  const shareToTwitter = () => {
    const text = `동서양 3개 체계가 분석한 나의 교차점: ${result?.archetype}. 수렴률 ${result?.convergence_rate}%`;
    const url = `${window.location.origin}/analyze`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      "_blank"
    );
  };

  const shareToThreads = () => {
    const text = `동서양 3개 체계가 분석한 나의 교차점: ${result?.archetype}. 수렴률 ${result?.convergence_rate}% ${window.location.origin}/analyze`;
    window.open(
      `https://www.threads.net/intent/post?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  const inputClass =
    "w-full px-4 py-3.5 text-lg font-bold rounded-[10px] outline-none transition-colors";

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
              <Seal size="lg" char="命" className="mx-auto animate-seal-pop" />
              <h1
                className="text-2xl font-black mt-3 tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                운명의 교차점
              </h1>
              <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--ink-muted)" }}>
                생년월일을 입력하면<br />동서양 3개 체계가 동시에 분석합니다
              </p>
            </div>

            <div
              className="rounded-[14px] p-5 mb-3.5 animate-fade-up"
              style={{
                background: "var(--bg-white)",
                border: "1.5px solid var(--border)",
                animationDelay: "0.05s",
              }}
            >
              {/* 이름 (선택) */}
              <div className="mb-3.5">
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
                  placeholder="예: 홍길동"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = "var(--seal)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
                <p className="text-[11px] mt-1" style={{ color: "var(--ink-light)" }}>
                  영문 이름 입력 시 운명수(Destiny Number)도 함께 분석합니다
                </p>
              </div>

              {/* 연도 */}
              <div className="mb-3.5">
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--ink-medium)" }}>
                  태어난 해
                </label>
                <input
                  className={inputClass}
                  style={{ background: "var(--bg-paper)", border: "2px solid var(--border)", color: "var(--ink)" }}
                  placeholder="예: 1990"
                  inputMode="numeric"
                  value={year}
                  onChange={(e) => setYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  onFocus={(e) => (e.target.style.borderColor = "var(--seal)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>

              {/* 월 / 일 */}
              <div className="flex gap-2.5 mb-3.5">
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--ink-medium)" }}>
                    월
                  </label>
                  <input
                    className={inputClass}
                    style={{ background: "var(--bg-paper)", border: "2px solid var(--border)", color: "var(--ink)" }}
                    placeholder="3"
                    inputMode="numeric"
                    value={month}
                    onChange={(e) => setMonth(e.target.value.replace(/\D/g, "").slice(0, 2))}
                    onFocus={(e) => (e.target.style.borderColor = "var(--seal)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--ink-medium)" }}>
                    일
                  </label>
                  <input
                    className={inputClass}
                    style={{ background: "var(--bg-paper)", border: "2px solid var(--border)", color: "var(--ink)" }}
                    placeholder="15"
                    inputMode="numeric"
                    value={day}
                    onChange={(e) => setDay(e.target.value.replace(/\D/g, "").slice(0, 2))}
                    onFocus={(e) => (e.target.style.borderColor = "var(--seal)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                  />
                </div>
              </div>

              {/* 시간 (선택) */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-1.5" style={{ color: "var(--ink-medium)" }}>
                  태어난 시간
                  <span
                    className="text-[10px] font-normal px-1.5 py-0.5 rounded"
                    style={{ background: "var(--bg-paper)", color: "var(--ink-light)" }}
                  >
                    선택
                  </span>
                </label>
                <input
                  className={inputClass}
                  style={{ background: "var(--bg-paper)", border: "2px solid var(--border)", color: "var(--ink)", opacity: 0.5 }}
                  placeholder="예: 14 (24시간제)"
                  value={hour}
                  onChange={(e) => setHour(e.target.value.replace(/\D/g, "").slice(0, 2))}
                  onFocus={(e) => (e.target.style.borderColor = "var(--seal)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                  disabled
                />
                <p className="text-[11px] mt-1" style={{ color: "var(--ink-light)" }}>
                  시간 입력 시 더 정확한 일주 분석이 가능합니다
                </p>
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
                animationDelay: "0.1s",
              }}
            >
              {valid ? "교차점 발견하기" : "생년월일을 입력해주세요"}
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

            <div className="flex justify-center gap-3 mt-4 animate-fade-up" style={{ animationDelay: "0.15s" }}>
              {([
                ["#2D5A27", "사주"],
                ["#1E3A5F", "별자리"],
                ["#5B3E8A", "수비학"],
                ["#8B6914", "띠"],
              ] as const).map(([c, v]) => (
                <span key={v} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--ink-muted)" }}>
                  <Dot color={c} />{v}
                </span>
              ))}
            </div>
          </>
        )}

        {/* ━━━ LOADING ━━━ */}
        {loading && (
          <div className="text-center py-20">
            <div className="relative inline-block mb-4">
              <Seal size="lg" char="命" className="mx-auto animate-seal-pop" />
              <div
                className="absolute inset-0 rounded-[3px] animate-pulse-ring"
                style={{ border: "2px solid var(--seal)" }}
              />
            </div>
            <div className="flex flex-col items-center gap-2 mt-4">
              {loadingSteps.map((step, i) => (
                <p
                  key={step}
                  className="text-sm font-semibold transition-all duration-500"
                  style={{
                    color: i <= loadingStep ? "var(--ink)" : "transparent",
                    fontFamily: "var(--font-display)",
                    opacity: i <= loadingStep ? 1 : 0,
                    transform: i <= loadingStep ? "translateY(0)" : "translateY(8px)",
                    transition: "opacity 0.5s ease, transform 0.5s ease, color 0.5s ease",
                  }}
                >
                  {i === loadingStep && "● "}{step}{i < loadingStep && " ✓"}
                </p>
              ))}
            </div>
            <div className="flex justify-center gap-1 mt-4">
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
          </div>
        )}

        {/* ━━━ RESULT ━━━ */}
        {result && (
          <>
            {/* ═══════════════════════════════════════════
                SECTION A: FREE PREVIEW (always visible)
               ═══════════════════════════════════════════ */}

            {/* Date */}
            <ScrollReveal delay={0} className="flex justify-end items-center mb-5">
              <span className="text-sm font-semibold" style={{ color: "var(--ink-muted)" }}>
                {year}.{month}.{day}
              </span>
            </ScrollReveal>

            {/* Convergence Hero */}
            <ScrollReveal delay={80}>
              <div
                className="rounded-[14px] p-6 mb-3.5"
                style={{ background: "var(--bg-white)", border: "1.5px solid var(--border)" }}
              >
                <div className="flex items-center gap-2 mb-5">
                  <Dot color="#C53D43" size={10} />
                  <span className="text-sm font-bold tracking-wider" style={{ color: "var(--seal)" }}>교차점</span>
                </div>

                {/* Convergence Rate Counter */}
                <div className="text-center mb-5">
                  <ConvergenceCounter rate={result.convergence_rate} />
                  <div
                    className="text-base font-bold mt-2"
                    style={{ fontFamily: "var(--font-display)", color: "var(--seal)" }}
                  >
                    {result.element_harmony.relation === "공명"
                      ? "완벽한 공명"
                      : result.element_harmony.relation === "상생"
                      ? "상생의 조화"
                      : result.element_harmony.relation === "긴장"
                      ? "변화의 긴장"
                      : "독특한 조합"}
                  </div>
                </div>

                {/* Convergence Bar */}
                <div className="h-2 rounded-full overflow-hidden mb-5" style={{ background: "var(--border)" }}>
                  <div
                    className="h-full rounded-full animate-bar-grow"
                    style={{
                      width: `${result.convergence_rate}%`,
                      background: "var(--seal)",
                    }}
                  />
                </div>

                {/* East vs West Connection */}
                <div className="flex gap-2">
                  <div className="flex-1 p-3.5 rounded-[10px] text-center" style={{ background: "var(--bg-paper)" }}>
                    <div className="flex items-center justify-center gap-1.5 mb-1.5">
                      <Dot color={OHANG_INFO[result.saju.day.ohang].color} />
                      <span className="text-[11px] font-semibold tracking-wider" style={{ color: "var(--ink-light)" }}>동양</span>
                    </div>
                    <div
                      className="text-[26px] font-black"
                      style={{ fontFamily: "var(--font-display)", color: OHANG_INFO[result.saju.day.ohang].color }}
                    >
                      {result.saju.day.ohang}
                    </div>
                    <div className="text-sm font-semibold mt-0.5" style={{ color: "var(--ink-medium)" }}>
                      {OHANG_INFO[result.saju.day.ohang].kr}
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
                      <Dot color={result.western.sunSign.color} />
                      <span className="text-[11px] font-semibold tracking-wider" style={{ color: "var(--ink-light)" }}>서양</span>
                    </div>
                    <div
                      className="text-xl font-black"
                      style={{ fontFamily: "var(--font-display)", color: result.western.sunSign.color }}
                    >
                      {result.western.sunSign.name}
                    </div>
                    <div className="text-sm font-semibold mt-0.5" style={{ color: "var(--ink-medium)" }}>
                      {result.western.element} {result.western.sunSign.element_kr}
                    </div>
                  </div>
                </div>

                {/* Harmony Description */}
                <div
                  className="mt-4 p-3.5 rounded-lg text-[15px] leading-[1.9]"
                  style={{ fontFamily: "var(--font-display)", background: "var(--bg-paper)", color: "var(--ink-muted)" }}
                >
                  {result.element_harmony.description}
                </div>
              </div>
            </ScrollReveal>

            {/* Archetype Name ONLY (no description in free preview) */}
            <ScrollReveal delay={160}>
              <div
                className="rounded-[14px] p-6 mb-3.5"
                style={{ background: "var(--seal-bg)", border: "1.5px solid #E8C5C7" }}
              >
                <div className="text-[11px] font-semibold tracking-widest mb-2" style={{ color: "var(--ink-light)" }}>
                  교차점 유형
                </div>
                <h2
                  className="text-[22px] font-black leading-snug"
                  style={{ fontFamily: "var(--font-display)", color: "var(--seal-dark)" }}
                >
                  {result.archetype}
                </h2>
              </div>
            </ScrollReveal>

            {/* ═══════════════════════════════════════════
                SECTION B: PREMIUM REPORT (PaymentGate)
               ═══════════════════════════════════════════ */}
            {/* SECTION B: FULL REPORT */}
              <div className="flex flex-col gap-1">

                {/* B1: 아키타입 상세 */}
                <ScrollReveal delay={0}>
                  <div
                    className="rounded-[14px] p-6 mb-3.5"
                    style={{ background: "var(--bg-white)", border: "1.5px solid var(--border)" }}
                  >
                    <SectionHeader color="var(--seal)" title="아키타입 상세" />
                    <h3
                      className="text-lg font-black mb-2"
                      style={{ fontFamily: "var(--font-display)", color: "var(--seal-dark)" }}
                    >
                      {result.archetype}
                    </h3>
                    <p className="text-[15px] leading-[1.9] mb-4" style={{ fontFamily: "var(--font-display)", color: "var(--ink-medium)" }}>
                      {result.archetype_desc}
                    </p>

                    {/* cross_message blockquote */}
                    {result.cross_message && (
                      <blockquote
                        className="text-[15px] leading-[2] italic"
                        style={{
                          fontFamily: "var(--font-display)",
                          color: "var(--ink-medium)",
                          borderLeft: "3px solid var(--seal)",
                          paddingLeft: "16px",
                          margin: 0,
                        }}
                      >
                        {result.cross_message}
                      </blockquote>
                    )}

                    {/* Career Crosspoint */}
                    {(result as any)?.career_crosspoint && (
                      <>
                        <Divider />
                        <div className="mt-5">
                          <div className="flex items-center gap-2 mb-3">
                            <Dot color="var(--saju)" size={7} />
                            <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>직업/진로 교차점</span>
                          </div>
                          <h4
                            className="text-base font-black mb-2"
                            style={{ fontFamily: "var(--font-display)", color: "var(--saju)" }}
                          >
                            {(result as any).career_crosspoint?.title}
                          </h4>
                          <p
                            className="text-[15px] leading-[1.9] mb-4"
                            style={{ fontFamily: "var(--font-display)", color: "var(--ink-medium)" }}
                          >
                            {(result as any).career_crosspoint?.description}
                          </p>
                          {(result as any).career_crosspoint?.ideal_fields && (
                            <div className="flex flex-wrap gap-2">
                              {((result as any).career_crosspoint.ideal_fields as string[]).map((f: string) => (
                                <Chip key={f} label={f} color="var(--saju)" />
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {/* Relationship Crosspoint */}
                    {(result as any)?.relationship_crosspoint && (
                      <>
                        <Divider />
                        <div className="mt-5">
                          <div className="flex items-center gap-2 mb-3">
                            <Dot color="var(--seal)" size={7} />
                            <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>연애/관계 교차점</span>
                          </div>
                          <h4
                            className="text-base font-black mb-2"
                            style={{ fontFamily: "var(--font-display)", color: "var(--seal)" }}
                          >
                            {(result as any).relationship_crosspoint?.title}
                          </h4>
                          <p
                            className="text-[15px] leading-[1.9] mb-4"
                            style={{ fontFamily: "var(--font-display)", color: "var(--ink-medium)" }}
                          >
                            {(result as any).relationship_crosspoint?.description}
                          </p>
                          {(result as any).relationship_crosspoint?.ideal_partner_traits && (
                            <div className="flex flex-wrap gap-2">
                              {((result as any).relationship_crosspoint.ideal_partner_traits as string[]).map((t: string) => (
                                <Chip key={t} label={t} color="var(--seal)" />
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </ScrollReveal>

                {/* B2: 오행 밸런스 */}
                <ScrollReveal delay={80}>
                  <div
                    className="rounded-[14px] p-6 mb-3.5"
                    style={{ background: "var(--bg-white)", border: "1.5px solid var(--border)" }}
                  >
                    <SectionHeader color="var(--saju)" title="오행 밸런스" />
                    <div className="flex justify-center gap-3 mb-4">
                      {(["木", "火", "土", "金", "水"] as const).map((oh) => (
                        <span
                          key={oh}
                          className="text-xs font-semibold px-2 py-1 rounded"
                          style={{
                            background: OHANG_BAR_COLORS[oh] + "15",
                            color: OHANG_BAR_COLORS[oh],
                          }}
                        >
                          {oh} {OHANG_INFO[oh].kr}
                        </span>
                      ))}
                    </div>
                    <OhangBars balance={result.saju.ohang_balance} />
                  </div>
                </ScrollReveal>

                {/* B3: 사주 상세분석 */}
                <ScrollReveal delay={160}>
                  <div
                    className="rounded-[14px] p-6 mb-3.5"
                    style={{ background: "var(--bg-white)", border: "1.5px solid var(--border)" }}
                  >
                    <SectionHeader color="var(--saju)" title="사주 상세분석" />

                    {/* Pillar Cards */}
                    <div className="flex gap-2.5 mb-3.5">
                      <div className="flex-1 text-center p-3.5 rounded-[10px]" style={{ background: "var(--bg-paper)" }}>
                        <div className="text-[11px] font-semibold mb-1.5" style={{ color: "var(--ink-light)" }}>연주</div>
                        <div className="text-[28px] font-black" style={{ fontFamily: "var(--font-display)" }}>
                          {result.saju.year.cheongan}{result.saju.year.jiji}
                        </div>
                        <div className="flex items-center justify-center gap-1 mt-1.5">
                          <Dot color={OHANG_INFO[result.saju.year.ohang].color} />
                          <span className="text-sm" style={{ color: "var(--ink-medium)" }}>
                            {result.saju.year.ohang} {OHANG_INFO[result.saju.year.ohang].kr}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 text-center p-3.5 rounded-[10px]" style={{ background: "var(--bg-paper)" }}>
                        <div className="text-[11px] font-semibold mb-1.5" style={{ color: "var(--ink-light)" }}>일간</div>
                        <div className="text-[28px] font-black" style={{ fontFamily: "var(--font-display)" }}>
                          {result.saju.day.cheongan}
                        </div>
                        <div className="flex items-center justify-center gap-1 mt-1.5">
                          <Dot color={OHANG_INFO[result.saju.day.ohang].color} />
                          <span className="text-sm" style={{ color: "var(--ink-medium)" }}>
                            {result.saju.personality.nature}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Personality description */}
                    <div className="p-4 rounded-lg mb-3.5" style={{ background: "var(--bg-paper)" }}>
                      <div className="text-[11px] font-semibold tracking-wider mb-2" style={{ color: "var(--ink-light)" }}>
                        일간의 성격
                      </div>
                      <p className="text-[15px] leading-[1.9] mb-3" style={{ fontFamily: "var(--font-display)", color: "var(--ink-medium)" }}>
                        {result.saju.personality.personality}
                      </p>
                      <div
                        className="text-sm italic leading-relaxed p-3 rounded-lg"
                        style={{
                          fontFamily: "var(--font-display)",
                          color: "var(--ink-muted)",
                          background: "var(--bg-white)",
                          borderLeft: "2px solid var(--saju)",
                        }}
                      >
                        &ldquo;{result.saju.personality.image}&rdquo;
                      </div>
                    </div>

                    {/* Detailed Personality */}
                    {(result.saju.personality as any)?.detailed_personality && (
                      <div className="p-4 rounded-lg mb-3.5" style={{ background: "var(--bg-paper)" }}>
                        <div className="flex items-center gap-2 mb-2">
                          <Dot color="var(--saju)" size={7} />
                          <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>성격 심층 분석</span>
                        </div>
                        <p
                          className="text-[15px] leading-[2]"
                          style={{ fontFamily: "var(--font-display)", color: "var(--ink-medium)" }}
                        >
                          {(result.saju.personality as any).detailed_personality}
                        </p>
                      </div>
                    )}

                    {/* Career */}
                    {(result.saju.personality as any)?.career && (
                      <div className="p-4 rounded-lg mb-3.5" style={{ background: "var(--bg-paper)" }}>
                        <div className="flex items-center gap-2 mb-2">
                          <Dot color="#8B6914" size={7} />
                          <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>직업/진로</span>
                        </div>
                        <p
                          className="text-[15px] leading-[2]"
                          style={{ fontFamily: "var(--font-display)", color: "var(--ink-medium)" }}
                        >
                          {(result.saju.personality as any).career}
                        </p>
                      </div>
                    )}

                    {/* Relationship Style */}
                    {(result.saju.personality as any)?.relationship && (
                      <div className="p-4 rounded-lg mb-3.5" style={{ background: "var(--bg-paper)" }}>
                        <div className="flex items-center gap-2 mb-2">
                          <Dot color="var(--seal)" size={7} />
                          <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>연애/관계 스타일</span>
                        </div>
                        <p
                          className="text-[15px] leading-[2]"
                          style={{ fontFamily: "var(--font-display)", color: "var(--ink-medium)" }}
                        >
                          {(result.saju.personality as any).relationship}
                        </p>
                      </div>
                    )}

                    {/* Weakness / Growth Area */}
                    {(result.saju.personality as any)?.weakness && (
                      <div className="p-4 rounded-lg mb-3.5" style={{ background: "var(--bg-paper)" }}>
                        <div className="flex items-center gap-2 mb-2">
                          <Dot color="var(--ink-muted)" size={7} />
                          <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>약점/성장 영역</span>
                        </div>
                        <p
                          className="text-[15px] leading-[2]"
                          style={{ fontFamily: "var(--font-display)", color: "var(--ink-medium)" }}
                        >
                          {(result.saju.personality as any).weakness}
                        </p>
                      </div>
                    )}

                    {/* Life Advice */}
                    {(result.saju.personality as any)?.advice && (
                      <div className="p-4 rounded-lg mb-3.5" style={{ background: "var(--bg-paper)" }}>
                        <div className="flex items-center gap-2 mb-2">
                          <Dot color="var(--numero)" size={7} />
                          <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>인생 조언</span>
                        </div>
                        <p
                          className="text-[15px] leading-[2]"
                          style={{ fontFamily: "var(--font-display)", color: "var(--ink-medium)" }}
                        >
                          {(result.saju.personality as any).advice}
                        </p>
                      </div>
                    )}

                    {/* Animal Sign — Expanded */}
                    <div className="p-4 rounded-lg" style={{ background: "var(--bg-paper)" }}>
                      <div className="flex items-center gap-2 mb-3">
                        <Dot color="#8B6914" size={7} />
                        <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>
                          {result.saju.animal.animal_kr}띠
                        </span>
                        <span className="text-xs ml-1" style={{ color: "var(--ink-light)" }}>
                          {result.saju.year.jiji}
                        </span>
                      </div>
                      {(result.saju.animal as any)?.personality && (
                        <p
                          className="text-[15px] leading-[2] mb-3"
                          style={{ fontFamily: "var(--font-display)", color: "var(--ink-medium)" }}
                        >
                          {(result.saju.animal as any).personality}
                        </p>
                      )}
                      {(result.saju.animal as any)?.compatible && (
                        <div className="mb-2">
                          <span className="text-xs font-semibold" style={{ color: "var(--saju)" }}>잘 맞는 띠: </span>
                          <span className="text-xs" style={{ color: "var(--ink-medium)" }}>
                            {((result.saju.animal as any).compatible as string[]).join(", ")}
                          </span>
                        </div>
                      )}
                      {(result.saju.animal as any)?.incompatible && (
                        <div>
                          <span className="text-xs font-semibold" style={{ color: "var(--seal)" }}>조심할 띠: </span>
                          <span className="text-xs" style={{ color: "var(--ink-medium)" }}>
                            {((result.saju.animal as any).incompatible as string[]).join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollReveal>

                {/* B4: 별자리 상세 */}
                <ScrollReveal delay={240}>
                  <div
                    className="rounded-[14px] p-6 mb-3.5"
                    style={{ background: "var(--bg-white)", border: "1.5px solid var(--border)" }}
                  >
                    <SectionHeader color={result.western.sunSign.color} title="별자리 상세" />

                    <div className="text-center py-2">
                      <div
                        className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-3"
                        style={{ background: result.western.sunSign.color + "15" }}
                      >
                        <span className="text-2xl">{result.western.sunSign.symbol}</span>
                      </div>
                      <div className="text-[22px] font-black mb-1" style={{ fontFamily: "var(--font-display)" }}>
                        {result.western.sunSign.name}
                      </div>
                      <div className="text-xs mb-3" style={{ color: "var(--ink-light)" }}>
                        {result.western.sunSign.date_range}
                      </div>
                      <div className="text-[15px] mb-4 leading-[1.9]" style={{ fontFamily: "var(--font-display)", color: "var(--ink-muted)" }}>
                        {result.western.sunSign.personality}
                      </div>

                      {/* Element & Modality */}
                      <div className="flex gap-2 justify-center mb-4">
                        <span
                          className="inline-block px-4 py-1.5 rounded-full text-sm font-bold"
                          style={{ background: result.western.sunSign.color + "12", color: result.western.sunSign.color }}
                        >
                          {result.western.element} {result.western.sunSign.element_kr}
                        </span>
                        <span
                          className="inline-block px-4 py-1.5 rounded-full text-sm font-bold"
                          style={{ background: "var(--bg-paper)", color: "var(--ink-muted)" }}
                        >
                          {result.western.sunSign.modality_kr}
                        </span>
                      </div>

                      {/* Trait Chips */}
                      <div className="flex flex-wrap justify-center gap-2 mb-4">
                        {result.western.sunSign.trait.map((t) => (
                          <Chip key={t} label={t} color={result.western.sunSign.color} />
                        ))}
                      </div>

                      {/* Ruler & Modality Explanation */}
                      <div
                        className="text-left p-3.5 rounded-lg text-[15px] leading-[1.8]"
                        style={{ background: "var(--bg-paper)", color: "var(--ink-muted)" }}
                      >
                        <span className="font-bold" style={{ color: "var(--ink-medium)" }}>
                          {result.western.sunSign.modality_kr}
                        </span>
                        {" "}
                        {result.western.modality === "Cardinal"
                          ? "시작하고 이끄는 힘. 새로운 계절을 여는 별자리입니다."
                          : result.western.modality === "Fixed"
                          ? "집중하고 지속하는 힘. 계절의 한가운데에서 깊이를 만드는 별자리입니다."
                          : "적응하고 변화하는 힘. 계절의 전환기에서 유연하게 흐르는 별자리입니다."}
                        <br />
                        <span className="text-xs" style={{ color: "var(--ink-light)" }}>
                          수호성: {result.western.sunSign.ruler_kr} ({result.western.sunSign.ruler}) / {result.western.sunSign.house}하우스
                        </span>
                      </div>

                      {/* Detailed Personality */}
                      {(result.western.sunSign as any)?.detailed_personality && (
                        <div className="text-left mt-4 p-4 rounded-lg" style={{ background: "var(--bg-paper)" }}>
                          <div className="flex items-center gap-2 mb-2">
                            <Dot color={result.western.sunSign.color} size={7} />
                            <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>성격 심층 분석</span>
                          </div>
                          <p
                            className="text-[15px] leading-[2]"
                            style={{ fontFamily: "var(--font-display)", color: "var(--ink-medium)" }}
                          >
                            {(result.western.sunSign as any).detailed_personality}
                          </p>
                        </div>
                      )}

                      {/* Love Style */}
                      {(result.western.sunSign as any)?.love_style && (
                        <div className="text-left mt-3.5 p-4 rounded-lg" style={{ background: "var(--bg-paper)" }}>
                          <div className="flex items-center gap-2 mb-2">
                            <Dot color="var(--seal)" size={7} />
                            <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>연애 스타일</span>
                          </div>
                          <p
                            className="text-[15px] leading-[2]"
                            style={{ fontFamily: "var(--font-display)", color: "var(--ink-medium)" }}
                          >
                            {(result.western.sunSign as any).love_style}
                          </p>
                        </div>
                      )}

                      {/* Career Strengths */}
                      {(result.western.sunSign as any)?.career_strengths && (
                        <div className="text-left mt-3.5 p-4 rounded-lg" style={{ background: "var(--bg-paper)" }}>
                          <div className="flex items-center gap-2 mb-3">
                            <Dot color="var(--saju)" size={7} />
                            <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>직업 강점</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {((result.western.sunSign as any).career_strengths as string[]).map((s: string) => (
                              <Chip key={s} label={s} color={result.western.sunSign.color} />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Shadow Side / Challenges */}
                      {(result.western.sunSign as any)?.shadow_side && (
                        <div className="text-left mt-3.5 p-4 rounded-lg" style={{ background: "var(--bg-paper)" }}>
                          <div className="flex items-center gap-2 mb-2">
                            <Dot color="var(--ink-muted)" size={7} />
                            <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>그림자 / 도전</span>
                          </div>
                          <p
                            className="text-[15px] leading-[2]"
                            style={{ fontFamily: "var(--font-display)", color: "var(--ink-medium)" }}
                          >
                            {(result.western.sunSign as any).shadow_side}
                          </p>
                        </div>
                      )}

                      {/* Best / Worst Compatibility */}
                      {((result.western.sunSign as any)?.best_compatibility || (result.western.sunSign as any)?.worst_compatibility) && (
                        <div className="text-left mt-3.5 p-4 rounded-lg" style={{ background: "var(--bg-paper)" }}>
                          <div className="flex items-center gap-2 mb-3">
                            <Dot color="var(--astro)" size={7} />
                            <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>별자리 궁합</span>
                          </div>
                          {(result.western.sunSign as any)?.best_compatibility && (
                            <div className="mb-2">
                              <span className="text-xs font-semibold" style={{ color: "var(--saju)" }}>최고 궁합: </span>
                              <span className="text-xs" style={{ color: "var(--ink-medium)" }}>
                                {((result.western.sunSign as any).best_compatibility as string[]).join(", ")}
                              </span>
                            </div>
                          )}
                          {(result.western.sunSign as any)?.worst_compatibility && (
                            <div>
                              <span className="text-xs font-semibold" style={{ color: "var(--seal)" }}>도전적 궁합: </span>
                              <span className="text-xs" style={{ color: "var(--ink-medium)" }}>
                                {((result.western.sunSign as any).worst_compatibility as string[]).join(", ")}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Life Lesson */}
                      {(result.western.sunSign as any)?.life_lesson && (
                        <blockquote
                          className="text-left mt-4 text-[15px] leading-[2] italic"
                          style={{
                            fontFamily: "var(--font-display)",
                            color: "var(--ink-medium)",
                            borderLeft: `3px solid ${result.western.sunSign.color}`,
                            paddingLeft: "16px",
                            margin: 0,
                          }}
                        >
                          {(result.western.sunSign as any).life_lesson}
                        </blockquote>
                      )}
                    </div>
                  </div>
                </ScrollReveal>

                {/* B5: 수비학 상세 */}
                <ScrollReveal delay={320}>
                  <div
                    className="rounded-[14px] p-6 mb-3.5"
                    style={{ background: "var(--bg-white)", border: "1.5px solid var(--border)" }}
                  >
                    <SectionHeader color="var(--numero)" title="수비학 상세" />

                    <div className="text-center py-2">
                      <div
                        className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-3"
                        style={{ background: "var(--numero)" + "15" }}
                      >
                        <span
                          className="text-2xl font-black"
                          style={{ fontFamily: "var(--font-display)", color: "var(--numero)" }}
                        >
                          {result.numerology.lifePath}
                        </span>
                      </div>
                      <div className="text-[11px] mb-1" style={{ color: "var(--ink-light)" }}>생명경로수</div>
                      <div className="text-xl font-black mb-2" style={{ fontFamily: "var(--font-display)" }}>
                        {result.numerology.lifePathInfo.name}
                      </div>
                      {result.numerology.lifePathInfo.is_master && (
                        <span
                          className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3"
                          style={{ background: "var(--seal-bg)", color: "var(--seal)" }}
                        >
                          마스터 넘버
                        </span>
                      )}
                      <div className="text-[15px] mb-4 leading-[1.9]" style={{ fontFamily: "var(--font-display)", color: "var(--ink-muted)" }}>
                        {result.numerology.lifePathInfo.personality}
                      </div>

                      {/* Strength Chips */}
                      <div className="mb-3">
                        <div className="text-[11px] font-semibold mb-2" style={{ color: "var(--ink-light)" }}>
                          강점
                        </div>
                        <div className="flex flex-wrap justify-center gap-2">
                          {result.numerology.lifePathInfo.strength.map((s) => (
                            <Chip key={s} label={s} color="var(--saju)" />
                          ))}
                        </div>
                      </div>

                      {/* Shadow Chips */}
                      <div className="mb-4">
                        <div className="text-[11px] font-semibold mb-2" style={{ color: "var(--ink-light)" }}>
                          그림자
                        </div>
                        <div className="flex flex-wrap justify-center gap-2">
                          {result.numerology.lifePathInfo.shadow.map((s) => (
                            <Chip key={s} label={s} color="var(--ink-light)" />
                          ))}
                        </div>
                      </div>

                      {/* Detailed Personality */}
                      {(result.numerology.lifePathInfo as any)?.detailed_personality && (
                        <div className="text-left p-4 rounded-lg mb-3.5" style={{ background: "var(--bg-paper)" }}>
                          <div className="flex items-center gap-2 mb-2">
                            <Dot color="var(--numero)" size={7} />
                            <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>성격 심층 분석</span>
                          </div>
                          <p
                            className="text-[15px] leading-[2]"
                            style={{ fontFamily: "var(--font-display)", color: "var(--ink-medium)" }}
                          >
                            {(result.numerology.lifePathInfo as any).detailed_personality}
                          </p>
                        </div>
                      )}

                      {/* Life Purpose */}
                      {(result.numerology.lifePathInfo as any)?.life_purpose && (
                        <div className="text-left p-4 rounded-lg mb-3.5" style={{ background: "var(--bg-paper)" }}>
                          <div className="flex items-center gap-2 mb-2">
                            <Dot color="var(--astro)" size={7} />
                            <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>인생 목적</span>
                          </div>
                          <p
                            className="text-[15px] leading-[2]"
                            style={{ fontFamily: "var(--font-display)", color: "var(--ink-medium)" }}
                          >
                            {(result.numerology.lifePathInfo as any).life_purpose}
                          </p>
                        </div>
                      )}

                      {/* Career Paths */}
                      {(result.numerology.lifePathInfo as any)?.career_paths && (
                        <div className="text-left p-4 rounded-lg mb-3.5" style={{ background: "var(--bg-paper)" }}>
                          <div className="flex items-center gap-2 mb-3">
                            <Dot color="var(--saju)" size={7} />
                            <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>추천 직업 분야</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {((result.numerology.lifePathInfo as any).career_paths as string[]).map((c: string) => (
                              <Chip key={c} label={c} color="var(--numero)" />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Relationship Style */}
                      {(result.numerology.lifePathInfo as any)?.relationship_style && (
                        <div className="text-left p-4 rounded-lg mb-3.5" style={{ background: "var(--bg-paper)" }}>
                          <div className="flex items-center gap-2 mb-2">
                            <Dot color="var(--seal)" size={7} />
                            <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>관계 스타일</span>
                          </div>
                          <p
                            className="text-[15px] leading-[2]"
                            style={{ fontFamily: "var(--font-display)", color: "var(--ink-medium)" }}
                          >
                            {(result.numerology.lifePathInfo as any).relationship_style}
                          </p>
                        </div>
                      )}

                      {/* Challenge */}
                      {(result.numerology.lifePathInfo as any)?.challenge && (
                        <div className="text-left p-4 rounded-lg mb-3.5" style={{ background: "var(--bg-paper)" }}>
                          <div className="flex items-center gap-2 mb-2">
                            <Dot color="var(--ink-muted)" size={7} />
                            <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>도전 과제</span>
                          </div>
                          <p
                            className="text-[15px] leading-[2]"
                            style={{ fontFamily: "var(--font-display)", color: "var(--ink-medium)" }}
                          >
                            {(result.numerology.lifePathInfo as any).challenge}
                          </p>
                        </div>
                      )}

                      {/* Personal Year Number */}
                      {(() => {
                        const m = parseInt(month);
                        const d = parseInt(day);
                        if (!m || !d) return null;
                        const currentYear = new Date().getFullYear();
                        let pySum = String(currentYear).split("").reduce((a, b) => a + Number(b), 0)
                          + String(m).split("").reduce((a, b) => a + Number(b), 0)
                          + String(d).split("").reduce((a, b) => a + Number(b), 0);
                        while (pySum > 9 && pySum !== 11 && pySum !== 22 && pySum !== 33) {
                          pySum = String(pySum).split("").reduce((a, b) => a + Number(b), 0);
                        }
                        return (
                          <div className="text-left p-4 rounded-lg mb-3.5" style={{ background: "var(--seal-bg)" }}>
                            <div className="flex items-center gap-2 mb-2">
                              <Dot color="var(--seal)" size={7} />
                              <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>
                                {currentYear}년 개인년수
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span
                                className="text-2xl font-black"
                                style={{ fontFamily: "var(--font-display)", color: "var(--seal)" }}
                              >
                                {pySum}
                              </span>
                              <p
                                className="text-[15px] leading-[1.8]"
                                style={{ fontFamily: "var(--font-display)", color: "var(--ink-medium)" }}
                              >
                                {pySum === 1 ? "새로운 시작과 독립의 해. 씨앗을 뿌리는 시기입니다."
                                  : pySum === 2 ? "협력과 인내의 해. 관계에 집중하는 시기입니다."
                                  : pySum === 3 ? "창의적 표현의 해. 자기표현이 빛나는 시기입니다."
                                  : pySum === 4 ? "기반을 다지는 해. 꾸준함이 보상받는 시기입니다."
                                  : pySum === 5 ? "변화와 자유의 해. 모험을 떠나는 시기입니다."
                                  : pySum === 6 ? "책임과 사랑의 해. 가정과 조화에 집중하는 시기입니다."
                                  : pySum === 7 ? "내면 탐구의 해. 영적 성장이 깊어지는 시기입니다."
                                  : pySum === 8 ? "성취와 풍요의 해. 물질적 성공이 가까운 시기입니다."
                                  : pySum === 9 ? "완성과 마무리의 해. 한 사이클을 정리하는 시기입니다."
                                  : pySum === 11 ? "영적 각성의 해. 직관이 극대화되는 마스터 넘버 시기입니다."
                                  : pySum === 22 ? "위대한 건설의 해. 큰 비전을 현실로 만드는 마스터 넘버 시기입니다."
                                  : "영적 스승의 해. 깊은 치유와 봉사의 마스터 넘버 시기입니다."}
                              </p>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Destiny Number (if name was provided) */}
                      {result.numerology.destinyNumber && result.numerology.destinyInfo && (
                        <div
                          className="p-4 rounded-lg text-left"
                          style={{ background: "var(--bg-paper)" }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className="text-lg font-black"
                              style={{ fontFamily: "var(--font-display)", color: "var(--numero)" }}
                            >
                              {result.numerology.destinyNumber}
                            </span>
                            <span className="text-[11px] font-semibold" style={{ color: "var(--ink-light)" }}>
                              운명수 (Destiny)
                            </span>
                          </div>
                          <div className="text-sm font-bold mb-1" style={{ color: "var(--ink)" }}>
                            {result.numerology.destinyInfo.name}
                          </div>
                          <div className="text-[15px] leading-[1.9]" style={{ fontFamily: "var(--font-display)", color: "var(--ink-muted)" }}>
                            {result.numerology.destinyInfo.personality}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollReveal>

                {/* B6: 성격 종합 */}
                <ScrollReveal delay={400}>
                  <div
                    className="rounded-[14px] p-6 mb-3.5"
                    style={{ background: "var(--bg-white)", border: "1.5px solid var(--border)" }}
                  >
                    <SectionHeader color="var(--ink)" title="성격 종합" />

                    {/* Nature Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="flex items-center justify-center w-12 h-12 rounded-full"
                        style={{ background: OHANG_INFO[result.saju.day.ohang].color + "15" }}
                      >
                        <span
                          className="text-xl font-black"
                          style={{ fontFamily: "var(--font-display)", color: OHANG_INFO[result.saju.day.ohang].color }}
                        >
                          {result.saju.day.cheongan}
                        </span>
                      </div>
                      <div>
                        <div className="text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>
                          {result.saju.personality.nature}
                        </div>
                        <div className="text-xs" style={{ color: "var(--ink-light)" }}>
                          {result.saju.day.ohang} {OHANG_INFO[result.saju.day.ohang].kr} / {result.saju.personality.yin_yang}
                        </div>
                      </div>
                    </div>

                    {/* Trait Chips */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {result.saju.personality.trait.map((t) => (
                        <Chip key={t} label={t} color={OHANG_INFO[result.saju.day.ohang].color} />
                      ))}
                    </div>

                    <Divider />

                    {/* Archetype Card */}
                    <div className="p-4 rounded-lg mt-4 mb-4" style={{ background: "var(--seal-bg)" }}>
                      <div className="text-[11px] font-semibold tracking-wider mb-1" style={{ color: "var(--ink-light)" }}>
                        아키타입
                      </div>
                      <div className="text-[17px] font-black" style={{ fontFamily: "var(--font-display)", color: "var(--seal)" }}>
                        {result.archetype}
                      </div>
                    </div>

                    {/* MBTI Similar */}
                    <div className="p-3.5 rounded-lg flex items-center gap-3 mb-4" style={{ background: "var(--bg-paper)" }}>
                      <Dot color="var(--mbti)" size={10} />
                      <div>
                        <div className="text-[11px] font-semibold" style={{ color: "var(--ink-light)" }}>MBTI 유사형</div>
                        <div className="text-base font-bold" style={{ fontFamily: "var(--font-display)" }}>
                          {result.saju.personality.mbti_similar.join(" / ")}
                        </div>
                      </div>
                    </div>

                    {/* Zodiac Personality Link */}
                    <div className="p-3.5 rounded-lg flex items-center gap-3" style={{ background: "var(--bg-paper)" }}>
                      <Dot color={result.western.sunSign.color} size={10} />
                      <div>
                        <div className="text-[11px] font-semibold" style={{ color: "var(--ink-light)" }}>
                          {result.western.sunSign.name} 성격
                        </div>
                        <div className="text-sm leading-relaxed" style={{ color: "var(--ink-medium)" }}>
                          {result.western.sunSign.personality}
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>

                {/* B7: 교차점 일치 특성 */}
                {result.matches.length > 0 && (
                  <ScrollReveal delay={480}>
                    <div
                      className="rounded-[14px] p-5 mb-3.5"
                      style={{ background: "var(--bg-white)", border: "1.5px solid var(--border)" }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Dot color="#C53D43" size={8} />
                        <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>교차점 일치 특성</span>
                        <span className="text-xs ml-auto" style={{ color: "var(--ink-light)" }}>
                          {result.matches.length}개 발견
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {result.matches
                          .filter((m) => m.strength === "강" || m.strength === "중")
                          .map((m) => (
                            <div
                              key={m.trait}
                              className="flex items-center justify-between p-3 rounded-lg"
                              style={{ background: "var(--bg-paper)" }}
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-1.5 h-6 rounded-full"
                                  style={{
                                    background: m.strength === "강" ? "var(--seal)" : "var(--border-strong)",
                                  }}
                                />
                                <div>
                                  <span className="text-sm font-bold">{m.trait}</span>
                                  <span
                                    className="text-xs ml-2 font-semibold"
                                    style={{ color: m.strength === "강" ? "var(--seal)" : "var(--ink-light)" }}
                                  >
                                    {m.strength}
                                  </span>
                                </div>
                              </div>
                              <div className="text-xs" style={{ color: "var(--ink-muted)" }}>
                                {m.sources.join(" / ")}
                              </div>
                            </div>
                          ))}
                      </div>

                      {/* 인생 조언 */}
                      {(result as any)?.life_advice && Array.isArray((result as any).life_advice) && (
                        <>
                          <Divider />
                          <div className="mt-4">
                            <div className="flex items-center gap-2 mb-4">
                              <Dot color="var(--seal)" size={8} />
                              <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>
                                교차점이 말하는 인생 조언
                              </span>
                            </div>
                            <div className="flex flex-col gap-3">
                              {((result as any).life_advice as string[]).map((advice: string, i: number) => (
                                <div
                                  key={i}
                                  className="p-4 rounded-xl"
                                  style={{ background: "var(--bg-paper)", border: "1px solid var(--border)" }}
                                >
                                  <div className="flex gap-3">
                                    <span
                                      className="text-lg font-black shrink-0 w-7 text-center"
                                      style={{ fontFamily: "var(--font-display)", color: "var(--seal)" }}
                                    >
                                      {i + 1}
                                    </span>
                                    <p
                                      className="text-[15px] leading-[2]"
                                      style={{ fontFamily: "var(--font-display)", color: "var(--ink-medium)" }}
                                    >
                                      {advice}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </ScrollReveal>
                )}

                {/* B8: AI 맞춤 해석 */}
                <ScrollReveal delay={560}>
                  <AIInterpretation result={result} />
                </ScrollReveal>

              </div>

            {/* ═══════════════════════════════════════════
                SECTION C: BOTTOM (always visible)
               ═══════════════════════════════════════════ */}

            {/* Share */}
            <ScrollReveal delay={640}>
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
                  <button
                    onClick={() => window.print()}
                    className="no-print w-full py-3 text-sm font-semibold rounded-lg cursor-pointer transition-opacity hover:opacity-80"
                    style={{
                      background: "transparent",
                      color: "var(--ink-muted)",
                      border: "1.5px solid var(--border)",
                      fontFamily: "inherit",
                    }}
                  >
                    PDF로 저장
                  </button>
                </div>
              </div>
            </ScrollReveal>

            {/* 궁합 분석 CTA */}
            <ScrollReveal delay={720}>
              <Link
                href="/compatibility"
                className="flex items-center gap-3 p-4 rounded-xl mb-3 no-underline transition-opacity hover:opacity-85"
                style={{ background: "var(--seal-bg)", border: "1.5px solid #E8C5C7" }}
              >
                <div
                  className="flex items-center justify-center w-9 h-9 rounded-[3px] shrink-0 -rotate-[3deg]"
                  style={{ border: "2px solid var(--seal)", color: "var(--seal)", fontFamily: "var(--font-display)" }}
                >
                  <span className="text-sm font-black">合</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold" style={{ color: "var(--seal)" }}>
                    궁합 분석
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--ink-light)" }}>
                    두 사람의 교차점을 비교합니다
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                  <path d="M6 4l4 4-4 4" stroke="var(--seal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </ScrollReveal>

            {/* Coming Soon */}
            <ScrollReveal delay={800}>
              <div
                className="flex items-center gap-3 p-4 rounded-xl mb-4"
                style={{ background: "var(--bg-warm)", border: "1.5px solid var(--border)" }}
              >
                <div
                  className="flex items-center justify-center w-9 h-9 rounded-full shrink-0"
                  style={{ background: "rgba(197,61,67,0.08)" }}
                >
                  <Dot color="#C53D43" size={10} />
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: "var(--ink-medium)" }}>
                    관상 / 타로 / 점성술 심화
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--ink-light)" }}>
                    추가 체계 분석 곧 공개
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Actions */}
            <ScrollReveal delay={880}>
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={reset}
                  className="w-full py-4 text-[15px] font-bold rounded-xl border-none cursor-pointer transition-opacity hover:opacity-85"
                  style={{ background: "var(--ink)", color: "var(--bg-paper)", fontFamily: "inherit" }}
                >
                  다시 분석하기
                </button>
                <Link
                  href="/"
                  className="w-full py-3.5 text-sm font-semibold rounded-xl text-center no-underline transition-opacity hover:opacity-85"
                  style={{ background: "var(--bg-white)", color: "var(--ink-muted)", border: "1.5px solid var(--border)" }}
                >
                  DESTINO 소개 보기
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

// ━━━ 수렴률 카운터 ━━━
function ConvergenceCounter({ rate }: { rate: number }) {
  const displayValue = useCountUp(rate, 2000);
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
