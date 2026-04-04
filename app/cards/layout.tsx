import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "문명 크로스체크 카드 | DESTINO",
  description:
    "6개 문명이 교차 분석한 결과를 카드 형태로 확인하세요. 사주, 점성술, MBTI, 관상, 수비학, 타로의 통합 인사이트.",
};

export default function CardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
