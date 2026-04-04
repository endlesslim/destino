"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Seal from "@/components/ui/Seal";
import Divider from "@/components/ui/Divider";
import Button from "@/components/ui/Button";
import ScrollReveal from "@/components/ScrollReveal";
import Footer from "@/components/Footer";
import {
  FACE_QUESTIONS,
  generateFaceReading,
  type FaceAnswers,
  type FaceReadingResult,
} from "@/lib/face-reading";

// ━━━ Ohang color map ━━━

const OHANG_COLORS: Record<string, string> = {
  "木": "var(--saju)",
  "火": "var(--seal)",
  "土": "var(--face)",
  "金": "var(--ink-medium)",
  "水": "var(--astro)",
};

// ━━━ Step type ━━━

type Step = "intro" | "question" | "result";

// ━━━ Main page ━━━

export default function FacePage() {
  const [step, setStep] = useState<Step>("intro");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<FaceAnswers>({});
  const [result, setResult] = useState<FaceReadingResult | null>(null);
  const [animating, setAnimating] = useState(false);
  const [birthInfo, setBirthInfo] = useState<{ year: number; month: number; day: number } | null>(null);

  // Load birth info from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("destino_my_info") || localStorage.getItem("destino_daily_birth");
    if (saved) {
      try {
        const { year, month, day } = JSON.parse(saved);
        if (year && month && day) {
          setBirthInfo({ year, month, day });
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const handleStart = useCallback(() => {
    setAnimating(true);
    setTimeout(() => {
      setStep("question");
      setQuestionIndex(0);
      setAnimating(false);
    }, 300);
  }, []);

  const handleAnswer = useCallback((questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    setAnimating(true);

    setTimeout(() => {
      if (questionIndex < FACE_QUESTIONS.length - 1) {
        setQuestionIndex(questionIndex + 1);
      } else {
        // Generate result
        const reading = generateFaceReading(
          newAnswers,
          birthInfo?.year,
          birthInfo?.month,
          birthInfo?.day,
        );
        setResult(reading);
        setStep("result");
      }
      setAnimating(false);
    }, 300);
  }, [answers, questionIndex, birthInfo]);

  const handleRestart = useCallback(() => {
    setStep("intro");
    setQuestionIndex(0);
    setAnswers({});
    setResult(null);
  }, []);

  return (
    <main
      className="min-h-screen flex flex-col items-center px-6 py-12"
      style={{ background: "var(--bg-paper)" }}
    >
      <Nav />
      <div className="w-full max-w-[440px] flex flex-col gap-8 pt-14">

        {step === "intro" && (
          <IntroSection onStart={handleStart} animating={animating} />
        )}

        {step === "question" && (
          <QuestionSection
            questionIndex={questionIndex}
            total={FACE_QUESTIONS.length}
            question={FACE_QUESTIONS[questionIndex]}
            onAnswer={handleAnswer}
            animating={animating}
          />
        )}

        {step === "result" && result && (
          <ResultSection
            result={result}
            hasBirth={!!birthInfo}
            onRestart={handleRestart}
          />
        )}

        <Footer />
      </div>
    </main>
  );
}

// ━━━ Intro Section ━━━

function IntroSection({ onStart, animating }: { onStart: () => void; animating: boolean }) {
  return (
    <section
      className="flex flex-col gap-8 animate-fade-up"
      style={{
        opacity: animating ? 0 : 1,
        transform: animating ? "translateY(-12px)" : "translateY(0)",
        transition: "opacity 0.3s ease, transform 0.3s ease",
      }}
    >
      <div className="flex flex-col items-center gap-4">
        <Seal size="lg" char="相" className="animate-seal-pop" />
        <p
          className="text-[11px] tracking-[0.1em] uppercase font-medium"
          style={{ color: "var(--face)" }}
        >
          FACE READING
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h1
          className="text-[28px] font-black leading-[1.3] tracking-[-0.01em]"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          얼굴에서 읽는<br />오행의 균형
        </h1>
        <p
          className="text-[15px] leading-[1.8]"
          style={{ color: "var(--ink-muted)" }}
        >
          관상은 얼굴에서 오행의 균형을 읽습니다.<br />
          이마, 눈, 코, 입, 턱 — 다섯 부위에 담긴<br />
          오행의 기운으로 당신의 성격과 운명을 분석합니다.
        </p>
      </div>

      <Divider />

      {/* Five areas preview */}
      <div className="flex flex-col gap-3">
        <p
          className="text-[11px] tracking-[0.1em] uppercase font-medium"
          style={{ color: "var(--ink-light)" }}
        >
          분석 부위
        </p>
        <div className="grid grid-cols-5 gap-2">
          {[
            { area: "이마", hanja: "額" },
            { area: "눈", hanja: "目" },
            { area: "코", hanja: "鼻" },
            { area: "입", hanja: "口" },
            { area: "턱", hanja: "顎" },
          ].map(({ area, hanja }) => (
            <div
              key={area}
              className="rounded-lg p-3 flex flex-col items-center gap-1.5"
              style={{
                background: "var(--bg-white)",
                border: "1px solid var(--border)",
              }}
            >
              <span
                className="text-[18px] font-black"
                style={{ fontFamily: "var(--font-display)", color: "var(--face)" }}
              >
                {hanja}
              </span>
              <span
                className="text-[11px] font-medium"
                style={{ color: "var(--ink-light)" }}
              >
                {area}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Button onClick={onStart}>관상 분석 시작하기</Button>
    </section>
  );
}

// ━━━ Question Section ━━━

function QuestionSection({
  questionIndex,
  total,
  question,
  onAnswer,
  animating,
}: {
  questionIndex: number;
  total: number;
  question: typeof FACE_QUESTIONS[number];
  onAnswer: (questionId: string, value: string) => void;
  animating: boolean;
}) {
  return (
    <section
      className="flex flex-col gap-8"
      style={{
        opacity: animating ? 0 : 1,
        transform: animating ? "translateX(24px)" : "translateX(0)",
        transition: "opacity 0.3s ease, transform 0.3s ease",
      }}
    >
      {/* Progress */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p
            className="text-[11px] tracking-[0.1em] uppercase font-medium"
            style={{ color: "var(--face)" }}
          >
            {question.area} ({question.areaHanja})
          </p>
          <p
            className="text-[12px] font-medium"
            style={{ color: "var(--ink-faint)" }}
          >
            {questionIndex + 1} / {total}
          </p>
        </div>
        {/* Progress bar */}
        <div
          className="h-1 rounded-full overflow-hidden"
          style={{ background: "var(--border)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${((questionIndex + 1) / total) * 100}%`,
              background: "var(--face)",
            }}
          />
        </div>
      </div>

      {/* Question card */}
      <div
        className="rounded-lg p-6 flex flex-col gap-6"
        style={{
          background: "var(--bg-white)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="flex flex-col items-center gap-3">
          <span
            className="text-[32px] font-black"
            style={{ fontFamily: "var(--font-display)", color: "var(--face)" }}
          >
            {question.areaHanja}
          </span>
          <h2
            className="text-[20px] font-bold text-center leading-[1.4]"
            style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
          >
            {question.question}
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {question.options.map((option) => (
            <button
              key={option.value}
              onClick={() => onAnswer(question.id, option.value)}
              className="w-full rounded-md px-4 py-4 text-left transition-all cursor-pointer hover:translate-y-[-1px]"
              style={{
                background: "var(--bg-paper)",
                border: "1.5px solid var(--border)",
                color: "var(--ink)",
                fontFamily: "var(--font-display)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--face)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
              }}
            >
              <span className="text-[15px] font-bold">{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ━━━ Result Section ━━━

function ResultSection({
  result,
  hasBirth,
  onRestart,
}: {
  result: FaceReadingResult;
  hasBirth: boolean;
  onRestart: () => void;
}) {
  const dominantColor = OHANG_COLORS[result.overallOhang] || "var(--face)";

  return (
    <div className="flex flex-col gap-8 animate-fade-up">

      {/* Face type header */}
      <ScrollReveal delay={0}>
        <div className="flex flex-col items-center gap-4">
          <Seal size="lg" char="相" className="animate-stamp-in" />
          <p
            className="text-[11px] tracking-[0.1em] uppercase font-medium"
            style={{ color: dominantColor }}
          >
            관상 분석 결과
          </p>
          <h2
            className="text-[28px] font-black text-center leading-[1.3]"
            style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
          >
            {result.faceType}
          </h2>
          <p
            className="text-[14px] leading-[1.8] text-center"
            style={{ color: "var(--ink-muted)" }}
          >
            {result.faceTypeDesc}
          </p>
        </div>
      </ScrollReveal>

      <Divider />

      {/* Five feature readings */}
      <ScrollReveal delay={100}>
        <div className="flex flex-col gap-3">
          <p
            className="text-[11px] tracking-[0.1em] uppercase font-medium"
            style={{ color: "var(--ink-light)" }}
          >
            부위별 분석
          </p>
          <div className="flex flex-col gap-3">
            {result.features.map((feature) => {
              const fColor = OHANG_COLORS[feature.ohangElement] || "var(--face)";
              return (
                <div
                  key={feature.area}
                  className="rounded-lg p-4 flex items-start gap-4"
                  style={{
                    background: "var(--bg-white)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div className="flex flex-col items-center gap-1 shrink-0 w-12">
                    <span
                      className="text-[20px] font-black"
                      style={{ fontFamily: "var(--font-display)", color: fColor }}
                    >
                      {feature.areaHanja}
                    </span>
                    <span
                      className="text-[10px] font-medium"
                      style={{ color: "var(--ink-light)" }}
                    >
                      {feature.area}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1">
                    <p
                      className="text-[13px] leading-[1.7]"
                      style={{ color: "var(--ink-muted)" }}
                    >
                      {feature.reading}
                    </p>
                    <span
                      className="text-[11px] font-medium"
                      style={{ color: fColor }}
                    >
                      {feature.ohangElement}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollReveal>

      <Divider />

      {/* Overall ohang */}
      <ScrollReveal delay={200}>
        <div
          className="rounded-lg p-6 flex flex-col items-center gap-4"
          style={{
            background: "var(--bg-white)",
            border: `1.5px solid ${dominantColor}`,
          }}
        >
          <p
            className="text-[11px] tracking-[0.1em] uppercase font-medium"
            style={{ color: dominantColor }}
          >
            지배 오행
          </p>
          <span
            className="text-[48px] font-black leading-none"
            style={{ fontFamily: "var(--font-display)", color: dominantColor }}
          >
            {result.overallOhang}
          </span>
          <p
            className="text-[14px] leading-[1.8] text-center"
            style={{ color: "var(--ink-muted)" }}
          >
            {result.ohangDescription}
          </p>
        </div>
      </ScrollReveal>

      <Divider />

      {/* Personality */}
      <ScrollReveal delay={280}>
        <div className="flex flex-col gap-3">
          <p
            className="text-[11px] tracking-[0.1em] uppercase font-medium"
            style={{ color: "var(--ink-light)" }}
          >
            성격 분석
          </p>
          <blockquote
            className="border-l-2 pl-4 py-2"
            style={{ borderColor: dominantColor }}
          >
            <p
              className="text-[14px] leading-[1.8]"
              style={{ fontFamily: "var(--font-display)", color: "var(--ink-medium)" }}
            >
              {result.personality}
            </p>
          </blockquote>
        </div>
      </ScrollReveal>

      <Divider />

      {/* Saju connection */}
      <ScrollReveal delay={360}>
        <div
          className="rounded-lg p-5 flex flex-col gap-3"
          style={{
            background: "var(--bg-white)",
            border: "1px solid var(--border)",
          }}
        >
          <p
            className="text-[11px] tracking-[0.1em] uppercase font-medium"
            style={{ color: "var(--saju)" }}
          >
            사주 연결
          </p>
          <p
            className="text-[13px] leading-[1.8]"
            style={{ color: "var(--ink-muted)" }}
          >
            {result.sajuConnection}
          </p>
          {!hasBirth && (
            <Link
              href="/analyze"
              className="text-[12px] font-medium hover:underline mt-1"
              style={{ color: "var(--seal)" }}
            >
              교차 분석에서 생년월일 입력하기
            </Link>
          )}
        </div>
      </ScrollReveal>

      <Divider />

      {/* Career recommendations */}
      <ScrollReveal delay={440}>
        <div className="flex flex-col gap-3">
          <p
            className="text-[11px] tracking-[0.1em] uppercase font-medium"
            style={{ color: "var(--ink-light)" }}
          >
            추천 직업
          </p>
          <div className="flex flex-wrap gap-2">
            {result.career.map((job) => (
              <span
                key={job}
                className="rounded-md px-3 py-1.5 text-[13px] font-medium"
                style={{
                  background: "var(--bg-white)",
                  border: "1px solid var(--border)",
                  color: "var(--ink-medium)",
                  fontFamily: "var(--font-display)",
                }}
              >
                {job}
              </span>
            ))}
          </div>
        </div>
      </ScrollReveal>

      <Divider />

      {/* Actions */}
      <ScrollReveal delay={520}>
        <div className="flex flex-col gap-3">
          <Button onClick={onRestart} variant="secondary">
            다시 분석하기
          </Button>
          <Link href="/analyze" className="block">
            <div
              className="w-full rounded-md py-4 text-center text-[15px] font-bold tracking-wider transition-opacity hover:opacity-80"
              style={{
                background: "var(--seal)",
                color: "#fff",
                fontFamily: "var(--font-display)",
                boxShadow: "0 4px 16px var(--shadow-btn)",
              }}
            >
              교차 분석 보기
            </div>
          </Link>
        </div>
      </ScrollReveal>
    </div>
  );
}
