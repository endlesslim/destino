// src/lib/claude.ts
// Claude API 연동 — 교차점 분석 결과를 자연어로 해석

import { type CrosspointResult } from "./cross-engine";
import { OHANG_INFO } from "./saju";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

interface ClaudeResponse {
  interpretation: string;
  daily_advice?: string;
}

// ━━━ 프롬프트 템플릿 ━━━

function buildCrosspointPrompt(result: CrosspointResult): string {
  const { saju, western, numerology, matches, element_harmony, convergence_rate, archetype } = result;
  const dayInfo = saju.personality;
  const sign = western.sunSign;
  const lpInfo = numerology.lifePathInfo;

  const matchList = matches.slice(0, 5)
    .map(m => `- "${m.trait}" → ${m.sources.join(", ")} (${m.count}개 체계 일치)`)
    .join("\n");

  return `당신은 동양 사주명리학, 서양 점성술, 수비학을 모두 깊이 이해하는 통합 운명 분석가입니다.
"데스티노"라는 서비스에서 사용자의 교차점 분석 결과를 자연어로 해석합니다.

규칙:
- 3~5문장으로 핵심만 전달
- 다른 문명의 체계들이 같은 결론을 내린다는 점을 강조
- 구체적이고 실용적인 통찰을 포함
- 톤: 따뜻하지만 근거 있는 해석. 신비주의 과잉 금지.
- "~일 수 있습니다" 같은 약한 표현 대신 "~입니다" 단정적 톤
- 한국어

이 사람의 분석 결과:

[사주]
- 일간: ${saju.day.cheongan}(${dayInfo.kr}) — ${dayInfo.nature}
- 연주: ${saju.year.cheongan}${saju.year.jiji}
- 오행: ${saju.day.ohang}(${OHANG_INFO[saju.day.ohang].kr})
- 성격: ${dayInfo.personality}
- 띠: ${saju.animal.animal_kr}띠

[서양 점성술]
- 태양궁: ${sign.name} (${sign.symbol})
- 원소: ${sign.element}(${sign.element_kr})
- 모달리티: ${sign.modality}(${sign.modality_kr})
- 성격: ${sign.personality}

[수비학]
- 생명경로수: ${lpInfo.number} (${lpInfo.name})
- 성격: ${lpInfo.personality}

[교차점 발견]
- 수렴률: ${convergence_rate}%
- 아키타입: ${archetype}
- 일치하는 특성:
${matchList}

[원소 조화]
- 동양: ${element_harmony.eastern}(${OHANG_INFO[element_harmony.eastern].kr})
- 서양: ${element_harmony.western}
- 관계: ${element_harmony.relation}

위 결과를 바탕으로 이 사람의 "운명의 교차점"을 해석해주세요.
여러 문명이 같은 결론을 내리는 지점을 중심으로 설명하세요.`;
}

function buildDailyPrompt(result: CrosspointResult, date: string): string {
  const dayInfo = result.saju.personality;
  const sign = result.western.sunSign;

  return `당신은 통합 운세 분석가입니다. 사주와 별자리를 결합한 오늘의 운세를 작성합니다.

규칙:
- 2~3문장으로 간결하게
- 사주 오행의 오늘 기운 + 별자리 트랜짓 느낌 결합
- 실용적 조언 1개 포함
- 톤: 친근하지만 구체적
- 한국어

이 사람:
- 사주 일간: ${result.saju.day.cheongan}(${dayInfo.nature})
- 별자리: ${sign.name}
- 날짜: ${date}

오늘의 통합 운세를 작성하세요.`;
}

// ━━━ API 호출 ━━━

export async function getInterpretation(result: CrosspointResult): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // API 키 없으면 로컬 폴백
    return generateLocalInterpretation(result);
  }

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        messages: [
          { role: "user", content: buildCrosspointPrompt(result) }
        ],
      }),
    });

    const data = await response.json();
    const text = data.content
      ?.filter((item: any) => item.type === "text")
      .map((item: any) => item.text)
      .join("") || "";

    return text || generateLocalInterpretation(result);
  } catch {
    return generateLocalInterpretation(result);
  }
}

export async function getDailyFortune(result: CrosspointResult): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const today = new Date().toISOString().split("T")[0];

  if (!apiKey) {
    return generateLocalDaily(result);
  }

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",  // 일상 운세는 Haiku로 비용 절감
        max_tokens: 200,
        messages: [
          { role: "user", content: buildDailyPrompt(result, today) }
        ],
      }),
    });

    const data = await response.json();
    return data.content?.[0]?.text || generateLocalDaily(result);
  } catch {
    return generateLocalDaily(result);
  }
}

// ━━━ 로컬 폴백 (API 없이 작동) ━━━

function generateLocalInterpretation(result: CrosspointResult): string {
  const { saju, western, matches, element_harmony, convergence_rate, archetype, archetype_desc } = result;
  const dayInfo = saju.personality;
  const sign = western.sunSign;

  const topMatches = matches.slice(0, 3).map(m => m.trait).join(", ");
  const systemNames = matches[0]?.sources.join("과 ") || "여러 체계";

  let text = `${archetype}. ${archetype_desc} `;
  text += `사주에서 ${saju.day.cheongan}(${dayInfo.nature})이 가리키는 기질과 `;
  text += `${sign.name}(${sign.element})이 가리키는 성격이 `;

  if (element_harmony.relation === "공명") {
    text += `완벽하게 같은 원소로 수렴합니다. `;
  } else if (element_harmony.relation === "상생") {
    text += `서로를 키워주는 상생 관계를 이룹니다. `;
  } else {
    text += `독특한 긴장감으로 복합적인 매력을 만들어냅니다. `;
  }

  if (topMatches) {
    text += `특히 ${topMatches}에서 ${systemNames}가 동시에 같은 답을 내렸습니다. `;
  }

  text += `전체 수렴률 ${convergence_rate}%.`;

  return text;
}

function generateLocalDaily(result: CrosspointResult): string {
  const dayInfo = result.saju.personality;
  const sign = result.western.sunSign;
  const ohang = OHANG_INFO[result.saju.day.ohang];

  return `${dayInfo.nature}의 기운과 ${sign.name}의 에너지가 만나는 오늘, `
    + `${ohang.kr}의 성질을 살려 차분하게 움직이는 것이 좋겠습니다. `
    + `작은 결정이라도 직감을 믿어보세요.`;
}

export { buildCrosspointPrompt, buildDailyPrompt };
