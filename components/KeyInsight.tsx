interface KeyInsightProps {
  text: string;
  source?: "사주" | "별자리" | "수비학" | "교차점";
  color?: string;
}

const SOURCE_COLORS: Record<string, string> = {
  "사주": "var(--saju)",
  "별자리": "var(--astro)",
  "수비학": "var(--numero)",
  "교차점": "var(--seal)",
};

export default function KeyInsight({
  text,
  source,
  color,
}: KeyInsightProps) {
  const accentColor = color || (source ? SOURCE_COLORS[source] : "var(--seal)");

  return (
    <div
      className="py-[14px] px-[18px] rounded-lg"
      style={{
        borderLeft: `3px solid ${accentColor}`,
        background: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
      }}
    >
      <p
        className="text-[17px] leading-[1.9] m-0"
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--ink-medium)",
        }}
      >
        {text}
      </p>
      {source && (
        <span
          className="inline-block mt-[6px] text-[11px] font-semibold tracking-wider"
          style={{ color: accentColor }}
        >
          {source}
        </span>
      )}
    </div>
  );
}
