"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

export default function WaitlistForm() {
  const [focused, setFocused] = useState(false);

  return (
    <section className="flex flex-col gap-4">
      <p
        className="text-[11px] tracking-[0.1em] uppercase font-medium"
        style={{ color: "var(--ink-light)" }}
      >
        선착순 1,000명 얼리 액세스
      </p>

      <input
        type="email"
        placeholder="이메일을 입력하세요"
        className="w-full rounded-md px-4 py-3.5 text-base outline-none transition-colors"
        style={{
          background: "var(--bg-white)",
          border: `1.5px solid ${focused ? "var(--seal)" : "var(--border)"}`,
          color: "var(--ink)",
          fontFamily: "var(--font-display)",
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />

      <Button variant="primary">교차점 발견하기</Button>
      <a href="/analyze">
        <Button variant="secondary">미니 도구 먼저 체험하기</Button>
      </a>
    </section>
  );
}
