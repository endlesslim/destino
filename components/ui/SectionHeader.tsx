import { type ReactNode } from "react";
import Dot from "./Dot";

export default function SectionHeader({
  color,
  title,
  subtitle,
  icon,
}: {
  color: string;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        {icon ? (
          <span className="shrink-0 flex items-center justify-center">{icon}</span>
        ) : (
          <Dot color={color} size={8} />
        )}
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
