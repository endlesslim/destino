"use client";

import Link from "next/link";

export default function ScrollToWaitlistButton() {
  return (
    <Link
      href="/analyze"
      className="w-fit rounded-md px-6 py-3 text-[14px] font-bold tracking-wider transition-all cursor-pointer hover:opacity-85 active:opacity-70 no-underline"
      style={{
        background: "var(--ink)",
        color: "var(--bg-paper)",
        fontFamily: "var(--font-display)",
      }}
    >
      지금 분석하기
    </Link>
  );
}
