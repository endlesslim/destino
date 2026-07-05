// lib/referral-server.ts
// 추천/쿠폰 서버 로직 (API 라우트 전용 — 클라이언트에서 import 금지)
//
// 정책:
// - 결제 완료자에게 추천코드(DST-xxxxxx) 발급
// - 추천 링크(?ref=코드)로 유입된 사람: 첫 결제 50% 할인
// - 추천이 성사되면 추천인에게 50% 할인 쿠폰(RW-xxxxxx) 자동 발급
//
// 저장소: Supabase referrals/coupons 테이블 (미설정 시 /tmp JSON 폴백 — 배포 환경에서는 유실됨)

import { supabase, isSupabaseConfigured } from "./supabase";
import crypto from "crypto";
import fs from "fs";

const REFERRALS_PATH = "/tmp/destino-referrals.json";
const COUPONS_PATH = "/tmp/destino-coupons.json";

export const REFERRAL_DISCOUNT_PCT = 50;

interface ReferralRecord {
  code: string;
  payment_id: string;
  created_at: string;
}

interface CouponRecord {
  code: string;
  discount_pct: number;
  source: string; // 'referral_reward' | 'manual'
  owner_ref_code: string | null;
  used_by_payment_id: string | null;
  used_at: string | null;
  created_at: string;
}

function readJson<T>(path: string): T[] {
  try {
    const data = JSON.parse(fs.readFileSync(path, "utf-8"));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeJson<T>(path: string, data: T[]): void {
  fs.writeFileSync(path, JSON.stringify(data, null, 2), "utf-8");
}

function randomCode(prefix: string): string {
  return `${prefix}-${crypto.randomBytes(4).toString("hex").slice(0, 6).toUpperCase()}`;
}

/** 결제 완료자에게 추천코드 발급 */
export async function issueReferralCode(paymentId: string): Promise<string> {
  const code = randomCode("DST");
  const record: ReferralRecord = {
    code,
    payment_id: paymentId,
    created_at: new Date().toISOString(),
  };
  if (isSupabaseConfigured()) {
    await supabase.from("referrals").insert(record);
  } else {
    const all = readJson<ReferralRecord>(REFERRALS_PATH);
    all.push(record);
    writeJson(REFERRALS_PATH, all);
  }
  return code;
}

/** 추천코드 유효성 확인 */
export async function isValidReferralCode(code: string): Promise<boolean> {
  if (!code || !/^DST-[A-Z0-9]{4,8}$/.test(code)) return false;
  if (isSupabaseConfigured()) {
    const { data } = await supabase.from("referrals").select("code").eq("code", code).limit(1);
    return !!(data && data.length);
  }
  return readJson<ReferralRecord>(REFERRALS_PATH).some((r) => r.code === code);
}

/** 쿠폰 조회 (미사용 쿠폰만) */
export async function findUnusedCoupon(code: string): Promise<{ code: string; discountPct: number; source: string } | null> {
  if (!code) return null;
  if (isSupabaseConfigured()) {
    const { data } = await supabase
      .from("coupons")
      .select("code, discount_pct, source, used_at")
      .eq("code", code)
      .is("used_at", null)
      .limit(1);
    if (data && data.length) return { code: data[0].code, discountPct: data[0].discount_pct, source: data[0].source };
    return null;
  }
  const c = readJson<CouponRecord>(COUPONS_PATH).find((x) => x.code === code && !x.used_at);
  return c ? { code: c.code, discountPct: c.discount_pct, source: c.source } : null;
}

/**
 * 열람 코드 일괄 생성 — 수동 판매 자동화용.
 * 미리 뽑아두고 입금 확인 시 하나씩 전송. 고객이 페이월 코드 입력창에 넣으면
 * 결제 없이 잠금 해제(1회용, 입력 시점부터 열람 기간 시작).
 */
export async function issueUnlockCodes(count: number): Promise<string[]> {
  const n = Math.min(Math.max(count, 1), 50);
  const codes: string[] = [];
  const records: CouponRecord[] = [];
  for (let i = 0; i < n; i++) {
    const code = randomCode("OPEN");
    codes.push(code);
    records.push({
      code,
      discount_pct: 100,
      source: "unlock",
      owner_ref_code: null,
      used_by_payment_id: null,
      used_at: null,
      created_at: new Date().toISOString(),
    });
  }
  if (isSupabaseConfigured()) {
    await supabase.from("coupons").insert(records);
  } else {
    const all = readJson<CouponRecord>(COUPONS_PATH);
    all.push(...records);
    writeJson(COUPONS_PATH, all);
  }
  return codes;
}

/**
 * 쿠폰 사용 처리 (원자적).
 * @returns 실제로 이 호출이 소진시켰으면 true — 동시 입력 레이스에서 한 명만 true를 받음
 */
export async function markCouponUsed(code: string, paymentId: string): Promise<boolean> {
  const usedAt = new Date().toISOString();
  if (isSupabaseConfigured()) {
    const { data } = await supabase
      .from("coupons")
      .update({ used_at: usedAt, used_by_payment_id: paymentId })
      .eq("code", code)
      .is("used_at", null)
      .select("code");
    return !!(data && data.length);
  }
  const all = readJson<CouponRecord>(COUPONS_PATH);
  const c = all.find((x) => x.code === code && !x.used_at);
  if (!c) return false;
  c.used_at = usedAt;
  c.used_by_payment_id = paymentId;
  writeJson(COUPONS_PATH, all);
  return true;
}

/** 추천 성사 → 추천인에게 50% 보상 쿠폰 발급 */
export async function issueReferralReward(refCode: string): Promise<string> {
  const code = randomCode("RW");
  const record: CouponRecord = {
    code,
    discount_pct: REFERRAL_DISCOUNT_PCT,
    source: "referral_reward",
    owner_ref_code: refCode,
    used_by_payment_id: null,
    used_at: null,
    created_at: new Date().toISOString(),
  };
  if (isSupabaseConfigured()) {
    await supabase.from("coupons").insert(record);
  } else {
    const all = readJson<CouponRecord>(COUPONS_PATH);
    all.push(record);
    writeJson(COUPONS_PATH, all);
  }
  return code;
}

/** 추천코드로 받은 보상 쿠폰 목록 (추천인 확인용) */
export async function getRewardCoupons(refCode: string): Promise<Array<{ code: string; discountPct: number; used: boolean }>> {
  if (isSupabaseConfigured()) {
    const { data } = await supabase
      .from("coupons")
      .select("code, discount_pct, used_at")
      .eq("owner_ref_code", refCode)
      .order("created_at", { ascending: false })
      .limit(50);
    return (data || []).map((c) => ({ code: c.code, discountPct: c.discount_pct, used: !!c.used_at }));
  }
  return readJson<CouponRecord>(COUPONS_PATH)
    .filter((c) => c.owner_ref_code === refCode)
    .map((c) => ({ code: c.code, discountPct: c.discount_pct, used: !!c.used_at }));
}
