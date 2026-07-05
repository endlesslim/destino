"use client";

import Link from "next/link";
import Nav from "@/components/Nav";
import Seal from "@/components/ui/Seal";
import Divider from "@/components/ui/Divider";
import ScrollReveal from "@/components/ScrollReveal";
/* ━━━ 체계별 데이터 ━━━ */
const systems = [
  {
    key: "saju",
    label: "사주명리학",
    origin: "중국 한나라 (~2,000년 전)",
    years: "3,000년",
    color: "var(--saju)",
    bgColor: "color-mix(in srgb, var(--saju) 15%, transparent)",
    icon: "四",
    principle: "생년월일시의 천간·지지 8글자로 음양오행의 균형을 분석합니다.",
    history:
      "한(漢)나라 시대 음양오행설에 뿌리를 둔 사주명리학은 3,000년에 걸쳐 동아시아 전역에서 발전했습니다. 송(宋)대 서자평이 체계화한 이후, 수천만 건의 실증 사례가 축적되었습니다.",
    usage:
      "DESTINO는 천간·지지 조합에서 오행 균형, 일간 성격, 격국(格局)을 추출하여 20개 성격 축에 매핑합니다.",
  },
  {
    key: "astro",
    label: "서양 점성술",
    origin: "바빌로니아 (~4,000년 전)",
    years: "4,000년",
    color: "var(--astro)",
    bgColor: "color-mix(in srgb, var(--astro) 15%, transparent)",
    icon: "☉",
    principle: "출생 시각의 행성 배치와 황도 12궁의 관계를 분석합니다.",
    history:
      "메소포타미아 문명에서 시작된 점성술은 그리스·로마를 거쳐 현대 심리점성술로 진화했습니다. NASA JPL의 천문력(Ephemeris) 데이터를 참조하여 정밀한 행성 위치를 계산합니다.",
    usage:
      "태양궁·상승궁·달궁의 원소(불·흙·바람·물)와 양식(활동·고정·변통)을 추출하여 성격 축에 반영합니다.",
  },
  {
    key: "numero",
    label: "수비학",
    origin: "피타고라스 (~2,500년 전)",
    years: "2,500년",
    color: "var(--numero)",
    bgColor: "color-mix(in srgb, var(--numero) 15%, transparent)",
    icon: "Σ",
    principle: "생년월일과 이름의 숫자 진동(vibration)으로 인생 경로를 분석합니다.",
    history:
      "피타고라스는 '만물은 수(數)다'라고 선언했습니다. 2,500년간 발전한 수비학은 각 숫자가 고유한 진동 에너지를 가진다고 봅니다. 현대에는 성명학과 결합하여 운명수(Destiny Number) 분석으로 확장되었습니다.",
    usage:
      "생명경로수(Life Path Number)와 운명수를 산출하고, 108가지 패턴에서 성격 특성을 추출합니다.",
  },
  {
    key: "mbti",
    label: "MBTI",
    origin: "칼 융 심리 유형론 (1921년~)",
    years: "100년+",
    color: "var(--mbti)",
    bgColor: "color-mix(in srgb, var(--mbti) 15%, transparent)",
    icon: "Ψ",
    principle: "인지 기능 4축(에너지·인식·판단·생활양식)으로 성격 유형을 분류합니다.",
    history:
      "칼 구스타프 융의 《심리 유형》(1921)에서 시작된 유형론은 마이어스-브릭스 모녀에 의해 MBTI로 체계화되었습니다. 현대 성격 심리학과 Big Five 모델과의 상관 연구가 꾸준히 진행되고 있습니다.",
    usage:
      "16가지 유형의 인지 기능 스택을 분석하여 의사결정 패턴, 소통 방식, 스트레스 반응을 성격 축에 매핑합니다.",
  },
  {
    key: "ziwei",
    label: "자미두수",
    origin: "중국 송대 (~1,000년 전)",
    years: "1,000년",
    color: "var(--saju)",
    bgColor: "color-mix(in srgb, var(--saju) 15%, transparent)",
    icon: "紫",
    principle: "출생 시점의 명궁에 배치되는 14주성으로 운명의 지도를 그립니다.",
    history:
      "송대 도사 진희이가 창시했다고 전해지는 자미두수는 자미성을 비롯한 별들을 12궁에 배치해 명반(命盤)을 만드는 동양 점성술입니다. 사주와 함께 동양 명리학의 양대 축으로 꼽힙니다.",
    usage:
      "음력 생년월일시로 명궁과 오행국을 정하고 14주성의 배치를 계산하여, 사주의 오행 구조와 교차 검증합니다.",
  },
  {
    key: "tarot",
    label: "타로",
    origin: "15세기 이탈리아~",
    years: "600년",
    color: "var(--tarot)",
    bgColor: "color-mix(in srgb, var(--tarot) 15%, transparent)",
    icon: "⚶",
    principle: "메이저 아르카나 22장이 그리는 인생 여정의 원형(archetype)을 분석합니다.",
    history:
      "15세기 이탈리아에서 카드 게임으로 시작된 타로는 18세기 프랑스에서 점술 도구로 재탄생했습니다. 메이저 아르카나 22장은 '바보(The Fool)'에서 '세계(The World)'까지 인간 성장의 보편적 여정을 상징합니다.",
    usage:
      "생년월일에서 탄생 카드를 산출하고, 22가지 원형에서 인생 테마와 성장 과제를 추출합니다. (곧 출시)",
    comingSoon: true,
  },
];

