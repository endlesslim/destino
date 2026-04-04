// lib/payment.ts
// 결제 설정 및 타입 — PortOne (토스페이먼츠) 연동

/**
 * PortOne 결제 설정
 *
 * 프로덕션 배포 시:
 * 1. PortOne 콘솔(https://admin.portone.io)에서 Store ID와 Channel Key를 발급
 * 2. .env.local에 아래 환경변수 설정:
 *    NEXT_PUBLIC_PORTONE_STORE_ID=store-xxxx
 *    NEXT_PUBLIC_PORTONE_CHANNEL_KEY=channel-xxxx
 *    PORTONE_API_SECRET=your-secret-key  (서버 전용, NEXT_PUBLIC 아님)
 */
export const PAYMENT_CONFIG = {
  storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID || "store-test",
  channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY || "channel-test",
  price: 16500,
  currency: "KRW",
  productName: "DESTINO 운명의 교차점 전체 분석 리포트",
} as const;

export interface PaymentResult {
  paymentId: string;
  status: "paid" | "failed" | "cancelled";
  amount: number;
  paidAt?: string;
}

export interface PaymentVerifyRequest {
  paymentId: string;
  orderName: string;
}

export interface PaymentVerifyResponse {
  success: boolean;
  accessToken?: string;
  error?: string;
}

export interface PaymentCheckResponse {
  valid: boolean;
}

/**
 * 고유 결제 ID 생성
 * 형식: destino_{timestamp}_{random6}
 */
export function generatePaymentId(): string {
  return `destino_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * 생년월일 기반 해시 생성 (localStorage 키에 사용)
 * 간단한 해시로, 보안 목적이 아닌 키 구분용
 */
export function generateBirthHash(year: number, month: number, day: number): string {
  const raw = `${year}-${month}-${day}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}
