import React from "react";

export default function StaggerSection({
  children,
  index,
  className = "",
  style = {},
}: {
  children: React.ReactNode;
  index: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`animate-stagger-in ${className}`}
      style={{
        ...style,
        animationDelay: `${index * 0.1}s`,
      }}
    >
      {children}
    </div>
  );
}
