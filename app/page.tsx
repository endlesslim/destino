import Link from "next/link";
import Seal from "@/components/ui/Seal";
import Divider from "@/components/ui/Divider";

const features = [
  {
    color: "var(--seal)",
    title: "교차 분석",
    description: "동서양 3개 체계가 같은 답을 내리는 교차점",
    href: "/analyze",
  },
  {
    color: "var(--astro)",
    title: "궁합 분석",
    description: "두 사람의 운명이 교차하는 지점",
    href: "/compatibility",
  },
  {
    color: "var(--saju)",
    title: "오늘의 운세",
    description: "매일 달라지는 오행의 기운",
    href: "/daily",
  },
];

const steps = [
  { number: "1", title: "생년월일 입력", description: "30초면 충분합니다" },
  { number: "2", title: "3개 체계 동시 분석", description: "사주 \u00B7 별자리 \u00B7 수비학" },
  { number: "3", title: "교차점 발견", description: "여러 문명이 같은 답을 내린 지점" },
];

const systems = [
  { label: "사주", sub: "천간\u00B7지지\u00B7오행", color: "var(--saju)", active: true },
  { label: "서양 점성술", sub: "태양궁\u00B7상승궁\u00B7달궁", color: "var(--astro)", active: true },
  { label: "수비학", sub: "생명경로수\u00B7표현수", color: "var(--numero)", active: true },
  { label: "MBTI", sub: "16가지 성격 유형", color: "var(--mbti)", active: false },
  { label: "관상", sub: "오관\u00B7오행 체형", color: "var(--face)", active: false },
  { label: "타로", sub: "메이저 아르카나", color: "var(--tarot)", active: false },
];

