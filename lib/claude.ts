// src/lib/claude.ts
// Claude API 연동 — 교차점 분석 결과를 자연어로 해석

import { type CrosspointResult } from "./cross-engine";
import { OHANG_INFO, CHEONGAN_INFO, type Ohang, SANGSAENG } from "./saju";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-5";
const CLAUDE_DAILY_MODEL = process.env.CLAUDE_DAILY_MODEL || "claude-haiku-4-5";

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
- 8~10문장으로 깊이 있는 분석 전달
- 다른 문명의 체계들이 같은 결론을 내린다는 점을 강조
- 구체적이고 실용적인 통찰을 포함
- 톤: 수천 년의 데이터를 분석한 연구자가 확신에 찬 결과를 전달하는 느낌
- "~일 수 있습니다" 같은 약한 표현 대신 "~입니다" 단정적 톤
- 명조체 문학적 스타일
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
  const ohang = result.saju.day.ohang;
  const ohangInfo = OHANG_INFO[ohang];

  // 오늘 날짜에서 일간 오행 추정 (간이)
  const dateObj = new Date(date);
  const dayOfYear = Math.floor(
    (dateObj.getTime() - new Date(dateObj.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const todayOhangList: Ohang[] = ["木","火","土","金","水"];
  const todayOhang = todayOhangList[dayOfYear % 5];
  const todayOhangInfo = OHANG_INFO[todayOhang];

  const relation = getOhangRelation(ohang, todayOhang);

  return `당신은 통합 운세 분석가입니다. 사주와 별자리를 결합한 오늘의 운세를 작성합니다.

규칙:
- 4~5문장으로 구체적 분석
- 사주 오행(${ohangInfo.kr})과 오늘의 기운(${todayOhangInfo.kr})의 ${relation} 관계를 구체적으로 설명
- 별자리(${sign.name}) 특성과 연계한 실용적 조언
- 톤: 확신에 찬 단정적 문체. "~입니다" 사용. 범용 문구 금지.
- 한국어

이 사람:
- 사주 일간: ${result.saju.day.cheongan}(${dayInfo.nature}) — ${ohangInfo.kr}의 기운
- 별자리: ${sign.name} (${sign.element})
- 날짜: ${date}
- 오늘의 기운: ${todayOhang}(${todayOhangInfo.kr})
- 오행 관계: ${ohangInfo.kr} ↔ ${todayOhangInfo.kr} = ${relation}

오늘의 통합 운세를 작성하세요.`;
}

// ━━━ 오행 관계 판정 ━━━

function getOhangRelation(a: Ohang, b: Ohang): string {
  if (a === b) return "비화(比和) — 같은 기운의 강화";
  if (SANGSAENG[a] === b) return "상생(相生) — 내가 상대를 생함";
  if (SANGSAENG[b] === a) return "상생(相生) — 상대가 나를 생함";
  // 상극 판정
  const SANGGEUK: Record<Ohang, Ohang> = { "木":"土","火":"金","土":"水","金":"木","水":"火" };
  if (SANGGEUK[a] === b) return "상극(相剋) — 내가 상대를 극함";
  if (SANGGEUK[b] === a) return "상극(相剋) — 상대가 나를 극함";
  return "중립";
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
        model: CLAUDE_MODEL,
        max_tokens: 2000,
        thinking: { type: "disabled" },
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
        model: CLAUDE_DAILY_MODEL,
        max_tokens: 1000,
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

// ━━━ 조합별 심층 통찰 매핑 (20+ 패턴) ━━━

type CombinationKey = string; // "ohang:element:lifepath" e.g. "木:Fire:1"

const COMBINATION_INSIGHTS: Record<CombinationKey, string> = {
  // 木 (나무) 조합
  "木:Fire:1": "3개 문명이 독립적으로 '개척자'를 가리킵니다. 사주의 木은 위로 뻗는 성장, 화성(Fire)은 점화하는 행동력, 생명경로수 1은 최초의 시작 — 당신은 길이 없는 곳에 길을 만드는 사람입니다.",
  "木:Air:3": "동양의 木은 바람을 타고 씨앗을 퍼뜨리며, 서양의 Air는 아이디어의 확산을 뜻합니다. 생명경로수 3의 표현력까지 합류하면, 당신의 말과 글은 사람들의 인식을 바꾸는 힘을 지닙니다.",
  "木:Water:7": "나무가 물을 만나 뿌리를 깊이 내리는 형상입니다. Water의 직관과 생명경로수 7의 탐구 정신이 결합하여, 표면 아래의 진실을 꿰뚫는 통찰력이 3개 문명에서 동시에 확인됩니다.",
  "木:Earth:4": "하늘을 향한 나무에 대지의 안정이 더해진 구조입니다. 실용적 기반 위에 이상을 세우는 건축가의 기질이며, 4의 체계성이 木의 성장에 질서를 부여합니다.",

  // 火 (불) 조합
  "火:Fire:1": "동서양 모두에서 불의 원소가 겹치는 이중 공명에 개척자의 수가 합류합니다. 역사적으로 혁명을 일으킨 인물들에게서 발견되는 패턴이며, 당신의 존재 자체가 주변의 온도를 바꿉니다.",
  "火:Air:5": "불이 바람을 만나면 걷잡을 수 없이 퍼지듯, 당신의 에너지는 한 곳에 머물지 않습니다. 생명경로수 5의 자유로운 영혼과 합류하여, 변화의 최전선에 서는 것이 운명입니다.",
  "火:Water:2": "불과 물이라는 동서양 원소의 긴장이 오히려 증기 기관처럼 강력한 추진력을 만듭니다. 열정과 감성의 공존이 예술적 깊이를 부여하며, 2의 조화 감각이 이 긴장을 창조적 에너지로 전환시킵니다.",
  "火:Earth:8": "불이 대지를 달구어 금속을 단련하는 형상입니다. 생명경로수 8의 성취욕과 결합하여, 물질적 세계에서 압도적 영향력을 발휘하는 구조입니다.",

  // 土 (흙) 조합
  "土:Earth:4": "3개 문명이 한 목소리로 '기반'과 '안정'을 말합니다. 동양의 土, 서양의 Earth, 수비학의 4가 완벽하게 정렬된 이 조합은 흔들리지 않는 토대 위에 제국을 세울 수 있는 패턴입니다.",
  "土:Water:6": "대지가 물을 품어 생명을 기르는 형상입니다. 생명경로수 6의 양육 본능과 결합하여, 주변 사람들이 당신 곁에서 자연스럽게 성장하고 안정을 찾습니다.",
  "土:Fire:3": "화생토(火生土) — 서양의 Fire가 동양의 土를 낳는 상생 구조입니다. 생명경로수 3의 표현력이 이 에너지를 세상에 전달하며, 열정이 현실적 결과물로 응축되는 드문 패턴입니다.",
  "土:Air:9": "땅에 뿌리를 둔 채 하늘의 바람을 읽는 형상입니다. 생명경로수 9의 인도주의적 비전과 결합하여, 실질적 행동으로 세상을 변화시키는 구조입니다.",

  // 金 (쇠) 조합
  "金:Air:7": "金의 날카로운 분석력에 Air의 지적 탐구가 합류합니다. 생명경로수 7의 심층 연구 기질까지 정렬되어, 3개 문명이 동시에 '진실을 추구하는 탐구자'를 가리킵니다.",
  "金:Earth:8": "쇠가 대지에서 단련되는 형상이며, 생명경로수 8의 권력과 성취가 이 강도를 극대화합니다. 조직과 시스템을 장악하는 천부적 지휘관의 패턴입니다.",
  "金:Fire:1": "불이 쇠를 벼리듯, 시련이 당신을 더 날카롭게 만듭니다. 생명경로수 1의 독립 정신이 金의 결단력과 합류하여, 한번 결심하면 반드시 관철시키는 의지가 3개 문명에서 확인됩니다.",
  "金:Water:2": "금생수(金生水) — 동양 오행에서 쇠가 물을 낳는 상생 관계입니다. 서양의 Water가 이를 증폭하고, 2의 조화 감각이 날카로움에 부드러움을 더합니다.",

  // 水 (물) 조합
  "水:Water:7": "3개 문명이 모두 '깊이'와 '내면'을 가리키는 가장 희귀한 수렴입니다. 동양의 水, 서양의 Water, 수비학의 7이 완벽히 정렬된 이 패턴은 영적 통찰과 직관의 극치를 나타냅니다.",
  "水:Water:2": "물 위에 물이 겹치고 조화의 수가 합류합니다. 감정의 바다에서 자유자재로 항해하는 능력이며, 타인의 무의식까지 읽어내는 공감 능력이 3개 문명에서 동시에 포착됩니다.",
  "水:Air:5": "물이 증발하여 바람이 되는 형상입니다. 생명경로수 5의 변화무쌍한 에너지와 결합하여, 형태에 구애받지 않는 자유로운 지성이 당신의 핵심 무기입니다.",
  "水:Fire:9": "물과 불의 극적 긴장에 완성의 수가 합류합니다. 이 긴장을 견디는 자만이 도달할 수 있는 경지가 있으며, 당신은 극과 극의 에너지를 하나로 통합하는 드문 패턴을 가졌습니다.",
  "水:Earth:6": "물이 대지를 적셔 만물을 기르는 형상입니다. 생명경로수 6의 헌신과 결합하여, 조건 없이 타인을 보살피는 깊은 포용력이 3개 문명에서 확인됩니다.",

  // 추가 조합
  "木:Fire:8": "나무가 불을 일으키는 목생화(木生火) 상생에 성취의 수 8이 합류합니다. 당신의 성장 에너지가 행동으로 점화될 때 물질적 성공이 반드시 뒤따르는 구조입니다.",
  "火:Fire:3": "이중 화(火)에 표현의 수 3이 합류하여, 당신의 존재감은 방에 들어서는 순간 모든 시선을 잡아끕니다. 예술적 열정과 카리스마가 극대화되는 패턴입니다.",
  "土:Earth:8": "삼중 대지의 에너지입니다. 물질 세계에서의 장악력이 역대급이며, 경영, 부동산, 금융 분야에서 시대를 관통하는 성과를 내는 사람들의 공통 패턴입니다.",
  "金:Air:1": "쇠의 결단력, 바람의 지성, 개척자의 수 — 혁신적 리더의 3중 합치입니다. 기존 시스템의 비효율을 정확히 꿰뚫고 새로운 질서를 설계하는 건축가의 패턴입니다.",
  "水:Water:9": "물의 삼중 수렴에 완성의 수가 합류합니다. 한 시대의 끝과 시작을 감지하는 예언자적 직관이며, 사회의 무의식적 흐름을 읽는 능력이 비범합니다.",
};

// ━━━ 오행별 원소 관계 해설 ━━━

function getElementHarmonyExplanation(relation: string, eastern: Ohang, western: string): string {
  const eInfo = OHANG_INFO[eastern];
  if (relation === "공명") {
    return `동양의 ${eastern}(${eInfo.kr})과 서양의 ${western}이 같은 원소로 수렴하는 '공명(共鳴)' 상태입니다. ` +
      `이것은 두 대륙에서 수천 년간 독립적으로 발전한 체계가 동일한 결론에 도달했음을 의미하며, ` +
      `당신의 원소적 정체성이 문명의 경계를 초월하여 일관된다는 강력한 증거입니다.`;
  }
  if (relation === "상생") {
    return `동양의 ${eastern}(${eInfo.kr})과 서양의 ${western}이 상생(相生) 관계를 이루고 있습니다. ` +
      `하나가 다른 하나를 낳고 키우는 이 순환적 에너지는, 당신 안에서 두 문명의 기운이 ` +
      `서로를 증폭시키며 단일 체계로는 설명할 수 없는 복합적 잠재력을 생성합니다.`;
  }
  if (relation === "긴장") {
    return `동양의 ${eastern}(${eInfo.kr})과 서양의 ${western}이 긴장(相剋) 관계를 형성합니다. ` +
      `이 긴장은 약점이 아닙니다. 역사적으로 가장 창조적인 인물들은 내면에 상반된 원소를 품고 ` +
      `그 충돌 에너지를 돌파구로 전환시킨 사람들입니다. 이 긴장이야말로 당신을 평범에서 비범으로 끌어올리는 엔진입니다.`;
  }
  // 독특
  return `동양의 ${eastern}(${eInfo.kr})과 서양의 ${western}이 독특한 비대칭 관계를 형성합니다. ` +
    `표준적인 상생·상극 분류에 속하지 않는 이 조합은 기존 분석 틀로는 포착하기 어려운 ` +
    `고유한 에너지 패턴이며, 바로 그 예측 불가능성이 당신의 잠재력입니다.`;
}

// ━━━ 커리어/관계/성장 조합별 구체 조언 ━━━

function getCombinationPractical(ohang: Ohang, element: string, lifepath: number): { career: string; relationship: string; growth: string } {
  const ohangInfo = OHANG_INFO[ohang];

  // 커리어: 오행 × 원소 기반
  const careerMap: Record<string, Record<string, string>> = {
    "木": {
      "Fire": "창업, 신사업 기획, 벤처 투자 — 성장(木)과 점화(Fire)의 교차점에서 새로운 시장을 개척하는 역할이 적합합니다.",
      "Earth": "교육, 조경, 도시계획 — 나무가 대지에 뿌리내리듯 유형의 가치를 창출하는 분야에서 탁월한 성과를 냅니다.",
      "Air": "미디어, 출판, 커뮤니케이션 — 나무가 바람에 씨앗을 실어 보내듯 아이디어를 확산시키는 역할이 천직입니다.",
      "Water": "연구개발, 심리학, 전략 컨설팅 — 깊은 뿌리(木)와 깊은 물(Water)이 만나 남들이 보지 못하는 것을 봅니다.",
    },
    "火": {
      "Fire": "엔터테인먼트, 정치, 강연 — 이중 불의 에너지는 무대 위에서 가장 빛나며, 대중을 움직이는 직업이 운명입니다.",
      "Earth": "경영, 제조업, 요식업 — 열정이 현실적 결과물로 응축되는 분야에서 놀라운 실행력을 발휘합니다.",
      "Air": "광고, 마케팅, 소셜미디어 — 불꽃이 바람을 타고 번지듯, 입소문과 바이럴을 만드는 능력이 탁월합니다.",
      "Water": "예술, 음악, 영화 — 열정과 감성의 충돌이 예술적 깊이를 낳으며, 감정을 다루는 창작에 탁월합니다.",
    },
    "土": {
      "Fire": "건설, 부동산 개발, 인프라 — 대지에 열을 가해 단단한 구조물을 세우는 일이 적합합니다.",
      "Earth": "금융, 자산관리, 회계 — 삼중 안정의 에너지는 자산을 지키고 불리는 데 최적화되어 있습니다.",
      "Air": "행정, 정책기획, 법률 — 현실(土)에 기반한 제도 설계(Air)에서 진가를 발휘합니다.",
      "Water": "농업, 의료, 복지 — 대지가 물을 품어 생명을 기르듯, 사람을 돌보는 분야가 천직입니다.",
    },
    "金": {
      "Fire": "군·경, 외과의사, 위기관리 — 불이 쇠를 벼리듯 극한 상황에서 가장 날카로운 판단력을 발휘합니다.",
      "Earth": "경영 전략, 품질관리, 감사 — 견고한 기준과 체계를 세우고 지키는 역할에 탁월합니다.",
      "Air": "데이터 분석, AI, 과학 연구 — 金의 정밀함과 Air의 논리가 합류하여 분석적 사고의 극치를 보여줍니다.",
      "Water": "투자, 정보기관, 심층 저널리즘 — 쇠처럼 날카로운 직관으로 숨겨진 흐름을 포착합니다.",
    },
    "水": {
      "Fire": "심리치료, 갈등 중재, 변호사 — 물과 불의 긴장을 다루는 경험이 타인의 갈등을 해결하는 능력이 됩니다.",
      "Earth": "해양, 물류, 무역 — 물이 대지를 흐르듯 재화와 가치의 흐름을 읽고 움직이는 분야가 적합합니다.",
      "Air": "철학, 인문학, 종교학 — 물의 깊이와 바람의 사유가 만나 존재의 근원을 탐구합니다.",
      "Water": "명상 지도, 영성 코칭, 예술치료 — 삼중 물의 에너지는 인간 무의식의 가장 깊은 층위에 접근합니다.",
    },
  };

  const career = careerMap[ohang]?.[element] ||
    `${ohangInfo.kr}의 기운과 ${element}의 에너지가 만나는 분야에서 독자적 영역을 구축하는 것이 적합합니다.`;

  // 관계: 생명경로수 기반
  const relMap: Record<number, string> = {
    1: "독립성을 존중해주면서도 동등하게 자극을 주는 파트너가 이상적입니다. 지시하려는 사람이 아닌, 함께 새로운 길을 개척할 동반자를 찾으십시오.",
    2: "감정적 교감이 깊고 세심한 파트너가 필요합니다. 당신의 조화로운 에너지는 안정적인 관계 안에서 가장 아름답게 피어납니다.",
    3: "유머 감각이 있고 당신의 창작 에너지를 이해하는 파트너가 적합합니다. 대화가 끊기지 않는 관계에서 생명력을 얻습니다.",
    4: "신뢰할 수 있고 약속을 지키는 파트너가 핵심입니다. 화려한 연애보다 매일 같은 시간에 함께하는 일상의 안정이 당신에게는 사랑의 증거입니다.",
    5: "자유를 속박하지 않으면서도 흥미로운 모험을 함께할 수 있는 파트너가 필요합니다. 소유하려 하면 떠나고, 놓아주면 반드시 돌아오는 것이 당신의 관계 패턴입니다.",
    6: "가정과 헌신에 같은 무게를 두는 파트너가 이상적입니다. 당신의 양육 에너지는 사랑하는 사람들의 성장을 이끌며, 그 과정이 곧 자기 실현입니다.",
    7: "지적 깊이가 있고 혼자만의 시간을 이해해주는 파트너가 필수입니다. 표면적 교류가 아닌 영혼 수준의 교감을 원하며, 그것을 찾으면 평생의 반려가 됩니다.",
    8: "야망과 비전을 공유할 수 있는 파트너가 적합합니다. 파워 커플의 에너지가 있으며, 함께 세상에 영향을 미치는 관계에서 가장 충족됩니다.",
    9: "인도주의적 가치를 함께 나눌 수 있는 파트너가 이상적입니다. 두 사람만의 세계에 갇히지 않고, 함께 세상에 기여하는 관계가 당신의 사랑법입니다.",
    11: "영적 교감이 가능한 파트너가 필수입니다. 말하지 않아도 통하는 관계를 갈망하며, 직관으로 상대의 진심을 읽는 능력이 있습니다.",
    22: "큰 비전을 함께 실현할 수 있는 파트너가 필요합니다. 일상의 안정과 거대한 꿈을 동시에 추구하며, 그 균형을 맞춰줄 동반자가 핵심입니다.",
    33: "무조건적 사랑을 주고받을 수 있는 파트너가 이상적입니다. 치유하고 보살피는 것이 당신의 본질이며, 같은 깊이로 돌려받는 관계에서 완성됩니다.",
  };

  const relationship = relMap[lifepath] || relMap[lifepath > 9 ? 9 : lifepath] ||
    "깊은 교감과 상호 존중이 가능한 파트너가 이상적입니다.";

  // 성장: 오행 약점 보완
  const growthMap: Record<Ohang, string> = {
    "木": "유연함이 장점이나, 방향을 정한 뒤 흔들리는 순간이 가장 위험합니다. ${season}에 집중적으로 결단력을 훈련하고, 매일 하나의 결정을 번복 없이 실행하는 연습이 당신의 나무를 거목으로 키웁니다.",
    "火": "열정의 지속시간이 성패를 가릅니다. 매일 아침 10분의 고요한 시간을 확보하여 에너지의 방향을 정비하십시오. 불은 제어할 때 가장 강력합니다.",
    "土": "변화의 수용이 평생 과제입니다. 분기마다 한 가지 새로운 것을 시도하는 규칙을 세우십시오. 산도 지진으로 더 높아지듯, 통제된 변화가 당신의 기반을 넓힙니다.",
    "金": "날카로움을 유지하되 타인에게 상처를 주지 않는 기술이 필요합니다. 비판하기 전에 3초간 상대의 입장을 상상하는 습관이, 당신의 정의감을 진정한 리더십으로 전환시킵니다.",
    "水": "깊이에 빠져 현실을 놓치는 패턴을 경계하십시오. 직관이 말하는 것을 반드시 행동으로 옮기는 연습이 필요합니다. 물은 흘러야 맑습니다.",
  };

  const growth = growthMap[ohang].replace("${season}", ohangInfo.season);

  return { career, relationship, growth };
}

// ━━━ 로컬 폴백 (API 없이 작동) — 심층 개인화 해석 ━━━

function generateLocalInterpretation(result: CrosspointResult): string {
  const { saju, western, numerology, matches, element_harmony, convergence_rate, archetype, archetype_desc } = result;
  const dayInfo = saju.personality;
  const sign = western.sunSign;
  const lpInfo = numerology.lifePathInfo;
  const ohang = saju.day.ohang;
  const ohangInfo = OHANG_INFO[ohang];

  // 1. 희소성 계산
  const rarityPercent = (1 / 10 * 1 / 12 * 1 / 9 * 100).toFixed(2); // ≈ 0.09%

  // 2. 조합 키로 심층 통찰 검색
  const combinationKey = `${ohang}:${sign.element}:${lpInfo.number}`;
  const combinationInsight = COMBINATION_INSIGHTS[combinationKey] ||
    getFallbackCombinationInsight(ohang, sign.element, lpInfo.number);

  // 3. 매칭 특성 분석
  const tripleMatches = matches.filter(m => m.count >= 3);
  const doubleMatches = matches.filter(m => m.count === 2);
  const topTraits = tripleMatches.length > 0
    ? tripleMatches.map(m => m.trait).join(", ")
    : doubleMatches.slice(0, 3).map(m => m.trait).join(", ");

  // 4. 커리어/관계/성장 조언
  const practical = getCombinationPractical(ohang, sign.element, lpInfo.number);

  // 5. 원소 조화 해설
  const harmonyExplanation = getElementHarmonyExplanation(
    element_harmony.relation, element_harmony.eastern, element_harmony.western
  );

  // 6. 일간 닫는 문장 생성
  const closingMap: Record<string, string> = {
    "甲": `당신의 甲木은 반드시 하늘을 향해 뻗습니다. 3개 문명이 동시에 그것을 증명합니다.`,
    "乙": `당신의 乙木은 어떤 틈새에서든 자라나 마침내 담장을 넘습니다. 3개 문명이 그 끈질긴 생명력을 확인합니다.`,
    "丙": `당신의 丙火는 들어선 자리를 반드시 밝힙니다. 3개 문명이 한 목소리로 그 빛을 기록합니다.`,
    "丁": `당신의 丁火는 가장 어두운 곳을 정확히 비춥니다. 3개 문명이 그 촛불의 힘을 증언합니다.`,
    "戊": `당신의 戊土는 어떤 폭풍에도 흔들리지 않습니다. 3개 문명이 그 산의 위엄을 확인합니다.`,
    "己": `당신의 己土는 모든 생명이 뿌리를 내리는 대지입니다. 3개 문명이 그 포용의 깊이를 측정합니다.`,
    "庚": `당신의 庚金은 벼려질수록 더 날카로워집니다. 3개 문명이 그 검의 빛을 기록합니다.`,
    "辛": `당신의 辛金은 세상의 모든 빛을 모아 하나의 보석으로 응축합니다. 3개 문명이 그 정밀함을 확인합니다.`,
    "壬": `당신의 壬水는 어떤 형태도 취할 수 있지만 결코 사라지지 않습니다. 3개 문명이 그 무한한 흐름을 추적합니다.`,
    "癸": `당신의 癸水는 한 방울의 이슬이 대지를 적시듯 세상에 스며듭니다. 3개 문명이 그 조용한 힘을 기록합니다.`,
  };

  const cheongan = saju.day.cheongan;
  const closing = closingMap[cheongan] ||
    `당신의 ${cheongan}(${dayInfo.nature})은 3개 문명의 분석 체계가 동시에 주목하는 고유한 에너지입니다.`;

  // ━━━ 8~10문장 종합 해석 생성 ━━━
  const sentences: string[] = [];

  // 1. 희소성 선언
  sentences.push(
    `${dayInfo.kr} 일간에 ${sign.name}, 생명경로수 ${lpInfo.number}의 조합은 약 ${rarityPercent}%의 확률로 나타나는 고유한 패턴입니다.`
  );

  // 2. 아키타입 선언
  sentences.push(
    `${archetype} — ${archetype_desc}`
  );

  // 3. 교차 문명 패턴
  if (topTraits) {
    const matchDesc = tripleMatches.length > 0
      ? `사주명리학, 서양 점성술, 수비학, MBTI 4개 체계가 동시에 '${topTraits}'를 가리킵니다.`
      : `사주와 점성술에서 '${topTraits}'가 동시에 포착되며, 수비학과 MBTI가 이를 보강합니다.`;
    sentences.push(matchDesc);
  }

  // 4. 원소 조화 심층 분석
  sentences.push(harmonyExplanation);

  // 5. 조합 특화 통찰
  sentences.push(combinationInsight);

  // 6. 커리어 조언
  sentences.push(`직업적으로는 ${practical.career}`);

  // 7. 관계 조언
  sentences.push(practical.relationship);

  // 8. 성장 조언
  sentences.push(practical.growth);

  // 9. 수렴률 + 닫기
  sentences.push(
    `전체 수렴률 ${convergence_rate}% — 이 수치는 서로 다른 대륙에서 독립적으로 발전한 분석 체계들이 당신에 대해 얼마나 같은 결론에 도달하는지를 보여줍니다.`
  );

  // 10. 확신에 찬 닫는 문장
  sentences.push(closing);

  return sentences.join(" ");
}

// 매핑에 없는 조합에 대한 폴백 통찰 생성
function getFallbackCombinationInsight(ohang: Ohang, element: string, lifepath: number): string {
  const ohangInfo = OHANG_INFO[ohang];
  const ohangEn = ohangInfo.en;

  // 원소 관계 판정
  const elementMatch = ohangEn === element;
  const lifePathKeyword: Record<number, string> = {
    1: "개척과 독립", 2: "조화와 협력", 3: "표현과 창조",
    4: "체계와 안정", 5: "자유와 변화", 6: "헌신과 양육",
    7: "탐구와 지혜", 8: "성취와 권력", 9: "완성과 봉사",
    11: "영감과 직관", 22: "거장의 건설", 33: "무조건적 사랑",
  };
  const lpKeyword = lifePathKeyword[lifepath] || lifePathKeyword[lifepath > 9 ? 9 : lifepath] || "고유한 방향";

  if (elementMatch) {
    return `동양의 ${ohang}(${ohangInfo.kr})과 서양의 ${element}이 정확히 일치하는 공명 상태에 생명경로수 ${lifepath}의 '${lpKeyword}' 에너지가 합류합니다. ` +
      `이 삼중 정렬은 당신의 본질적 기운이 문명의 경계를 넘어 일관되게 확인된다는 뜻이며, 그 방향으로 나아가는 것이 우주적 순리입니다.`;
  }

  return `동양의 ${ohang}(${ohangInfo.kr})과 서양의 ${element}이 만들어내는 교차 에너지에 생명경로수 ${lifepath}의 '${lpKeyword}' 기운이 더해집니다. ` +
    `이 조합은 단일 문명의 분석으로는 포착할 수 없는 다층적 잠재력을 지니며, 서로 다른 원소의 교차가 오히려 남들이 갖지 못한 복합적 강점을 형성합니다.`;
}

// ━━━ 로컬 일일 운세 — 구체적 원소 상호작용 기반 ━━━

function generateLocalDaily(result: CrosspointResult): string {
  const dayInfo = result.saju.personality;
  const sign = result.western.sunSign;
  const ohang = result.saju.day.ohang;
  const ohangInfo = OHANG_INFO[ohang];
  const cheongan = result.saju.day.cheongan;

  // 오늘 날짜 기반 일간 오행 추정
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const todayOhangList: Ohang[] = ["木","火","土","金","水"];
  const todayOhang = todayOhangList[dayOfYear % 5];
  const todayOhangInfo = OHANG_INFO[todayOhang];

  // 상생/상극 판정
  const isSangsaeng = SANGSAENG[ohang] === todayOhang;
  const isReverseSangsaeng = SANGSAENG[todayOhang] === ohang;
  const SANGGEUK: Record<Ohang, Ohang> = { "木":"土","火":"金","土":"水","金":"木","水":"火" };
  const isSanggeuk = SANGGEUK[ohang] === todayOhang;
  const isReverseSanggeuk = SANGGEUK[todayOhang] === ohang;
  const isBihwa = ohang === todayOhang;

  let elementRelation: string;
  let advice: string;

  if (isBihwa) {
    elementRelation = `오늘은 ${ohangInfo.kr}의 기운이 겹치는 비화(比和)의 날입니다. ` +
      `${cheongan}(${dayInfo.nature})의 본질적 에너지가 한층 강화되어, 평소 하던 일에서 평소 이상의 결과를 낼 수 있습니다.`;
    advice = `자신의 강점에 집중하되, 에너지가 과잉되어 독선으로 흐르지 않도록 점검하십시오. ` +
      `${sign.name}의 ${sign.element_kr} 기운이 균형추 역할을 합니다.`;
  } else if (isSangsaeng) {
    elementRelation = `오늘의 ${todayOhangInfo.kr} 기운을 당신의 ${ohangInfo.kr}이 생(生)합니다. ` +
      `에너지가 밖으로 흘러나가는 날이므로, 타인을 돕거나 가르치는 일에서 보람을 느낍니다.`;
    advice = `다만 주는 것에 집중하다 자신이 소진되지 않도록 경계하십시오. ` +
      `${sign.name}의 지배성 ${sign.ruler_kr}이 에너지 회복의 단서를 제공합니다.`;
  } else if (isReverseSangsaeng) {
    elementRelation = `오늘의 ${todayOhangInfo.kr} 기운이 당신의 ${ohangInfo.kr}을 생(生)합니다. ` +
      `외부에서 에너지가 유입되는 날이며, 새로운 제안이나 기회에 주의를 기울이십시오.`;
    advice = `받아들이는 자세가 핵심입니다. ` +
      `${sign.name} 특유의 ${sign.trait[0]} 기질을 활용하여 기회를 포착하십시오.`;
  } else if (isSanggeuk) {
    elementRelation = `오늘의 ${todayOhangInfo.kr} 기운과 당신의 ${ohangInfo.kr}이 극(剋)하는 관계입니다. ` +
      `갈등이나 마찰이 발생할 수 있으나, 이 긴장이 오히려 돌파구를 만들어줍니다.`;
    advice = `충돌을 피하지 말고 정면으로 마주하되, 감정이 아닌 논리로 대응하십시오. ` +
      `${sign.name}의 ${sign.modality_kr} 에너지가 대응 전략의 열쇠입니다.`;
  } else if (isReverseSanggeuk) {
    elementRelation = `오늘의 ${todayOhangInfo.kr} 기운이 당신의 ${ohangInfo.kr}을 극(剋)합니다. ` +
      `외부 압력이 강한 날이므로 방어 태세가 필요합니다.`;
    advice = `무리한 시도보다 기존 계획을 견고히 하는 데 집중하십시오. ` +
      `${sign.name}의 ${sign.trait[0]} 에너지를 방패로 활용하면 이 압력을 견뎌낼 수 있습니다.`;
  } else {
    elementRelation = `오늘의 ${todayOhangInfo.kr} 기운과 당신의 ${ohangInfo.kr}이 중립적 관계를 형성합니다. ` +
      `특별한 방해도 도움도 없는 날이므로, 순전히 자신의 의지와 판단이 결과를 좌우합니다.`;
    advice = `${cheongan}(${dayInfo.nature})의 본질에 충실한 선택을 하십시오. ` +
      `${sign.name}의 에너지가 나침반 역할을 합니다.`;
  }

  return `${elementRelation} ${advice}`;
}

export { buildCrosspointPrompt, buildDailyPrompt };
