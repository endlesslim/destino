import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "운명의 교차점 분석 | DESTINO",
  description:
    "같은 질문을 사주, 자미두수, 점성술, 수비학, 타로, MBTI에 따로 묻고, 답이 겹치는 교차점만 보여드립니다.",
};

export default function AnalyzeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
