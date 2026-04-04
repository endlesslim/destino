import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import fs from "fs";

const DATA_PATH = "/tmp/destino-subscribers.json";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------------------------------------------------------------------------
// In-memory rate limiting: max 3 submissions per IP per hour
// ---------------------------------------------------------------------------
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  rateLimitMap.set(ip, recent);
  return recent.length >= RATE_LIMIT_MAX;
}

function recordRequest(ip: string): void {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) ?? [];
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
}

function readSubscribers(): string[] {
  try {
    return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
  } catch {
    return [];
  }
}

function writeSubscribers(list: string[]): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(list, null, 2), "utf-8");
}

export async function POST(request: NextRequest) {
  // Resolve client IP
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0]?.trim() ?? realIp ?? "127.0.0.1";

  // Rate limit check
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { message: "요청이 너무 많습니다. 1시간 후 다시 시도해주세요." },
      { status: 429 },
    );
  }

  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "잘못된 요청입니다." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ message: "올바른 이메일 주소를 입력해주세요." }, { status: 400 });
  }

  // Supabase
  if (isSupabaseConfigured()) {
    const { data: existing } = await supabase
      .from("subscribers")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      return NextResponse.json({ message: "이미 구독 중입니다." }, { status: 409 });
    }

    const { error } = await supabase.from("subscribers").insert({ email });
    if (error) {
      return NextResponse.json({ message: "오류가 발생했습니다." }, { status: 500 });
    }

    recordRequest(ip);
    return NextResponse.json({ success: true });
  }

  // File fallback
  const list = readSubscribers();
  if (list.includes(email)) {
    return NextResponse.json({ message: "이미 구독 중입니다." }, { status: 409 });
  }

  list.push(email);
  writeSubscribers(list);
  recordRequest(ip);

  return NextResponse.json({ success: true });
}