export default function Home() {
  return (
    <main
      className="min-h-screen flex flex-col items-center px-6 py-16"
      style={{ background: "var(--bg-paper)" }}
    >
      <div className="w-full max-w-[440px] flex flex-col gap-10">

        {/* 히어로 */}
        <section className="flex flex-col items-center text-center gap-6 animate-fade-up">
          <Seal size="lg" char="命" className="animate-seal-pop" />

          <p
            className="text-sm font-black tracking-[0.15em] uppercase"
            style={{ color: "var(--ink-light)", fontFamily: "var(--font-display)" }}
          >
            DESTINO
          </p>

          <h1
            className="text-[36px] font-black leading-[1.2] tracking-[-0.02em]"
            style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
          >
            6개 문명이<br />내린 같은 답
          </h1>

          <p
            className="text-[15px] leading-[1.8]"
            style={{ color: "var(--ink-muted)" }}
          >
            사주 · 별자리 · 수비학이 당신에 대해<br />
            같은 결론을 내리는 교차점을 찾습니다
          </p>

          <div className="flex flex-col gap-3 w-full mt-2">
            <Link
              href="/analyze"
              className="w-full py-3.5 text-center text-[15px] font-bold tracking-wide rounded-lg transition-colors"
              style={{
                background: "var(--ink)",
                color: "var(--bg-paper)",
                fontFamily: "var(--font-display)",
              }}
            >
              무료로 분석하기
            </Link>
            <Link
              href="/compatibility"
              className="w-full py-3.5 text-center text-[15px] font-bold tracking-wide rounded-lg border-2 transition-colors"
              style={{
                borderColor: "var(--ink)",
                color: "var(--ink)",
                background: "transparent",
                fontFamily: "var(--font-display)",
              }}
            >
              궁합 분석하기
            </Link>
          </div>
        </section>

        <Divider />

        {/* 기능 카드 */}
        <section className="flex flex-col gap-4">
          {features.map(({ color, title, description, href }) => (
            <Link
              key={title}
              href={href}
              className="flex items-start gap-4 rounded-lg p-5 transition-colors hover-lift"
              style={{
                background: "var(--bg-white)",
                border: "1px solid var(--border)",
              }}
            >
              <span
                className="text-[10px] mt-1 shrink-0"
                style={{ color }}
              >
                ●
              </span>
              <div className="flex flex-col gap-1">
                <span
                  className="text-[16px] font-bold"
                  style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
                >
                  {title}
                </span>
                <span
                  className="text-[14px]"
                  style={{ color: "var(--ink-muted)" }}
                >
                  {description}
                </span>
              </div>
            </Link>
          ))}
        </section>

        <Divider />

        {/* 이용 방법 */}
        <section className="flex flex-col gap-4">
          <p
            className="text-[11px] tracking-[0.1em] uppercase font-medium"
            style={{ color: "var(--ink-light)" }}
          >
            이용 방법
          </p>
          <div className="flex flex-col gap-5">
            {steps.map(({ number, title, description }) => (
              <div key={number} className="flex items-start gap-4">
                <span
                  className="w-7 h-7 shrink-0 inline-flex items-center justify-center rounded-full text-[12px] font-bold"
                  style={{
                    background: "var(--bg-warm)",
                    color: "var(--ink-medium)",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {number}
                </span>
                <div className="flex flex-col gap-0.5">
                  <span
                    className="text-[15px] font-bold"
                    style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
                  >
                    {title}
                  </span>
                  <span
                    className="text-[14px]"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    {description}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Divider />

        {/* 분석 체계 */}
        <section className="flex flex-col gap-4">
          <p
            className="text-[11px] tracking-[0.1em] uppercase font-medium"
            style={{ color: "var(--ink-light)" }}
          >
            분석 체계
          </p>
          <div className="grid grid-cols-2 gap-3">
            {systems.map(({ label, sub, color, active }) => (
              <div
                key={label}
                className={`rounded-lg p-4 relative ${active ? "hover-lift" : ""}`}
                style={{
                  background: "var(--bg-white)",
                  border: "1px solid var(--border)",
                  opacity: active ? 1 : 0.5,
                }}
              >
                <div
                  className="text-[10px] tracking-[0.08em] font-medium mb-1"
                  style={{ color: active ? color : "var(--ink-faint)" }}
                >
                  ●
                </div>
                <div
                  className="text-sm font-bold"
                  style={{
                    color: active ? "var(--ink)" : "var(--ink-light)",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {label}
                </div>
                <div
                  className="text-[12px] mt-0.5"
                  style={{ color: active ? "var(--ink-light)" : "var(--ink-faint)" }}
                >
                  {sub}
                </div>
                {!active && (
                  <span
                    className="absolute top-3 right-3 text-[9px] tracking-[0.05em] font-medium px-1.5 py-0.5 rounded"
                    style={{
                      background: "var(--bg-warm)",
                      color: "var(--ink-light)",
                    }}
                  >
                    곧 출시
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        <Divider />

        {/* 푸터 */}
        <footer
          className="text-center flex flex-col gap-3 py-4"
          style={{ color: "var(--ink-light)" }}
        >
          <p
            className="text-[11px] tracking-[0.1em] uppercase font-medium"
            style={{ fontFamily: "var(--font-display)" }}
          >
            DESTINO
          </p>
          <div
            className="flex justify-center gap-4 text-[12px]"
            style={{ color: "var(--ink-light)" }}
          >
            <Link href="/analyze" className="hover:underline">교차 분석</Link>
            <span style={{ color: "var(--border)" }}>|</span>
            <Link href="/compatibility" className="hover:underline">궁합 분석</Link>
            <span style={{ color: "var(--border)" }}>|</span>
            <Link href="/daily" className="hover:underline">오늘의 운세</Link>
            <span style={{ color: "var(--border)" }}>|</span>
            <a href="mailto:hello@destino.me" className="hover:underline">문의</a>
          </div>
          <p className="text-[12px]" style={{ color: "var(--ink-faint)" }}>
            &copy; {new Date().getFullYear()} DESTINO. All rights reserved.
          </p>
        </footer>

      </div>
    </main>
  );
}
