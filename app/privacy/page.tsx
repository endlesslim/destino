import Link from "next/link";
import Seal from "@/components/ui/Seal";
import Divider from "@/components/ui/Divider";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침 — DESTINO",
  description: "DESTINO 개인정보처리방침",
};

const sections = [
  {
    title: "1. 수집하는 개인정보",
    content:
      "DESTINO는 운명 분석 서비스 제공을 위해 다음의 정보를 수집합니다.\n\n필수 항목: 생년월일 (양력/음력 구분 포함)\n선택 항목: 이름, 이메일 주소\n\n선택 항목은 서비스 이용에 필수적이지 않으며, 미입력 시에도 핵심 분석 기능을 이용하실 수 있습니다.",
  },
  {
    title: "2. 수집 목적",
    content:
      "수집한 개인정보는 다음의 목적으로만 사용됩니다.\n\n- 사주, 점성술, 수비학 등 운명 분석 서비스 제공\n- 서비스 품질 개선 및 이용 통계 분석\n- 이용자 문의 응대",
  },
  {
    title: "3. 보유 기간",
    content:
      "DESTINO는 이용자의 분석 결과를 서버에 보관하지 않습니다. 모든 분석 결과는 이용자의 브라우저 로컬 스토리지(localStorage)에 저장되며, 서버 측에는 분석에 필요한 임시 데이터만 처리 후 즉시 삭제됩니다.",
  },
  {
    title: "4. 제3자 제공",
    content:
      "DESTINO는 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 법령에 의한 요청이 있는 경우에 한해 관계 기관에 제공할 수 있습니다.",
  },
  {
    title: "5. 이용자의 권리",
    content:
      "이용자는 언제든지 자신의 데이터를 삭제할 수 있습니다. 브라우저의 사이트 데이터 삭제 기능을 통해 저장된 모든 분석 결과 및 입력 정보를 완전히 제거할 수 있습니다. 별도의 회원 탈퇴 절차는 필요하지 않습니다.",
  },
  {
    title: "6. 쿠키 사용",
    content:
      "DESTINO는 언어 선택 등 기능적 목적으로만 쿠키 및 로컬 스토리지를 사용합니다. 광고 추적 목적의 쿠키는 사용하지 않습니다. 서비스 개선을 위한 익명화된 분석 도구(Google Analytics)를 사용할 수 있으며, 이 경우 개인을 식별할 수 없는 통계 정보만 수집됩니다.",
  },
  {
    title: "7. 개인정보 보호책임자",
    content:
      "개인정보 처리에 관한 문의사항은 아래 연락처로 문의해 주시기 바랍니다.\n\n담당자: 개인정보 보호책임자\n이메일: privacy@destino.kr",
  },
];

export default function PrivacyPage() {
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
            개인정보처리방침
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
                className="text-[14px] leading-[1.8] whitespace-pre-line"
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
            <Link href="/terms" className="hover:underline">
              이용약관
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
