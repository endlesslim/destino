import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이름 풀이 | DESTINO",
  description:
    "이름의 획수와 오행이 사주와 어우러지는지 확인합니다.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
