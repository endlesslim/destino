"use client";

import { useState } from "react";
import Seal from "@/components/ui/Seal";
import Divider from "@/components/ui/Divider";
import { analyzeCrosspoint, type CrosspointResult } from "@/lib/cross-engine";
import { OHANG_INFO } from "@/lib/saju";

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

type TabKey = "saju" | "star" | "num" | "person";

export default function AnalyzePage() {
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [result, setResult] = useState<CrosspointResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<TabKey>("saju");

  const valid = year.length === 4 && month !== "" && day !== "";

  const analyze = () => {
    const y = parseInt(year);
    const m = parseInt(month);
    const d = parseInt(day);
    if (!y || !m || !d || y < 1924 || y > 2025 || m < 1 || m > 12 || d < 1 || d > 31) return;
    setLoading(true);
    setTimeout(() => {
      setResult(analyzeCrosspoint(y, m, d));
      setLoading(false);
    }, 500);
  };

  const reset = () => {
    setResult(null);
    setYear("");
    setMonth("");
    setDay("");
    setTab("saju");
  };

  const inputClass =
    "w-full px-4 py-3.5 text-lg font-bold rounded-[10px] outline-none transition-colors";

  return (
    <main className="min-h-screen flex flex-col items-center px-5 py-10" style={{ background: "var(--bg-paper)" }}>
      <div className="w-full max-w-[420px] flex flex-col">

        {/* ━━━ INPUT ━━━ */}
        {!result && !loading && (
          <>
            <div className="text-center mb-7">
              <Seal size="lg" char="命" className="mx-auto animate-seal-pop" />
              <h1
                className="text-2xl font-black mt-3 tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                운명의 교차점
              </h1>
              <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--ink-muted)" }}>
                생년월일을 입력하면<br />4개 문명이 동시에 분석합니다
              </p>
            </div>

            <div
              className="rounded-[14px] p-5 mb-3.5"
              style={{ background: "var(--bg-white)", border: "1.5px solid var(--border)" }}
            >
              <div className="mb-3.5">
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--ink-medium)" }}>
                  태어난 해
                </label>
                <input
                  className={inputClass}
                  style={{ background: "var(--bg-paper)", border: "2px solid var(--border)", color: "var(--ink)" }}
                  placeholder="예: 1990"
                  value={year}
                  onChange={(e) => setYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  onFocus={(e) => (e.target.style.borderColor = "var(--seal)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>
              <div className="flex gap-2.5">
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--ink-medium)" }}>
                    월
                  </label>
                  <input
                    className={inputClass}
                    style={{ background: "var(--bg-paper)", border: "2px solid var(--border)", color: "var(--ink)" }}
                    placeholder="3"
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
                    value={day}
                    onChange={(e) => setDay(e.target.value.replace(/\D/g, "").slice(0, 2))}
                    onFocus={(e) => (e.target.style.borderColor = "var(--seal)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={analyze}
              disabled={!valid}
              className="w-full py-4.5 text-base font-extrabold rounded-xl border-none cursor-pointer transition-all"
              style={{
                background: valid ? "var(--seal)" : "var(--ink-ghost)",
                color: valid ? "#fff" : "var(--ink-faint)",
                boxShadow: valid ? "0 4px 16px rgba(197,61,67,0.25)" : "none",
              }}
            >
              {valid ? "교차점 발견하기" : "생년월일을 입력해주세요"}
            </button>

            <div className="flex justify-center gap-3 mt-4">
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
            <div
              className="text-3xl animate-pulse"
              style={{ color: "var(--seal)", fontFamily: "var(--font-display)", fontWeight: 900 }}
            >
              命
            </div>
            <p className="text-sm mt-3" style={{ color: "var(--ink-muted)" }}>
              4개 문명이 분석 중...
            </p>
          </div>
        )}

        {/* ━━━ RESULT ━━━ */}
        {result && (
          <>
            {/* Header */}
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-2">
                <Seal size="sm" char="命" />
                <span className="text-xs tracking-widest" style={{ color: "var(--ink-light)" }}>DESTINO</span>
              </div>
              <span className="text-sm font-semibold" style={{ color: "var(--ink-muted)" }}>
                {year}.{month}.{day}
              </span>
            </div>

            {/* ━━━ CROSSPOINT HERO ━━━ */}
            <div
              className="rounded-[14px] p-5 mb-3.5"
              style={{ background: "var(--bg-white)", border: "1.5px solid var(--border)" }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Dot color="#C53D43" size={10} />
                <span className="text-sm font-bold tracking-wider" style={{ color: "var(--seal)" }}>교차점</span>
              </div>

              {/* Convergence Rate */}
              <div className="text-center mb-4">
                <span
                  className="text-[52px] font-black leading-none"
                  style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
                >
                  {result.convergence_rate}
                </span>
                <span
                  className="text-xl font-bold"
                  style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
                >
                  %
                </span>
                <div
                  className="text-base font-bold mt-1"
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

              {/* Bar */}
              <div className="h-1.5 rounded-full overflow-hidden mb-4" style={{ background: "var(--border)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${result.convergence_rate}%`, background: "var(--seal)" }}
                />
              </div>

              {/* East vs West */}
              <div className="flex gap-2">
                <div className="flex-1 p-3.5 rounded-[10px] text-center" style={{ background: "var(--bg-paper)" }}>
                  <div className="flex items-center justify-center gap-1.5 mb-1.5">
                    <Dot color={OHANG_INFO[result.saju.day.ohang].color} />
                    <span className="text-[11px] font-semibold" style={{ color: "var(--ink-light)" }}>동양</span>
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
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10h12M12 6l4 4-4 4M8 6L4 10l4 4" stroke="var(--seal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                <div className="flex-1 p-3.5 rounded-[10px] text-center" style={{ background: "var(--bg-paper)" }}>
                  <div className="flex items-center justify-center gap-1.5 mb-1.5">
                    <Dot color={result.western.sunSign.color} />
                    <span className="text-[11px] font-semibold" style={{ color: "var(--ink-light)" }}>서양</span>
                  </div>
                  <div
                    className="text-xl font-black"
                    style={{ fontFamily: "var(--font-display)", color: result.western.sunSign.color }}
                  >
                    {result.western.sunSign.name}
                  </div>
                  <div className="text-sm font-semibold mt-0.5" style={{ color: "var(--ink-medium)" }}>
                    {result.western.element} · {result.western.sunSign.element_kr}
                  </div>
                </div>
              </div>
            </div>

            {/* ━━━ TABS ━━━ */}
            <div className="grid grid-cols-4 gap-1.5 mb-3.5">
              {([
                ["saju", "사주"],
                ["star", "별자리"],
                ["num", "수비학"],
                ["person", "성격"],
              ] as [TabKey, string][]).map(([k, v]) => {
                const active = tab === k;
                return (
                  <button
                    key={k}
                    onClick={() => setTab(k)}
                    className="flex flex-col items-center gap-1 py-2.5 rounded-[10px] cursor-pointer"
                    style={{
                      border: active ? "2px solid var(--seal)" : "2px solid transparent",
                      background: active ? "var(--seal-bg)" : "var(--bg-white)",
                      fontFamily: "inherit",
                    }}
                  >
                    <TabIcon type={k} active={active} />
                    <span
                      className="text-xs"
                      style={{
                        fontWeight: active ? 700 : 500,
                        color: active ? "var(--seal)" : "var(--ink-muted)",
                      }}
                    >
                      {v}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* ━━━ TAB CONTENT ━━━ */}
            <div
              className="rounded-[14px] p-5 mb-3.5"
              style={{ background: "var(--bg-white)", border: "1.5px solid var(--border)" }}
            >
              {tab === "saju" && (
                <div>
                  <div className="flex gap-2.5 mb-3.5">
                    <div className="flex-1 text-center p-3.5 rounded-[10px]" style={{ background: "var(--bg-paper)" }}>
                      <div className="text-[11px] font-semibold mb-1.5" style={{ color: "var(--ink-light)" }}>연주</div>
                      <div className="text-[28px] font-black" style={{ fontFamily: "var(--font-display)" }}>
                        {result.saju.year.cheongan}{result.saju.year.jiji}
                      </div>
                      <div className="flex items-center justify-center gap-1 mt-1.5">
                        <Dot color={OHANG_INFO[result.saju.year.ohang].color} />
                        <span className="text-sm" style={{ color: "var(--ink-medium)" }}>
                          {result.saju.year.ohang} · {OHANG_INFO[result.saju.year.ohang].kr}
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
                  <div className="text-center p-3 rounded-lg" style={{ background: "var(--bg-paper)" }}>
                    <span className="text-[15px] font-bold">{result.saju.animal.animal_kr}띠</span>
                    <span className="text-sm ml-2" style={{ color: "var(--ink-light)" }}>
                      {result.saju.year.jiji}
                    </span>
                  </div>
                </div>
              )}

              {tab === "star" && (
                <div className="text-center py-2">
                  <div
                    className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-3"
                    style={{ background: result.western.sunSign.color + "15" }}
                  >
                    <Dot color={result.western.sunSign.color} size={20} />
                  </div>
                  <div className="text-[22px] font-black mb-1" style={{ fontFamily: "var(--font-display)" }}>
                    {result.western.sunSign.name}
                  </div>
                  <div className="text-sm mb-3 leading-relaxed" style={{ color: "var(--ink-muted)" }}>
                    {result.western.sunSign.personality}
                  </div>
                  <span
                    className="inline-block px-4 py-1.5 rounded-full text-sm font-bold"
                    style={{ background: result.western.sunSign.color + "12", color: result.western.sunSign.color }}
                  >
                    {result.western.element} · {result.western.sunSign.element_kr}
                  </span>
                </div>
              )}

              {tab === "num" && (
                <div className="text-center py-2">
                  <div
                    className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-3"
                    style={{ background: "#5B3E8A15" }}
                  >
                    <span className="text-2xl font-black" style={{ fontFamily: "var(--font-display)", color: "#5B3E8A" }}>
                      {result.numerology.lifePath}
                    </span>
                  </div>
                  <div className="text-[11px] mb-1" style={{ color: "var(--ink-light)" }}>생명경로수</div>
                  <div className="text-xl font-black mb-2" style={{ fontFamily: "var(--font-display)" }}>
                    {result.numerology.lifePathInfo.name}
                  </div>
                  <div className="text-sm" style={{ color: "var(--ink-muted)" }}>
                    {result.numerology.lifePathInfo.personality}
                  </div>
                </div>
              )}

              {tab === "person" && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="flex items-center justify-center w-9 h-9 rounded-full"
                      style={{ background: OHANG_INFO[result.saju.day.ohang].color + "15" }}
                    >
                      <span
                        className="text-base font-black"
                        style={{ fontFamily: "var(--font-display)", color: OHANG_INFO[result.saju.day.ohang].color }}
                      >
                        {result.saju.day.cheongan}
                      </span>
                    </div>
                    <div>
                      <div className="text-base font-bold" style={{ fontFamily: "var(--font-display)" }}>
                        {result.saju.personality.nature}
                      </div>
                      <div className="text-xs" style={{ color: "var(--ink-light)" }}>
                        {result.saju.day.ohang} · {OHANG_INFO[result.saju.day.ohang].kr}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm leading-[1.9] mb-3.5" style={{ color: "var(--ink-medium)" }}>
                    {result.saju.personality.personality}
                  </p>

                  {/* Archetype */}
                  <div className="p-3.5 rounded-lg mb-3" style={{ background: "var(--seal-bg)" }}>
                    <div className="text-[11px] mb-1" style={{ color: "var(--ink-light)" }}>아키타입</div>
                    <div className="text-[15px] font-bold" style={{ color: "var(--seal)" }}>
                      {result.archetype}
                    </div>
                    <div className="text-sm mt-1 leading-relaxed" style={{ color: "var(--ink-muted)" }}>
                      {result.archetype_desc}
                    </div>
                  </div>

                  {/* MBTI similar */}
                  <div className="p-3 rounded-lg flex items-center gap-2.5" style={{ background: "var(--bg-paper)" }}>
                    <Dot color="#5B3E8A" />
                    <div>
                      <div className="text-[11px]" style={{ color: "var(--ink-light)" }}>MBTI 유사형</div>
                      <div className="text-[15px] font-bold">
                        {result.saju.personality.mbti_similar.join(" · ")}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ━━━ CROSSPOINT MATCHES ━━━ */}
            {result.matches.length > 0 && (
              <div
                className="rounded-[14px] p-5 mb-3.5"
                style={{ background: "var(--bg-white)", border: "1.5px solid var(--border)" }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Dot color="#C53D43" size={8} />
                  <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>일치하는 특성</span>
                </div>
                <div className="flex flex-col gap-2">
                  {result.matches.slice(0, 5).map((m) => (
                    <div
                      key={m.trait}
                      className="flex items-center justify-between p-3 rounded-lg"
                      style={{ background: "var(--bg-paper)" }}
                    >
                      <div>
                        <span className="text-sm font-bold">{m.trait}</span>
                        <span
                          className="text-xs ml-2"
                          style={{ color: m.strength === "강" ? "var(--seal)" : "var(--ink-light)" }}
                        >
                          {m.strength}
                        </span>
                      </div>
                      <div className="text-xs" style={{ color: "var(--ink-muted)" }}>
                        {m.sources.join(" · ")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ━━━ COMING SOON ━━━ */}
            <div
              className="flex items-center gap-3 p-4 rounded-xl mb-4"
              style={{ background: "var(--seal-bg)", border: "1.5px solid #E8C5C7" }}
            >
              <div
                className="flex items-center justify-center w-9 h-9 rounded-full shrink-0"
                style={{ background: "rgba(197,61,67,0.08)" }}
              >
                <Dot color="#C53D43" size={10} />
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: "var(--seal)" }}>
                  관상 · 타로 · 점성술 심화
                </div>
                <div className="text-xs mt-0.5" style={{ color: "var(--ink-light)" }}>
                  6개 문명 전체 분석 곧 공개
                </div>
              </div>
            </div>

            {/* ━━━ RETRY ━━━ */}
            <button
              onClick={reset}
              className="w-full py-4 text-[15px] font-bold rounded-xl border-none cursor-pointer transition-opacity hover:opacity-85"
              style={{ background: "var(--ink)", color: "var(--bg-paper)", fontFamily: "inherit" }}
            >
              다른 생년월일로 분석하기
            </button>
          </>
        )}
      </div>
    </main>
  );
}
