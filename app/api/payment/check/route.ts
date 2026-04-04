// app/api/payment/check/route.ts
// Access token 유효성 검증 API

import { NextRequest, NextResponse } from "next/server";
import type { PaymentCheckResponse } from "@/lib/payment";
import crypto from "crypto";

const TOKEN_SECRET = process.env.TOKEN_SECRET || "destino-secret-key-change-in-production";

interface TokenPayload {
  paymentId: string;
  issuedAt: number;
  expiresAt: number;
  type: string;
}

/** HMAC-SHA256 서명된 토큰을 검증 */
function validateToken(token: string): boolean {
  const [payloadStr, signature] = token.split(".");
  if (!payloadStr || !signature) return false;

  const expectedSig = crypto.createHmac("sha256", TOKEN_SECRET).update(payloadStr).digest("base64url");
  if (signature !== expectedSig) return false;

  try {
    const payload: TokenPayload = JSON.parse(Buffer.from(payloadStr, "base64url").toString());

    // 타입 확인
    if (payload.type !== "destino_report_access") return false;

    // 만료 확인 (24시간)
    if (Date.now() > payload.expiresAt) return false;

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
