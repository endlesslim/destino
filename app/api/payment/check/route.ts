// app/api/payment/check/route.ts
// Access token 유효성 검증 API

import { NextRequest, NextResponse } from "next/server";
import type { PaymentCheckResponse } from "@/lib/payment";

interface TokenPayload {
  paymentId: string;
  issuedAt: number;
  expiresAt: number;
  type: string;
}

/** base64url 토큰을 디코딩하여 검증 */
function validateToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const payload: TokenPayload = JSON.parse(decoded);

    // 타입 확인
    if (payload.type !== "destino_report_access") {
      return false;
    }

    // 만료 확인 (24시간)
    if (Date.now() > payload.expiresAt) {
      return false;
    }

    // paymentId 형식 확인
    if (!payload.paymentId || !payload.paymentId.startsWith("destino_")) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<PaymentCheckResponse>> {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    const valid = validateToken(token);
    return NextResponse.json({ valid });
  } catch {
    return NextResponse.json({ valid: false }, { status: 400 });
  }
}
