// app/api/track/route.ts
// 퍼널 이벤트 수집 API — Supabase events 테이블 (미설정 시 /tmp 파일 폴백)

import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import fs from "fs";

const DATA_PATH = "/tmp/destino-events.json";

const VALID_STEPS = new Set([
  "visit_analyze",
  "analyze_submit",
  "result_view",
  "paywall_view",
  "payment_click",
  "payment_done",
]);

interface EventEntry {
  session_id: string;
  step: string;
  meta: Record<string, unknown> | null;
  created_at: string;
}

function readEvents(): EventEntry[] {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, step, meta } = body;

    if (!sessionId || typeof sessionId !== "string" || !VALID_STEPS.has(step)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const entry: EventEntry = {
      session_id: sessionId.slice(0, 64),
      step,
      meta: meta && typeof meta === "object" ? meta : null,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      await supabase.from("events").insert(entry);
    } else {
      const events = readEvents();
      events.push(entry);
      // 폴백 파일 무한 증식 방지
      fs.writeFileSync(DATA_PATH, JSON.stringify(events.slice(-50000)), "utf-8");
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
