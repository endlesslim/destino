// app/api/interpret/route.ts
// AI 맞춤 해석 엔드포인트 — Claude API 또는 로컬 폴백

import { NextRequest, NextResponse } from "next/server";
import { getInterpretation } from "@/lib/claude";
import { type CrosspointResult } from "@/lib/cross-engine";

export async function POST(request: NextRequest) {
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
