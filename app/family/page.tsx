"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Seal from "@/components/ui/Seal";
import SectionHeader from "@/components/ui/SectionHeader";
import StaggerSection from "@/components/ui/StaggerSection";
import ScrollReveal from "@/components/ScrollReveal";
import { OHANG_INFO, type Ohang, OHANG_LIST } from "@/lib/saju";
import { analyzeFamilyRelationships, type FamilyMember, type FamilyAnalysis } from "@/lib/family-analysis";
import { useCountUp } from "@/hooks/useCountUp";

// ━━━ 역할 드롭다운 옵션 ━━━
const ROLE_OPTIONS = [
  "나", "아버지", "어머니", "형", "오빠", "누나", "언니",
  "동생", "배우자", "남편", "아내", "아들", "딸",
  "할아버지", "할머니", "첫째", "둘째", "셋째",
];

// ━━━ 스코어 원 ━━━
function ScoreCircle({ score, size = 48 }: { score: number; size?: number }) {
  const r = (size - 6) / 2;
  const c = Math.PI * 2 * r;
  const offset = c - (score / 100) * c;
  const color = score >= 75 ? "var(--saju)" : score >= 50 ? "var(--astro)" : "var(--seal)";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth="3" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="3"
        strokeDasharray={c} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transform: "rotate(-90deg)", transformOrigin: "center", transition: "stroke-dashoffset 1.2s ease" }}
      />
      <text x={size / 2} y={size / 2 + 1} textAnchor="middle" dominantBaseline="central"
        style={{ fontSize: size * 0.28, fontWeight: 800, fill: "var(--ink)", fontFamily: "var(--font-display)" }}>
        {score}
      </text>
    </svg>
  );
}

// ━━━ 오행 바 ━━━
function ElementBar({ element, count, total }: { element: Ohang; count: number; total: number }) {
  const pct = Math.round((count / total) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-bold w-8 text-center" style={{ color: OHANG_INFO[element].color }}>
        {element}
      </span>
      <div className="flex-1 h-[8px] rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.max(pct, 5)}%`,
            background: OHANG_INFO[element].color,
            transition: "width 1s ease",
          }}
        />
      </div>
      <span className="text-xs w-10 text-right" style={{ color: "var(--ink-muted)" }}>{pct}%</span>
    </div>
  );
}

