"use client";
import { useRef, useEffect, useState, type ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number; // ms
  className?: string;
  mode?: "auto" | "scroll"; // auto = delay 후 자동 등장, scroll = 스크롤 시 등장
}

export default function ScrollReveal({ children, delay = 0, className = "", mode = "auto" }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (mode === "auto") {
      // 딜레이 후 자동 등장 — 스크롤 불필요
      const timer = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(timer);
    }

    // scroll 모드: 화면에 보일 때 등장
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, mode]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.5s cubic-bezier(0.22,1,0.36,1), transform 0.5s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      {children}
    </div>
  );
}
