// app/api/admin/issue-link/route.ts
// 수동 판매용 열람 링크 발급 — 입금 확인 후 관리자가 생성해 고객에게 전송
// POST { year, month, day, hour?, name?, mbti?, days? } + x-admin-key 헤더
// → { url, expiresAt } : 페이월 없이 전체 리포트가 열리는 개인화 링크

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const TOKEN_SECRET = process.env.TOKEN_SECRET || "destino-secret-key-change-in-production";

/**
 * 개봉 대기(activation) 토큰 생성.
 * 고객이 링크를 처음 여는 순간 /api/payment/activate가 이 토큰을
 * 열람 토큰(첫 개봉 시점 + viewDays)으로 교환한다.
 * openWithinDays: 개봉 기한 — 이 안에 한 번은 열어야 함.
 */
function createActivationToken(paymentId: string, viewDays: number, openWithinDays: number) {
  const expiresAt = Date.now() + openWithinDays * 24 * 60 * 60 * 1000;
  const payload = {
    paymentId,
    issuedAt: Date.now(),
    expiresAt,
    viewDays,
    type: "destino_link_activation",
  };
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", TOKEN_SECRET).update(payloadStr).digest("base64url");
  return { token: `${payloadStr}.${signature}`, openBy: expiresAt };
}

export async function POST(request: NextRequest) {
  // 인증 — /api/admin/stats와 동일 정책
  const adminKey = process.env.ADMIN_KEY;
  const provided = request.headers.get("x-admin-key") || "";
  if (adminKey) {
    if (provided !== adminKey) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "ADMIN_KEY 환경변수를 설정하세요." }, { status: 503 });
  }

  try {
    const { year, month, day, hour, name, mbti, days } = await request.json();
    if (!year || !month || !day) {
      return NextResponse.json({ error: "생년월일이 필요합니다." }, { status: 400 });
    }

    const validDays = Math.min(Math.max(Number(days) || 1, 1), 90);
    const OPEN_WITHIN_DAYS = 14; // 개봉 기한
    const { token, openBy } = createActivationToken(
      `manual_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
      validDays,
      OPEN_WITHIN_DAYS,
    );

    const origin = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
    const params = new URLSearchParams();
    params.set("y", String(year));
    params.set("m", String(month));
    params.set("d", String(day));
    if (hour !== undefined && hour !== null && hour !== "") params.set("h", String(hour));
    if (name) params.set("n", String(name));
    if (mbti) params.set("mbti", String(mbti).toUpperCase());
    params.set("token", token);

    return NextResponse.json({
      url: `${origin}/analyze?${params.toString()}`,
      openBy,
      validDays,
    });
  } catch {
    return NextResponse.json({ error: "요청 처리 중 오류" }, { status: 400 });
  }
}
