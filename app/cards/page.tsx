import Link from "next/link";
import { Metadata } from "next";
import Seal from "@/components/ui/Seal";
import Divider from "@/components/ui/Divider";
import { CARDS } from "@/lib/cards-data";

export const metadata: Metadata = {
  title: "문명 크로스체크 카드 — DESTINO",
  description: "총 20편 — 동서양 교차 분석 Threads 카드 시리즈",
};

export default function CardsGalleryPage() {
  return (
    <main
      className="min-h-screen"
      style={{ background: "var(--bg-paper)", color: "var(--ink)" }}
    >
      <div className="mx-auto max-w-[440px] px-6 py-10">
        {/* Header */}
        <div className="mb-2">
          <span
            className="tracking-[0.1em] uppercase"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 10,
              color: "var(--ink-faint)",
            }}
          >
            THREADS CARD SERIES
          </span>
        </div>

        <div className="flex items-center gap-3 mb-1">
          <Seal size="sm" char="命" />
          <h1
            className="font-black"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 24,
              letterSpacing: "-0.01em",
            }}
          >
            문명 크로스체크 카드
          </h1>
        </div>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 14,
            color: "var(--ink-light)",
            lineHeight: 1.7,
          }}
        >
          총 20편 — 동서양 문명이 내린 같은 답을 교차 분석합니다
        </p>

        <Divider />

        {/* Card grid */}
        <div className="grid grid-cols-2 gap-3">
          {CARDS.map((card) => (
            <CardThumbnail key={card.id} card={card} />
          ))}
        </div>
      </div>
    </main>
  );
}

function CardThumbnail({
  card,
}: {
  card: (typeof CARDS)[number];
}) {
  const titleOneLine = card.title.replace("\n", " ");
  const num = String(card.id).padStart(2, "0");

  return (
    <Link
      href={`/cards/${card.id}`}
      className="group block rounded-lg transition-colors"
      style={{
        background: "var(--bg-white)",
        border: "1px solid var(--border)",
        padding: 14,
      }}
    >
      {/* Number + category */}
      <div
        className="flex items-center justify-between mb-2"
        style={{ fontFamily: "var(--font-body)" }}
      >
        <span
          style={{
            fontSize: 10,
            color: "var(--ink-ghost)",
          }}
        >
          #{num}
        </span>
        <span
          className="rounded"
          style={{
            fontSize: 9,
            padding: "2px 6px",
            background: "var(--bg-paper)",
            color: "var(--ink-faint)",
          }}
        >
          {card.cat}
        </span>
      </div>

      {/* Title */}
      <h2
        className="font-black mb-2 group-hover:text-[var(--seal)] transition-colors"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 15,
          lineHeight: 1.35,
          letterSpacing: "-0.01em",
          minHeight: 40,
        }}
      >
        {titleOneLine}
      </h2>

      {/* East vs West mini */}
      <div
        className="flex items-center gap-1 mb-2"
        style={{ fontFamily: "var(--font-body)", fontSize: 11 }}
      >
        <span
          className="rounded px-1.5 py-0.5"
          style={{
            background: "var(--bg-paper)",
            color: "var(--ink-muted)",
            fontSize: 11,
          }}
        >
          {card.east}
        </span>
        <span style={{ color: "var(--seal)", fontSize: 10, fontWeight: 900 }}>
          ↔
        </span>
        <span
          className="rounded px-1.5 py-0.5"
          style={{
            background: "var(--bg-paper)",
            color: "var(--ink-muted)",
            fontSize: 11,
          }}
        >
          {card.west}
        </span>
      </div>

      {/* Match badge */}
      <div
        className="inline-block font-black"
        style={{
          fontSize: 11,
          color: "var(--seal)",
          border: "1.5px solid var(--seal)",
          borderRadius: 3,
          padding: "2px 8px",
          transform: "rotate(-2deg)",
          fontFamily: "var(--font-display)",
        }}
      >
        {card.match}
      </div>
    </Link>
  );
}
