// app/api/coupon/mine/route.ts
// 내 추천코드로 발급된 보상 쿠폰 조회
// GET ?ref=DST-XXXXXX → { coupons: [{code, discountPct, used}] }

import { NextRequest, NextResponse } from "next/server";
import { getRewardCoupons } from "@/lib/referral-server";

export async function GET(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get("ref") || "";
  if (!/^DST-[A-Z0-9]{4,8}$/.test(ref)) {
    return NextResponse.json({ coupons: [] });
  }
  try {
    const coupons = await getRewardCoupons(ref);
    return NextResponse.json({ coupons });
  } catch {
    return NextResponse.json({ coupons: [] });
  }
}
