"use client";

import { useState, useEffect } from "react";

export default function WaitlistCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/waitlist")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.count === "number") setCount(data.count);
      })
      .catch(() => {
        // Silently fail — counter is non-critical
      });
  }, []);

  if (count === null || count === 0) return null;

  return (
    <p
      className="text-[13px]"
      style={{ color: "var(--ink-light)" }}
    >
      현재{" "}
      <span className="font-bold" style={{ color: "var(--ink-medium)" }}>
        {count.toLocaleString()}명
      </span>{" "}
      대기 중
    </p>
  );
}
