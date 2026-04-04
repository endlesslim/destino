// app/api/payment/verify/route.ts
// 결제 검증 API — PortOne 결제 완료 후 서버 사이드 검증

import { NextRequest, NextResponse } from "next/server";
import { PAYMENT_CONFIG, type PaymentVerifyResponse } from "@/lib/payment";
import * as fs from "fs";
import * as path from "path";

const PAYMENTS_FILE = path.join("/tmp", "destino-payments.json");

/** Access token 생성 (base64 인코딩된 JSON) */
function createAccessToken(paymentId: string): string {
  const payload = {
    paymentId,
    issuedAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24시간
    type: "destino_report_access",
  };
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
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
    const { paymentId, orderName } = body;

    if (!paymentId || !orderName) {
      return NextResponse.json(
        { success: false, error: "paymentId와 orderName이 필요합니다." },
        { status: 400 },
      );
    }

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

    savePaymentRecord({
      paymentId,
      orderName,
      amount: PAYMENT_CONFIG.price,
      paidAt,
      accessToken,
    });

    return NextResponse.json({
      success: true,
      accessToken,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { success: false, error: "결제 처리 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
