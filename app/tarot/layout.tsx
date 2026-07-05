import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "타로 리딩 — 탄생 카드와 오늘의 스프레드 | DESTINO",
  description:
    "생년월일이 가리키는 탄생 카드와 78장 풀덱에서 뽑는 오늘의 세 장.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
