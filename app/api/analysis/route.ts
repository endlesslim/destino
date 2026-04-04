import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import fs from "fs";

const DATA_PATH = "/tmp/destino-analyses.json";

interface AnalysisRecord {
  id: string;
  year: number;
  month: number;
  day: number;
  hour?: number;
  name?: string;
  convergence_rate?: number;
  archetype?: string;
  element_harmony?: string;
  result_json: Record<string, unknown>;
  created_at: string;
}

function readAnalyses(): AnalysisRecord[] {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    const data = JSON.parse(raw);
    if (Array.isArray(data)) return data;
    return [];
  } catch {
    return [];
  }
}

function writeAnalyses(records: AnalysisRecord[]): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(records, null, 2), "utf-8");
}

// POST: Save analysis result, return { id }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, month, day, hour, name, convergenceRate, archetype, elementHarmony, resultJson } = body;

    if (!year || !month || !day || !resultJson) {
      return NextResponse.json(
        { error: "missing_fields", message: "필수 항목이 누락되었습니다." },
        { status: 400 },
      );
    }

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from("analyses")
        .insert({
          year,
          month,
          day,
          hour: hour || null,
          name: name || null,
          convergence_rate: convergenceRate,
          archetype: archetype || null,
          element_harmony: elementHarmony || null,
          result_json: resultJson,
        })
        .select("id")
        .single();

      if (error) throw error;

      return NextResponse.json({ id: data.id });
    } else {
      // File-based fallback
      const records = readAnalyses();
      const id = crypto.randomUUID();
      records.push({
        id,
        year,
        month,
        day,
        hour: hour || undefined,
        name: name || undefined,
        convergence_rate: convergenceRate,
        archetype: archetype || undefined,
        element_harmony: elementHarmony || undefined,
        result_json: resultJson,
        created_at: new Date().toISOString(),
      });
      writeAnalyses(records);

      return NextResponse.json({ id });
    }
  } catch (error) {
    console.error("Analysis save error:", error);
    return NextResponse.json(
      { error: "server_error", message: "분석 결과 저장 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

// GET: Retrieve analysis by ID
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "missing_id", message: "분석 ID가 필요합니다." },
      { status: 400 },
    );
  }

  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from("analyses")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        return NextResponse.json(
          { error: "not_found", message: "분석 결과를 찾을 수 없습니다." },
          { status: 404 },
        );
      }

      return NextResponse.json(data);
    } else {
      // File-based fallback
      const records = readAnalyses();
      const record = records.find((r) => r.id === id);

      if (!record) {
        return NextResponse.json(
          { error: "not_found", message: "분석 결과를 찾을 수 없습니다." },
          { status: 404 },
        );
      }

      return NextResponse.json(record);
    }
  } catch (error) {
    console.error("Analysis retrieval error:", error);
    return NextResponse.json(
      { error: "server_error", message: "분석 결과 조회 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
