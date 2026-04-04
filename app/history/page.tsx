"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Seal from "@/components/ui/Seal";
import { getHistory, clearHistory, type SavedAnalysis } from "@/lib/history";
import Footer from "@/components/Footer";

export default function HistoryPage() {
  const [history, setHistory] = useState<SavedAnalysis[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setHistory(getHistory());
    setLoaded(true);
  }, []);

  const handleClear = () => {
    if (window.confirm("모든 분석 기록을 삭제하시겠습니까?")) {
      clearHistory();
      setHistory([]);
    }
  };

  return (
    <main
      className="min-h-screen"
      style={{ background: "var(--bg-paper)" }}
    >
      <Nav />

      <div className="mx-auto max-w-[440px] px-5 pt-16 pb-10">
        {/* Header */}
        <div className="flex items-center gap-3 mt-4 mb-6">
          <Seal size="sm" char="記" />
          <div>
            <h1
              className="text-lg font-black tracking-tight"
              style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
            >
              분석 기록
            </h1>
            <p className="text-xs mt-0.5" style={{ color: "var(--ink-light)" }}>
              지난 분석 결과를 확인합니다
            </p>
          </div>
        </div>

        {/* Content */}
        {!loaded ? (
          <div className="text-center py-16">
            <div
              className="text-sm"
              style={{ color: "var(--ink-light)" }}
            >
              불러오는 중...
            </div>
          </div>
        ) : history.length === 0 ? (
          /* Empty state */
          <div
            className="text-center py-16 rounded-xl"
            style={{ background: "var(--bg-white)", border: "1.5px solid var(--border)" }}
          >
            <div
              className="text-3xl mb-3"
              style={{ color: "var(--ink-ghost)" }}
            >
              命
            </div>
            <div
              className="text-sm font-medium mb-1"
              style={{ color: "var(--ink-muted)" }}
            >
              아직 분석 기록이 없습니다
            </div>
            <div
              className="text-xs mb-5"
              style={{ color: "var(--ink-light)" }}
            >
              첫 분석을 시작해보세요
            </div>
            <Link
              href="/analyze"
              className="inline-block px-6 py-2.5 text-sm font-bold rounded-lg no-underline transition-opacity hover:opacity-85"
              style={{ background: "var(--ink)", color: "var(--bg-paper)" }}
            >
              교차 분석 시작
            </Link>
          </div>
        ) : (
          <>
            {/* History list */}
            <div className="flex flex-col gap-3 mb-6">
              {history.map((item) => (
                <Link
                  key={item.id}
                  href={`/analyze?y=${item.year}&m=${item.month}&d=${item.day}${item.name ? `&n=${encodeURIComponent(item.name)}` : ""}`}
                  className="block rounded-xl p-4 no-underline transition-opacity hover:opacity-90"
                  style={{ background: "var(--bg-white)", border: "1.5px solid var(--border)" }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div
                        className="text-sm font-bold"
                        style={{ color: "var(--ink)" }}
                      >
                        {item.name || `${item.year}년 ${item.month}월 ${item.day}일생`}
                      </div>
                      <div
                        className="text-xs mt-0.5"
                        style={{ color: "var(--ink-light)" }}
                      >
                        {item.year}년 {item.month}월 {item.day}일
                      </div>
                    </div>
                    <div
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ background: "var(--seal-bg)", color: "var(--seal)" }}
                    >
                      {item.convergenceRate}%
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded"
                      style={{ background: "var(--bg-paper)", color: "var(--ink-medium)" }}
                    >
                      {item.archetype}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: "var(--ink-light)" }}
                    >
                      {item.elementHarmony}
                    </span>
                  </div>
                  <div
                    className="text-[10px] mt-2"
                    style={{ color: "var(--ink-faint)" }}
                  >
                    {new Date(item.date).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </Link>
              ))}
            </div>

            {/* Clear button */}
            <button
              onClick={handleClear}
              className="w-full py-3 text-sm font-medium rounded-lg cursor-pointer transition-opacity hover:opacity-80"
              style={{
                background: "transparent",
                color: "var(--ink-light)",
                border: "1.5px solid var(--border)",
                fontFamily: "inherit",
              }}
            >
              기록 전체 삭제
            </button>
          </>
        )}

        <Footer />
      </div>
    </main>
  );
}
