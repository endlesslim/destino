import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "가족 분석 | DESTINO",
  description:
    "가족 구성원의 사주를 비교해 관계의 역학을 읽습니다.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
