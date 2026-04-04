import Link from "next/link";
import Seal from "@/components/ui/Seal";
import Divider from "@/components/ui/Divider";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관 — DESTINO",
  description: "DESTINO 서비스 이용약관",
};

const sections = [
  {
    title: "1. 서비스 소개",
    content:
      "DESTINO(이하 '서비스')는 동서양 운명 분석 교차 서비스입니다. 사주, 서양 점성술, 수비학 등 다양한 전통 체계를 교차 분석하여 이용자에게 통합적 운명 분석 결과를 제공합니다.",
  },
  {
    title: "2. 이용 조건",
    content:
      "본 서비스는 만 14세 이상의 개인이 이용할 수 있으며, 개인적 용도로만 사용하여야 합니다. 상업적 목적의 재배포, 복제, 가공은 금지됩니다.",
  },
  {
    title: "3. 분석 결과의 성격",
    content:
      "본 서비스의 분석 결과는 전통적 명리학, 서양 점성술, 수비학 등의 체계를 참고한 것으로, 학술적·과학적 근거에 기반한 의학적·법적 조언이 아닙니다. 분석 결과는 참고 자료로서의 성격만을 가지며, 중요한 의사결정의 유일한 근거로 사용하지 마시기 바랍니다.",
  },
  {
    title: "4. 결제 및 환불",
    content:
      "유료 서비스의 경우, 디지털 콘텐츠의 특성상 분석 결과를 열람한 이후에는 환불이 불가합니다. 결제 전 서비스 내용을 충분히 확인하시기 바랍니다. 결제 오류 또는 기술적 문제로 인한 미제공 시에는 전액 환불됩니다.",
  },
  {
    title: "5. 지식재산권",
    content:
      "서비스에서 제공하는 분석 결과, 텍스트, 디자인, 알고리즘 등 모든 콘텐츠의 저작권은 DESTINO에 있습니다. 이용자는 개인적 열람 목적으로만 결과를 사용할 수 있으며, 무단 복제·배포·수정은 금지됩니다.",
  },
  {
    title: "6. 면책 조항",
    content:
      "DESTINO는 분석 결과에 대한 의존으로 인해 발생하는 직접적·간접적 손해에 대하여 법적 책임을 지지 않습니다. 본 서비스의 결과는 오락 및 참고 목적으로 제공되며, 이용자의 판단과 행동에 대한 최종 책임은 이용자 본인에게 있습니다.",
  },
  {
    title: "7. 약관 변경",
    content:
      "본 약관은 서비스 운영상 필요에 따라 변경될 수 있습니다. 약관 변경 시 시행일 최소 7일 전에 서비스 내 공지를 통해 안내드리며, 변경된 약관은 공지된 시행일부터 효력이 발생합니다.",
  },
];

export default function TermsPage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center px-6 py-16"
      style={{ background: "var(--bg-paper)" }}
    >
      <div className="w-full max-w-[440px] flex flex-col gap-8">
        {/* Header */}
        <section className="flex flex-col items-center text-center gap-4">
          <Seal size="lg" char="命" />
          <h1
            className="text-[28px] font-black leading-[1.3] tracking-[-0.01em]"
            style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
          >
            이용약관
          </h1>
        </section>

        <Divider />

        {/* Sections */}
        <div className="flex flex-col gap-6">
          {sections.map(({ title, content }) => (
            <section key={title} className="flex flex-col gap-2">
              <h2
                className="text-[16px] font-bold"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--ink)",
                }}
              >
                {title}
              </h2>
              <p
                className="text-[14px] leading-[1.8]"
                style={{ color: "var(--ink-muted)" }}
              >
                {content}
              </p>
            </section>
          ))}
        </div>

        <Divider />

        {/* Effective date */}
        <p
          className="text-[13px] text-center"
          style={{ color: "var(--ink-light)" }}
        >
          시행일: 2026년 4월 4일
        </p>

        {/* Footer nav */}
        <footer
          className="text-center flex flex-col gap-3 py-4"
          style={{ color: "var(--ink-light)" }}
        >
          <div
            className="flex justify-center gap-4 text-[12px]"
            style={{ color: "var(--ink-light)" }}
          >
            <Link href="/" className="hover:underline">
              홈으로
            </Link>
            <span style={{ color: "var(--border)" }}>|</span>
            <Link href="/privacy" className="hover:underline">
              개인정보처리방침
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
