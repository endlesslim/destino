import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "궁합 분석 — 사주도 별자리도 같은 답인지 | DESTINO",
  description:
    "두 사람의 궁합을 사주·별자리·수비학·MBTI로 교차 확인합니다.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
