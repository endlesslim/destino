import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "자미두수 명반 | DESTINO",
  description:
    "명궁에 배치된 14주성이 그리는 운명의 지도 — 무료로 펼쳐보세요.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
