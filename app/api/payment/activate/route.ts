// app/api/payment/activate/route.ts
// 판매 링크 첫 개봉 → 열람 토큰 활성화
// 개봉 대기 토큰(destino_link_activation)을 검증하고,
// "지금부터 viewDays일" 유효한 열람 토큰(destino_report_access)으로 교환한다.

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const TOKEN_SECRET = process.env.TOKEN_SECRET || "destino-secret-key-change-in-production";

interface ActivationPayload {
  paymentId: string;
  issuedAt: number;
  expiresAt: number; // 개봉 기한
  viewDays: number;
  type: string;
}

function verifyActivationToken(token: string): ActivationPayload | null {
  const [payloadStr, signature] = token.split(".");
  if (!payloadStr || !signature) return null;
  const expected = crypto.createHmac("sha256", TOKEN_SECRET).update(payloadStr).digest("base64url");
  if (signature !== expected) return null;
  try {
    const payload: ActivationPayload = JSON.parse(Buffer.from(payloadStr, "base64url").toString());
    if (payload.type !== "destino_link_activation") return null;
    if (Date.now() > payload.expiresAt) return null; // 개봉 기한 초과
    return payload;
  } catch {
    return null;
  }
}

function createAccessToken(paymentId: string, viewDays: number): { token: string; expiresAt: number } {
  const expiresAt = Date.now() + viewDays * 24 * 60 * 60 * 1000;
  const payload = {
    paymentId,
    issuedAt: Date.now(),
    expiresAt,
    type: "destino_report_access",
  };
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", TOKEN_SECRET).update(payloadStr).digest("base64url");
  return { token: `${payloadStr}.${signature}`, expiresAt };
}

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    if (!token || typeof token !== "string") {
      return NextResponse.json({ valid: false }, { status: 400 });
    }
    const payload = verifyActivationToken(token);
    if (!payload) {
      return NextResponse.json({ valid: false });
    }
    const viewDays = Math.min(Math.max(payload.viewDays || 1, 1), 90);
    const access = createAccessToken(payload.paymentId, viewDays);
    return NextResponse.json({
      valid: true,
      accessToken: access.token,
      expiresAt: access.expiresAt,
    });
  } catch {
    return NextResponse.json({ valid: false }, { status: 400 });
  }
}
