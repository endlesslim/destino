"use client";

import { useState } from "react";

interface FeedbackWidgetProps {
  year: number;
  month: number;
  day: number;
  convergenceRate?: number;
  archetype?: string;
}

export default function FeedbackWidget({
  year,
  month,
  day,
  convergenceRate,
  archetype,
}: FeedbackWidgetProps) {
  const [rating, setRating] = useState<"accurate" | "inaccurate" | null>(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleRate = (value: "accurate" | "inaccurate") => {
    setRating(value);
  };

  const handleSubmit = async () => {
    if (!rating) return;
    setSubmitting(true);

    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year,
          month,
          day,
          convergenceRate,
          archetype,
          rating,
          comment: comment.trim() || undefined,
        }),
      });
      setSubmitted(true);
    } catch {
      // Silently fail — feedback is non-critical
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div
        className="rounded-[14px] p-5 mb-3.5 text-center"
        style={{ background: "var(--bg-white)", border: "1.5px solid var(--border)" }}
      >
        <div className="text-sm" style={{ color: "var(--ink-medium)" }}>
          소중한 의견 감사합니다
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-[14px] p-5 mb-3.5"
      style={{ background: "var(--bg-white)", border: "1.5px solid var(--border)" }}
    >
      <div className="text-sm font-bold mb-3" style={{ color: "var(--ink)" }}>
        이 분석이 정확하다고 느끼셨나요?
      </div>

      <div className="flex gap-2 mb-3">
        <button
          onClick={() => handleRate("accurate")}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold rounded-lg cursor-pointer transition-all"
          style={{
            background: rating === "accurate" ? "var(--saju)" : "var(--bg-paper)",
            color: rating === "accurate" ? "#fff" : "var(--ink-medium)",
            border: rating === "accurate" ? "1.5px solid var(--saju)" : "1.5px solid var(--border)",
            fontFamily: "inherit",
          }}
          aria-label="정확해요"
          aria-pressed={rating === "accurate"}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M3 8.5l3.5 3.5L13 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          정확해요
        </button>
        <button
          onClick={() => handleRate("inaccurate")}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold rounded-lg cursor-pointer transition-all"
          style={{
            background: rating === "inaccurate" ? "#6B7280" : "var(--bg-paper)",
            color: rating === "inaccurate" ? "#fff" : "var(--ink-medium)",
            border: rating === "inaccurate" ? "1.5px solid #6B7280" : "1.5px solid var(--border)",
            fontFamily: "inherit",
          }}
          aria-label="아니에요"
          aria-pressed={rating === "inaccurate"}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M4 4l8 8M12 4l-8 8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          아니에요
        </button>
      </div>

      {rating && (
        <div className="animate-[fadeIn_0.2s_ease-out]">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="추가 의견이 있으시면 남겨주세요 (선택사항)"
            className="w-full p-3 text-sm rounded-lg resize-none mb-2"
            style={{
              background: "var(--bg-paper)",
              color: "var(--ink)",
              border: "1.5px solid var(--border)",
              fontFamily: "inherit",
              outline: "none",
            }}
            rows={3}
            aria-label="추가 의견"
          />
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-2.5 text-sm font-bold rounded-lg cursor-pointer transition-all"
            style={{
              background: "var(--saju)",
              color: "#fff",
              border: "none",
              fontFamily: "inherit",
              opacity: submitting ? 0.6 : 1,
            }}
          >
            {submitting ? "전송 중..." : "의견 보내기"}
          </button>
        </div>
      )}
    </div>
  );
}
