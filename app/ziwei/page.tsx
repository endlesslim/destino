"use client";

// app/ziwei/page.tsx
// 자미두수 — 명궁·오행국·14주성 명반 분석

import { useState, useEffect } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Divider from "@/components/ui/Divider";
import ScrollReveal from "@/components/ScrollReveal";
import Seal from "@/components/ui/Seal";
import Footer from "@/components/Footer";
import { analyzeZiwei, PALACES, type ZiweiResult } from "@/lib/ziwei";

export default function ZiweiPage() {
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthHour, setBirthHour] = useState("");
  const [result, setResult] = useState<ZiweiResult | null>(null);
  const [hasSaved, setHasSaved] = useState(false);

  // 저장된 프로필 자동 로드
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
        setResult(analyzeZiwei(year, month, day));
      } catch {
        // 무시
      }
    }
  }, []);

  function handleSubmit() {
    const y = parseInt(birthYear);
    const m = parseInt(birthMonth);
    const d = parseInt(birthDay);
    const h = birthHour === "" ? undefined : parseInt(birthHour);
    const maxYear = new Date().getFullYear();
    if (!y || !m || !d || y < 1924 || y > maxYear || m < 1 || m > 12 || d < 1 || d > 31) return;
    if (h !== undefined && (h < 0 || h > 23)) return;
    localStorage.setItem("destino_daily_birth", JSON.stringify({ year: y, month: m, day: d }));
    setHasSaved(true);
    setResult(analyzeZiwei(y, m, d, h));
  }

  function handleReset() {
    setResult(null);
    setHasSaved(false);
  }

  const inputStyle = {
    background: "var(--bg-white)",
    border: "1px solid var(--border)",
    color: "var(--ink)",
    fontFamily: "var(--font-body)",
  };

  return (
    <main className="min-h-screen flex flex-col items-center px-6 pb-12" style={{ background: "var(--bg-paper)" }}>
      <Nav />
      <div className="w-full max-w-[440px] flex flex-col gap-8 pt-16">
        {hasSaved && result && (
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
          <section className="flex flex-col gap-6 animate-fade-up">
            <div className="flex flex-col items-center gap-4 text-center">
              <Seal size="lg" char="紫" className="animate-seal-pop" />
              <h1
                className="text-[28px] font-black leading-[1.3] tracking-[-0.01em]"
                style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
              >
                자미두수 명반
              </h1>
              <p className="text-[15px] leading-[1.8]" style={{ color: "var(--ink-muted)" }}>
                송대부터 이어진 동양 점성술.
                <br />
                명궁에 배치된 별들이 당신의 지도를 그립니다
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-[11px] tracking-[0.1em] uppercase font-medium" style={{ color: "var(--ink-light)" }}>
                생년월일 (양력)
              </p>
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="number" placeholder="1990" value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  className="rounded-md px-3 py-3 text-[15px] text-center outline-none"
                  style={inputStyle} min={1924} max={new Date().getFullYear()}
                />
                <input
                  type="number" placeholder="1" value={birthMonth}
                  onChange={(e) => setBirthMonth(e.target.value)}
                  className="rounded-md px-3 py-3 text-[15px] text-center outline-none"
                  style={inputStyle} min={1} max={12}
                />
                <input
                  type="number" placeholder="28" value={birthDay}
                  onChange={(e) => setBirthDay(e.target.value)}
                  className="rounded-md px-3 py-3 text-[15px] text-center outline-none"
                  style={inputStyle} min={1} max={31}
                />
              </div>
              <p className="text-[11px] tracking-[0.1em] uppercase font-medium mt-2" style={{ color: "var(--ink-light)" }}>
                태어난 시간 (선택 — 명궁 정확도가 크게 올라갑니다)
              </p>
              <input
                type="number" placeholder="예: 14 (24시간제)" value={birthHour}
                onChange={(e) => setBirthHour(e.target.value)}
                className="rounded-md px-3 py-3 text-[15px] text-center outline-none"
                style={inputStyle} min={0} max={23}
              />
              <button
                onClick={handleSubmit}
                className="w-full py-4 text-[15px] font-bold rounded-lg border-none cursor-pointer btn-stamp mt-2"
                style={{ background: "var(--seal)", color: "#fff", fontFamily: "var(--font-display)" }}
              >
                명반 펼치기
              </button>
            </div>
          </section>
        ) : (
          <div className="flex flex-col gap-8">
            {/* 명궁 요약 */}
            <ScrollReveal>
              <div
                className="rounded-[14px] p-6 relative overflow-hidden animate-stamp-in"
                style={{ background: "var(--seal-bg)", border: "2px solid var(--seal)" }}
              >
                <div className="text-[11px] font-semibold tracking-widest mb-2" style={{ color: "var(--ink-light)" }}>
                  命宮 명궁 — {result.palaceBranch}궁 · {result.bureau}
                  {result.hourAssumed ? " · 자시 가정" : ""}
                </div>
                <h2
                  className="text-[32px] font-black leading-snug"
                  style={{ fontFamily: "var(--font-display)", color: "var(--seal-dark)" }}
                >
                  {result.mainStars.map((s) => s.name).join(" · ")}
                </h2>
                {result.isEmpty && (
                  <p className="text-[11px] mt-1" style={{ color: "var(--ink-light)" }}>
                    명궁이 공궁이라 마주 보는 천이궁의 별을 빌려 해석합니다 (차성안궁)
                  </p>
                )}
                <p className="text-[15px] leading-[1.9] mt-3" style={{ color: "var(--ink-medium)" }}>
                  {result.summary}
                </p>
              </div>
            </ScrollReveal>

            {/* 주성 상세 */}
            {result.mainStars.map((star, i) => (
              <ScrollReveal key={star.name} delay={100 + i * 80}>
                <div
                  className="rounded-[14px] p-6"
                  style={{ background: "var(--bg-white)", border: "1.5px solid var(--border)", borderLeft: "3px solid var(--saju)" }}
                >
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-[22px] font-black" style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}>
                      {star.hanja} {star.name}
                    </span>
                    <span className="text-[12px]" style={{ color: "var(--saju)" }}>{star.modernType}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 my-3">
                    {star.keywords.map((k) => (
                      <span
                        key={k}
                        className="text-[12px] font-medium px-3 py-1 rounded-full"
                        style={{ background: "var(--bg-paper)", color: "var(--ink-muted)", border: "1px solid var(--border)" }}
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                  <p className="text-[15px] leading-[1.9] mb-4" style={{ color: "var(--ink-medium)" }}>
                    {star.personality}
                  </p>
                  <div className="text-[13px] leading-[1.8] mb-2" style={{ color: "var(--ink-muted)" }}>
                    <span className="font-bold" style={{ color: "var(--ink-medium)" }}>어울리는 길 — </span>
                    {star.career.join(", ")}
                  </div>
                  <div className="text-[13px] leading-[1.8] mb-2" style={{ color: "var(--ink-muted)" }}>
                    <span className="font-bold" style={{ color: "var(--ink-medium)" }}>사랑의 방식 — </span>
                    {star.love}
                  </div>
                  <div className="text-[13px] leading-[1.8]" style={{ color: "var(--ink-light)" }}>
                    <span className="font-bold">그림자 — </span>
                    {star.shadow}
                  </div>
                </div>
              </ScrollReveal>
            ))}

            {/* 12궁 명반 */}
            <ScrollReveal delay={300}>
              <div>
                <p className="text-[11px] tracking-[0.1em] uppercase font-medium mb-1" style={{ color: "var(--saju)" }}>
                  命盤 — 12궁 명반
                </p>
                <p className="text-[12px] mb-3" style={{ color: "var(--ink-faint)" }}>
                  신궁(身宮)은 {result.bodyPalaceBranch}궁 · 각 궁의 의미는 카드를 참고하세요
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {result.palaces.map((p) => {
                    const meta = PALACES.find((x) => x.name === p.name);
                    const isMyeong = p.name === "명궁";
                    return (
                      <div
                        key={p.name}
                        className="rounded-lg p-2.5 text-center"
                        style={{
                          background: isMyeong ? "var(--seal-bg)" : "var(--bg-white)",
                          border: isMyeong ? "1.5px solid var(--seal)" : "1px solid var(--border)",
                        }}
                      >
                        <div className="text-[11px] font-bold" style={{ color: isMyeong ? "var(--seal)" : "var(--ink-medium)" }}>
                          {p.name} <span style={{ color: "var(--ink-faint)" }}>{p.branch}</span>
                        </div>
                        <div className="text-[11px] mt-1 leading-snug" style={{ color: "var(--ink-muted)", fontFamily: "var(--font-display)" }}>
                          {p.stars.length ? p.stars.join("·") : "공궁"}
                        </div>
                        {meta && (
                          <div className="text-[9px] mt-1" style={{ color: "var(--ink-faint)" }}>
                            {meta.meaning}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </ScrollReveal>

            {/* 교차 분석 CTA */}
            <ScrollReveal delay={400}>
              <Link
                href="/analyze"
                className="block w-full py-3.5 text-center text-[15px] font-bold tracking-wide rounded-lg no-underline btn-stamp"
                style={{ background: "var(--seal)", color: "#fff", fontFamily: "var(--font-display)", boxShadow: "0 4px 16px var(--shadow-btn)" }}
              >
                6개 문명 교차 분석도 해보기
              </Link>
            </ScrollReveal>
          </div>
        )}

        <Footer />
      </div>
    </main>
  );
}
