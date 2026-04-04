"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Seal from "@/components/ui/Seal";
import SectionHeader from "@/components/ui/SectionHeader";
import StaggerSection from "@/components/ui/StaggerSection";
import { OHANG_INFO, type Ohang } from "@/lib/saju";
import { analyzeKoreanName, type NameAnalysis } from "@/lib/name-analysis";

// ━━━ 스코어 원 (대형) ━━━
function BigScoreCircle({ score, label }: { score: number; label: string }) {
  const size = 120;
  const r = (size - 8) / 2;
  const c = Math.PI * 2 * r;
  const offset = c - (score / 100) * c;
  const color = label === "대길" ? "var(--saju)" :
    label === "길" ? "var(--astro)" :
      label === "평" ? "var(--face)" : "var(--seal)";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth="4" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={c} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transform: "rotate(-90deg)", transformOrigin: "center", transition: "stroke-dashoffset 1.5s ease" }}
        />
        <text x={size / 2} y={size / 2 - 4} textAnchor="middle" dominantBaseline="central"
          style={{ fontSize: 32, fontWeight: 900, fill: "var(--ink)", fontFamily: "var(--font-display)" }}>
          {score}
        </text>
        <text x={size / 2} y={size / 2 + 22} textAnchor="middle" dominantBaseline="central"
          style={{ fontSize: 11, fontWeight: 600, fill: color }}>
          {label}
        </text>
      </svg>
    </div>
  );
}

