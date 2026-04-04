import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "DESTINO — 6개 문명이 내린 같은 답";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F5F0E8",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Seal character */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 120,
            height: 120,
            border: "4px solid #C53D43",
            borderRadius: 8,
            marginBottom: 32,
          }}
        >
          <span
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: "#C53D43",
              lineHeight: 1,
            }}
          >
            命
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            color: "#1C1917",
            letterSpacing: "0.12em",
            marginBottom: 16,
          }}
        >
          DESTINO
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            color: "#3D3229",
            marginBottom: 40,
          }}
        >
          6개 문명이 내린 같은 답
        </div>

        {/* Bottom systems */}
        <div
          style={{
            fontSize: 18,
            color: "#6B5E53",
            letterSpacing: "0.08em",
          }}
        >
          사주 · 점성술 · MBTI · 관상 · 수비학 · 타로
        </div>
      </div>
    ),
    { ...size }
  );
}
