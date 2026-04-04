import { notFound } from "next/navigation";
import { Metadata } from "next";
import Seal from "@/components/ui/Seal";
import { CARDS, getCardById } from "@/lib/cards-data";

interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return CARDS.map((card) => ({ id: String(card.id) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const card = getCardById(Number(id));
  if (!card) return {};
  const title = card.title.replace("\n", " ");
  return {
    title: `${title} — DESTINO #${String(card.id).padStart(2, "0")}`,
    description: card.sub.replace("\n", " "),
  };
}

export default async function CardPage({ params }: PageProps) {
  const { id } = await params;
  const card = getCardById(Number(id));
  if (!card) notFound();

  const titleLines = card.title.split("\n");
  const subLines = card.sub.split("\n");
  const numbering = `#${String(card.id).padStart(2, "0")}/20`;

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bg-warm)" }}>
      {/* 1080x1080 card viewport */}
      <div
        className="relative overflow-hidden"
        style={{
          width: 1080,
          height: 1080,
          background: "var(--bg-paper)",
          fontFamily: "var(--font-display)",
          color: "var(--ink)",
          flexShrink: 0,
        }}
      >
        {/* Subtle texture dots */}
        <TextureDots />

        {/* Card content */}
        <div
          className="relative flex flex-col"
          style={{ zIndex: 1, padding: 84, height: "100%" }}
        >
          {/* Top bar: logo + category */}
          <div className="flex justify-between items-center" style={{ marginBottom: 60 }}>
            <div className="flex items-center" style={{ gap: 18 }}>
              <Seal size="lg" char="命" />
              <span
                className="tracking-[0.15em] uppercase"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 24,
                  color: "var(--ink-faint)",
                }}
              >
                DESTINO
              </span>
            </div>
            <span
              className="rounded-md"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 26,
                padding: "10px 24px",
                background: "var(--bg-white)",
                border: "2px solid var(--border)",
                color: "var(--ink-light)",
              }}
            >
              {card.cat}
            </span>
          </div>

          {/* Title */}
          <div
            className="font-black"
            style={{
              fontSize: 84,
              lineHeight: 1.25,
              marginBottom: 48,
              letterSpacing: "-0.02em",
            }}
          >
            {titleLines.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>

          {/* East vs West comparison boxes */}
          <div className="flex items-center" style={{ gap: 24, marginBottom: 48 }}>
            <ComparisonBox label="동양" value={card.east} />
            <div
              className="font-black"
              style={{ fontSize: 36, color: "var(--seal)" }}
            >
              ↔
            </div>
            <ComparisonBox label="서양" value={card.west} />
          </div>

          {/* Description text */}
          <div
            className="flex-1"
            style={{
              fontSize: 40,
              color: "var(--ink-muted)",
              lineHeight: 1.7,
              fontFamily: "var(--font-body)",
            }}
          >
            {subLines.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>

          {/* Bottom bar: seal badge + numbering */}
          <div className="flex justify-between items-center">
            <div
              className="font-black"
              style={{
                border: "3px solid var(--seal)",
                borderRadius: 6,
                padding: "8px 30px",
                fontSize: 36,
                color: "var(--seal)",
                transform: "rotate(-2deg)",
                fontFamily: "var(--font-display)",
              }}
            >
              {card.match}
            </div>
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 28,
                color: "var(--ink-ghost)",
              }}
            >
              {numbering}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComparisonBox({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex-1 text-center"
      style={{
        background: "var(--bg-white)",
        border: "3px solid var(--border)",
        borderRadius: 18,
        padding: "30px 42px",
      }}
    >
      <div
        className="tracking-[0.1em]"
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 22,
          color: "var(--ink-faint)",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div className="font-black" style={{ fontSize: 54 }}>
        {value}
      </div>
    </div>
  );
}

function TextureDots() {
  // Deterministic dot positions for consistent rendering
  const dots: Array<{ cx: number; cy: number }> = [];
  let seed = 42;
  for (let i = 0; i < 600; i++) {
    seed = (seed * 16807 + 0) % 2147483647;
    const cx = (seed / 2147483647) * 1080;
    seed = (seed * 16807 + 0) % 2147483647;
    const cy = (seed / 2147483647) * 1080;
    dots.push({ cx, cy });
  }

  return (
    <svg
      className="absolute inset-0"
      style={{ opacity: 0.03 }}
      width={1080}
      height={1080}
      aria-hidden="true"
    >
      {dots.map((dot, i) => (
        <circle key={i} cx={dot.cx} cy={dot.cy} r={1.5} fill="#1C1917" />
      ))}
    </svg>
  );
}
