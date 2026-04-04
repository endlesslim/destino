"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";

interface ExpandableProps {
  title: string;
  preview: string;
  children: ReactNode;
  defaultOpen?: boolean;
  accentColor?: string;
}

export default function Expandable({
  title,
  preview,
  children,
  defaultOpen = false,
  accentColor = "var(--seal)",
}: ExpandableProps) {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState<string>(defaultOpen ? "none" : "0px");

  useEffect(() => {
    if (!contentRef.current) return;
    if (open) {
      const h = contentRef.current.scrollHeight;
      setMaxHeight(`${h}px`);
      // After transition, set to none so dynamic content isn't clipped
      const timer = setTimeout(() => setMaxHeight("none"), 350);
      return () => clearTimeout(timer);
    } else {
      // First set explicit height so transition works from a real value
      const h = contentRef.current.scrollHeight;
      setMaxHeight(`${h}px`);
      // Force reflow then collapse
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setMaxHeight("0px");
        });
      });
    }
  }, [open]);

  return (
    <div>
      {!open && (
        <p
          className="text-[14px] leading-[1.8] mb-0"
          style={{
            fontFamily: "var(--font-body, sans-serif)",
            color: "var(--ink-muted)",
          }}
        >
          {preview}
        </p>
      )}

      <div
        ref={contentRef}
        style={{
          maxHeight,
          overflow: maxHeight === "none" ? "visible" : "hidden",
          transition: "max-height 0.32s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="pt-[12px]">{children}</div>
      </div>

      <button
        onClick={() => setOpen((v) => !v)}
        className="mt-[8px] text-[13px] font-semibold border-none bg-transparent cursor-pointer p-0 transition-colors"
        style={{
          color: accentColor,
          fontFamily: "inherit",
        }}
        aria-expanded={open}
      >
        {open ? "접기" : "더 보기"}
      </button>
    </div>
  );
}
