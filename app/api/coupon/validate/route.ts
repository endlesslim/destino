// app/api/coupon/validate/route.ts
// 쿠폰/추천코드 유효성 확인 API
// POST { code } → { valid, discountPct, kind: 'coupon' | 'referral' }

import { NextRequest, NextResponse } from "next/server";
import {
  findUnusedCoupon,
  isValidReferralCode,
  REFERRAL_DISCOUNT_PCT,
} from "@/lib/referral-server";

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    if (!code || typeof code !== "string") {
      return NextResponse.json({ valid: false }, { status: 400 });
    }
    const normalized = code.trim().toUpperCase();

    // 1) 보유 쿠폰 (RW-...) 또는 열람 코드 (OPEN-...)
    const coupon = await findUnusedCoupon(normalized);
    if (coupon) {
      // 열람 코드는 할인이 아니라 즉시 잠금 해제 대상
      const kind = coupon.source === "unlock" ? "unlock" : "coupon";
      return NextResponse.json({ valid: true, discountPct: coupon.discountPct, kind });
    }

    // 2) 추천코드 (DST-...) — 첫 결제 50% 할인
    if (await isValidReferralCode(normalized)) {
      return NextResponse.json({ valid: true, discountPct: REFERRAL_DISCOUNT_PCT, kind: "referral" });
    }

    return NextResponse.json({ valid: false });
  } catch {
    return NextResponse.json({ valid: false }, { status: 400 });
  }
}
