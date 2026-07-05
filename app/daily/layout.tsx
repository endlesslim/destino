import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "오늘의 운세 — 오행으로 보는 하루 | DESTINO",
  description:
    "내 사주 일간과 오늘의 일진을 비교해 하루의 흐름을 읽습니다. 타로 세 장도 매일 새로.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
