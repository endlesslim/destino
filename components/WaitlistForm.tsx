"use client";

import { useState, useRef, FormEvent } from "react";
import Button from "@/components/ui/Button";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormStatus = "idle" | "loading" | "success" | "error";

interface ErrorInfo {
  type: "invalid_email" | "duplicate" | "too_many_requests" | "unknown";
  message: string;
}

const ERROR_MESSAGES: Record<ErrorInfo["type"], string> = {
  invalid_email: "올바른 이메일 주소를 입력해주세요.",
  duplicate: "이미 등록된 이메일입니다.",
  too_many_requests: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
  unknown: "오류가 발생했습니다. 다시 시도해주세요.",
};

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [focused, setFocused] = useState(false);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [position, setPosition] = useState<number | null>(null);
  const [error, setError] = useState<ErrorInfo | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function validateClient(value: string): boolean {
    if (!value.trim()) {
      setClientError("이메일을 입력해주세요.");
      return false;
    }
    if (!EMAIL_REGEX.test(value.trim())) {
      setClientError("올바른 이메일 형식이 아닙니다.");
      return false;
    }
    setClientError(null);
    return true;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!validateClient(email)) return;

    setStatus("loading");
    setError(null);
    setClientError(null);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorType = (data.error ?? "unknown") as ErrorInfo["type"];
        setError({
          type: errorType,
          message: ERROR_MESSAGES[errorType] ?? ERROR_MESSAGES.unknown,
        });
        setStatus("error");
        return;
      }

      setPosition(data.position);
      setStatus("success");
    } catch {
      setError({ type: "unknown", message: ERROR_MESSAGES.unknown });
      setStatus("error");
    }
  }

  // --- Success state ---
  if (status === "success" && position !== null) {
    return (
      <section id="waitlist" className="flex flex-col gap-4 animate-fade-up">
        <div
          className="rounded-lg p-8 text-center"
          style={{ background: "var(--bg-white)", border: "1px solid var(--border)" }}
        >
          <div
            className="text-[28px] mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {"\uD83C\uDF89"}
          </div>
          <p
            className="text-lg font-bold mb-1"
            style={{ color: "var(--ink)", fontFamily: "var(--font-display)" }}
          >
            {position.toLocaleString()}번째로 등록되었습니다
          </p>
          <p
            className="text-sm"
            style={{ color: "var(--ink-muted)" }}
          >
            런칭 시 가장 먼저 알려드리겠습니다
          </p>
        </div>

        <a
          href="/analyze"
          className="w-full rounded-md py-4 text-[15px] font-bold tracking-wider transition-all cursor-pointer text-center block border-[1.5px] hover:opacity-80 active:opacity-60"
          style={{ background: "transparent", color: "var(--ink)", borderColor: "var(--border-strong)", fontFamily: "var(--font-display)" }}
        >
          미니 도구 먼저 체험하기
        </a>
      </section>
    );
  }

  // --- Form state ---
  return (
    <section id="waitlist" className="flex flex-col gap-4">
      <p
        className="text-[11px] tracking-[0.1em] uppercase font-medium"
        style={{ color: "var(--ink-light)" }}
      >
        선착순 1,000명 얼리 액세스
      </p>

      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div>
          <input
            type="email"
            placeholder="이메일을 입력하세요"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (clientError) setClientError(null);
              if (error) setError(null);
              if (status === "error") setStatus("idle");
            }}
            className="w-full rounded-md px-4 py-3.5 text-base outline-none transition-colors"
            style={{
              background: "var(--bg-white)",
              border: `1.5px solid ${
                clientError || error
                  ? "var(--seal)"
                  : focused
                    ? "var(--seal)"
                    : "var(--border)"
              }`,
              color: "var(--ink)",
              fontFamily: "var(--font-display)",
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={status === "loading"}
            aria-label="이메일 주소"
            aria-invalid={!!(clientError || error)}
          />
          {(clientError || error) && (
            <p
              className="text-[13px] mt-2"
              style={{ color: "var(--seal)" }}
              role="alert"
            >
              {clientError ?? error?.message}
            </p>
          )}
        </div>

        <Button
          variant="primary"
          type="submit"
          disabled={status === "loading"}
          style={status === "loading" ? { opacity: 0.6, cursor: "wait" } : undefined}
        >
          {status === "loading" ? "등록 중..." : "교차점 발견하기"}
        </Button>
      </form>

      <a
        href="/analyze"
        className="w-full rounded-md py-4 text-[15px] font-bold tracking-wider transition-all cursor-pointer text-center block border-[1.5px] hover:opacity-80 active:opacity-60"
        style={{ background: "transparent", color: "var(--ink)", borderColor: "var(--border-strong)", fontFamily: "var(--font-display)" }}
      >
        미니 도구 먼저 체험하기
      </a>
    </section>
  );
}
