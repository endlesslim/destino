import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import fs from "fs";

const DATA_PATH = "/tmp/destino-subscribers.json";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

    return NextResponse.json({ success: true });
  }

  // File fallback
  const list = readSubscribers();
  if (list.includes(email)) {
    return NextResponse.json({ message: "이미 구독 중입니다." }, { status: 409 });
  }

  list.push(email);
  writeSubscribers(list);

  return NextResponse.json({ success: true });
}
