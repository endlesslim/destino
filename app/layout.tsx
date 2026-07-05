import type { Metadata, Viewport } from "next";
import { Noto_Serif_KR } from "next/font/google";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import BottomTab from "@/components/BottomTab";
import "./globals.css";

const notoSerifKR = Noto_Serif_KR({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-XXXXXXXXXX";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#F5F0E8",
};

export const metadata: Metadata = {
  title: {
    default: "DESTINO — 사주도 별자리도 같은 답",
    template: "%s",
  },
  description:
    "사주, 자미두수, 서양 점성술, 수비학, 타로, MBTI를 교차 분석해서 당신의 운명 교차점을 찾아드립니다.",
  keywords: [
    "사주",
    "점성술",
    "MBTI",
    "자미두수",
    "수비학",
    "타로",
    "운명",
    "크로스체크",
    "DESTINO",
    "운세",
    "사주팔자",
    "별자리",
    "성격 분석",
  ],
  authors: [{ name: "DESTINO" }],
  creator: "DESTINO",
  metadataBase: new URL("https://destino.kr"),
  alternates: {
    canonical: "/",
    languages: {
      "ko-KR": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://destino.kr",
    title: "DESTINO — 사주도 별자리도 같은 답",
    description:
      "사주, 자미두수, 서양 점성술, 수비학, 타로, MBTI를 교차 분석해서 당신의 운명 교차점을 찾아드립니다.",
    siteName: "DESTINO",
  },
  twitter: {
    card: "summary_large_image",
    title: "DESTINO — 사주도 별자리도 같은 답",
    description:
      "사주, 자미두수, 서양 점성술, 수비학, 타로, MBTI를 교차 분석해서 당신의 운명 교차점을 찾아드립니다.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${notoSerifKR.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col pb-16 md:pb-0" suppressHydrationWarning>
        <GoogleAnalytics measurementId={GA_MEASUREMENT_ID} />
        {children}
        <BottomTab />
      </body>
    </html>
  );
}
