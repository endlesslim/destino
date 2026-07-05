"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Seal from "@/components/ui/Seal";
import Divider from "@/components/ui/Divider";
import Nav from "@/components/Nav";
import ScrollReveal from "@/components/ScrollReveal";
import { analyzeMarriageCompat, type MarriageCompatResult } from "@/lib/marriage-compat";
import { playStampSound } from "@/lib/sound";
import Dot from "@/components/ui/Dot";
import SectionHeader from "@/components/ui/SectionHeader";
import { useCountUp } from "@/hooks/useCountUp";
import Footer from "@/components/Footer";

// ━━━ 칩 ━━━
function Chip({ label, color = "var(--ink-muted)", bg }: { label: string; color?: string; bg?: string }) {
  return (
    <span
      className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
      style={{ color, background: bg || `${color}12` }}
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

// ━━━ 결혼 점수 카운터 ━━━
function MarriageScoreCounter({ score }: { score: number }) {
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

// ━━━ 타임라인 위상 아이콘 ━━━
const PHASE_LABELS: { key: keyof MarriageCompatResult["timeline"]; label: string; color: string }[] = [
  { key: "dating", label: "연애기", color: "var(--seal)" },
  { key: "engagement", label: "약혼기", color: "var(--astro)" },
  { key: "earlyMarriage", label: "신혼기", color: "var(--saju)" },
  { key: "middleYears", label: "중반기", color: "var(--numero)" },
  { key: "matureYears", label: "성숙기", color: "var(--mbti)" },
];

export default function MarriagePage() {
  return (
    <Suspense fallback={null}>
      <MarriagePageInner />
    </Suspense>
  );
}

function MarriagePageInner() {
  const searchParams = useSearchParams();
  const [year1, setYear1] = useState("");
  const [month1, setMonth1] = useState("");
  const [day1, setDay1] = useState("");
  const [name1, setName1] = useState("");
  const [year2, setYear2] = useState("");
  const [month2, setMonth2] = useState("");
  const [day2, setDay2] = useState("");
  const [name2, setName2] = useState("");

  const [result, setResult] = useState<MarriageCompatResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const valid =
    year1.length === 4 && month1 !== "" && day1 !== "" &&
    year2.length === 4 && month2 !== "" && day2 !== "";

  // Load from localStorage + URL params
  useEffect(() => {
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

    // URL params for sharing
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
      setTimeout(() => {
        const yi1 = parseInt(y1), mi1 = parseInt(m1), di1 = parseInt(d1);
        const yi2 = parseInt(y2), mi2 = parseInt(m2), di2 = parseInt(d2);
        if (yi1 && mi1 && di1 && yi2 && mi2 && di2) {
          setLoading(true);
          setTimeout(() => {
            setResult(
              analyzeMarriageCompat({
                person1: { year: yi1, month: mi1, day: di1, name: n1 || undefined },
                person2: { year: yi2, month: mi2, day: di2, name: n2 || undefined },
              })
            );
            setLoading(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
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
        analyzeMarriageCompat({
          person1: { year: y1, month: m1, day: d1, name: name1 || undefined },
          person2: { year: y2, month: m2, day: d2, name: name2 || undefined },
        })
      );
      setLoading(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
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
    const url = `${window.location.origin}/marriage?y1=${year1}&m1=${month1}&d1=${day1}&y2=${year2}&m2=${month2}&d2=${day2}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [year1, month1, day1, year2, month2, day2]);

  const shareToKakao = async () => {
    const title = "DESTINO 결혼 궁합 분석";
    const text = `두 사람의 결혼 궁합: ${result?.marriageScore}% — ${result?.marriageLabel}`;
    const url = `${window.location.origin}/marriage?y1=${year1}&m1=${month1}&d1=${day1}&y2=${year2}&m2=${month2}&d2=${day2}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {}
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

    ctx.fillStyle = "#F5F0E8";
    ctx.fillRect(0, 0, 1080, 1920);

    ctx.fillStyle = "#C53D43";
    ctx.fillRect(440, 120, 200, 3);

    ctx.font = "bold 28px serif";
    ctx.fillStyle = "#1C1917";
    ctx.textAlign = "center";
    ctx.fillText("DESTINO", 540, 180);

    ctx.font = "900 24px serif";
    ctx.fillText("결혼 궁합 심화 분석", 540, 240);

    ctx.font = "900 120px serif";
    ctx.fillStyle = "#C53D43";
    ctx.fillText(`${result.marriageScore}%`, 540, 460);

    ctx.font = "bold 36px serif";
    ctx.fillStyle = "#1C1917";
    ctx.fillText(result.marriageLabel, 540, 530);

    let y = 620;
    ctx.font = "bold 28px sans-serif";
    result.dimensions.forEach((dim) => {
      ctx.fillStyle = "#3D3229";
      ctx.textAlign = "left";
      ctx.fillText(`${dim.name}: ${dim.score}%`, 120, y);
      y += 60;
    });

    y += 40;
    ctx.font = "italic 24px serif";
    ctx.fillStyle = "#6B5E53";
    ctx.textAlign = "center";

    const ruleLines = result.goldenRule.match(/.{1,28}/g) || [result.goldenRule];
    ruleLines.forEach((line) => {
      ctx.fillText(line, 540, y);
      y += 40;
    });

    ctx.fillStyle = "#C53D43";
    ctx.fillRect(440, 1780, 200, 3);
    ctx.font = "16px sans-serif";
    ctx.fillStyle = "#8B7E74";
    ctx.fillText("destino.kr", 540, 1830);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "destino-marriage-result.png";
      a.click();
      URL.revokeObjectURL(url);
      setInstaSaved(true);
    });
  };

  // ━━━ 입력 필드 스타일 ━━━
  const inputStyle = {
    background: "var(--bg-white)",
    border: "1.5px solid var(--border)",
    color: "var(--ink)",
    fontFamily: "inherit",
  };

  const loadingSteps = [
    "두 사람의 오행 에너지 분석 중",
    "결혼 차원별 궁합 계산 중",
    "부부 타임라인 예측 중",
    "황금률 도출 중",
  ];

  return (
    <main
      className="min-h-screen flex flex-col items-center"
      style={{ background: "var(--bg-paper)" }}
    >
      <Nav />

      <div ref={topRef} className="w-full max-w-[440px] px-6 pt-20 pb-8">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2.5 mb-4">
              <Seal char="合" size="lg" />
            </div>
            <h1
              className="text-[24px] font-black leading-[1.3] tracking-[-0.01em] mb-2"
              style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
            >
              결혼 궁합 심화 분석
            </h1>
            <p className="text-[14px] leading-[1.7]" style={{ color: "var(--ink-muted)" }}>
              사주·별자리·수비학·MBTI에게 다시 물은 두 사람의 결혼 궁합
            </p>
          </div>
        </ScrollReveal>

        {!result && !loading && (
          <ScrollReveal delay={100}>
            <div className="flex flex-col gap-6">
              {/* Person 1 */}
              <div>
                <div className="text-xs font-bold mb-2 tracking-wider" style={{ color: "var(--seal)" }}>
                  첫 번째 사람
                </div>
                <div className="flex gap-2 mb-2">
                  <input
                    type="number"
                    placeholder="년 (예: 1990)"
                    value={year1}
                    onChange={(e) => setYear1(e.target.value)}
                    className="flex-1 px-3 py-3 rounded-lg text-sm outline-none"
                    style={inputStyle}
                  />
                  <select
                    value={month1}
                    onChange={(e) => setMonth1(e.target.value)}
                    className="w-20 px-2 py-3 rounded-lg text-sm outline-none"
                    style={inputStyle}
                  >
                    <option value="">월</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}월</option>
                    ))}
                  </select>
                  <select
                    value={day1}
                    onChange={(e) => setDay1(e.target.value)}
                    className="w-20 px-2 py-3 rounded-lg text-sm outline-none"
                    style={inputStyle}
                  >
                    <option value="">일</option>
                    {Array.from({ length: 31 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}일</option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  placeholder="이름 (선택)"
                  value={name1}
                  onChange={(e) => setName1(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={inputStyle}
                />
              </div>

              <Divider />

              {/* Person 2 */}
              <div>
                <div className="text-xs font-bold mb-2 tracking-wider" style={{ color: "var(--astro)" }}>
                  두 번째 사람
                </div>
                <div className="flex gap-2 mb-2">
                  <input
                    type="number"
                    placeholder="년 (예: 1992)"
                    value={year2}
                    onChange={(e) => setYear2(e.target.value)}
                    className="flex-1 px-3 py-3 rounded-lg text-sm outline-none"
                    style={inputStyle}
                  />
                  <select
                    value={month2}
                    onChange={(e) => setMonth2(e.target.value)}
                    className="w-20 px-2 py-3 rounded-lg text-sm outline-none"
                    style={inputStyle}
                  >
                    <option value="">월</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}월</option>
                    ))}
                  </select>
                  <select
                    value={day2}
                    onChange={(e) => setDay2(e.target.value)}
                    className="w-20 px-2 py-3 rounded-lg text-sm outline-none"
                    style={inputStyle}
                  >
                    <option value="">일</option>
                    {Array.from({ length: 31 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}일</option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  placeholder="이름 (선택)"
                  value={name2}
                  onChange={(e) => setName2(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={inputStyle}
                />
              </div>

              {validationError && (
                <p className="text-xs text-center" style={{ color: "var(--seal)" }}>
                  {validationError}
                </p>
              )}

              <button
                onClick={analyze}
                disabled={!valid}
                className="w-full py-4 text-[15px] font-bold rounded-xl border-none cursor-pointer transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: "var(--seal)",
                  color: "#fff",
                  fontFamily: "inherit",
                  boxShadow: valid ? "0 4px 16px var(--shadow-btn)" : "none",
                }}
              >
                결혼 궁합 분석하기
              </button>
            </div>
          </ScrollReveal>
        )}

        {/* Loading */}
        {loading && (
          <div className="py-20 text-center">
            <p
              className="text-sm font-semibold mb-6 animate-pulse"
              style={{ color: "var(--ink-muted)" }}
            >
              분석 중 ...
            </p>
            <div className="flex flex-col gap-3 text-left max-w-[280px] mx-auto">
              {loadingSteps.map((step, i) => (
                <div
                  key={step}
                  className="flex items-center gap-2 text-xs animate-pulse"
                  style={{ color: "var(--ink-light)", animationDelay: `${i * 0.3}s` }}
                >
                  <Dot color="var(--seal)" size={5} />
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ━━━ RESULTS ━━━ */}
        {result && !loading && (
          <>
            {/* 1. Marriage Score */}
            <ScrollReveal>
              <div
                className="rounded-[14px] p-6 mb-3.5 text-center"
                style={{ background: "var(--bg-white)", border: "1.5px solid var(--border)" }}
              >
                <div className="text-[10px] font-semibold tracking-[0.12em] uppercase mb-3" style={{ color: "var(--seal)" }}>
                  MARRIAGE COMPATIBILITY
                </div>
                <MarriageScoreCounter score={result.marriageScore} />
                <div className="mt-2">
                  <span
                    className="inline-block px-4 py-1.5 rounded-[3px] text-sm font-black -rotate-[2deg]"
                    style={{
                      fontFamily: "var(--font-display)",
                      color: "var(--seal)",
                      border: "2px solid var(--seal)",
                    }}
                  >
                    {result.marriageLabel}
                  </span>
                </div>
                <p className="text-[12px] mt-3" style={{ color: "var(--ink-light)" }}>
                  기존 궁합 {result.compatibility.overallScore}% + 결혼 심화 분석
                </p>
              </div>
            </ScrollReveal>

            {/* 2. Five Dimensions */}
            <ScrollReveal delay={100}>
              <SectionHeader color="var(--seal)" title="결혼 궁합 5대 차원" />
              <div className="flex flex-col gap-2.5 mb-3.5">
                {result.dimensions.map((dim, i) => {
                  const colors = ["var(--seal)", "var(--saju)", "var(--face)", "var(--astro)", "var(--mbti)"];
                  return (
                    <div
                      key={dim.name}
                      className="rounded-[12px] p-4"
                      style={{ background: "var(--bg-white)", border: "1.5px solid var(--border)" }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[14px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}>
                          {dim.name}
                        </span>
                        <span className="text-[13px] font-black" style={{ color: colors[i] }}>
                          {dim.score}%
                        </span>
                      </div>
                      <ScoreBar score={dim.score} color={colors[i]} delay={i * 80} />
                      <p className="text-[13px] leading-[1.8] mt-2.5" style={{ color: "var(--ink-muted)" }}>
                        {dim.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </ScrollReveal>

            {/* 3. Marriage Timeline */}
            <ScrollReveal delay={200}>
              <SectionHeader color="var(--astro)" title="결혼 타임라인" />
              <div
                className="rounded-[14px] p-5 mb-3.5"
                style={{ background: "var(--bg-white)", border: "1.5px solid var(--border)" }}
              >
                <div className="relative pl-6">
                  {/* Vertical line */}
                  <div
                    className="absolute left-[7px] top-2 bottom-2 w-[2px]"
                    style={{ background: "var(--border-strong)" }}
                  />
                  {PHASE_LABELS.map(({ key, label, color }, i) => (
                    <div key={key} className="relative pb-6 last:pb-0">
                      {/* Dot */}
                      <div
                        className="absolute -left-[19px] top-1 w-3.5 h-3.5 rounded-full border-2"
                        style={{ borderColor: color, background: "var(--bg-white)" }}
                      />
                      <div className="text-[12px] font-bold tracking-wider mb-1" style={{ color }}>
                        {label}
                      </div>
                      <p className="text-[13px] leading-[1.8]" style={{ color: "var(--ink-muted)" }}>
                        {result.timeline[key]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* 4. Best Wedding Months */}
            <ScrollReveal delay={300}>
              <SectionHeader color="var(--saju)" title="결혼하기 좋은 달" />
              <div className="flex gap-2.5 mb-3.5">
                {result.bestWeddingMonths.map((m, i) => (
                  <div
                    key={m}
                    className="flex-1 rounded-[12px] p-4 text-center"
                    style={{
                      background: i === 0 ? "var(--seal-bg)" : "var(--bg-white)",
                      border: `1.5px solid ${i === 0 ? "var(--seal)" : "var(--border)"}`,
                    }}
                  >
                    <div
                      className="text-[10px] font-semibold tracking-wider mb-1"
                      style={{ color: i === 0 ? "var(--seal)" : "var(--ink-light)" }}
                    >
                      {i === 0 ? "BEST" : `${i + 1}순위`}
                    </div>
                    <div
                      className="text-[22px] font-black"
                      style={{ fontFamily: "var(--font-display)", color: i === 0 ? "var(--seal)" : "var(--ink)" }}
                    >
                      {m}월
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            {/* 5. Caution Periods */}
            <ScrollReveal delay={350}>
              <div
                className="rounded-[14px] p-4 mb-3.5"
                style={{ background: "var(--caution-bg)", border: "1.5px solid var(--caution-border)" }}
              >
                <div className="text-[11px] font-bold tracking-wider mb-2" style={{ color: "var(--caution-title)" }}>
                  주의할 시기
                </div>
                <ul className="flex flex-col gap-1.5">
                  {result.cautionPeriods.map((period) => (
                    <li key={period} className="text-[13px] leading-[1.7] flex gap-2" style={{ color: "var(--caution-text)" }}>
                      <span className="shrink-0 mt-1">
                        <Dot color="var(--caution-border)" size={5} />
                      </span>
                      {period}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>

            {/* 6. Strengths & Growth */}
            <ScrollReveal delay={400}>
              <div className="grid grid-cols-2 gap-2.5 mb-3.5">
                <div
                  className="rounded-[12px] p-4"
                  style={{ background: "var(--bg-white)", border: "1.5px solid var(--saju)" }}
                >
                  <div className="text-[11px] font-bold tracking-wider mb-2.5" style={{ color: "var(--saju)" }}>
                    부부 강점
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.strengthsAsCouple.map((s) => (
                      <Chip key={s} label={s} color="var(--saju)" />
                    ))}
                  </div>
                </div>
                <div
                  className="rounded-[12px] p-4"
                  style={{ background: "var(--bg-white)", border: "1.5px solid var(--astro)" }}
                >
                  <div className="text-[11px] font-bold tracking-wider mb-2.5" style={{ color: "var(--astro)" }}>
                    함께 성장할 영역
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.growthAreas.map((a) => (
                      <Chip key={a} label={a} color="var(--astro)" />
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* 7. Golden Rule */}
            <ScrollReveal delay={500}>
              <div
                className="rounded-[14px] p-6 mb-3.5 text-center"
                style={{
                  background: "var(--bg-white)",
                  border: "2px solid var(--seal)",
                  borderStyle: "double",
                }}
              >
                <div className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-3" style={{ color: "var(--seal)" }}>
                  GOLDEN RULE
                </div>
                <p
                  className="text-[16px] leading-[1.9] font-bold italic"
                  style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
                >
                  &ldquo;{result.goldenRule}&rdquo;
                </p>
              </div>
            </ScrollReveal>

            {/* 8. Detailed Advice */}
            <ScrollReveal delay={550}>
              <div
                className="rounded-[14px] p-5 mb-3.5"
                style={{ background: "var(--bg-white)", border: "1.5px solid var(--border)" }}
              >
                <div className="text-[12px] font-bold tracking-wider mb-2" style={{ color: "var(--ink-medium)" }}>
                  상세 조언
                </div>
                <p className="text-[14px] leading-[1.9]" style={{ color: "var(--ink-muted)" }}>
                  {result.detailedAdvice}
                </p>
              </div>
            </ScrollReveal>

            {/* 9. Share */}
            <ScrollReveal delay={600}>
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
                      onClick={shareToKakao}
                      className="flex-1 py-3 text-sm font-semibold rounded-lg border-none cursor-pointer transition-opacity hover:opacity-80"
                      style={{ background: "var(--bg-warm)", color: "var(--ink)", fontFamily: "inherit", border: "1px solid var(--border)" }}
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
                    {instaSaved ? "이미지가 저장되었습니다" : "인스타 스토리용 저장"}
                  </button>
                </div>
              </div>
            </ScrollReveal>

            {/* 10. Actions */}
            <ScrollReveal delay={680}>
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={reset}
                  className="w-full py-4 text-[15px] font-bold rounded-xl border-none cursor-pointer transition-opacity hover:opacity-85"
                  style={{ background: "var(--seal)", color: "#fff", fontFamily: "inherit", boxShadow: "0 4px 16px var(--shadow-btn)" }}
                >
                  다시 분석하기
                </button>
                <Link
                  href="/compatibility"
                  className="w-full py-3.5 text-sm font-semibold rounded-xl text-center no-underline transition-opacity hover:opacity-85"
                  style={{ background: "var(--bg-white)", color: "var(--ink-muted)", border: "1.5px solid var(--border)" }}
                >
                  일반 궁합 분석으로 돌아가기
                </Link>
              </div>
            </ScrollReveal>

            <div className="h-10" />
          </>
        )}

        <Footer />
      </div>
    </main>
  );
}
