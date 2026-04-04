"use client";

import { useState, type FormEvent } from "react";
import Seal from "@/components/ui/Seal";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function DailyEmailSubscribe() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();

    if (!trimmed || !EMAIL_REGEX.test(trimmed)) {
      setErrorMsg("올바른 이메일 주소를 입력해주세요.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || "오류가 발생했습니다.");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setErrorMsg("네트워크 오류가 발생했습니다.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        className="rounded-lg p-6 text-center"
        style={{ background: "var(--bg-white)", border: "1.5px solid var(--seal)" }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="mx-auto mb-3">
          <circle cx="16" cy="16" r="14" stroke="var(--seal)" strokeWidth="2" />
          <path d="M10 16l4 4 8-8" stroke="var(--seal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p
          className="text-lg font-bold mb-1"
          style={{ color: "var(--ink)", fontFamily: "var(--font-display)" }}
        >
          등록 완료
        </p>
        <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
          매일 아침 7시, 오늘의 운세를 이메일로 보내드리겠습니다
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg p-6 flex flex-col gap-4 relative overflow-hidden"
      style={{ background: "var(--bg-white)", border: "1.5px solid var(--seal)" }}
    >
      <div className="absolute top-3 right-3 opacity-20">
        <Seal size="sm" char="運" />
      </div>
      <p
        className="text-[11px] tracking-[0.1em] uppercase font-medium"
        style={{ color: "var(--seal)" }}
      >
        DAILY EMAIL
      </p>
      <h3
        className="text-[18px] font-bold leading-[1.4]"
        style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
      >
        매일 아침,<br />이메일로 받아보기
      </h3>
      <p className="text-[14px] leading-[1.7]" style={{ color: "var(--ink-muted)" }}>
        오늘의 운세를 매일 아침 7시에 이메일로 보내드립니다.
        놓치지 않고 하루를 준비하세요.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="이메일을 입력하세요"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") { setStatus("idle"); setErrorMsg(""); }
          }}
          className="w-full rounded-md px-4 py-3 text-sm outline-none transition-colors"
          style={{
            background: "var(--bg-paper)",
            border: `1.5px solid ${status === "error" ? "var(--seal)" : "var(--border)"}`,
            color: "var(--ink)",
          }}
          disabled={status === "loading"}
        />
        {errorMsg && (
          <p className="text-[13px]" style={{ color: "var(--seal)" }}>{errorMsg}</p>
        )}
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-md py-3 text-[15px] font-bold transition-opacity hover:opacity-85"
          style={{
            background: "var(--seal)",
            color: "#fff",
            border: "none",
            cursor: status === "loading" ? "wait" : "pointer",
            opacity: status === "loading" ? 0.6 : 1,
          }}
        >
          {status === "loading" ? "등록 중..." : "무료로 구독하기"}
        </button>
      </form>
    </div>
  );
}
