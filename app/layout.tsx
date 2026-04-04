import type { Metadata } from "next";
import { Noto_Serif_KR } from "next/font/google";
import "./globals.css";

const notoSerifKR = Noto_Serif_KR({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DESTINO — 6개 문명이 내린 같은 답",
  description: "사주, 서양 점성술, MBTI, 관상, 수비학, 타로를 교차 분석해서 당신의 교차점을 찾아드립니다.",
  openGraph: {
    title: "DESTINO",
    description: "6개 문명이 내린 같은 답",
    siteName: "DESTINO",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${notoSerifKR.variable} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
