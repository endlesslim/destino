// app/api/compat-interpret/route.ts
// AI 맞춤 궁합 해석 — 두 사람의 교차 분석 데이터를 Claude가 자연어로 해석
// API 키 없음/호출 실패 시 로컬 폴백

import { NextRequest, NextResponse } from "next/server";

const CLAUDE_MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-5";

// ── 레이트리밋: IP당 시간당 5회 ──
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (rateLimitMap.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW);
  rateLimitMap.set(ip, recent);
  return recent.length >= RATE_LIMIT_MAX;
}

function recordRequest(ip: string): void {
  const list = rateLimitMap.get(ip) ?? [];
  list.push(Date.now());
  rateLimitMap.set(ip, list);
}

interface CompatSummary {
  p1: { name?: string; ilgan: string; ohang: string; sunSign: string; element: string; lifePath: number; mbti?: string };
  p2: { name?: string; ilgan: string; ohang: string; sunSign: string; element: string; lifePath: number; mbti?: string };
  overallScore: number;
  archetype: string;
  relation: string;
  sharedTraits: string[];
  tensionTraits: string[];
}

function buildPrompt(s: CompatSummary): string {
  const n1 = s.p1.name || "첫 번째 사람";
  const n2 = s.p2.name || "두 번째 사람";
  return `당신은 사주명리학, 서양 점성술, 수비학을 통합해 관계를 분석하는 궁합 전문가입니다.

규칙:
- 6~8문장의 깊이 있는 궁합 해석
- 두 사람의 실제 데이터 조합에서만 나올 수 있는 구체적 통찰
- 반드시 포함: (1) 이 관계의 핵심 역학 한 줄 정의 (2) 싸웠을 때 ${n1}이(가) ${n2}에게 하면 안 되는 것 하나 (3) 관계가 깊어지는 구체적 행동 하나
- 확신에 찬 단정 톤 ("~입니다"), 명조체 문학적 스타일
- 한국어

[${n1}]
- 사주 일간: ${s.p1.ilgan} (오행 ${s.p1.ohang})
- 별자리: ${s.p1.sunSign} (${s.p1.element})
- 생명경로수: ${s.p1.lifePath}${s.p1.mbti ? `\n- MBTI: ${s.p1.mbti}` : ""}

[${n2}]
- 사주 일간: ${s.p2.ilgan} (오행 ${s.p2.ohang})
- 별자리: ${s.p2.sunSign} (${s.p2.element})
- 생명경로수: ${s.p2.lifePath}${s.p2.mbti ? `\n- MBTI: ${s.p2.mbti}` : ""}

[교차 분석 결과]
- 궁합 점수: ${s.overallScore}점
- 관계 아키타입: ${s.archetype}
- 원소 관계: ${s.relation}
- 공유 특성: ${s.sharedTraits.join(", ") || "없음"}
- 긴장 특성: ${s.tensionTraits.join(", ") || "없음"}

두 사람의 궁합을 해석해주세요.`;
}

function localFallback(s: CompatSummary): string {
  const n1 = s.p1.name || "한 사람";
  const n2 = s.p2.name || "다른 한 사람";
  const shared = s.sharedTraits[0];
  const tension = s.tensionTraits[0];
  const parts: string[] = [];
  parts.push(
    `${s.p1.ilgan} 일간과 ${s.p2.ilgan} 일간, ${s.p1.sunSign}와 ${s.p2.sunSign}의 만남은 '${s.archetype}'의 구조를 이룹니다.`
  );
  parts.push(
    `두 사람의 원소는 ${s.relation}의 관계 — 이는 ${s.overallScore}점이라는 수치가 우연이 아님을 보여줍니다.`
  );
  if (shared) {
    parts.push(`특히 '${shared}'을(를) 함께 지니고 있어, 말하지 않아도 통하는 지점이 관계의 뿌리가 됩니다.`);
  }
  if (tension) {
    parts.push(
      `다만 '${tension}'에서 에너지가 충돌합니다. 갈등이 생겼을 때 ${n1}이(가) 옳고 그름을 따지기 시작하면 ${n2}은(는) 마음의 문을 닫습니다 — 판정보다 공감이 먼저입니다.`
    );
  }
  parts.push(
    `생명경로수 ${s.p1.lifePath}과 ${s.p2.lifePath}의 조합은 서로의 인생 과제를 비춰주는 거울입니다.`
  );
  parts.push(
    `이 관계를 깊어지게 하는 것은 거창한 이벤트가 아니라, 상대의 기운이 낮은 날을 알아차리고 말없이 곁을 지키는 하루입니다.`
  );
  return parts.join(" ");
}

export async function POST(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "127.0.0.1";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "요청이 너무 많습니다. 1시간 후 다시 시도해주세요." },
      { status: 429 },
    );
  }

  let summary: CompatSummary;
  try {
    summary = (await request.json()) as CompatSummary;
    if (!summary.p1?.ilgan || !summary.p2?.ilgan) {
      return NextResponse.json({ error: "궁합 데이터가 필요합니다." }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  recordRequest(ip);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ interpretation: localFallback(summary) });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 1500,
        thinking: { type: "disabled" },
        messages: [{ role: "user", content: buildPrompt(summary) }],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ interpretation: localFallback(summary) });
    }

    const data = await response.json();
    const text =
      (data.content as Array<{ type: string; text?: string }> | undefined)
        ?.filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("") || "";

    return NextResponse.json({ interpretation: text || localFallback(summary) });
  } catch {
    return NextResponse.json({ interpretation: localFallback(summary) });
  }
}
