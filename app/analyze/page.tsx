"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Seal from "@/components/ui/Seal";
import Divider from "@/components/ui/Divider";
import Nav from "@/components/Nav";
import ScrollReveal from "@/components/ScrollReveal";
import Expandable from "@/components/Expandable";
import KeyInsight from "@/components/KeyInsight";
import StatCard from "@/components/StatCard";

import { analyzeCrosspoint, type CrosspointResult } from "@/lib/cross-engine";
import { OHANG_INFO, OHANG_LIST, type Ohang } from "@/lib/saju";
import { generateMonthlyForecast, type MonthlyForecast } from "@/lib/monthly-forecast";
import { playStampSound } from "@/lib/sound";
import { saveAnalysis } from "@/lib/history";
import FeedbackWidget from "@/components/FeedbackWidget";
import ChatConsultation from "@/components/ChatConsultation";
import Dot from "@/components/ui/Dot";
import StaggerSection from "@/components/ui/StaggerSection";
import SectionHeader from "@/components/ui/SectionHeader";
import { SajuIcon, AstroIcon, NumeroIcon, MBTIIcon, FaceIcon, TarotIcon, SystemIcon, StarIcon } from "@/components/ui/SystemIcons";
import { useCountUp } from "@/hooks/useCountUp";

// ━━━ Canvas 유틸 (인스타 카드용) ━━━
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split("");
  const lines: string[] = [];
  let line = "";
  for (const char of words) {
    const test = line + char;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = char;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 3); // 최대 3줄
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}

// ━━━ 텍스트 유틸 ━━━
function splitFirstSentence(text: string): [string, string] {
  if (!text || typeof text !== "string") return ["", ""];
  const m = text.match(/^(.+?[.!?。])\s*/);
  if (m) return [m[1], text.slice(m[0].length)];
  const mid = Math.min(60, Math.floor(text.length / 2));
  const comma = text.indexOf(",", 20);
  const split = comma > 0 && comma < 80 ? comma + 1 : mid;
  return [text.slice(0, split).trim(), text.slice(split).trim()];
}

function splitFirstTwo(text: string): [string, string] {
  if (!text || typeof text !== "string") return ["", ""];
  const m = text.match(/^(.+?[.!?。]\s*.+?[.!?。])\s*/);
  if (m) return [m[1], text.slice(m[0].length)];
  return splitFirstSentence(text);
}

