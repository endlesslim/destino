import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const DATA_PATH = "/tmp/destino-waitlist.json";

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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function readEmails(): string[] {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    const data = JSON.parse(raw);
    if (Array.isArray(data)) return data;
    return [];
  } catch {
    return [];
  }
}

function writeEmails(emails: string[]): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(emails, null, 2), "utf-8");
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------------------------------------------------------------------------
// GET — return current waitlist count
// ---------------------------------------------------------------------------
export async function GET() {
  if (isSupabaseConfigured()) {
    const { count } = await supabase.from("waitlist").select("*", { count: "exact", head: true });
    return NextResponse.json({ count: count || 0 });
  }

  const emails = readEmails();
  return NextResponse.json({ count: emails.length });
}

// ---------------------------------------------------------------------------
// POST — add email to waitlist
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  // Resolve client IP
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0]?.trim() ?? realIp ?? "127.0.0.1";

  // Rate limit check
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "too_many_requests", message: "요청이 너무 많습니다. 1시간 후 다시 시도해주세요." },
      { status: 429 },
    );
  }

  // Parse body
  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_body", message: "잘못된 요청입니다." },
      { status: 400 },
    );
  }

  const email = body.email?.trim().toLowerCase();

  // Validate
  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { error: "invalid_email", message: "올바른 이메일 주소를 입력해주세요." },
      { status: 400 },
    );
  }

  if (isSupabaseConfigured()) {
    // Check duplicate
    const { data: existing } = await supabase
      .from("waitlist")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "duplicate", message: "이미 등록된 이메일입니다." },
        { status: 409 },
      );
    }

    // Insert
    const { error } = await supabase.from("waitlist").insert({ email });
    if (error) throw error;

    recordRequest(ip);

    // Get count
    const { count } = await supabase.from("waitlist").select("*", { count: "exact", head: true });
    return NextResponse.json({ success: true, position: count || 1 });
  }

  // File-based fallback
  const emails = readEmails();

  // Duplicate check
  if (emails.includes(email)) {
    return NextResponse.json(
      { error: "duplicate", message: "이미 등록된 이메일입니다." },
      { status: 409 },
    );
  }

  // Store
  emails.push(email);
  writeEmails(emails);
  recordRequest(ip);

  return NextResponse.json({ success: true, position: emails.length });
}
