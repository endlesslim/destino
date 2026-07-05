import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "분석 기록 | DESTINO",
  description:
    "지난 교차 분석 결과를 다시 확인합니다.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