// ━━━ 탭 아이콘 (SVG) ━━━
function TabIcon({ type, active }: { type: string; active: boolean }) {
  const color = active ? "var(--seal)" : "var(--ink-light)";
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

// ━━━ 오행 바 차트 ━━━
const OHANG_BAR_COLORS: Record<Ohang, string> = {
  "木": "var(--saju)",
  "火": "var(--seal)",
  "土": "var(--face)",
  "金": "var(--ink-muted)",
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

// ━━━ 문명 헤더 (각 분석 체계의 권위감) ━━━
function CivilizationHeader({
  symbol,
  title,
  origin,
  basis,
  color,
}: {
  symbol: string;
  title: string;
  origin: string;
  basis: string;
  color: string;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-start gap-3.5">
        <span
          className="text-[32px] font-black leading-none shrink-0 mt-0.5"
          style={{ fontFamily: "var(--font-display)", color }}
        >
          {symbol}
        </span>
        <div className="flex-1 min-w-0">
          <h3
            className="text-[17px] font-black leading-tight"
            style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
          >
            {title}
          </h3>
          <p
            className="text-[12px] mt-1 leading-snug"
            style={{ color: "var(--ink-light)" }}
          >
            {origin}
          </p>
        </div>
      </div>
      <div className="mt-3">
        <span
          className="inline-block text-[10px] tracking-[0.04em] font-semibold px-2.5 py-1 rounded"
          style={{ background: `color-mix(in srgb, ${color} 12%, transparent)`, color, border: `1px solid color-mix(in srgb, ${color} 20%, transparent)` }}
        >
          {basis}
        </span>
      </div>
    </div>
  );
}

// ━━━ 수렴 시각화 (문명 간 분석 -> 교차점 전환) ━━━
function ConvergenceMoment() {
  return (
    <ScrollReveal delay={400}>
      <div
        className="rounded-[14px] p-6 mb-3.5 text-center overflow-hidden relative"
        style={{
          background: "var(--bg-white)",
          border: "1.5px solid var(--border)",
        }}
      >
        {/* 4개 문명 라인이 수렴하는 시각화 */}
        <div className="relative h-[80px] mb-5">
          <svg
            viewBox="0 0 300 80"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            <line x1="20" y1="8" x2="150" y2="40" stroke="var(--saju)" strokeWidth="2" opacity="0.7">
              <animate attributeName="x2" from="20" to="150" dur="1.2s" fill="freeze" />
            </line>
            <line x1="20" y1="28" x2="150" y2="40" stroke="var(--astro)" strokeWidth="2" opacity="0.7">
              <animate attributeName="x2" from="20" to="150" dur="1.2s" fill="freeze" />
            </line>
            <line x1="20" y1="52" x2="150" y2="40" stroke="var(--numero)" strokeWidth="2" opacity="0.7">
              <animate attributeName="x2" from="20" to="150" dur="1.2s" fill="freeze" />
            </line>
            <line x1="20" y1="72" x2="150" y2="40" stroke="var(--mbti)" strokeWidth="2" opacity="0.7">
              <animate attributeName="x2" from="20" to="150" dur="1.2s" fill="freeze" />
            </line>
            <circle cx="150" cy="40" r="5" fill="var(--seal)" opacity="0">
              <animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="1s" fill="freeze" />
              <animate attributeName="r" from="2" to="5" dur="0.5s" begin="1s" fill="freeze" />
            </circle>
            <line x1="150" y1="40" x2="280" y2="40" stroke="var(--seal)" strokeWidth="2.5" opacity="0">
              <animate attributeName="opacity" from="0" to="0.8" dur="0.6s" begin="1.2s" fill="freeze" />
              <animate attributeName="x2" from="150" to="280" dur="0.8s" begin="1.2s" fill="freeze" />
            </line>
            <text x="8" y="12" fontSize="8" fill="var(--saju)" fontWeight="bold">四柱</text>
            <text x="8" y="32" fontSize="8" fill="var(--astro)" fontWeight="bold">星</text>
            <text x="8" y="56" fontSize="8" fill="var(--numero)" fontWeight="bold">數</text>
            <text x="8" y="76" fontSize="8" fill="var(--mbti)" fontWeight="bold">型</text>
          </svg>
        </div>

        <p
          className="text-[11px] tracking-[0.12em] uppercase font-semibold mb-2"
          style={{ color: "var(--seal)" }}
        >
          CONVERGENCE
        </p>
        <h3
          className="text-[18px] font-black leading-[1.4] mb-2"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          수렴
        </h3>
        <p
          className="text-[14px] leading-[1.8] mb-1"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink-muted)" }}
        >
          위 4개 문명의 분석이 아래의 교차점에서 만납니다
        </p>
        <p
          className="text-[12px] leading-[1.7]"
          style={{ color: "var(--ink-light)" }}
        >
          4개 문명, 수천 년의 독립적 관찰이 수렴한 결과
        </p>
      </div>
    </ScrollReveal>
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
      <SectionHeader color="var(--seal)" title="AI 맞춤 해석" icon={<StarIcon color="var(--seal)" size={14} />} />
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

  const loadingSteps = [
    "동아시아 사주명리학 분석 중",
    "바빌로니아 점성술 확인 중",
    "피타고라스 수비학 계산 중",
    "칼 융 성격유형 매칭 중",
    "4개 문명의 교차점 발견 중",
  ];

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
            const h = searchParams.get("h");
            const hi = h ? parseInt(h) : undefined;
            const r = analyzeCrosspoint(yi, mi, di, n || undefined, hi !== undefined && hi >= 0 && hi <= 23 ? hi : undefined);
            setResult(r);
            setLoading(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
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

    const currentYear = new Date().getFullYear();
    if (!y || y < 1924 || y > currentYear) {
      setValidationError(`1924~${currentYear}년 사이를 입력해주세요`);
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
      const h = hour ? parseInt(hour) : undefined;
      const r = analyzeCrosspoint(y, m, d, name || undefined, h !== undefined && h >= 0 && h <= 23 ? h : undefined);
      setResult(r);
      setLoading(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
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
    }, 2500);
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

  const shareToThreads = () => {
    const text = `동서양 4개 체계가 분석한 나의 교차점: ${result?.archetype}. 수렴률 ${result?.convergence_rate}% ${window.location.origin}/analyze`;
    window.open(
      `https://www.threads.net/intent/post?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  const shareToKakao = async () => {
    const title = "DESTINO 운명 분석";
    const text = `동서양 4개 체계가 분석한 나의 교차점: ${result?.archetype}. 수렴률 ${result?.convergence_rate}%`;
    const url = `${window.location.origin}/analyze?y=${year}&m=${month}&d=${day}`;
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

    // Canvas 2D API는 CSS 변수를 사용할 수 없어 하드코딩된 색상 사용
    const C = {
      paper: "#F5F0E8", ink: "#1C1917", seal: "#C53D43",
      muted: "#6B5E53", light: "#8B7E74", faint: "#B8AFA4",
      border: "#D4C9BC", white: "#FFFDF7", warm: "#EDE8DE",
      saju: "#2D5A27", astro: "#1E3A5F", numero: "#6B3A2A", mbti: "#5B3E8A",
    };

    // 배경
    ctx.fillStyle = C.paper;
    ctx.fillRect(0, 0, 1080, 1920);

    // 상단 장식선
    ctx.fillStyle = C.seal;
    ctx.fillRect(440, 80, 200, 3);

    // 브랜드
    ctx.fillStyle = C.ink;
    ctx.font = "bold 42px serif";
    ctx.textAlign = "center";
    ctx.fillText("DESTINO", 540, 150);

    // 부제
    ctx.fillStyle = C.light;
    ctx.font = "22px sans-serif";
    ctx.fillText("동서양 운명 교차 분석", 540, 195);

    // 이름 (있으면 표시)
    if (name) {
      ctx.fillStyle = C.ink;
      ctx.font = "bold 36px serif";
      ctx.fillText(name, 540, 280);
    }

    // 생년월일
    ctx.fillStyle = C.muted;
    ctx.font = "24px sans-serif";
    ctx.fillText(`${year}.${month}.${day}${hour ? ` ${hour}시` : ""}`, 540, name ? 325 : 280);

    // 구분선
    const baseY = name ? 370 : 330;
    ctx.fillStyle = C.border;
    ctx.fillRect(340, baseY, 400, 1);

    // 수렴률
    ctx.fillStyle = C.ink;
    ctx.font = "bold 140px serif";
    ctx.fillText(`${result.convergence_rate}%`, 540, baseY + 170);
    ctx.fillStyle = C.seal;
    ctx.font = "bold 32px serif";
    ctx.fillText(result.element_harmony.relation === "공명" ? "완벽한 공명" : result.element_harmony.relation === "상생" ? "상생의 조화" : "변화의 긴장", 540, baseY + 220);

    // 아키타입
    ctx.fillStyle = C.ink;
    ctx.font = "bold 48px serif";
    ctx.fillText(result.archetype, 540, baseY + 320);

    // 아키타입 설명 (첫 문장)
    ctx.fillStyle = C.muted;
    ctx.font = "22px sans-serif";
    const descFirst = result.archetype_desc.split(".")[0] + ".";
    const descLines = wrapText(ctx, descFirst, 800);
    descLines.forEach((line, i) => {
      ctx.fillText(line, 540, baseY + 370 + i * 32);
    });

    // 4개 체계 요약 박스
    const boxY = baseY + 470;
    const boxW = 460;
    const boxH = 100;
    const gap = 20;

    // 사주
    ctx.fillStyle = C.warm;
    roundRect(ctx, 70, boxY, boxW, boxH, 12);
    ctx.fillStyle = C.saju;
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("● 사주명리학", 90, boxY + 30);
    ctx.fillStyle = C.ink;
    ctx.font = "bold 32px serif";
    ctx.fillText(`${result.saju.day.cheongan} (${result.saju.personality.nature})`, 90, boxY + 72);

    // 별자리
    ctx.fillStyle = C.warm;
    roundRect(ctx, 70 + boxW + gap, boxY, boxW, boxH, 12);
    ctx.fillStyle = C.astro;
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("● 서양 점성술", 90 + boxW + gap, boxY + 30);
    ctx.fillStyle = C.ink;
    ctx.font = "bold 32px serif";
    ctx.fillText(`${result.western.sunSign.name} (${result.western.sunSign.element_kr})`, 90 + boxW + gap, boxY + 72);

    // 수비학
    ctx.fillStyle = C.warm;
    roundRect(ctx, 70, boxY + boxH + gap, boxW, boxH, 12);
    ctx.fillStyle = C.numero;
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("● 수비학", 90, boxY + boxH + gap + 30);
    ctx.fillStyle = C.ink;
    ctx.font = "bold 32px serif";
    ctx.fillText(`경로수 ${result.numerology.lifePath} (${result.numerology.lifePathInfo.name})`, 90, boxY + boxH + gap + 72);

    // MBTI
    ctx.fillStyle = C.warm;
    roundRect(ctx, 70 + boxW + gap, boxY + boxH + gap, boxW, boxH, 12);
    ctx.fillStyle = C.mbti;
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("● MBTI", 90 + boxW + gap, boxY + boxH + gap + 30);
    ctx.fillStyle = C.ink;
    ctx.font = "bold 32px serif";
    ctx.fillText(`${result.mbti.primaryType}`, 90 + boxW + gap, boxY + boxH + gap + 72);

    // 동서양 교차
    ctx.textAlign = "center";
    const crossY = boxY + boxH * 2 + gap * 2 + 60;
    ctx.fillStyle = C.faint;
    ctx.font = "20px sans-serif";
    ctx.fillText("동양", 340, crossY);
    ctx.fillText("서양", 740, crossY);
    ctx.fillStyle = C.ink;
    ctx.font = "bold 48px serif";
    ctx.fillText(result.saju.day.ohang, 340, crossY + 60);
    ctx.fillText(result.western.sunSign.element, 740, crossY + 60);
    ctx.fillStyle = C.seal;
    ctx.font = "28px sans-serif";
    ctx.fillText("↔", 540, crossY + 55);
    ctx.fillStyle = C.muted;
    ctx.font = "20px sans-serif";
    ctx.fillText(OHANG_INFO[result.saju.day.ohang].kr, 340, crossY + 95);
    ctx.fillText(result.western.sunSign.element_kr, 740, crossY + 95);

    // 띠
    ctx.fillStyle = C.light;
    ctx.font = "22px sans-serif";
    ctx.fillText(`${result.saju.animal.animal_kr}띠 · ${result.saju.year.cheongan}${result.saju.year.jiji}년생`, 540, crossY + 155);

    // 하단 구분선
    ctx.fillStyle = C.border;
    ctx.fillRect(340, 1720, 400, 1);

    // 브랜드 푸터
    ctx.fillStyle = C.light;
    ctx.font = "24px sans-serif";
    ctx.fillText("destino.kr", 540, 1770);

    // 하단 장식선
    ctx.fillStyle = C.seal;
    ctx.fillRect(440, 1810, 200, 3);

    // Download
    const link = document.createElement("a");
    link.download = "destino-result.png";
    link.href = canvas.toDataURL("image/png");
    link.click();

    setInstaSaved(true);
    setTimeout(() => setInstaSaved(false), 3000);
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
                생년월일 하나로, 4개 문명이 동시에 분석합니다
              </p>
            </div>

            {/* 4개 문명 소개 */}
            <div className="grid grid-cols-2 gap-2 mb-4 animate-fade-up" style={{ animationDelay: "0.03s" }}>
              {[
                { name: "사주명리학", origin: "동아시아 3,000년", color: "var(--saju)" },
                { name: "서양 점성술", origin: "바빌로니아 4,000년", color: "var(--astro)" },
                { name: "수비학", origin: "그리스 2,500년", color: "var(--numero)" },
                { name: "MBTI", origin: "칼 융 심리학", color: "var(--mbti)" },
              ].map((civ) => (
                <div
                  key={civ.name}
                  className="flex items-center gap-2 p-2.5 rounded-lg"
                  style={{ background: "var(--bg-white)", border: "1px solid var(--border)" }}
                >
                  <span
                    className="inline-block w-2 h-2 rounded-full shrink-0"
                    style={{ background: civ.color }}
                  />
                  <div>
                    <div className="text-[13px] font-bold" style={{ color: "var(--ink)" }}>{civ.name}</div>
                    <div className="text-[11px]" style={{ color: "var(--ink-light)" }}>{civ.origin}</div>
                  </div>
                </div>
              ))}
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
                  style={{ background: "var(--bg-paper)", border: "2px solid var(--border)", color: "var(--ink)" }}
                  placeholder="예: 14 (24시간제)"
                  value={hour}
                  onChange={(e) => setHour(e.target.value.replace(/\D/g, "").slice(0, 2))}
                  onFocus={(e) => (e.target.style.borderColor = "var(--seal)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
                <p className="text-[11px] mt-1" style={{ color: "var(--ink-light)" }}>
                  시간 입력 시 시주(내면의 자아)까지 분석합니다
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
                boxShadow: valid ? "0 4px 16px var(--shadow-btn)" : "none",
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
                ["saju", "var(--saju)", "사주"],
                ["astro", "var(--astro)", "별자리"],
                ["mbti", "var(--mbti)", "수비학"],
                ["face", "var(--face)", "띠"],
              ] as const).map(([type, c, v]) => (
                <span key={v} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--ink-muted)" }}>
                  <SystemIcon type={type} color={c} size={12} />{v}
                </span>
              ))}
            </div>

            <div className="flex justify-center mt-5 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <Link
                href="/about"
                className="text-[13px] font-medium transition-opacity hover:opacity-70"
                style={{ color: "var(--ink-light)", textDecoration: "underline", textUnderlineOffset: "3px" }}
              >
                어떻게 분석하나요?
              </Link>
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
                <div className="flex flex-col gap-1 mb-5">
                  <div className="flex items-center gap-2">
                    <StarIcon color="var(--seal)" size={14} />
                    <span className="text-sm font-bold tracking-wider" style={{ color: "var(--seal)" }}>교차점</span>
                  </div>
                  <p className="text-[12px] leading-snug ml-[18px]" style={{ color: "var(--ink-light)" }}>
                    4개 문명, 수천 년의 독립적 관찰이 수렴한 결과
                  </p>
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

            {/* Archetype Name with Seal Stamp Visual */}
            <ScrollReveal delay={160}>
              <div
                className="rounded-[14px] p-6 mb-3.5 relative overflow-hidden"
                style={{ background: "var(--seal-bg)", border: "1.5px solid var(--seal-light)" }}
              >
                {/* Seal watermark */}
                <div
                  className="absolute -right-4 -top-4 w-[100px] h-[100px] flex items-center justify-center -rotate-[12deg] pointer-events-none"
                  style={{ opacity: 0.06 }}
                >
                  <span
                    className="text-[80px] font-black"
                    style={{ fontFamily: "var(--font-display)", color: "var(--seal)" }}
                  >
                    命
                  </span>
                </div>
                <div className="text-[11px] font-semibold tracking-widest mb-2" style={{ color: "var(--ink-light)" }}>
                  교차점 유형
                </div>
                <h2
                  className="text-[22px] font-black leading-snug relative"
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
                    <SectionHeader color="var(--seal)" title="아키타입 상세" icon={<StarIcon color="var(--seal)" size={14} />} />
                    <h3
                      className="text-lg font-black mb-2"
                      style={{ fontFamily: "var(--font-display)", color: "var(--seal-dark)" }}
                    >
                      {result.archetype}
                    </h3>
                    <p className="text-[15px] leading-[1.9] mb-4" style={{ fontFamily: "var(--font-display)", color: "var(--ink-medium)" }}>
                      {result.archetype_desc}
                    </p>

                    {/* cross_message: Seal-stamped container */}
                    {result.cross_message && (() => {
                      const [first, rest] = splitFirstSentence(result.cross_message);
                      return (
                        <div
                          className="relative overflow-hidden rounded-lg p-4"
                          style={{ background: "var(--seal-bg)", border: "1px solid color-mix(in srgb, var(--seal) 15%, transparent)" }}
                        >
                          {/* Seal watermark */}
                          <div
                            className="absolute right-2 bottom-1 pointer-events-none -rotate-[8deg]"
                            style={{ opacity: 0.04 }}
                          >
                            <span
                              className="text-[56px] font-black"
                              style={{ fontFamily: "var(--font-display)", color: "var(--seal)" }}
                            >
                              印
                            </span>
                          </div>
                          <div className="relative flex flex-col gap-[16px]">
                            <KeyInsight text={first} source="교차점" />
                            {rest && (
                              <Expandable
                                title="교차 메시지"
                                preview={rest.slice(0, 80) + (rest.length > 80 ? "..." : "")}
                                accentColor="var(--seal)"
                              >
                                <p
                                  className="text-[15px] leading-[2]"
                                  style={{ fontFamily: "var(--font-display)", color: "var(--ink-medium)" }}
                                >
                                  {rest}
                                </p>
                              </Expandable>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Career Crosspoint */}
                    {result?.career_crosspoint && (
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
                            {result.career_crosspoint?.title}
                          </h4>
                          <p
                            className="text-[15px] leading-[1.9] mb-4"
                            style={{ fontFamily: "var(--font-display)", color: "var(--ink-medium)" }}
                          >
                            {result.career_crosspoint?.description}
                          </p>
                          {result.career_crosspoint?.ideal_fields && (
                            <div className="flex flex-wrap gap-2">
                              {result.career_crosspoint.ideal_fields.map((f: string) => (
                                <Chip key={f} label={f} color="var(--saju)" />
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {/* Relationship Crosspoint */}
                    {result?.relationship_crosspoint && (
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
                            {result.relationship_crosspoint?.title}
                          </h4>
                          <p
                            className="text-[15px] leading-[1.9] mb-4"
                            style={{ fontFamily: "var(--font-display)", color: "var(--ink-medium)" }}
                          >
                            {result.relationship_crosspoint?.description}
                          </p>
                          {result.relationship_crosspoint?.ideal_partner_traits && (
                            <div className="flex flex-wrap gap-2">
                              {result.relationship_crosspoint.ideal_partner_traits.map((t: string) => (
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
                    <SectionHeader color="var(--saju)" title="오행 밸런스" icon={<SajuIcon color="var(--saju)" size={14} />} />
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
                    style={{
                      background: "var(--bg-white)",
                      borderLeft: "3px solid var(--saju)",
                      borderTop: "1.5px solid var(--border)",
                      borderRight: "1.5px solid var(--border)",
                      borderBottom: "1.5px solid var(--border)",
                      boxShadow: "inset 0 0 0 1000px color-mix(in srgb, var(--saju) 12%, transparent)",
                    }}
                  >
                    <CivilizationHeader
                      symbol="四柱"
                      title="사주명리학"
                      origin="기원전 1,000년 -- 동아시아"
                      basis="天干地支 60甲子 체계 기반"
                      color="var(--saju)"
                    />

                    {/* Pillar Cards - 만세력 스타일 */}
                    <div
                      className="rounded-lg mb-3.5 overflow-hidden"
                      style={{ border: "1px solid var(--saju)", background: "var(--bg-paper)" }}
                    >
                      {/* 만세력 헤더 */}
                      <div
                        className="flex text-center text-[10px] font-bold tracking-wider py-1.5"
                        style={{ background: "color-mix(in srgb, var(--saju) 10%, transparent)", color: "var(--saju)" }}
                      >
                        <div className="flex-1">年柱</div>
                        <div className="flex-1" style={{ borderLeft: "1px solid color-mix(in srgb, var(--saju) 18%, transparent)" }}>月柱</div>
                        <div className="flex-1" style={{ borderLeft: "1px solid color-mix(in srgb, var(--saju) 18%, transparent)", borderRight: "1px solid color-mix(in srgb, var(--saju) 18%, transparent)" }}>日柱</div>
                        {result.saju.hour && <div className="flex-1">時柱</div>}
                      </div>
                      {/* 천간 행 */}
                      <div className="flex text-center" style={{ borderBottom: "1px solid var(--border)" }}>
                        <div className="flex-1 py-3">
                          <div
                            className="text-[26px] font-black"
                            style={{ fontFamily: "var(--font-display)", color: OHANG_INFO[result.saju.year.ohang].color }}
                          >
                            {result.saju.year.cheongan}
                          </div>
                          <div className="text-[10px] mt-0.5" style={{ color: "var(--ink-light)" }}>천간</div>
                        </div>
                        <div className="flex-1 py-3" style={{ borderLeft: "1px solid var(--border)" }}>
                          <div
                            className="text-[26px] font-black"
                            style={{ fontFamily: "var(--font-display)", color: OHANG_INFO[result.saju.month.ohang].color }}
                          >
                            {result.saju.month.cheongan}
                          </div>
                          <div className="text-[10px] mt-0.5" style={{ color: "var(--ink-light)" }}>천간</div>
                        </div>
                        <div className="flex-1 py-3" style={{ borderLeft: "1px solid var(--border)", borderRight: result.saju.hour ? "1px solid var(--border)" : "none" }}>
                          <div
                            className="text-[26px] font-black"
                            style={{ fontFamily: "var(--font-display)", color: OHANG_INFO[result.saju.day.ohang].color }}
                          >
                            {result.saju.day.cheongan}
                          </div>
                          <div className="text-[10px] mt-0.5" style={{ color: "var(--ink-light)" }}>천간 (일간)</div>
                        </div>
                        {result.saju.hour && (
                          <div className="flex-1 py-3">
                            <div
                              className="text-[26px] font-black"
                              style={{ fontFamily: "var(--font-display)", color: OHANG_INFO[result.saju.hour.ohang].color }}
                            >
                              {result.saju.hour.cheongan}
                            </div>
                            <div className="text-[10px] mt-0.5" style={{ color: "var(--ink-light)" }}>천간</div>
                          </div>
                        )}
                      </div>
                      {/* 지지 행 */}
                      <div className="flex text-center">
                        <div className="flex-1 py-3">
                          <div
                            className="text-[26px] font-black"
                            style={{ fontFamily: "var(--font-display)", color: OHANG_INFO[result.saju.year.ohang].color }}
                          >
                            {result.saju.year.jiji}
                          </div>
                          <div className="text-[10px] mt-0.5" style={{ color: "var(--ink-light)" }}>지지</div>
                        </div>
                        <div className="flex-1 py-3" style={{ borderLeft: "1px solid var(--border)" }}>
                          <div
                            className="text-[26px] font-black"
                            style={{ fontFamily: "var(--font-display)", color: OHANG_INFO[result.saju.month.ohang].color }}
                          >
                            {result.saju.month.jiji}
                          </div>
                          <div className="text-[10px] mt-0.5" style={{ color: "var(--ink-light)" }}>지지</div>
                        </div>
                        <div className="flex-1 py-3" style={{ borderLeft: "1px solid var(--border)", borderRight: result.saju.hour ? "1px solid var(--border)" : "none" }}>
                          <div className="flex items-center justify-center gap-1">
                            <Dot color={OHANG_INFO[result.saju.day.ohang].color} />
                            <span className="text-sm font-semibold" style={{ color: "var(--ink-medium)" }}>
                              {result.saju.personality.nature}
                            </span>
                          </div>
                          <div className="text-[10px] mt-1" style={{ color: "var(--ink-light)" }}>
                            {result.saju.day.ohang} {OHANG_INFO[result.saju.day.ohang].kr}
                          </div>
                        </div>
                        {result.saju.hour && (
                          <div className="flex-1 py-3">
                            <div
                              className="text-[26px] font-black"
                              style={{ fontFamily: "var(--font-display)", color: OHANG_INFO[result.saju.hour.ohang].color }}
                            >
                              {result.saju.hour.jiji}
                            </div>
                            <div className="text-[10px] mt-0.5" style={{ color: "var(--ink-light)" }}>지지</div>
                          </div>
                        )}
                      </div>
                      {/* 오행 요약 */}
                      <div
                        className="flex justify-center gap-3 py-2 text-[11px]"
                        style={{ background: "color-mix(in srgb, var(--saju) 12%, transparent)", borderTop: "1px solid var(--border)" }}
                      >
                        <span style={{ color: OHANG_INFO[result.saju.year.ohang].color }}>
                          {result.saju.year.ohang} {OHANG_INFO[result.saju.year.ohang].kr}
                        </span>
                        <span style={{ color: "var(--ink-faint)" }}>|</span>
                        <span style={{ color: OHANG_INFO[result.saju.month.ohang].color }}>
                          {result.saju.month.ohang} {OHANG_INFO[result.saju.month.ohang].kr}
                        </span>
                        <span style={{ color: "var(--ink-faint)" }}>|</span>
                        <span style={{ color: OHANG_INFO[result.saju.day.ohang].color }}>
                          {result.saju.day.ohang} {OHANG_INFO[result.saju.day.ohang].kr}
                        </span>
                      </div>
                    </div>

                    {/* 시주 내면의 자아 */}
                    {result.saju.hourPersonality && (
                      <div className="p-4 rounded-lg mb-3.5" style={{ background: "var(--bg-paper)", borderLeft: "2px solid var(--seal)" }}>
                        <div className="flex items-center gap-2 mb-2">
                          <Dot color="var(--seal)" size={7} />
                          <span className="text-sm font-bold" style={{ color: "var(--seal)" }}>시주 (내면의 자아)</span>
                        </div>
                        <p className="text-[14px] leading-[1.9]" style={{ fontFamily: "var(--font-display)", color: "var(--ink-medium)" }}>
                          {result.saju.hourPersonality}
                        </p>
                      </div>
                    )}

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

                    {/* Detailed Personality: KeyInsight + Expandable */}
                    {result.saju.personality?.detailed_personality && (() => {
                      const text = result.saju.personality.detailed_personality;
                      const [first, rest] = splitFirstSentence(text);
                      return (
                        <div className="p-4 rounded-lg mb-3.5" style={{ background: "var(--bg-paper)" }}>
                          <div className="flex items-center gap-2 mb-3">
                            <Dot color="var(--saju)" size={7} />
                            <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>성격 심층 분석</span>
                          </div>
                          <KeyInsight text={first} source="사주" color="var(--saju)" />
                          {rest && (
                            <div className="mt-[16px]">
                              <Expandable
                                title="성격 심층"
                                preview={rest.slice(0, 80) + (rest.length > 80 ? "..." : "")}
                                accentColor="var(--saju)"
                              >
                                <p
                                  className="text-[15px] leading-[2]"
                                  style={{ fontFamily: "var(--font-display)", color: "var(--ink-medium)" }}
                                >
                                  {rest}
                                </p>
                              </Expandable>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Career: StatCards */}
                    {result.saju.personality?.career && result.saju.personality.career.length > 0 && (
                      <div className="p-4 rounded-lg mb-3.5" style={{ background: "var(--bg-paper)" }}>
                        <div className="flex items-center gap-2 mb-3">
                          <Dot color="var(--face)" size={7} />
                          <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>직업/진로</span>
                        </div>
                        <div className="flex gap-2 mb-[16px]">
                          <StatCard
                            number={result.saju.day.cheongan}
                            label="일간"
                            color="var(--saju)"
                          />
                          <StatCard
                            number={result.saju.day.ohang}
                            label={OHANG_INFO[result.saju.day.ohang].kr}
                            color={OHANG_INFO[result.saju.day.ohang].color}
                          />
                        </div>
                        <Expandable
                          title="직업/진로"
                          preview={splitFirstSentence(result.saju.personality.career[0])[0]}
                          accentColor="var(--face)"
                        >
                          <ul className="text-[15px] leading-[2] list-none p-0 m-0"
                            style={{ fontFamily: "var(--font-display)", color: "var(--ink-medium)" }}
                          >
                            {result.saju.personality.career.map((c: string) => (
                              <li key={c} className="mb-1">{c}</li>
                            ))}
                          </ul>
                        </Expandable>
                      </div>
                    )}

                    {/* Relationship Style: Expandable */}
                    {result.saju.personality?.relationship && (() => {
                      const text = result.saju.personality.relationship;
                      const [first, rest] = splitFirstSentence(text);
                      return (
                        <div className="p-4 rounded-lg mb-3.5" style={{ background: "var(--bg-paper)" }}>
                          <div className="flex items-center gap-2 mb-3">
                            <Dot color="var(--seal)" size={7} />
                            <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>연애/관계 스타일</span>
                          </div>
                          <Expandable
                            title="연애/관계"
                            preview={first}
                            accentColor="var(--seal)"
                          >
                            <p
                              className="text-[15px] leading-[2]"
                              style={{ fontFamily: "var(--font-display)", color: "var(--ink-medium)" }}
                            >
                              {text}
                            </p>
                          </Expandable>
                        </div>
                      );
                    })()}

                    {/* Weakness / Growth Area: Expandable */}
                    {result.saju.personality?.weakness && (() => {
                      const text = result.saju.personality.weakness;
                      const [first] = splitFirstSentence(text);
                      return (
                        <div className="p-4 rounded-lg mb-3.5" style={{ background: "var(--bg-paper)" }}>
                          <div className="flex items-center gap-2 mb-3">
                            <Dot color="var(--ink-muted)" size={7} />
                            <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>약점/성장 영역</span>
                          </div>
                          <Expandable
                            title="약점/성장"
                            preview={first}
                            accentColor="var(--ink-muted)"
                          >
                            <p
                              className="text-[15px] leading-[2]"
                              style={{ fontFamily: "var(--font-display)", color: "var(--ink-medium)" }}
                            >
                              {text}
                            </p>
                          </Expandable>
                        </div>
                      );
                    })()}

                    {/* Life Advice: KeyInsight */}
                    {result.saju.personality?.advice && (
                      <div className="p-4 rounded-lg mb-3.5" style={{ background: "var(--bg-paper)" }}>
                        <div className="flex items-center gap-2 mb-3">
                          <Dot color="var(--numero)" size={7} />
                          <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>인생 조언</span>
                        </div>
                        <KeyInsight
                          text={result.saju.personality.advice}
                          source="사주"
                          color="var(--numero)"
                        />
                      </div>
                    )}

                    {/* Animal Sign — Expanded */}
                    <div className="p-4 rounded-lg" style={{ background: "var(--bg-paper)" }}>
                      <div className="flex items-center gap-2 mb-3">
                        <Dot color="var(--face)" size={7} />
                        <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>
                          {result.saju.animal.animal_kr}띠
                        </span>
                        <span className="text-xs ml-1" style={{ color: "var(--ink-light)" }}>
                          {result.saju.year.jiji}
                        </span>
                      </div>
                      {result.saju.animal?.personality && (
                        <p
                          className="text-[15px] leading-[2] mb-3"
                          style={{ fontFamily: "var(--font-display)", color: "var(--ink-medium)" }}
                        >
                          {result.saju.animal.personality}
                        </p>
                      )}
                      {result.saju.animal?.compatibility_best && (
                        <div className="mb-2">
                          <span className="text-xs font-semibold" style={{ color: "var(--saju)" }}>잘 맞는 띠: </span>
                          <span className="text-xs" style={{ color: "var(--ink-medium)" }}>
                            {result.saju.animal.compatibility_best.join(", ")}
                          </span>
                        </div>
                      )}
                      {result.saju.animal?.compatibility_worst && (
                        <div>
                          <span className="text-xs font-semibold" style={{ color: "var(--seal)" }}>조심할 띠: </span>
                          <span className="text-xs" style={{ color: "var(--ink-medium)" }}>
                            {result.saju.animal.compatibility_worst.join(", ")}
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
                    style={{
                      background: "var(--bg-white)",
                      borderLeft: "3px solid var(--astro)",
                      borderTop: "1.5px solid var(--border)",
                      borderRight: "1.5px solid var(--border)",
                      borderBottom: "1.5px solid var(--border)",
                      boxShadow: "inset 0 0 0 1000px color-mix(in srgb, var(--astro) 12%, transparent)",
                    }}
                  >
                    <CivilizationHeader
                      symbol={result.western.sunSign.symbol}
                      title="서양 점성술"
                      origin="기원전 2,000년 -- 바빌로니아"
                      basis="NASA JPL 천문 데이터 참조"
                      color="var(--astro)"
                    />

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

                      {/* Detailed Personality: Expandable with first 2 sentences visible */}
                      {result.western.sunSign?.detailed_personality && (() => {
                        const text = result.western.sunSign.detailed_personality;
                        const [first, rest] = splitFirstTwo(text);
                        return (
                          <div className="text-left mt-4 p-4 rounded-lg" style={{ background: "var(--bg-paper)" }}>
                            <div className="flex items-center gap-2 mb-3">
                              <Dot color={result.western.sunSign.color} size={7} />
                              <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>성격 심층 분석</span>
                            </div>
                            <Expandable
                              title="성격 심층"
                              preview={first}
                              accentColor={result.western.sunSign.color}
                            >
                              <p
                                className="text-[15px] leading-[2]"
                                style={{ fontFamily: "var(--font-display)", color: "var(--ink-medium)" }}
                              >
                                {text}
                              </p>
                            </Expandable>
                          </div>
                        );
                      })()}

                      {/* Love Style: KeyInsight */}
                      {result.western.sunSign?.love_style && (() => {
                        const text = result.western.sunSign.love_style;
                        const [first] = splitFirstSentence(text);
                        return (
                          <div className="text-left mt-[24px] p-4 rounded-lg" style={{ background: "var(--bg-paper)" }}>
                            <div className="flex items-center gap-2 mb-3">
                              <Dot color="var(--seal)" size={7} />
                              <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>연애 스타일</span>
                            </div>
                            <KeyInsight text={first} source="별자리" color="var(--seal)" />
                          </div>
                        );
                      })()}

                      {/* Career Strengths */}
                      {result.western.sunSign?.career_strengths && (
                        <div className="text-left mt-[24px] p-4 rounded-lg" style={{ background: "var(--bg-paper)" }}>
                          <div className="flex items-center gap-2 mb-3">
                            <Dot color="var(--saju)" size={7} />
                            <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>직업 강점</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {result.western.sunSign.career_strengths.map((s: string) => (
                              <Chip key={s} label={s} color={result.western.sunSign.color} />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Shadow Side / Challenges: Expandable */}
                      {result.western.sunSign?.shadow_side && (() => {
                        const text = result.western.sunSign.shadow_side;
                        const [first] = splitFirstSentence(text);
                        return (
                          <div className="text-left mt-[24px] p-4 rounded-lg" style={{ background: "var(--bg-paper)" }}>
                            <div className="flex items-center gap-2 mb-3">
                              <Dot color="var(--ink-muted)" size={7} />
                              <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>그림자 / 도전</span>
                            </div>
                            <Expandable
                              title="그림자 / 도전"
                              preview={first}
                              accentColor="var(--ink-muted)"
                            >
                              <p
                                className="text-[15px] leading-[2]"
                                style={{ fontFamily: "var(--font-display)", color: "var(--ink-medium)" }}
                              >
                                {text}
                              </p>
                            </Expandable>
                          </div>
                        );
                      })()}

                      {/* Best / Worst Compatibility */}
                      {(result.western.sunSign?.compatibility_best || result.western.sunSign?.compatibility_worst) && (
                        <div className="text-left mt-3.5 p-4 rounded-lg" style={{ background: "var(--bg-paper)" }}>
                          <div className="flex items-center gap-2 mb-3">
                            <Dot color="var(--astro)" size={7} />
                            <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>별자리 궁합</span>
                          </div>
                          {result.western.sunSign?.compatibility_best && (
                            <div className="mb-2">
                              <span className="text-xs font-semibold" style={{ color: "var(--saju)" }}>최고 궁합: </span>
                              <span className="text-xs" style={{ color: "var(--ink-medium)" }}>
                                {result.western.sunSign.compatibility_best.join(", ")}
                              </span>
                            </div>
                          )}
                          {result.western.sunSign?.compatibility_worst && (
                            <div>
                              <span className="text-xs font-semibold" style={{ color: "var(--seal)" }}>도전적 궁합: </span>
                              <span className="text-xs" style={{ color: "var(--ink-medium)" }}>
                                {result.western.sunSign.compatibility_worst.join(", ")}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Life Lesson */}
                      {result.western.sunSign?.life_lesson && (
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
                          {result.western.sunSign.life_lesson}
                        </blockquote>
                      )}
                    </div>
                  </div>
                </ScrollReveal>

                {/* B5: 수비학 상세 */}
                <ScrollReveal delay={320}>
                  <div
                    className="rounded-[14px] p-6 mb-3.5"
                    style={{
                      background: "var(--bg-white)",
                      borderLeft: "3px solid var(--numero)",
                      borderTop: "1.5px solid var(--border)",
                      borderRight: "1.5px solid var(--border)",
                      borderBottom: "1.5px solid var(--border)",
                      boxShadow: "inset 0 0 0 1000px color-mix(in srgb, var(--numero) 12%, transparent)",
                    }}
                  >
                    <CivilizationHeader
                      symbol={String(result.numerology.lifePath)}
                      title="수비학"
                      origin="기원전 500년 -- 피타고라스"
                      basis="수의 진동(Vibration) 이론 기반"
                      color="var(--numero)"
                    />

                    <div className="text-center py-2">
                      <div
                        className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-3"
                        style={{ background: "color-mix(in srgb, var(--numero) 12%, transparent)" }}
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

                      {/* Detailed Personality: Expandable */}
                      {result.numerology.lifePathInfo?.detailed_personality && (() => {
                        const text = result.numerology.lifePathInfo.detailed_personality;
                        const [first] = splitFirstSentence(text);
                        return (
                          <div className="text-left p-4 rounded-lg mb-[24px]" style={{ background: "var(--bg-paper)" }}>
                            <div className="flex items-center gap-2 mb-3">
                              <Dot color="var(--numero)" size={7} />
                              <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>성격 심층 분석</span>
                            </div>
                            <Expandable
                              title="성격 심층"
                              preview={first}
                              accentColor="var(--numero)"
                            >
                              <p
                                className="text-[15px] leading-[2]"
                                style={{ fontFamily: "var(--font-display)", color: "var(--ink-medium)" }}
                              >
                                {text}
                              </p>
                            </Expandable>
                          </div>
                        );
                      })()}

                      {/* Life Purpose: KeyInsight */}
                      {result.numerology.lifePathInfo?.life_purpose && (
                        <div className="text-left p-4 rounded-lg mb-[24px]" style={{ background: "var(--bg-paper)" }}>
                          <div className="flex items-center gap-2 mb-3">
                            <Dot color="var(--astro)" size={7} />
                            <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>인생 목적</span>
                          </div>
                          <KeyInsight
                            text={result.numerology.lifePathInfo.life_purpose}
                            source="수비학"
                            color="var(--astro)"
                          />
                        </div>
                      )}

                      {/* Career Paths: StatCards + Chips */}
                      {result.numerology.lifePathInfo?.career_paths && (
                        <div className="text-left p-4 rounded-lg mb-[24px]" style={{ background: "var(--bg-paper)" }}>
                          <div className="flex items-center gap-2 mb-3">
                            <Dot color="var(--saju)" size={7} />
                            <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>추천 직업 분야</span>
                          </div>
                          <div className="flex gap-2 mb-[16px]">
                            <StatCard
                              number={String(result.numerology.lifePath)}
                              label="생명경로수"
                              color="var(--numero)"
                            />
                            <StatCard
                              number={String(result.numerology.lifePathInfo.career_paths.length)}
                              label="경로수"
                              color="var(--saju)"
                            />
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {result.numerology.lifePathInfo.career_paths.map((c: string) => (
                              <Chip key={c} label={c} color="var(--numero)" />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Relationship Style */}
                      {result.numerology.lifePathInfo?.relationship_style && (
                        <div className="text-left p-4 rounded-lg mb-[24px]" style={{ background: "var(--bg-paper)" }}>
                          <div className="flex items-center gap-2 mb-3">
                            <Dot color="var(--seal)" size={7} />
                            <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>관계 스타일</span>
                          </div>
                          <p
                            className="text-[15px] leading-[2]"
                            style={{ fontFamily: "var(--font-display)", color: "var(--ink-medium)" }}
                          >
                            {result.numerology.lifePathInfo.relationship_style}
                          </p>
                        </div>
                      )}

                      {/* Challenge: Expandable */}
                      {result.numerology.lifePathInfo?.challenge && (() => {
                        const text = result.numerology.lifePathInfo.challenge;
                        const [first] = splitFirstSentence(text);
                        return (
                          <div className="text-left p-4 rounded-lg mb-3.5" style={{ background: "var(--bg-paper)" }}>
                            <div className="flex items-center gap-2 mb-3">
                              <Dot color="var(--ink-muted)" size={7} />
                              <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>도전 과제</span>
                            </div>
                            <Expandable
                              title="도전 과제"
                              preview={first}
                              accentColor="var(--ink-muted)"
                            >
                              <p
                                className="text-[15px] leading-[2]"
                                style={{ fontFamily: "var(--font-display)", color: "var(--ink-medium)" }}
                              >
                                {text}
                              </p>
                            </Expandable>
                          </div>
                        );
                      })()}

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

                {/* B5.5: MBTI 교차분석 */}
                <ScrollReveal delay={360}>
                  <div
                    className="rounded-[14px] p-6 mb-3.5"
                    style={{
                      background: "var(--bg-white)",
                      borderLeft: "3px solid var(--mbti)",
                      borderTop: "1.5px solid var(--border)",
                      borderRight: "1.5px solid var(--border)",
                      borderBottom: "1.5px solid var(--border)",
                      boxShadow: "inset 0 0 0 1000px color-mix(in srgb, var(--mbti) 12%, transparent)",
                    }}
                  >
                    <CivilizationHeader
                      symbol={result.mbti.primaryType}
                      title="성격유형론"
                      origin="1921년 -- 칼 융"
                      basis="융의 심리 유형론(Psychological Types) 기반"
                      color="var(--mbti)"
                    />

                    <div className="text-center py-2">
                      {/* MBTI Type Badge */}
                      <div
                        className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-3"
                        style={{ background: "color-mix(in srgb, var(--mbti) 12%, transparent)" }}
                      >
                        <span
                          className="text-2xl font-black tracking-wide"
                          style={{ fontFamily: "var(--font-display)", color: "var(--mbti)" }}
                        >
                          {result.mbti.primaryType}
                        </span>
                      </div>

                      {/* Secondary Type */}
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <span
                          className="inline-block px-3 py-1 rounded-full text-sm font-bold"
                          style={{ background: "color-mix(in srgb, var(--mbti) 12%, transparent)", color: "var(--mbti)" }}
                        >
                          {result.mbti.primaryType}
                        </span>
                        <span className="text-xs" style={{ color: "var(--ink-light)" }}>or</span>
                        <span
                          className="inline-block px-3 py-1 rounded-full text-sm font-bold"
                          style={{ background: "var(--bg-paper)", color: "var(--ink-muted)" }}
                        >
                          {result.mbti.secondaryType}
                        </span>
                      </div>

                      {/* Description */}
                      <p
                        className="text-[15px] leading-[1.9] mb-4 text-left"
                        style={{ fontFamily: "var(--font-display)", color: "var(--ink-medium)" }}
                      >
                        {result.mbti.description}
                      </p>

                      {/* Strengths */}
                      <div className="mb-3 text-left">
                        <div className="text-[11px] font-semibold mb-2" style={{ color: "var(--ink-light)" }}>
                          강점
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {result.mbti.strengths.map((s) => (
                            <Chip key={s} label={s} color="var(--mbti)" />
                          ))}
                        </div>
                      </div>

                      {/* Weaknesses */}
                      <div className="mb-4 text-left">
                        <div className="text-[11px] font-semibold mb-2" style={{ color: "var(--ink-light)" }}>
                          약점
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {result.mbti.weaknesses.map((w) => (
                            <Chip key={w} label={w} color="var(--ink-light)" />
                          ))}
                        </div>
                      </div>

                      {/* Saju Alignment */}
                      <div className="text-left p-4 rounded-lg mb-3.5" style={{ background: "var(--bg-paper)" }}>
                        <div className="flex items-center gap-2 mb-2">
                          <Dot color="var(--saju)" size={7} />
                          <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>사주와의 연결</span>
                        </div>
                        <p
                          className="text-[15px] leading-[2]"
                          style={{ fontFamily: "var(--font-display)", color: "var(--ink-medium)" }}
                        >
                          {result.mbti.sajuAlignment}
                        </p>
                      </div>

                      {/* Zodiac Alignment */}
                      <div className="text-left p-4 rounded-lg mb-3.5" style={{ background: "var(--bg-paper)" }}>
                        <div className="flex items-center gap-2 mb-2">
                          <Dot color="var(--astro)" size={7} />
                          <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>별자리와의 연결</span>
                        </div>
                        <p
                          className="text-[15px] leading-[2]"
                          style={{ fontFamily: "var(--font-display)", color: "var(--ink-medium)" }}
                        >
                          {result.mbti.zodiacAlignment}
                        </p>
                      </div>

                      {/* Love Style */}
                      <div className="text-left p-4 rounded-lg mb-3.5" style={{ background: "var(--bg-paper)" }}>
                        <div className="flex items-center gap-2 mb-2">
                          <Dot color="var(--seal)" size={7} />
                          <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>연애 스타일</span>
                        </div>
                        <p
                          className="text-[15px] leading-[2]"
                          style={{ fontFamily: "var(--font-display)", color: "var(--ink-medium)" }}
                        >
                          {result.mbti.loveStyle}
                        </p>
                      </div>

                      {/* Career */}
                      <div className="text-left p-4 rounded-lg mb-3.5" style={{ background: "var(--bg-paper)" }}>
                        <div className="flex items-center gap-2 mb-3">
                          <Dot color="var(--face)" size={7} />
                          <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>추천 직업</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {result.mbti.career.map((c) => (
                            <Chip key={c} label={c} color="var(--mbti)" />
                          ))}
                        </div>
                      </div>

                      {/* Compatibility */}
                      <div className="text-left p-4 rounded-lg" style={{ background: "var(--bg-paper)" }}>
                        <div className="flex items-center gap-2 mb-3">
                          <Dot color="var(--mbti)" size={7} />
                          <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>MBTI 궁합</span>
                        </div>
                        <div className="mb-2">
                          <span className="text-xs font-semibold" style={{ color: "var(--saju)" }}>최고 궁합: </span>
                          <span className="text-xs" style={{ color: "var(--ink-medium)" }}>
                            {result.mbti.compatibility_best.join(", ")}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs font-semibold" style={{ color: "var(--seal)" }}>도전적 궁합: </span>
                          <span className="text-xs" style={{ color: "var(--ink-medium)" }}>
                            {result.mbti.compatibility_worst.join(", ")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>

                {/* Convergence Moment: 문명간 수렴 시각화 */}
                <ConvergenceMoment />

                {/* B6: 성격 종합 */}
                <ScrollReveal delay={440}>
                  <div
                    className="rounded-[14px] p-6 mb-3.5"
                    style={{ background: "var(--bg-white)", border: "1.5px solid var(--border)" }}
                  >
                    <SectionHeader color="var(--ink)" title="성격 종합" icon={<StarIcon color="var(--ink)" size={14} />} />

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
                  <ScrollReveal delay={520}>
                    <div
                      className="rounded-[14px] p-5 mb-3.5"
                      style={{ background: "var(--bg-white)", border: "1.5px solid var(--border)" }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Dot color="var(--seal)" size={8} />
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
                      {result?.life_advice && Array.isArray(result.life_advice) && (
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
                              {result.life_advice.map((advice: string, i: number) => (
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
                <ScrollReveal delay={600}>
                  <AIInterpretation result={result} />
                </ScrollReveal>

              </div>

            {/* ═══════════════════════════════════════════
                SECTION B9: 월별 운세
               ═══════════════════════════════════════════ */}
            <MonthlyForecastSection year={parseInt(year)} month={parseInt(month)} day={parseInt(day)} />

            {/* ═══════════════════════════════════════════
                SECTION C: BOTTOM (always visible)
               ═══════════════════════════════════════════ */}

            {/* Feedback */}
            <ScrollReveal delay={620}>
              <FeedbackWidget
                year={parseInt(year)}
                month={parseInt(month)}
                day={parseInt(day)}
                convergenceRate={result.convergence_rate}
                archetype={result.archetype}
              />
            </ScrollReveal>

            {/* AI Chat Consultation */}
            <ScrollReveal delay={630}>
              <div className="mb-3.5">
                <ChatConsultation
                  context={{
                    archetype: result.archetype,
                    saju: `${result.saju.day.cheongan} (${result.saju.day.ohang})`,
                    zodiac: result.western.sunSign.name,
                    numerology: `${result.numerology.lifePath}`,
                    mbti: result.mbti.primaryType,
                    convergenceRate: result.convergence_rate,
                  }}
                />
              </div>
            </ScrollReveal>

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

            {/* 궁합 분석 CTA */}
            <ScrollReveal delay={720}>
              <Link
                href="/compatibility"
                className="flex items-center gap-3 p-4 rounded-xl mb-3 no-underline transition-opacity hover:opacity-85"
                style={{ background: "var(--seal-bg)", border: "1.5px solid var(--seal-light)" }}
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

            {/* Tarot link */}
            <ScrollReveal delay={800}>
              <Link
                href="/tarot"
                className="flex items-center gap-3 p-4 rounded-xl mb-4 no-underline transition-opacity hover:opacity-85"
                style={{ background: "var(--bg-warm)", border: "1.5px solid var(--tarot)" }}
              >
                <div
                  className="flex items-center justify-center w-9 h-9 rounded-full shrink-0"
                  style={{ background: "color-mix(in srgb, var(--tarot) 10%, transparent)" }}
                >
                  <TarotIcon color="var(--tarot)" size={16} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold" style={{ color: "var(--ink-medium)" }}>
                    타로 카드 리딩
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--ink-light)" }}>
                    탄생 카드와 올해의 카드 확인하기
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                  <path d="M6 4l4 4-4 4" stroke="var(--tarot)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </ScrollReveal>

            {/* Career Deep Analysis link */}
            <ScrollReveal delay={860}>
              <Link
                href="/career"
                className="flex items-center gap-3 p-4 rounded-xl mb-3 no-underline transition-opacity hover:opacity-85"
                style={{ background: "var(--bg-warm)", border: "1.5px solid var(--saju)" }}
              >
                <div
                  className="flex items-center justify-center w-9 h-9 rounded-[3px] shrink-0 -rotate-[3deg]"
                  style={{ border: "2px solid var(--saju)", color: "var(--saju)", fontFamily: "var(--font-display)" }}
                >
                  <span className="text-sm font-black">職</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold" style={{ color: "var(--ink-medium)" }}>
                    커리어 심화 분석
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--ink-light)" }}>
                    TOP 5 추천 직업과 업무 성향 분석
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                  <path d="M6 4l4 4-4 4" stroke="var(--saju)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </ScrollReveal>

            {/* Love Deep Analysis link */}
            <ScrollReveal delay={920}>
              <Link
                href="/love"
                className="flex items-center gap-3 p-4 rounded-xl mb-4 no-underline transition-opacity hover:opacity-85"
                style={{ background: "var(--bg-warm)", border: "1.5px solid var(--seal)" }}
              >
                <div
                  className="flex items-center justify-center w-9 h-9 rounded-[3px] shrink-0 -rotate-[3deg]"
                  style={{ border: "2px solid var(--seal)", color: "var(--seal)", fontFamily: "var(--font-display)" }}
                >
                  <span className="text-sm font-black">緣</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold" style={{ color: "var(--ink-medium)" }}>
                    연애 심화 분석
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--ink-light)" }}>
                    이상형, 연애 패턴, 올해 연애운
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                  <path d="M6 4l4 4-4 4" stroke="var(--seal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </ScrollReveal>

            {/* Actions */}
            <ScrollReveal delay={980}>
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={reset}
                  className="w-full py-4 text-[15px] font-bold rounded-xl border-none cursor-pointer transition-opacity hover:opacity-85"
                  style={{ background: "var(--seal)", color: "#fff", fontFamily: "inherit", boxShadow: "0 4px 16px var(--shadow-btn)" }}
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

// ━━━ 월별 운세 섹션 ━━━
function MonthlyForecastSection({ year, month, day }: { year: number; month: number; day: number }) {
  const forecast = generateMonthlyForecast(year, month, day, 2026);
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);

  return (
    <ScrollReveal delay={650}>
      <div className="mb-3.5">
        <SectionHeader color="var(--astro)" title="2026년 월별 운세" icon={<AstroIcon color="var(--astro)" size={14} />} />

        {/* Year Summary */}
        <div
          className="rounded-[14px] p-5 mb-4"
          style={{
            background: "var(--bg-white)",
            border: "1.5px solid var(--border)",
            borderLeft: "3px solid var(--seal)",
          }}
        >
          <p
            className="text-[14px] leading-[1.9] italic"
            style={{ color: "var(--ink-muted)", fontFamily: "var(--font-display)" }}
          >
            &ldquo;{forecast.yearSummary}&rdquo;
          </p>
        </div>

        {/* Best & Caution badges */}
        <div className="flex gap-2 mb-4">
          <div
            className="flex-1 rounded-lg px-3 py-2.5 text-center"
            style={{ background: "var(--seal-bg)", border: "1px solid var(--seal)" }}
          >
            <div className="text-[10px] font-semibold tracking-wider mb-0.5" style={{ color: "var(--seal)" }}>
              BEST MONTH
            </div>
            <div className="text-lg font-black" style={{ fontFamily: "var(--font-display)", color: "var(--seal)" }}>
              {forecast.bestMonth}월
            </div>
          </div>
          <div
            className="flex-1 rounded-lg px-3 py-2.5 text-center"
            style={{ background: "#FFF8E1", border: "1px solid #F59E0B" }}
          >
            <div className="text-[10px] font-semibold tracking-wider mb-0.5" style={{ color: "#B45309" }}>
              CAUTION
            </div>
            <div className="text-lg font-black" style={{ fontFamily: "var(--font-display)", color: "#B45309" }}>
              {forecast.cautionMonth}월
            </div>
          </div>
        </div>

        {/* 12 month cards — 2 column grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {forecast.months.map((m) => {
            const isBest = m.month === forecast.bestMonth;
            const isCaution = m.month === forecast.cautionMonth;
            const isExpanded = expandedMonth === m.month;
            const borderColor = isBest ? "var(--seal)" : isCaution ? "#F59E0B" : "var(--border)";
            const bgColor = isBest ? "var(--seal-bg)" : isCaution ? "#FFFBEB" : "var(--bg-white)";

            return (
              <button
                key={m.month}
                onClick={() => setExpandedMonth(isExpanded ? null : m.month)}
                className="rounded-[12px] p-3.5 text-left transition-all cursor-pointer"
                style={{
                  background: bgColor,
                  border: `1.5px solid ${borderColor}`,
                  gridColumn: isExpanded ? "1 / -1" : undefined,
                }}
              >
                {/* Header row */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-[15px] font-black"
                    style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
                  >
                    {m.label}
                  </span>
                  <span
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: isBest ? "var(--seal)" : isCaution ? "#F59E0B" : "var(--ink-muted)",
                      color: "#fff",
                    }}
                  >
                    {m.keyword}
                  </span>
                </div>

                {/* Score bar */}
                <div className="mb-2">
                  <div
                    className="h-[6px] rounded-full overflow-hidden"
                    style={{ background: "var(--border)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${m.score * 10}%`,
                        background: isBest ? "var(--seal)" : isCaution ? "#F59E0B" : "var(--ink-muted)",
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px]" style={{ color: "var(--ink-light)" }}>
                      {m.score}/10
                    </span>
                    <span className="text-[10px]" style={{ color: "var(--ink-light)" }}>
                      행운의 날: {m.luckyDay}일
                    </span>
                  </div>
                </div>

                {/* Category mini-bars (always visible) */}
                <div className="flex gap-1.5 mb-1.5">
                  {(["career", "love", "health", "wealth"] as const).map((cat) => {
                    const labels = { career: "직업", love: "연애", health: "건강", wealth: "재물" };
                    const colors = { career: "var(--saju)", love: "var(--seal)", health: "var(--astro)", wealth: "var(--face)" };
                    return (
                      <div key={cat} className="flex-1">
                        <div className="text-[9px] font-medium mb-0.5" style={{ color: "var(--ink-light)" }}>
                          {labels[cat]}
                        </div>
                        <div className="flex gap-[2px]">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <div
                              key={n}
                              className="h-[3px] flex-1 rounded-full"
                              style={{
                                background: n <= m.category[cat] ? colors[cat] : "var(--border)",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                    <p className="text-[13px] leading-[1.8] mb-2" style={{ color: "var(--ink-muted)" }}>
                      {m.description}
                    </p>
                    <p className="text-[12px] leading-[1.6] font-semibold" style={{ color: "var(--ink-medium)" }}>
                      {m.advice}
                    </p>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </ScrollReveal>
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
