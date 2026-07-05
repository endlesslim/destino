import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "크로스체크 카드 | DESTINO",
  description:
    "사주, 자미두수, 점성술, 수비학, 타로, MBTI — 답이 겹친 지점만 담은 크로스체크 카드 20편.",
};

export default function CardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
