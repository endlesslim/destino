// app/api/admin/stats/route.ts
// 관리자 대시보드 통계 API — ADMIN_KEY 헤더 필요
//
// 데이터 소스: Supabase (설정 시) / 로컬 개발 시 /tmp JSON 폴백
// 프로덕션에서는 반드시 Supabase 환경변수 + ADMIN_KEY를 설정할 것.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/supabase";
import fs from "fs";

const EVENTS_PATH = "/tmp/destino-events.json";
const FEEDBACK_PATH = "/tmp/destino-feedback.json";

const FUNNEL_ORDER = [
  "visit_analyze",
  "analyze_submit",
  "result_view",
  "paywall_view",
  "payment_click",
  "payment_done",
] as const;

const FUNNEL_LABELS: Record<string, string> = {
  visit_analyze: "분석 페이지 방문",
  analyze_submit: "생년월일 입력·분석 실행",
  result_view: "무료 결과 확인",
  paywall_view: "프리미엄 페이월 노출",
  payment_click: "결제 버튼 클릭",
  payment_done: "결제 완료",
};

function readJson<T>(path: string): T[] {
  try {
    const data = JSON.parse(fs.readFileSync(path, "utf-8"));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/** 서버 전용 Supabase 클라이언트 (service role 우선, 없으면 anon) */
function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function GET(request: NextRequest) {
  // ── 인증 ──
  const adminKey = process.env.ADMIN_KEY;
  const provided = request.headers.get("x-admin-key") || "";
  if (adminKey) {
    if (provided !== adminKey) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === "production") {
    // 프로덕션에서 ADMIN_KEY 미설정이면 잠금
    return NextResponse.json(
      { error: "ADMIN_KEY 환경변수를 설정해야 대시보드를 사용할 수 있습니다." },
      { status: 503 },
    );
  }

  try {
    let feedback: Array<{ rating: string; comment?: string | null; created_at: string; year?: number; month?: number; day?: number; archetype?: string | null }> = [];
    let events: Array<{ session_id: string; step: string; created_at: string }> = [];
    let source: "supabase" | "local" = "local";

    if (isSupabaseConfigured()) {
      const sb = getServerSupabase();
      if (sb) {
        const [fb, ev] = await Promise.all([
          sb.from("feedback").select("rating, comment, created_at, year, month, day, archetype").order("created_at", { ascending: false }).limit(2000),
          sb.from("events").select("session_id, step, created_at").order("created_at", { ascending: false }).limit(50000),
        ]);
        if (fb.error || ev.error) {
          return NextResponse.json(
            { error: `Supabase 조회 실패: ${fb.error?.message || ev.error?.message}. events/feedback SELECT 정책 또는 SUPABASE_SERVICE_ROLE_KEY 설정을 확인하세요.` },
            { status: 500 },
          );
        }
        feedback = fb.data || [];
        events = ev.data || [];
        source = "supabase";
      }
    } else {
      feedback = readJson(FEEDBACK_PATH);
      events = readJson(EVENTS_PATH);
    }

    // ── 만족도 집계 ──
    const accurate = feedback.filter((f) => f.rating === "accurate").length;
    const inaccurate = feedback.filter((f) => f.rating === "inaccurate").length;
    const totalFeedback = accurate + inaccurate;
    const comments = feedback
      .filter((f) => f.comment && f.comment.trim())
      .slice(0, 30)
      .map((f) => ({
        rating: f.rating,
        comment: f.comment,
        created_at: f.created_at,
        birth: f.year ? `${f.year}.${f.month}.${f.day}` : null,
        archetype: f.archetype || null,
      }));

    // ── 퍼널 집계 (단계별 고유 세션 수) ──
    const stepSessions = new Map<string, Set<string>>();
    for (const e of events) {
      if (!stepSessions.has(e.step)) stepSessions.set(e.step, new Set());
      stepSessions.get(e.step)!.add(e.session_id);
    }
    const funnel = FUNNEL_ORDER.map((step) => ({
      step,
      label: FUNNEL_LABELS[step],
      sessions: stepSessions.get(step)?.size || 0,
    }));

    // ── 일별 추이 (최근 14일, 방문·분석·결제) ──
    const days: Record<string, { visits: Set<string>; analyzes: Set<string>; payments: Set<string> }> = {};
    const cutoff = Date.now() - 14 * 86400000;
    for (const e of events) {
      const t = new Date(e.created_at).getTime();
      if (isNaN(t) || t < cutoff) continue;
      const dayKey = e.created_at.slice(0, 10);
      if (!days[dayKey]) days[dayKey] = { visits: new Set(), analyzes: new Set(), payments: new Set() };
      if (e.step === "visit_analyze") days[dayKey].visits.add(e.session_id);
      if (e.step === "analyze_submit") days[dayKey].analyzes.add(e.session_id);
      if (e.step === "payment_done") days[dayKey].payments.add(e.session_id);
    }
    const daily = Object.entries(days)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ date, visits: v.visits.size, analyzes: v.analyzes.size, payments: v.payments.size }));

    return NextResponse.json({
      source,
      satisfaction: {
        total: totalFeedback,
        accurate,
        inaccurate,
        accurateRate: totalFeedback ? Math.round((accurate / totalFeedback) * 100) : null,
        comments,
      },
      funnel,
      daily,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
