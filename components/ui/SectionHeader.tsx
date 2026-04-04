import Dot from "./Dot";

export default function SectionHeader({
  color,
  title,
  subtitle,
}: {
  color: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        <Dot color={color} size={8} />
        <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>
          {title}
        </span>
      </div>
      {subtitle && (
        <p className="text-xs mt-1 ml-4" style={{ color: "var(--ink-light)" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
