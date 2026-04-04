// app/api/interpret/route.ts
// AI 맞춤 해석 엔드포인트 — Claude API 또는 로컬 폴백

import { NextRequest, NextResponse } from "next/server";
import { getInterpretation } from "@/lib/claude";
import { type CrosspointResult } from "@/lib/cross-engine";

// ---------------------------------------------------------------------------
// In-memory rate limiting: max 5 requests per IP per hour
// ---------------------------------------------------------------------------
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);
  rateLimitMap.set(ip, recent);
  return recent.length >= RATE_LIMIT_MAX;
}

function recordRequest(ip: string): void {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) ?? [];
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
}

export async function POST(request: NextRequest) {
  // Resolve client IP
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0]?.trim() ?? realIp ?? "127.0.0.1";

  // Rate limit check
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "요청이 너무 많습니다. 1시간 후 다시 시도해주세요." },
      { status: 429 },
    );
  }

  try {
    const body = await request.json();
    const result = body as CrosspointResult;

    // 최소 유효성 검증
    if (!result.saju || !result.western || !result.numerology) {
      return NextResponse.json(
        { error: "유효하지 않은 분석 결과입니다." },
        { status: 400 },
      );
    }

    recordRequest(ip);
    const interpretation = await getInterpretation(result);

    return NextResponse.json({ interpretation });
  } catch (error) {
    console.error("[interpret] Error:", error);
    return NextResponse.json(
      { error: "해석 생성에 실패했습니다." },
      { status: 500 },
    );
  }
}