// ━━━ 메인 페이지 ━━━
export default function FamilyPage() {
  const [members, setMembers] = useState<FamilyMember[]>([
    { role: "나", year: 2000, month: 1, day: 1 },
    { role: "어머니", year: 1970, month: 1, day: 1 },
  ]);
  const [result, setResult] = useState<FamilyAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  // localStorage에서 "나" 자동 로드
  useEffect(() => {
    try {
      const stored = localStorage.getItem("destino_birth");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.year && parsed.month && parsed.day) {
          setMembers(prev => prev.map(m =>
            m.role === "나" ? { ...m, year: parsed.year, month: parsed.month, day: parsed.day } : m
          ));
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const addMember = useCallback(() => {
    if (members.length >= 6) return;
    const usedRoles = new Set(members.map(m => m.role));
    const nextRole = ROLE_OPTIONS.find(r => !usedRoles.has(r)) || "동생";
    setMembers(prev => [...prev, { role: nextRole, year: 1990, month: 1, day: 1 }]);
  }, [members]);

  const removeMember = useCallback((index: number) => {
    if (members.length <= 2) return;
    setMembers(prev => prev.filter((_, i) => i !== index));
  }, [members.length]);

  const updateMember = useCallback((index: number, field: keyof FamilyMember, value: string | number) => {
    setMembers(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
  }, []);

  const handleAnalyze = useCallback(() => {
    setLoading(true);
    // Small delay for UX
    setTimeout(() => {
      const analysis = analyzeFamilyRelationships(members);
      setResult(analysis);
      setLoading(false);
    }, 800);
  }, [members]);

  return (
    <main className="min-h-screen flex flex-col items-center" style={{ background: "var(--bg-paper)" }}>
      <Nav />

      <div className="w-full max-w-[440px] px-5 pt-16 pb-24">
        {/* Header */}
        <div className="pt-6 pb-8 text-center">
          <Seal size="lg" char="家" className="mx-auto mb-4" />
          <h1
            className="text-[28px] font-black leading-[1.3] tracking-[-0.02em]"
            style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
          >
            가족 분석
          </h1>
          <p className="text-[14px] mt-2 leading-[1.8]" style={{ color: "var(--ink-muted)" }}>
            가족 구성원의 사주와 교차점을 비교하여
            <br />
            관계 역학을 분석합니다
          </p>
        </div>

        {!result ? (
          /* ━━━ 입력 폼 ━━━ */
          <div className="flex flex-col gap-4">
            {members.map((member, i) => (
              <div
                key={i}
                className="rounded-xl p-4"
                style={{ background: "var(--bg-white)", border: "1px solid var(--border)" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-sm font-bold"
                    style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
                  >
                    구성원 {i + 1}
                  </span>
                  {members.length > 2 && (
                    <button
                      onClick={() => removeMember(i)}
                      className="text-xs px-2 py-1 rounded"
                      style={{ color: "var(--ink-light)", background: "var(--bg-warm)" }}
                      aria-label={`구성원 ${i + 1} 삭제`}
                    >
                      삭제
                    </button>
                  )}
                </div>

                {/* Role */}
                <div className="mb-3">
                  <label className="text-xs font-medium mb-1 block" style={{ color: "var(--ink-muted)" }}>
                    관계
                  </label>
                  <select
                    value={member.role}
                    onChange={e => updateMember(i, "role", e.target.value)}
                    className="w-full h-10 px-3 rounded-lg text-sm font-medium"
                    style={{
                      background: "var(--bg-paper)",
                      border: "1px solid var(--border)",
                      color: "var(--ink)",
                      fontFamily: "var(--font-body)",
                    }}
                    aria-label="관계 선택"
                  >
                    {ROLE_OPTIONS.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                {/* Birth date */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs font-medium mb-1 block" style={{ color: "var(--ink-muted)" }}>년</label>
                    <input
                      type="number"
                      value={member.year}
                      onChange={e => updateMember(i, "year", parseInt(e.target.value) || 2000)}
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
                      value={member.month}
                      onChange={e => updateMember(i, "month", parseInt(e.target.value) || 1)}
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
                      value={member.day}
                      onChange={e => updateMember(i, "day", parseInt(e.target.value) || 1)}
                      min={1} max={31}
                      className="w-full h-10 px-3 rounded-lg text-sm text-center"
                      style={{ background: "var(--bg-paper)", border: "1px solid var(--border)", color: "var(--ink)" }}
                      aria-label="출생일"
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Add button */}
            {members.length < 6 && (
              <button
                onClick={addMember}
                className="w-full py-3 rounded-lg text-sm font-bold transition-colors"
                style={{
                  border: "2px dashed var(--border-strong)",
                  color: "var(--ink-muted)",
                  background: "transparent",
                }}
              >
                + 가족 구성원 추가 (최대 6명)
              </button>
            )}

            {/* Analyze button */}
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full py-3.5 text-center text-[15px] font-bold tracking-wide rounded-lg transition-all hover:opacity-90 active:opacity-80 mt-2"
              style={{
                background: "var(--seal)",
                color: "#fff",
                fontFamily: "var(--font-display)",
                boxShadow: "0 4px 16px var(--shadow-btn)",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "분석 중..." : "가족 분석하기"}
            </button>
          </div>
        ) : (
          /* ━━━ 결과 ━━━ */
          <FamilyResult result={result} onReset={() => setResult(null)} />
        )}
      </div>
    </main>
  );
}

// ━━━ 결과 컴포넌트 ━━━
function FamilyResult({ result, onReset }: { result: FamilyAnalysis; onReset: () => void }) {
  return (
    <div className="flex flex-col gap-6">

      {/* 1. 구성원 카드 */}
      <StaggerSection index={0}>
        <SectionHeader color="var(--seal)" title="가족 구성원" subtitle="각 구성원의 아키타입" />
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {result.members.map((m, i) => (
            <div
              key={i}
              className="shrink-0 w-[140px] rounded-xl p-4 flex flex-col items-center text-center gap-2"
              style={{ background: "var(--bg-white)", border: "1px solid var(--border)" }}
            >
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: "var(--bg-warm)", color: "var(--ink-medium)" }}
              >
                {m.role}
              </span>
              <span
                className="text-[13px] font-black leading-tight"
                style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
              >
                {m.archetype}
              </span>
              <div className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: OHANG_INFO[m.element as Ohang]?.color || "var(--ink-muted)" }}
                />
                <span className="text-[11px]" style={{ color: "var(--ink-muted)" }}>
                  {m.element} | {m.zodiac}
                </span>
              </div>
            </div>
          ))}
        </div>
      </StaggerSection>

      {/* 2. 관계 그리드 */}
      <StaggerSection index={1}>
        <SectionHeader color="var(--astro)" title="관계 분석" subtitle="구성원 간 궁합 점수" />
        <div className="flex flex-col gap-3">
          {result.relationships.map((rel, i) => (
            <div
              key={i}
              className="rounded-xl p-4"
              style={{ background: "var(--bg-white)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>
                    {rel.pair[0]}
                  </span>
                  <span className="text-xs" style={{ color: "var(--ink-faint)" }}>&harr;</span>
                  <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>
                    {rel.pair[1]}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: rel.relation === "상생" ? "#2D5A2715" :
                        rel.relation === "상극" ? "#C53D4315" :
                          rel.relation === "비화" ? "#1E3A5F15" : "#8B691415",
                      color: rel.relation === "상생" ? "var(--saju)" :
                        rel.relation === "상극" ? "var(--seal)" :
                          rel.relation === "비화" ? "var(--astro)" : "var(--face)",
                    }}
                  >
                    {rel.relation}
                  </span>
                  <ScoreCircle score={rel.score} size={40} />
                </div>
              </div>
              <p className="text-[13px] leading-[1.8]" style={{ color: "var(--ink-muted)" }}>
                {rel.description}
              </p>
            </div>
          ))}
        </div>
      </StaggerSection>

      {/* 3. 가족 역학 */}
      <StaggerSection index={2}>
        <SectionHeader color="var(--saju)" title="가족 역학" subtitle={`지배 오행: ${result.familyElement}`} />
        <div
          className="rounded-xl p-5"
          style={{ background: "var(--bg-white)", border: "1px solid var(--border)" }}
        >
          <p className="text-[14px] leading-[1.9]" style={{ color: "var(--ink-medium)" }}>
            {result.familyDynamic}
          </p>
        </div>
      </StaggerSection>

      {/* 4. 오행 분포 */}
      <StaggerSection index={3}>
        <SectionHeader color="var(--face)" title="가족 오행 분포" />
        <div
          className="rounded-xl p-5"
          style={{ background: "var(--bg-white)", border: "1px solid var(--border)" }}
        >
          <div className="flex flex-col gap-3">
            {(() => {
              const counts: Record<string, number> = {};
              result.members.forEach(m => {
                counts[m.element] = (counts[m.element] || 0) + 1;
              });
              const total = result.members.length;
              return OHANG_LIST.map(el => (
                <ElementBar key={el} element={el} count={counts[el] || 0} total={total} />
              ));
            })()}
          </div>
        </div>
      </StaggerSection>

      {/* 5. 조언 */}
      <StaggerSection index={4}>
        <SectionHeader color="var(--tarot)" title="가족 관계 조언" />
        <div className="flex flex-col gap-3">
          {result.advice.map((tip, i) => (
            <div
              key={i}
              className="rounded-lg px-5 py-4"
              style={{
                background: "var(--bg-white)",
                borderLeft: "3px solid var(--tarot)",
              }}
            >
              <p className="text-[13px] leading-[1.8]" style={{ color: "var(--ink-medium)" }}>
                {tip}
              </p>
            </div>
          ))}
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
          다시 분석하기
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
