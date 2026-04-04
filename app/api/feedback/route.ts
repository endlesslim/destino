import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import fs from "fs";

const DATA_PATH = "/tmp/destino-feedback.json";

interface FeedbackEntry {
  year: number;
  month: number;
  day: number;
  convergenceRate?: number;
  archetype?: string;
  rating: "accurate" | "inaccurate";
  comment?: string;
  created_at: string;
}

function readFeedback(): FeedbackEntry[] {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    const data = JSON.parse(raw);
    if (Array.isArray(data)) return data;
    return [];
  } catch {
    return [];
  }
}

function writeFeedback(entries: FeedbackEntry[]): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(entries, null, 2), "utf-8");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, month, day, convergenceRate, archetype, rating, comment } = body;

    // Validate required fields
    if (!year || !month || !day || !rating) {
      return NextResponse.json(
        { error: "missing_fields", message: "필수 항목이 누락되었습니다." },
        { status: 400 },
      );
    }

    if (rating !== "accurate" && rating !== "inaccurate") {
      return NextResponse.json(
        { error: "invalid_rating", message: "올바른 평가를 선택해주세요." },
        { status: 400 },
      );
    }

    if (isSupabaseConfigured()) {
      const { error } = await supabase.from("feedback").insert({
        year,
        month,
        day,
        convergence_rate: convergenceRate,
        archetype,
        rating,
        comment: comment || null,
      });

      if (error) throw error;
    } else {
      // File-based fallback
      const entries = readFeedback();
      entries.push({
        year,
        month,
        day,
        convergenceRate,
        archetype,
        rating,
        comment: comment || undefined,
        created_at: new Date().toISOString(),
      });
      writeFeedback(entries);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Feedback save error:", error);
    return NextResponse.json(
      { error: "server_error", message: "피드백 저장 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