/* ━━━ 타임라인 데이터 ━━━ */
const timelineItems = [
  { label: "서양 점성술", years: "4,000년", color: "var(--astro)", width: "100%" },
  { label: "사주명리학", years: "3,000년", color: "var(--saju)", width: "75%" },
  { label: "수비학", years: "2,500년", color: "var(--numero)", width: "62%" },
  { label: "자미두수", years: "1,000년", color: "var(--saju)", width: "25%" },
  { label: "타로", years: "600년", color: "var(--tarot)", width: "15%" },
  { label: "MBTI", years: "100년+", color: "var(--mbti)", width: "3%" },
];

/* ━━━ 20개 성격 축 (일부) ━━━ */
const personalityAxes = [
  "리더십 ↔ 협력",
  "직관 ↔ 분석",
  "도전 ↔ 안정",
  "내향 ↔ 외향",
  "창의 ↔ 실용",
  "독립 ↔ 관계",
  "행동 ↔ 사색",
  "감정 ↔ 논리",
];

export default function AboutPage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center px-5 py-10"
      style={{ background: "var(--bg-paper)" }}
    >
      <Nav />
      <div className="w-full max-w-[520px] flex flex-col pt-10">

        {/* ━━━ 히어로 ━━━ */}
        <section className="text-center mb-6 animate-fade-up">
          <Seal size="lg" char="法" className="mx-auto animate-seal-pop" />
          <p
            className="text-[11px] tracking-[0.15em] uppercase font-medium mt-4"
            style={{ color: "var(--ink-light)" }}
          >
            METHODOLOGY
          </p>
          <h1
            className="text-[30px] font-black leading-[1.3] tracking-[-0.02em] mt-2"
            style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
          >
            분석 방법론
          </h1>
          <p
            className="text-[15px] leading-[1.8] mt-3"
            style={{ color: "var(--ink-muted)" }}
          >
            과거와 현대를 관통하는 운명 분석의 교차점
          </p>
        </section>

        <Divider />

        {/* ━━━ Section 1: 교차점이란 ━━━ */}
        <ScrollReveal>
          <section className="flex flex-col gap-5">
            <p
              className="text-[11px] tracking-[0.1em] uppercase font-medium"
              style={{ color: "var(--ink-light)" }}
            >
              01 &mdash; 교차점이란
            </p>
            <h2
              className="text-[22px] font-black leading-[1.4] tracking-[-0.01em]"
              style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
            >
              여러 문명이 독립적으로<br />같은 결론에 도달한 지점
            </h2>

            <div className="flex flex-col gap-4">
              <p
                className="text-[15px] leading-[1.9]"
                style={{ color: "var(--ink-muted)" }}
              >
                수천 년간 독립적으로 발전한 동서양의 운명 분석 체계들이
                한 사람에 대해 같은 결론을 내리는 지점 &mdash; 그것이 <strong style={{ color: "var(--ink)" }}>교차점</strong>입니다.
              </p>
              <p
                className="text-[15px] leading-[1.9]"
                style={{ color: "var(--ink-muted)" }}
              >
                동아시아의 사주명리학은 음양오행으로, 바빌로니아에서 시작된 서양 점성술은
                행성과 별자리로, 피타고라스의 수비학은 숫자의 진동으로 &mdash;
                각기 다른 언어와 철학으로 인간의 본질을 탐구해왔습니다.
              </p>
              <p
                className="text-[15px] leading-[1.9]"
                style={{ fontFamily: "var(--font-display)", color: "var(--ink-medium)" }}
              >
                &ldquo;서로 만난 적 없는 문명들이 같은 답을 내릴 때,
                그것은 우연이 아니라 패턴입니다.&rdquo;
              </p>
            </div>

            {/* 타임라인 시각화 */}
            <div
              className="rounded-xl p-5 mt-2"
              style={{ background: "var(--bg-white)", border: "1px solid var(--border)" }}
            >
              <p
                className="text-[11px] tracking-[0.08em] uppercase font-medium mb-4"
                style={{ color: "var(--ink-light)" }}
              >
                수천 년의 수렴
              </p>
              <div className="flex flex-col gap-3">
                {timelineItems.map((item, i) => (
                  <ScrollReveal key={item.label} delay={i * 80}>
                    <div className="flex items-center gap-3">
                      <span
                        className="text-[12px] font-medium w-[72px] shrink-0 text-right"
                        style={{ color: item.color }}
                      >
                        {item.label}
                      </span>
                      <div className="flex-1 h-[6px] rounded-full overflow-hidden" style={{ background: "var(--bg-warm)" }}>
                        <div
                          className="h-full rounded-full animate-bar-grow"
                          style={{
                            width: item.width,
                            background: item.color,
                            opacity: 0.7,
                            animationDelay: `${0.3 + i * 0.15}s`,
                          }}
                        />
                      </div>
                      <span
                        className="text-[11px] w-[48px] shrink-0"
                        style={{ color: "var(--ink-light)" }}
                      >
                        {item.years}
                      </span>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
              <p
                className="text-[12px] mt-4 text-center"
                style={{ color: "var(--ink-faint)" }}
              >
                각 체계가 독립적으로 발전한 기간 &rarr; 하나의 교차점으로 수렴
              </p>
            </div>
          </section>
        </ScrollReveal>

        <Divider />

        {/* ━━━ Section 2: 분석 체계 ━━━ */}
        <ScrollReveal>
          <section className="flex flex-col gap-5">
            <p
              className="text-[11px] tracking-[0.1em] uppercase font-medium"
              style={{ color: "var(--ink-light)" }}
            >
              02 &mdash; 분석 체계
            </p>
            <h2
              className="text-[22px] font-black leading-[1.4] tracking-[-0.01em]"
              style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
            >
              6개 문명의 지혜
            </h2>
            <p
              className="text-[15px] leading-[1.9]"
              style={{ color: "var(--ink-muted)" }}
            >
              DESTINO는 인류 역사상 가장 오래 검증된 운명 분석 체계들을 교차 참조합니다.
            </p>
          </section>
        </ScrollReveal>

        <div className="flex flex-col gap-4 mt-5">
          {systems.map((sys, i) => (
            <ScrollReveal key={sys.key} delay={i * 60}>
              <div
                className={`rounded-xl p-5 relative ${sys.comingSoon ? "" : "hover-lift"}`}
                style={{
                  background: "var(--bg-white)",
                  border: "1px solid var(--border)",
                  opacity: sys.comingSoon ? 0.6 : 1,
                }}
              >
                {/* 헤더 */}
                <div className="flex items-start gap-3 mb-3">
                  <span
                    className="w-10 h-10 shrink-0 inline-flex items-center justify-center rounded-lg text-[18px] font-black"
                    style={{
                      background: sys.bgColor,
                      color: sys.color,
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {sys.icon}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3
                        className="text-[16px] font-bold"
                        style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
                      >
                        {sys.label}
                      </h3>
                      {sys.comingSoon && (
                        <span
                          className="text-[9px] tracking-[0.05em] font-medium px-1.5 py-0.5 rounded"
                          style={{ background: "var(--bg-warm)", color: "var(--ink-light)" }}
                        >
                          곧 출시
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] mt-0.5" style={{ color: sys.color }}>
                      {sys.origin} &middot; {sys.years}
                    </p>
                  </div>
                </div>

                {/* 원리 */}
                <p
                  className="text-[14px] leading-[1.8] font-medium mb-2"
                  style={{ color: "var(--ink-medium)" }}
                >
                  {sys.principle}
                </p>

                {/* 역사 */}
                <p
                  className="text-[13px] leading-[1.8] mb-2"
                  style={{ color: "var(--ink-muted)" }}
                >
                  {sys.history}
                </p>

                {/* DESTINO 활용 */}
                <div
                  className="rounded-lg p-3 mt-2"
                  style={{ background: sys.bgColor }}
                >
                  <p
                    className="text-[11px] tracking-[0.06em] uppercase font-medium mb-1"
                    style={{ color: sys.color }}
                  >
                    DESTINO 활용
                  </p>
                  <p
                    className="text-[13px] leading-[1.7]"
                    style={{ color: "var(--ink-medium)" }}
                  >
                    {sys.usage}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <Divider />

        {/* ━━━ Section 3: 교차 분석 알고리즘 ━━━ */}
        <ScrollReveal>
          <section className="flex flex-col gap-5">
            <p
              className="text-[11px] tracking-[0.1em] uppercase font-medium"
              style={{ color: "var(--ink-light)" }}
            >
              03 &mdash; 교차 분석 알고리즘
            </p>
            <h2
              className="text-[22px] font-black leading-[1.4] tracking-[-0.01em]"
              style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
            >
              수렴의 수학
            </h2>

            {/* Step 1 */}
            <div
              className="rounded-xl p-5"
              style={{ background: "var(--bg-white)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="w-7 h-7 shrink-0 inline-flex items-center justify-center rounded-full text-[12px] font-bold"
                  style={{ background: "var(--bg-warm)", color: "var(--ink-medium)", fontFamily: "var(--font-display)" }}
                >
                  1
                </span>
                <h3 className="text-[15px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}>
                  성격 축 매핑
                </h3>
              </div>
              <p className="text-[14px] leading-[1.8]" style={{ color: "var(--ink-muted)" }}>
                각 분석 체계의 결과를 <strong style={{ color: "var(--ink)" }}>20개 성격 축</strong>으로 변환합니다.
                서로 다른 언어로 표현된 결과가 하나의 좌표계에 놓이는 순간입니다.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {personalityAxes.map((axis) => (
                  <span
                    key={axis}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                    style={{ background: "var(--bg-warm)", color: "var(--ink-medium)" }}
                  >
                    {axis}
                  </span>
                ))}
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <span className="text-[18px] animate-pulse-subtle" style={{ color: "var(--ink-faint)" }}>
                ↓
              </span>
            </div>

            {/* Step 2 */}
            <div
              className="rounded-xl p-5"
              style={{ background: "var(--bg-white)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="w-7 h-7 shrink-0 inline-flex items-center justify-center rounded-full text-[12px] font-bold"
                  style={{ background: "var(--bg-warm)", color: "var(--ink-medium)", fontFamily: "var(--font-display)" }}
                >
                  2
                </span>
                <h3 className="text-[15px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}>
                  교차점 발견
                </h3>
              </div>
              <p className="text-[14px] leading-[1.8]" style={{ color: "var(--ink-muted)" }}>
                <strong style={{ color: "var(--ink)" }}>2개 이상의 체계가 같은 축을 가리킬 때</strong>, 교차점이 발견됩니다.
                예를 들어 사주에서 &lsquo;갑목(甲木)&rsquo;이 리더십을 가리키고,
                서양 점성술에서 양자리 태양이 같은 방향을 가리킨다면 &mdash;
                그것은 동서양이 독립적으로 발견한 당신의 본질입니다.
              </p>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <span className="text-[18px] animate-pulse-subtle" style={{ color: "var(--ink-faint)" }}>
                ↓
              </span>
            </div>

            {/* Step 3 */}
            <div
              className="rounded-xl p-5"
              style={{ background: "var(--bg-white)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="w-7 h-7 shrink-0 inline-flex items-center justify-center rounded-full text-[12px] font-bold"
                  style={{ background: "var(--bg-warm)", color: "var(--ink-medium)", fontFamily: "var(--font-display)" }}
                >
                  3
                </span>
                <h3 className="text-[15px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}>
                  수렴률 산출
                </h3>
              </div>
              <p className="text-[14px] leading-[1.8] mb-3" style={{ color: "var(--ink-muted)" }}>
                교차점의 강도를 정량화합니다.
              </p>
              <div
                className="rounded-lg p-4"
                style={{ background: "var(--bg-paper)" }}
              >
                <p
                  className="text-[14px] font-bold text-center leading-[2]"
                  style={{ fontFamily: "var(--font-display)", color: "var(--seal)" }}
                >
                  수렴률 = 교차점 빈도 &times; 강도 &times; 원소 조화도
                </p>
              </div>
              <p className="text-[13px] leading-[1.8] mt-3" style={{ color: "var(--ink-muted)" }}>
                빈도는 몇 개의 체계가 동의하는지, 강도는 각 체계 내에서 해당 특성이 얼마나
                두드러지는지, 원소 조화도는 오행·사원소 간의 상생 관계를 반영합니다.
              </p>
            </div>

            {/* 통계 강조 */}
            <ScrollReveal delay={200}>
              <div
                className="rounded-xl p-5 mt-2 text-center"
                style={{ background: "var(--seal-bg)", border: "1px solid color-mix(in srgb, var(--seal) 18%, transparent)" }}
              >
                <p
                  className="text-[13px] leading-[1.9]"
                  style={{ fontFamily: "var(--font-display)", color: "var(--seal-dark)" }}
                >
                  이 알고리즘은<br />
                  <strong className="text-[20px]">1,080</strong>가지 천간-별자리 조합과<br />
                  <strong className="text-[20px]">108</strong>가지 생명경로수 패턴을<br />
                  교차 참조합니다.
                </p>
              </div>
            </ScrollReveal>
          </section>
        </ScrollReveal>

        <Divider />

        {/* ━━━ Section 4: 왜 교차점이 중요한가 ━━━ */}
        <ScrollReveal>
          <section className="flex flex-col gap-5">
            <p
              className="text-[11px] tracking-[0.1em] uppercase font-medium"
              style={{ color: "var(--ink-light)" }}
            >
              04 &mdash; 왜 교차점이 중요한가
            </p>
            <h2
              className="text-[22px] font-black leading-[1.4] tracking-[-0.01em]"
              style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
            >
              하나의 답이 아닌,<br />여러 문명의 합의
            </h2>

            <div className="flex flex-col gap-4">
              <p className="text-[15px] leading-[1.9]" style={{ color: "var(--ink-muted)" }}>
                단일 체계는 한 문명의 관점에 불과합니다. 사주명리학만으로는 동아시아의 시선으로만
                당신을 바라보게 되고, 서양 점성술만으로는 지중해 문명의 렌즈만 사용하게 됩니다.
              </p>
              <p className="text-[15px] leading-[1.9]" style={{ color: "var(--ink-muted)" }}>
                교차점은 <strong style={{ color: "var(--ink)" }}>여러 문명이 독립적으로 같은 결론에 도달한 증거</strong>입니다.
                서로 다른 대륙에서, 서로 다른 시대에, 서로 다른 철학으로 발전한 체계들이
                당신에 대해 같은 답을 내릴 때 &mdash; 그것은 단순한 점술을 넘어 인류 지혜의 수렴입니다.
              </p>

              <div
                className="rounded-xl p-5"
                style={{ background: "var(--bg-white)", border: "1px solid var(--border)" }}
              >
                <p
                  className="text-[15px] leading-[1.9] text-center"
                  style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
                >
                  &ldquo;하나의 체계가 틀릴 수 있습니다.<br />
                  하지만 세 개의 체계가<br />
                  같은 답을 내릴 확률은<br />
                  <span style={{ color: "var(--seal)" }}>우연이 아닙니다.</span>&rdquo;
                </p>
              </div>

              {/* 비유: 단일 vs 교차 */}
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div
                  className="rounded-lg p-4 text-center"
                  style={{ background: "var(--bg-white)", border: "1px solid var(--border)" }}
                >
                  <p className="text-[24px] mb-2" style={{ opacity: 0.4 }}>1</p>
                  <p className="text-[13px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--ink-light)" }}>
                    단일 체계
                  </p>
                  <p className="text-[12px] mt-1" style={{ color: "var(--ink-faint)" }}>
                    한 문명의 관점
                  </p>
                </div>
                <div
                  className="rounded-lg p-4 text-center"
                  style={{ background: "var(--seal-bg)", border: "1px solid color-mix(in srgb, var(--seal) 18%, transparent)" }}
                >
                  <p className="text-[24px] mb-2" style={{ color: "var(--seal)" }}>3+</p>
                  <p className="text-[13px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--seal-dark)" }}>
                    교차 분석
                  </p>
                  <p className="text-[12px] mt-1" style={{ color: "var(--seal)" }}>
                    문명 간 합의
                  </p>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        <Divider />

        {/* ━━━ CTA ━━━ */}
        <ScrollReveal>
          <section className="text-center flex flex-col items-center gap-5 mb-6">
            <Seal size="md" char="命" />
            <p
              className="text-[15px] leading-[1.8]"
              style={{ fontFamily: "var(--font-display)", color: "var(--ink-medium)" }}
            >
              당신의 교차점을 발견할 준비가 되셨나요?
            </p>
            <Link
              href="/analyze"
              className="w-full max-w-[320px] py-3.5 text-center text-[15px] font-bold tracking-wide rounded-lg transition-all hover:opacity-90 active:opacity-80"
              style={{
                background: "var(--seal)",
                color: "#fff",
                fontFamily: "var(--font-display)",
                boxShadow: "0 4px 16px var(--shadow-btn)",
              }}
            >
              무료로 분석하기
            </Link>
          </section>
        </ScrollReveal>

        {/* ━━━ 푸터 ━━━ */}
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
            <Link href="/" className="hover:underline">홈</Link>
            <span style={{ color: "var(--border)" }}>|</span>
            <Link href="/analyze" className="hover:underline">교차 분석</Link>
            <span style={{ color: "var(--border)" }}>|</span>
            <Link href="/compatibility" className="hover:underline">궁합 분석</Link>
          </div>
          <p className="text-[12px]" style={{ color: "var(--ink-faint)" }}>
            &copy; {new Date().getFullYear()} DESTINO. All rights reserved.
          </p>
        </footer>

      </div>
    </main>
  );
}
