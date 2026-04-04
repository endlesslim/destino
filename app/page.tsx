import Seal from "@/components/ui/Seal";
import Divider from "@/components/ui/Divider";
import WaitlistForm from "@/components/WaitlistForm";

export default function Home() {
  return (
    <main
      className="min-h-screen flex flex-col items-center px-6 py-16"
      style={{ background: "var(--bg-paper)" }}
    >
      <div className="w-full max-w-[440px] flex flex-col gap-10">

        {/* 헤더 */}
        <header className="flex items-center gap-3">
          <Seal size="md" char="命" className="animate-seal-pop" />
          <span
            className="text-sm font-black tracking-[0.15em] uppercase"
            style={{ color: "var(--ink-light)", fontFamily: "var(--font-display)" }}
          >
            DESTINO
          </span>
        </header>

        <Divider />

        {/* 히어로 */}
        <section className="flex flex-col gap-4 animate-fade-up">
          <div
            className="inline-block px-3 py-1 border-2 rounded-[3px] -rotate-[2deg] text-xs font-black tracking-wide w-fit"
            style={{ borderColor: "var(--seal)", color: "var(--seal)", fontFamily: "var(--font-display)" }}
          >
            교차점
          </div>

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
            사주, 서양 점성술, MBTI, 관상, 수비학, 타로.<br />
            모두 다른 언어로 당신을 설명하지만,<br />
            교차하는 지점은 하나입니다.
          </p>
        </section>

        <Divider />

        {/* 웨이트리스트 폼 */}
        <WaitlistForm />

        <Divider />

        {/* 6개 체계 */}
        <section className="flex flex-col gap-4">
          <p
            className="text-[11px] tracking-[0.1em] uppercase font-medium"
            style={{ color: "var(--ink-light)" }}
          >
            분석 체계
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "사주", sub: "천간·지지·오행", color: "var(--saju)" },
              { label: "서양 점성술", sub: "태양궁·상승궁·달궁", color: "var(--astro)" },
              { label: "MBTI", sub: "16가지 성격 유형", color: "var(--mbti)" },
              { label: "관상", sub: "오관·오행 체형", color: "var(--face)" },
              { label: "수비학", sub: "생명경로수·표현수", color: "var(--numero)" },
              { label: "타로", sub: "메이저 아르카나", color: "var(--tarot)" },
            ].map(({ label, sub, color }) => (
              <div
                key={label}
                className="rounded-lg p-4"
                style={{ background: "var(--bg-white)", border: "1px solid var(--border)" }}
              >
                <div
                  className="text-[10px] tracking-[0.08em] font-medium mb-1"
                  style={{ color }}
                >
                  ●
                </div>
                <div
                  className="text-sm font-bold"
                  style={{ color: "var(--ink)", fontFamily: "var(--font-display)" }}
                >
                  {label}
                </div>
                <div
                  className="text-[12px] mt-0.5"
                  style={{ color: "var(--ink-light)" }}
                >
                  {sub}
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
