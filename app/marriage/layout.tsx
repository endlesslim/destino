import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "결혼 궁합 심화 분석 | DESTINO",
  description:
    "사주·별자리·수비학·MBTI에게 다시 물은 두 사람의 결혼 궁합 — 5개 차원 심화 분석.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
