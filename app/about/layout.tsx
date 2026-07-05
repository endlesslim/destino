import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "분석 방법론 | DESTINO",
  description:
    "같은 질문을 여섯 번 묻고 겹치는 답만 남기는 DESTINO의 교차 검증 방법론.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
