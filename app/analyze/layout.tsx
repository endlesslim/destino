import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "운명의 교차점 분석 | DESTINO",
  description:
    "사주, 점성술, MBTI, 관상, 수비학, 타로 — 6개 문명의 시선으로 당신의 운명 교차점을 분석합니다.",
};

export default function AnalyzeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