// ━━━ 오행 뱃지 ━━━
function OhangBadge({ ohang, size = "md" }: { ohang: Ohang; size?: "sm" | "md" }) {
  const px = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold ${px}`}
      style={{
        background: `${OHANG_INFO[ohang].color}15`,
        color: OHANG_INFO[ohang].color,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: OHANG_INFO[ohang].color }} />
      {ohang} {OHANG_INFO[ohang].kr}
    </span>
  );
}

// ━━━ 메인 페이지 ━━━
export default function NameAnalysisPage() {
  const [name, setName] = useState("");
  const [useBirth, setUseBirth] = useState(false);
  const [birthYear, setBirthYear] = useState(2000);
  const [birthMonth, setBirthMonth] = useState(1);
  const [birthDay, setBirthDay] = useState(1);
  const [result, setResult] = useState<NameAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // localStorage에서 생년월일 자동 로드
  useEffect(() => {
    try {
      const stored = localStorage.getItem("destino_birth");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.year && parsed.month && parsed.day) {
          setBirthYear(parsed.year);
          setBirthMonth(parsed.month);
          setBirthDay(parsed.day);
          setUseBirth(true);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const validateName = useCallback((n: string): boolean => {
    if (n.length < 2 || n.length > 4) {
      setError("이름은 2~4자 한글로 입력해주세요.");
      return false;
    }
    // Check all chars are Hangul
    for (const c of n) {
      const code = c.charCodeAt(0);
      if (code < 0xAC00 || code > 0xD7A3) {
        setError("한글 이름만 입력할 수 있습니다.");
        return false;
      }
    }
    setError("");
    return true;
  }, []);

  const handleAnalyze = useCallback(() => {
    if (!validateName(name)) return;
    setLoading(true);
    setTimeout(() => {
      const analysis = analyzeKoreanName(
        name,
        useBirth ? birthYear : undefined,
        useBirth ? birthMonth : undefined,
        useBirth ? birthDay : undefined,
      );
      setResult(analysis);
      setLoading(false);
    }, 600);
  }, [name, useBirth, birthYear, birthMonth, birthDay, validateName]);

  return (
    <main className="min-h-screen flex flex-col items-center" style={{ background: "var(--bg-paper)" }}>
      <Nav />

      <div className="w-full max-w-[440px] px-5 pt-16 pb-24">
        {/* Header */}
        <div className="pt-6 pb-8 text-center">
          <Seal size="lg" char="名" className="mx-auto mb-4" />
          <h1
            className="text-[28px] font-black leading-[1.3] tracking-[-0.02em]"
            style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
          >
            이름 풀이
          </h1>
          <p className="text-[14px] mt-2 leading-[1.8]" style={{ color: "var(--ink-muted)" }}>
            한글 이름의 획수와 오행으로
            <br />
            이름에 담긴 운명을 분석합니다
          </p>
        </div>

        {!result ? (
          /* ━━━ 입력 폼 ━━━ */
          <div className="flex flex-col gap-4">
            {/* Name input */}
            <div
              className="rounded-xl p-5"
              style={{ background: "var(--bg-white)", border: "1px solid var(--border)" }}
            >
              <label
                className="text-sm font-bold block mb-2"
                style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
              >
                한글 이름
              </label>
              <input
                type="text"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  if (error) setError("");
                }}
                placeholder="예: 김민준"
                maxLength={4}
                className="w-full h-12 px-4 rounded-lg text-lg font-bold text-center tracking-widest"
                style={{
                  background: "var(--bg-paper)",
                  border: "1px solid var(--border)",
                  color: "var(--ink)",
                  fontFamily: "var(--font-display)",
                }}
                aria-label="한글 이름 입력"
              />
              {error && (
                <p className="text-xs mt-2" style={{ color: "var(--seal)" }}>{error}</p>
              )}
              <p className="text-xs mt-2" style={{ color: "var(--ink-light)" }}>
                성 포함 2~4자 한글 이름을 입력하세요
              </p>
            </div>

            {/* Birth toggle */}
            <div
              className="rounded-xl p-5"
              style={{ background: "var(--bg-white)", border: "1px solid var(--border)" }}
            >
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useBirth}
                  onChange={e => setUseBirth(e.target.checked)}
                  className="w-4 h-4 rounded accent-[var(--seal)]"
                />
                <span className="text-sm font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}>
                  생년월일 추가 (사주 조화도 분석)
                </span>
              </label>

              {useBirth && (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div>
                    <label className="text-xs font-medium mb-1 block" style={{ color: "var(--ink-muted)" }}>년</label>
                    <input
                      type="number"
                      value={birthYear}
                      onChange={e => setBirthYear(parseInt(e.target.value) || 2000)}
                      min={1920} max={2026}
                      className="w-full h-10 px-3 rounded-lg text-sm text-center"
                      style={{ background: "var(--bg-paper)", border: "1px solid var(--border)", color: "var(--ink)" }}
                      aria-label="출생년도"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block" style={{ color: "var(--ink-muted)" }}>월</label>
                    <input
                      type="number"
                      value={birthMonth}
                      onChange={e => setBirthMonth(parseInt(e.target.value) || 1)}
                      min={1} max={12}
                      className="w-full h-10 px-3 rounded-lg text-sm text-center"
                      style={{ background: "var(--bg-paper)", border: "1px solid var(--border)", color: "var(--ink)" }}
                      aria-label="출생월"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block" style={{ color: "var(--ink-muted)" }}>일</label>
                    <input
                      type="number"
                      value={birthDay}
                      onChange={e => setBirthDay(parseInt(e.target.value) || 1)}
                      min={1} max={31}
                      className="w-full h-10 px-3 rounded-lg text-sm text-center"
                      style={{ background: "var(--bg-paper)", border: "1px solid var(--border)", color: "var(--ink)" }}
                      aria-label="출생일"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Analyze button */}
            <button
              onClick={handleAnalyze}
              disabled={loading || name.length < 2}
              className="w-full py-3.5 text-center text-[15px] font-bold tracking-wide rounded-lg transition-all hover:opacity-90 active:opacity-80"
              style={{
                background: "var(--seal)",
                color: "#fff",
                fontFamily: "var(--font-display)",
                boxShadow: "0 4px 16px var(--shadow-btn)",
                opacity: loading || name.length < 2 ? 0.5 : 1,
              }}
            >
              {loading ? "분석 중..." : "이름 분석하기"}
            </button>
          </div>
        ) : (
          /* ━━━ 결과 ━━━ */
          <NameResult result={result} onReset={() => setResult(null)} />
        )}
      </div>
    </main>
  );
}

// ━━━ 결과 컴포넌트 ━━━
function NameResult({ result, onReset }: { result: NameAnalysis; onReset: () => void }) {
  return (
    <div className="flex flex-col gap-6">

      {/* 1. 이름 + 총 점수 */}
      <StaggerSection index={0}>
        <div
          className="rounded-xl p-6 flex flex-col items-center text-center gap-4"
          style={{ background: "var(--bg-white)", border: "1px solid var(--border)" }}
        >
          <h2
            className="text-[32px] font-black tracking-[0.15em]"
            style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
          >
            {result.name}
          </h2>
          <BigScoreCircle score={result.overallScore} label={result.overallLabel} />
          <p className="text-xs" style={{ color: "var(--ink-muted)" }}>
            총 획수: {result.totalStrokes}획
          </p>
        </div>
      </StaggerSection>

      {/* 2. 글자별 획수 */}
      <StaggerSection index={1}>
        <SectionHeader color="var(--seal)" title="글자별 획수 분석" />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(90px,1fr))] gap-3">
          {result.charBreakdowns.map((bd, i) => (
            <div
              key={i}
              className="rounded-xl p-4 text-center"
              style={{ background: "var(--bg-white)", border: "1px solid var(--border)" }}
            >
              <div
                className="text-[24px] font-black mb-2"
                style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
              >
                {bd.char}
              </div>
              <div className="text-[11px] leading-[1.6]" style={{ color: "var(--ink-muted)" }}>
                {bd.cho} + {bd.jung}{bd.jong ? ` + ${bd.jong}` : ""}
              </div>
              <div
                className="text-sm font-bold mt-1"
                style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
              >
                {bd.strokes}획
              </div>
            </div>
          ))}
        </div>
      </StaggerSection>

      {/* 3. 천격/인격/지격 */}
      <StaggerSection index={2}>
        <SectionHeader color="var(--saju)" title="삼격 오행 분석" subtitle="천격 (성) / 인격 (성+이름) / 지격 (이름)" />
        <div className="flex flex-col gap-3">
          {([
            { label: "천격", sub: "성씨의 기운", data: result.cheonGeok },
            { label: "인격", sub: "성격과 운명의 핵심", data: result.inGeok },
            { label: "지격", sub: "초년의 운세", data: result.jiGeok },
          ] as const).map(({ label, sub, data }, i) => (
            <div
              key={label}
              className="rounded-xl p-4"
              style={{
                background: "var(--bg-white)",
                border: "1px solid var(--border)",
                borderLeft: `3px solid ${OHANG_INFO[data.ohang].color}`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span
                    className="text-sm font-bold"
                    style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
                  >
                    {label}
                  </span>
                  <span className="text-xs ml-2" style={{ color: "var(--ink-light)" }}>
                    {sub}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold" style={{ color: "var(--ink-muted)" }}>
                    {data.strokes}획
                  </span>
                  <OhangBadge ohang={data.ohang} size="sm" />
                </div>
              </div>
              <p className="text-[13px] leading-[1.8]" style={{ color: "var(--ink-muted)" }}>
                {data.meaning}
              </p>
            </div>
          ))}
        </div>
      </StaggerSection>

      {/* 4. 이름이 나타내는 성격 */}
      <StaggerSection index={3}>
        <SectionHeader color="var(--mbti)" title="이름의 성격" />
        <div
          className="rounded-xl p-5"
          style={{ background: "var(--bg-white)", border: "1px solid var(--border)" }}
        >
          <p className="text-[14px] leading-[1.9]" style={{ color: "var(--ink-medium)" }}>
            {result.namePersonality}
          </p>
        </div>
      </StaggerSection>

      {/* 5. 이름이 가리키는 운명 */}
      <StaggerSection index={4}>
        <SectionHeader color="var(--astro)" title="이름의 운명" />
        <div
          className="rounded-xl p-5"
          style={{ background: "var(--bg-white)", border: "1px solid var(--border)" }}
        >
          <p className="text-[14px] leading-[1.9]" style={{ color: "var(--ink-medium)" }}>
            {result.nameDestiny}
          </p>
        </div>
      </StaggerSection>

      {/* 6. 사주 조화도 */}
      <StaggerSection index={5}>
        <SectionHeader color="var(--tarot)" title="사주와의 조화" />
        <div
          className="rounded-xl p-5"
          style={{ background: "var(--bg-white)", border: "1px solid var(--border)" }}
        >
          <p className="text-[14px] leading-[1.9]" style={{ color: "var(--ink-medium)" }}>
            {result.sajuAlignment}
          </p>
        </div>
      </StaggerSection>

      {/* 7. 종합 추천 */}
      <StaggerSection index={6}>
        <SectionHeader color="var(--face)" title="종합 평가" />
        <div
          className="rounded-xl p-5"
          style={{
            background: "var(--bg-white)",
            border: "1px solid var(--border)",
            borderLeft: "3px solid var(--seal)",
          }}
        >
          <p className="text-[14px] leading-[1.9] font-medium" style={{ color: "var(--ink-medium)" }}>
            {result.recommendation}
          </p>
        </div>
      </StaggerSection>

      {/* Reset */}
      <div className="flex flex-col gap-3 mt-4">
        <button
          onClick={onReset}
          className="w-full py-3 text-center text-[14px] font-bold rounded-lg transition-colors"
          style={{
            border: "2px solid var(--ink)",
            color: "var(--ink)",
            background: "transparent",
            fontFamily: "var(--font-display)",
          }}
        >
          다른 이름 분석하기
        </button>
        <Link
          href="/"
          className="w-full py-3 text-center text-[14px] rounded-lg"
          style={{ color: "var(--ink-muted)" }}
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
