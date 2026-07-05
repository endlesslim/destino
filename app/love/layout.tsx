import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "연애 심화 분석 | DESTINO",
  description:
    "사주·별자리·수비학·MBTI의 답이 겹치는 당신의 연애 패턴과 이상형.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
