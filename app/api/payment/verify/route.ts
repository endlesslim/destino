// app/api/payment/verify/route.ts
// 결제 검증 API — PortOne 결제 완료 후 서버 사이드 검증

import { NextRequest, NextResponse } from "next/server";
import { PAYMENT_CONFIG, type PaymentVerifyResponse } from "@/lib/payment";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  issueReferralCode,
  isValidReferralCode,
  findUnusedCoupon,
  markCouponUsed,
  issueReferralReward,
} from "@/lib/referral-server";
import * as fs from "fs";
import * as path from "path";
import crypto from "crypto";

const PAYMENTS_FILE = path.join("/tmp", "destino-payments.json");

const TOKEN_SECRET = process.env.TOKEN_SECRET || "destino-secret-key-change-in-production";

/** Access token 생성 (HMAC-SHA256 서명된 토큰) */
function createAccessToken(paymentId: string): string {
  const payload = {
    paymentId,
    issuedAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24시간
    type: "destino_report_access",
  };
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", TOKEN_SECRET).update(payloadStr).digest("base64url");
  return `${payloadStr}.${signature}`;
}

/** 결제 기록 저장 (파일 기반, 프로덕션에서는 DB 사용) */
function savePaymentRecord(record: {
  paymentId: string;
  orderName: string;
  amount: number;
  paidAt: string;
  accessToken: string;
}) {
  let records: Record<string, unknown>[] = [];
  try {
    if (fs.existsSync(PAYMENTS_FILE)) {
      const data = fs.readFileSync(PAYMENTS_FILE, "utf-8");
      records = JSON.parse(data);
    }
  } catch {
    records = [];
  }
  records.push(record);
  fs.writeFileSync(PAYMENTS_FILE, JSON.stringify(records, null, 2), "utf-8");
}

export async function POST(request: NextRequest): Promise<NextResponse<PaymentVerifyResponse>> {
  try {
    const body = await request.json();
    const { paymentId, orderName, couponCode, refCode } = body;

    if (!paymentId || !orderName) {
      return NextResponse.json(
        { success: false, error: "paymentId와 orderName이 필요합니다." },
        { status: 400 },
      );
    }

    // ── 할인 검증 (클라이언트가 보낸 코드를 서버에서 재검증) ──
    // 프로덕션에서는 PortOne 결제 금액과 (정가 - 할인) 일치 여부까지 검증할 것
    let discountPct = 0;
    let appliedCoupon: string | null = null;
    let appliedRef: string | null = null;
    if (couponCode && typeof couponCode === "string") {
      const coupon = await findUnusedCoupon(couponCode.trim().toUpperCase());
      if (coupon) {
        discountPct = coupon.discountPct;
        appliedCoupon = coupon.code;
      }
    }
    if (!appliedCoupon && refCode && typeof refCode === "string") {
      const normalized = refCode.trim().toUpperCase();
      if (await isValidReferralCode(normalized)) {
        discountPct = 50;
        appliedRef = normalized;
      }
    }
    const expectedAmount = Math.round(PAYMENT_CONFIG.price * (100 - discountPct) / 100);

    /**
     * 프로덕션 결제 검증:
     *
     * PortOne V2 API로 실제 결제 상태를 확인합니다.
     * .env.local에 PORTONE_API_SECRET 설정 필요.
     *
     * const PORTONE_API_SECRET = process.env.PORTONE_API_SECRET;
     * if (!PORTONE_API_SECRET) {
     *   return NextResponse.json(
     *     { success: false, error: "서버 설정 오류" },
     *     { status: 500 },
     *   );
     * }
     *
     * const verifyResponse = await fetch(
     *   `https://api.portone.io/payments/${encodeURIComponent(paymentId)}`,
     *   {
     *     headers: {
     *       Authorization: `PortOne ${PORTONE_API_SECRET}`,
     *     },
     *   },
     * );
     *
     * if (!verifyResponse.ok) {
     *   return NextResponse.json(
     *     { success: false, error: "결제 검증에 실패했습니다." },
     *     { status: 400 },
     *   );
     * }
     *
     * const payment = await verifyResponse.json();
     *
     * if (payment.status !== "PAID") {
     *   return NextResponse.json(
     *     { success: false, error: "결제가 완료되지 않았습니다." },
     *     { status: 400 },
     *   );
     * }
     *
     * if (payment.amount.total !== PAYMENT_CONFIG.price) {
     *   return NextResponse.json(
     *     { success: false, error: "결제 금액이 일치하지 않습니다." },
     *     { status: 400 },
     *   );
     * }
     */

    // 테스트 모드: 결제 성공으로 간주하고 기록 저장
    const accessToken = createAccessToken(paymentId);
    const paidAt = new Date().toISOString();

    // Save to Supabase when configured
    if (isSupabaseConfigured()) {
      await supabase.from("payments").insert({
        payment_id: paymentId,
        amount: expectedAmount,
        product: orderName,
        status: "paid",
      });
    }

    // 로컬 개발 폴백 (Supabase 미설정 시에만; 서버리스에서 /tmp는 휘발성)
    if (!isSupabaseConfigured()) {
      try {
        savePaymentRecord({
          paymentId,
          orderName,
          amount: expectedAmount,
          paidAt,
          accessToken,
        });
      } catch {
        // 파일 기록 실패는 결제 성공에 영향 없음
      }
    }

    // ── 추천/쿠폰 후처리 ──
    // 1) 이 결제자에게 새 추천코드 발급 (공유용)
    let myReferralCode: string | null = null;
    try {
      myReferralCode = await issueReferralCode(paymentId);
    } catch {
      // 추천코드 발급 실패는 결제 성공에 영향 없음
    }
    // 2) 사용한 쿠폰 소진 처리
    if (appliedCoupon) {
      try { await markCouponUsed(appliedCoupon, paymentId); } catch {}
    }
    // 3) 추천 성사 → 추천인에게 50% 보상 쿠폰 발급
    if (appliedRef) {
      try { await issueReferralReward(appliedRef); } catch {}
    }

    return NextResponse.json({
      success: true,
      accessToken,
      referralCode: myReferralCode,
      paidAmount: expectedAmount,
      discountPct,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { success: false, error: "결제 처리 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
