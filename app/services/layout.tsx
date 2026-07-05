import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "전체 서비스 | DESTINO",
  description:
    "사주·자미두수·점성술·수비학·타로·MBTI — 교차 검증 운명 분석 전체 메뉴.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
