import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "커리어 심화 분석 | DESTINO",
  description:
    "사주·별자리·수비학·MBTI의 답이 겹친 직업 방향 TOP 5.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
