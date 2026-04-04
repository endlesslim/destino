interface StatCardProps {
  number: string;
  label: string;
  color?: string;
}

export default function StatCard({
  number,
  label,
  color = "var(--ink)",
}: StatCardProps) {
  return (
    <div
      className="flex-1 min-w-[80px] py-[14px] px-[12px] rounded-[10px] text-center"
      style={{
        background: `color-mix(in srgb, ${color} 6%, transparent)`,
      }}
    >
      <div
        className="text-[24px] font-black leading-none"
        style={{
          fontFamily: "var(--font-display)",
          color,
        }}
      >
        {number}
      </div>
      <div
        className="text-[11px] font-semibold mt-[6px] tracking-wide"
        style={{ color: "var(--ink-muted)" }}
      >
        {label}
      </div>
    </div>
  );
}
