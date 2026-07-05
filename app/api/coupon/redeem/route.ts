// app/api/coupon/redeem/route.ts
// 열람 코드 사용 — 코드를 1회용으로 소진하고 열람 토큰(사용 시점부터 24시간)을 발급
// POST { code } → { valid, accessToken }

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { findUnusedCoupon, markCouponUsed } from "@/lib/referral-server";

const TOKEN_SECRET = process.env.TOKEN_SECRET || "destino-secret-key-change-in-production";
const VIEW_HOURS = 24;

function createAccessToken(paymentId: string): string {
  const payload = {
    paymentId,
    issuedAt: Date.now(),
    expiresAt: Date.now() + VIEW_HOURS * 60 * 60 * 1000,
    type: "destino_report_access",
  };
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", TOKEN_SECRET).update(payloadStr).digest("base64url");
  return `${payloadStr}.${signature}`;
}

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    if (!code || typeof code !== "string") {
      return NextResponse.json({ valid: false }, { status: 400 });
    }
    const normalized = code.trim().toUpperCase();

    const coupon = await findUnusedCoupon(normalized);
    if (!coupon || coupon.source !== "unlock") {
      return NextResponse.json({ valid: false });
    }

    // 원자적 소진 — 동시 입력 레이스에서도 정확히 한 명만 토큰을 받음
    const paymentId = `code_${normalized}_${Date.now()}`;
    const consumed = await markCouponUsed(normalized, paymentId);
    if (!consumed) {
      return NextResponse.json({ valid: false });
    }

    return NextResponse.json({
      valid: true,
      accessToken: createAccessToken(paymentId),
    });
  } catch {
    return NextResponse.json({ valid: false }, { status: 400 });
  }
}
