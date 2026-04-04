"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface ChatContext {
  archetype: string;
  saju: string;
  zodiac: string;
  numerology: string;
  mbti: string;
  convergenceRate: number;
}

interface ChatMessage {
  role: "user" | "ai";
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "제 직업운에 대해 더 알려주세요",
  "올해 주의할 점이 있나요?",
  "연애운은 어떤가요?",
];

export default function ChatConsultation({ context }: { context: ChatContext }) {
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState(10);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input when expanded
  useEffect(() => {
    if (expanded) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [expanded]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;

      const userMessage: ChatMessage = { role: "user", content: text.trim() };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text.trim(), context }),
        });

        const data = await res.json();

        if (res.status === 429) {
          setMessages((prev) => [
            ...prev,
            { role: "ai", content: data.error || "메시지 한도를 초과했습니다." },
          ]);
          setRemaining(0);
        } else {
          setMessages((prev) => [
            ...prev,
            { role: "ai", content: data.reply },
          ]);
          if (typeof data.remaining === "number") {
            setRemaining(data.remaining);
          }
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: "ai", content: "연결에 실패했습니다. 잠시 후 다시 시도해주세요." },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [context, loading]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div
      className="rounded-[14px] overflow-hidden transition-all duration-300"
      style={{
        background: "var(--bg-white)",
        border: "1.5px solid var(--border)",
      }}
    >
      {/* Header - always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 cursor-pointer border-none bg-transparent"
        style={{ fontFamily: "inherit" }}
        aria-expanded={expanded}
        aria-controls="chat-panel"
      >
        <div className="flex items-center gap-2.5">
          {/* Chat bubble icon */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M3 4C3 3.44772 3.44772 3 4 3H16C16.5523 3 17 3.44772 17 4V13C17 13.5523 16.5523 14 16 14H7L4 17V14H4C3.44772 14 3 13.5523 3 13V4Z"
              stroke="var(--seal)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <circle cx="7.5" cy="8.5" r="0.8" fill="var(--seal)" />
            <circle cx="10" cy="8.5" r="0.8" fill="var(--seal)" />
            <circle cx="12.5" cy="8.5" r="0.8" fill="var(--seal)" />
          </svg>
          <span
            className="text-sm font-bold"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--ink)",
            }}
          >
            AI 상담사에게 물어보세요
          </span>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="shrink-0 transition-transform duration-300"
          style={{
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          }}
          aria-hidden="true"
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="var(--ink-light)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Expandable panel */}
      <div
        id="chat-panel"
        className="transition-all duration-300 ease-in-out overflow-hidden"
        style={{
          maxHeight: expanded ? "560px" : "0px",
          opacity: expanded ? 1 : 0,
        }}
      >
        <div
          className="h-px mx-5"
          style={{ background: "var(--border)" }}
        />

        {/* Messages area */}
        <div
          className="overflow-y-auto px-5 py-3"
          style={{ maxHeight: "400px" }}
          role="log"
          aria-label="상담 메시지"
          aria-live="polite"
        >
          {messages.length === 0 && (
            <p
              className="text-center text-[13px] py-6"
              style={{ color: "var(--ink-light)" }}
            >
              분석 결과에 대해 궁금한 점을 물어보세요
            </p>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex mb-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className="max-w-[85%] rounded-xl px-3.5 py-2.5 text-[14px] leading-[1.7]"
                style={
                  msg.role === "user"
                    ? {
                        background: "var(--seal-bg)",
                        color: "var(--ink)",
                        fontFamily: "var(--font-body, inherit)",
                        borderBottomRightRadius: "4px",
                      }
                    : {
                        background: "var(--bg-paper)",
                        color: "var(--ink)",
                        fontFamily: "var(--font-display)",
                        borderBottomLeftRadius: "4px",
                      }
                }
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Loading state */}
          {loading && (
            <div className="flex justify-start mb-3">
              <div
                className="rounded-xl px-3.5 py-2.5 text-[14px]"
                style={{
                  background: "var(--bg-paper)",
                  color: "var(--ink-light)",
                  fontFamily: "var(--font-display)",
                  borderBottomLeftRadius: "4px",
                }}
              >
                <span className="inline-flex items-center gap-1">
                  분석 중
                  <span className="dots-animation">
                    <span className="dot-1">.</span>
                    <span className="dot-2">.</span>
                    <span className="dot-3">.</span>
                  </span>
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested questions */}
        {messages.length === 0 && (
          <div className="px-5 pb-3 flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                disabled={loading}
                className="text-[12px] px-3 py-1.5 rounded-full cursor-pointer border-none transition-all hover:opacity-80 disabled:opacity-50"
                style={{
                  background: "var(--bg-paper)",
                  color: "var(--ink-muted)",
                  fontFamily: "inherit",
                }}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input area */}
        <div className="px-5 pb-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="질문을 입력하세요..."
              disabled={loading || remaining <= 0}
              maxLength={200}
              className="flex-1 text-[14px] px-3.5 py-2.5 rounded-lg border-none outline-none disabled:opacity-50"
              style={{
                background: "var(--bg-paper)",
                color: "var(--ink)",
                fontFamily: "inherit",
              }}
              aria-label="상담 메시지 입력"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading || remaining <= 0}
              className="shrink-0 px-4 py-2.5 rounded-lg border-none cursor-pointer text-[14px] font-bold transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: "var(--seal)",
                color: "#fff",
                fontFamily: "inherit",
              }}
              aria-label="메시지 전송"
            >
              전송
            </button>
          </form>

          {/* Remaining messages indicator */}
          <p
            className="text-[11px] mt-2 text-right"
            style={{ color: "var(--ink-faint)" }}
          >
            오늘 남은 질문: {remaining}/{RATE_LIMIT}
          </p>
        </div>
      </div>

      {/* Inline styles for dots animation */}
      <style>{`
        .dots-animation .dot-1,
        .dots-animation .dot-2,
        .dots-animation .dot-3 {
          animation: dotFade 1.4s infinite;
        }
        .dots-animation .dot-2 { animation-delay: 0.2s; }
        .dots-animation .dot-3 { animation-delay: 0.4s; }
        @keyframes dotFade {
          0%, 80%, 100% { opacity: 0.2; }
          40% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

const RATE_LIMIT = 10;
