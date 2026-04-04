// lib/compatibility.ts
// 궁합 분석 엔진 — 두 사람의 교차점을 비교하는 DESTINO 핵심 수익 기능

import { analyzeCrosspoint, type CrosspointResult, type TraitAxis } from "./cross-engine";
import { OHANG_INFO, SANGSAENG, SANGGEUK, type Ohang } from "./saju";
import type { WesternElement } from "./western";

// ━━━ 타입 ━━━

export interface CompatibilityInput {
  person1: { year: number; month: number; day: number; name?: string };
  person2: { year: number; month: number; day: number; name?: string };
}

export interface CompatibilityResult {
  person1: CrosspointResult;
  person2: CrosspointResult;

  // Overall
  overallScore: number;  // 0-100
  overallLabel: string;

  // Dimensional scores
  dimensions: {
    name: string;
    score: number;
    description: string;
    system: string;
  }[];

  // Trait analysis
  sharedTraits: string[];
  complementaryTraits: string[];
  tensionTraits: string[];

  // Archetype
  archetype: string;
  archetypeDesc: string;

  // Element relation
  elementRelation: {
    person1Element: string;
    person2Element: string;
    relation: "상생" | "상극" | "비화" | "상합";
    description: string;
  };

  // Advice
  advice: string;
}

// ━━━ 오행 궁합 (40%) ━━━

function scoreOhangCompat(oh1: Ohang, oh2: Ohang): { score: number; description: string } {
  if (oh1 === oh2) {
    return {
      score: 75,
      description: `두 사람 모두 ${OHANG_INFO[oh1].kr}의 기운을 가지고 있습니다. 같은 원소끼리의 비화(比和) 관계로, 서로를 깊이 이해하지만 때때로 같은 방향으로만 치우칠 수 있습니다.`,
    };
  }
  if (SANGSAENG[oh1] === oh2) {
    return {
      score: 90,
      description: `${OHANG_INFO[oh1].kr}이 ${OHANG_INFO[oh2].kr}을 생해주는 상생 관계입니다. 한 사람이 다른 사람에게 에너지를 불어넣는 자연스러운 흐름이 있습니다.`,
    };
  }
  if (SANGSAENG[oh2] === oh1) {
    return {
      score: 90,
      description: `${OHANG_INFO[oh2].kr}이 ${OHANG_INFO[oh1].kr}을 생해주는 상생 관계입니다. 서로에게 부족한 부분을 채워주는 조화로운 흐름입니다.`,
    };
  }
  if (SANGGEUK[oh1] === oh2 || SANGGEUK[oh2] === oh1) {
    return {
      score: 50,
      description: `${OHANG_INFO[oh1].kr}과 ${OHANG_INFO[oh2].kr}은 상극 관계입니다. 긴장이 존재하지만, 이 에너지를 잘 다루면 서로를 단련시키는 힘이 됩니다.`,
    };
  }
  return {
    score: 65,
    description: `${OHANG_INFO[oh1].kr}과 ${OHANG_INFO[oh2].kr}은 간접적 관계입니다. 직접적 충돌은 없으나, 서로의 리듬을 이해하는 데 시간이 필요합니다.`,
  };
}

function getOhangRelation(oh1: Ohang, oh2: Ohang): "상생" | "상극" | "비화" | "상합" {
  if (oh1 === oh2) return "비화";
  if (SANGSAENG[oh1] === oh2 || SANGSAENG[oh2] === oh1) return "상생";
  if (SANGGEUK[oh1] === oh2 || SANGGEUK[oh2] === oh1) return "상극";
  return "상합";
}

// ━━━ 별자리 궁합 (30%) ━━━

const ELEMENT_COMPAT: Record<string, number> = {
  "Fire-Fire": 95, "Earth-Earth": 95, "Air-Air": 95, "Water-Water": 95,
  "Fire-Air": 80, "Air-Fire": 80,
  "Earth-Water": 80, "Water-Earth": 80,
  "Fire-Earth": 65, "Earth-Fire": 65,
  "Air-Water": 65, "Water-Air": 65,
  "Fire-Water": 45, "Water-Fire": 45,
  "Earth-Air": 45, "Air-Earth": 45,
};

function scoreWesternCompat(
  el1: WesternElement, sign1: string,
  el2: WesternElement, sign2: string,
): { score: number; description: string } {
  const key = `${el1}-${el2}`;
  const score = ELEMENT_COMPAT[key] ?? 65;

  if (el1 === el2) {
    return {
      score,
      description: `${sign1}와 ${sign2}, 같은 ${el1} 원소. 서로의 에너지를 직관적으로 이해하는 깊은 공감의 조합입니다.`,
    };
  }
  if (score >= 80) {
    return {
      score,
      description: `${sign1}(${el1})와 ${sign2}(${el2})는 서로를 부채질하는 상호보완 원소입니다. 자연스럽게 조화를 이루는 관계.`,
    };
  }
  if (score <= 45) {
    return {
      score,
      description: `${sign1}(${el1})와 ${sign2}(${el2})는 정반대 원소입니다. 강한 끌림과 동시에 도전이 공존하는 관계.`,
    };
  }
  return {
    score,
    description: `${sign1}(${el1})와 ${sign2}(${el2})는 중립적 관계입니다. 의식적인 노력이 관계를 더 깊게 만듭니다.`,
  };
}

// ━━━ 수비학 궁합 (30%) ━━━

// 생명경로수 호환성 매트릭스 (1-9, 주요 조합만)
const LP_COMPAT: Record<string, number> = {
  // 높은 궁합 (85-95)
  "1-2": 90, "1-5": 85, "1-9": 88,
  "2-4": 88, "2-6": 92, "2-8": 85,
  "3-5": 90, "3-6": 85, "3-9": 88,
  "4-6": 88, "4-8": 90, "4-7": 85,
  "5-7": 85, "5-9": 88,
  "6-9": 90, "6-8": 85,
  "7-9": 85,
  // 중간 궁합 (65-79)
  "1-3": 75, "1-4": 70, "1-7": 72,
  "2-3": 68, "2-5": 65, "2-9": 75,
  "3-4": 65, "3-7": 70, "3-8": 68,
  "4-5": 65, "4-9": 72,
  "5-6": 70, "5-8": 68,
  "6-7": 72,
  "7-8": 70,
  "8-9": 72,
  // 도전적 궁합 (45-60)
  "1-6": 55, "1-8": 58,
  "2-7": 52,
  "7-7": 60,
  "8-8": 55,
};

function normalizeLpKey(a: number, b: number): string {
  // 마스터 넘버를 기본 숫자로 축소
  const na = a === 11 ? 2 : a === 22 ? 4 : a === 33 ? 6 : a;
  const nb = b === 11 ? 2 : b === 22 ? 4 : b === 33 ? 6 : b;
  const lo = Math.min(na, nb);
  const hi = Math.max(na, nb);
  return `${lo}-${hi}`;
}

function scoreNumerologyCompat(
  lp1: number, lp1Name: string,
  lp2: number, lp2Name: string,
): { score: number; description: string } {
  const key = normalizeLpKey(lp1, lp2);
  const base = LP_COMPAT[key];

  // 마스터 넘버 보너스
  const masterBonus = ((lp1 === 11 || lp1 === 22 || lp1 === 33) ? 3 : 0) +
    ((lp2 === 11 || lp2 === 22 || lp2 === 33) ? 3 : 0);

  let score: number;
  if (base !== undefined) {
    score = Math.min(98, base + masterBonus);
  } else if (lp1 === lp2) {
    // 같은 숫자
    score = Math.min(98, 78 + masterBonus);
  } else {
    score = Math.min(98, 68 + masterBonus);
  }

  if (score >= 85) {
    return {
      score,
      description: `생명경로수 ${lp1}(${lp1Name})과 ${lp2}(${lp2Name})는 강한 시너지를 가진 조합입니다. 숫자의 에너지가 서로를 증폭시킵니다.`,
    };
  }
  if (score >= 70) {
    return {
      score,
      description: `생명경로수 ${lp1}(${lp1Name})과 ${lp2}(${lp2Name})는 자연스러운 균형을 이루는 조합입니다. 서로의 약점을 보완합니다.`,
    };
  }
  if (score >= 55) {
    return {
      score,
      description: `생명경로수 ${lp1}(${lp1Name})과 ${lp2}(${lp2Name})는 도전적이지만 성장 가능한 조합입니다. 차이를 인정하는 것이 열쇠입니다.`,
    };
  }
  return {
    score,
    description: `생명경로수 ${lp1}(${lp1Name})과 ${lp2}(${lp2Name})는 서로 다른 리듬을 가진 조합입니다. 차이 속에서 배움을 찾는 관계.`,
  };
}

// ━━━ 특성 분석 ━━━

function analyzeTraits(p1: CrosspointResult, p2: CrosspointResult) {
  const p1Traits = new Set(p1.matches.map(m => m.trait));
  const p2Traits = new Set(p2.matches.map(m => m.trait));

  const shared: string[] = [];
  const complementary: string[] = [];
  const tension: string[] = [];

  // 공유 특성: 둘 다 가진 것
  for (const t of p1Traits) {
    if (p2Traits.has(t)) shared.push(t);
  }

  // 보완 특성 쌍 정의
  const complementPairs: [TraitAxis, TraitAxis][] = [
    ["리더십", "포용력"],
    ["추진력", "안정감"],
    ["열정", "지혜"],
    ["결단력", "유연함"],
    ["에너지", "섬세함"],
    ["자유", "신뢰"],
    ["직관", "현실감각"],
    ["감성", "완벽주의"],
  ];

  for (const [a, b] of complementPairs) {
    if ((p1Traits.has(a) && p2Traits.has(b)) || (p1Traits.has(b) && p2Traits.has(a))) {
      complementary.push(`${a} + ${b}`);
    }
  }

  // 긴장 특성: 한쪽만 강하게 가진 것 (강도 "강"인 것 중)
  const p1Strong = new Set(p1.matches.filter(m => m.strength === "강").map(m => m.trait));
  const p2Strong = new Set(p2.matches.filter(m => m.strength === "강").map(m => m.trait));

  // 긴장 쌍 정의
  const tensionPairs: [TraitAxis, TraitAxis][] = [
    ["추진력", "예민함"],
    ["리더십", "정의감"],
    ["자유", "안정감"],
    ["열정", "완벽주의"],
    ["에너지", "통찰력"],
  ];

  for (const [a, b] of tensionPairs) {
    if ((p1Strong.has(a) && p2Strong.has(b)) || (p1Strong.has(b) && p2Strong.has(a))) {
      tension.push(`${a} vs ${b}`);
    }
  }

  // 보완 특성이 부족하면 추가
  if (complementary.length === 0) {
    const p1Only = [...p1Traits].filter(t => !p2Traits.has(t)).slice(0, 2);
    const p2Only = [...p2Traits].filter(t => !p1Traits.has(t)).slice(0, 2);
    if (p1Only.length > 0 && p2Only.length > 0) {
      complementary.push(`${p1Only[0]} + ${p2Only[0]}`);
    }
  }

  // 긴장이 없으면 하나 생성 (궁합 분석은 긴장 포인트도 필요)
  if (tension.length === 0 && p1Strong.size > 0 && p2Strong.size > 0) {
    const p1s = [...p1Strong][0];
    const p2s = [...p2Strong].find(t => t !== p1s);
    if (p2s) tension.push(`${p1s} vs ${p2s}`);
  }

  return { shared, complementary, tension };
}

// ━━━ 아키타입 ━━━

interface RelArchetype {
  name: string;
  desc: string;
  minScore: number;
}

const ARCHETYPES: RelArchetype[] = [
  { name: "천생연분", minScore: 95,
    desc: "동서양의 모든 체계가 하나의 답을 가리킵니다. 만남 자체가 우연이 아닌 필연. 서로의 존재가 완성의 마지막 조각처럼 맞아떨어지는, 드문 관계입니다." },
  { name: "불꽃의 동반자", minScore: 85,
    desc: "함께 있으면 서로의 에너지가 증폭됩니다. 꺼질 수 없는 불꽃처럼 강렬한 시너지를 만들어내는 조합. 같은 방향을 바라보며 달리는 두 사람." },
  { name: "균형의 파트너", minScore: 75,
    desc: "한쪽이 기울면 다른 쪽이 잡아줍니다. 시소의 양 끝에서 완벽한 균형을 만드는 관계. 조용하지만 단단한 신뢰가 기반입니다." },
  { name: "성장의 거울", minScore: 65,
    desc: "상대방에게서 자신의 미처 몰랐던 면을 발견합니다. 함께하면 각자 혼자일 때보다 더 넓은 사람이 되는 관계. 거울이 비추는 것은 가능성입니다." },
  { name: "도전의 여정", minScore: 55,
    desc: "쉬운 관계는 아니지만, 그래서 더 가치 있습니다. 서로의 다름이 자극이 되고, 부딪힘이 성장의 촉매가 됩니다. 노력한 만큼 깊어지는 관계." },
  { name: "모순의 매력", minScore: 45,
    desc: "논리로는 설명할 수 없는 끌림이 있습니다. 정반대의 요소들이 오히려 강한 자장을 형성합니다. 이해할 수 없기에 매혹적인 관계." },
  { name: "서로 다른 세계", minScore: 35,
    desc: "각자의 우주에서 살아가는 두 사람. 겹치는 부분은 적지만, 그 작은 교차점에서 예상치 못한 불꽃이 피어납니다. 다름을 존중하는 것이 열쇠." },
  { name: "운명의 시험", minScore: 0,
    desc: "운명이 시험을 건넸습니다. 쉽게 맞지 않는 퍼즐이지만, 맞추려는 노력 자체가 두 사람을 변화시킵니다. 시험을 통과하면 어떤 관계보다 강해집니다." },
];

function getArchetype(score: number): RelArchetype {
  for (const arch of ARCHETYPES) {
    if (score >= arch.minScore) return arch;
  }
  return ARCHETYPES[ARCHETYPES.length - 1];
}

// ━━━ 조언 생성 ━━━

function generateAdvice(
  score: number,
  elementRelation: CompatibilityResult["elementRelation"],
  shared: string[],
  tension: string[],
  archetype: string,
): string {
  const parts: string[] = [];

  if (score >= 85) {
    parts.push(
      shared.length > 0
        ? `'${shared.slice(0, 2).join("', '")}'이라는 공통분모가 관계의 튼튼한 기둥입니다.`
        : `높은 조화도가 서로에 대한 깊은 이해를 보여줍니다.`,
    );
    parts.push("이 자연스러운 흐름을 신뢰하되, 각자의 독립적인 공간도 존중해 주세요.");
  } else if (score >= 65) {
    parts.push(
      elementRelation.relation === "상생"
        ? `오행의 상생 흐름이 관계에 자연스러운 에너지를 불어넣습니다.`
        : `서로의 다른 리듬을 배우는 과정이 곧 성장입니다.`,
    );
    if (tension.length > 0) {
      parts.push(`${tension[0]}의 긴장은 피하지 말고 대화의 주제로 삼으세요. 이 차이가 관계를 더 풍성하게 만듭니다.`);
    } else {
      parts.push("서로의 속도를 존중하면 함께 멀리 갈 수 있는 관계입니다.");
    }
  } else {
    parts.push(
      `'${archetype}'로서의 관계는 쉽지 않지만 변화의 가능성이 큽니다.`,
    );
    parts.push(
      shared.length > 0
        ? `공유하는 '${shared[0]}' 특성에서 출발점을 찾으세요. 작은 공통분모가 큰 다리가 됩니다.`
        : "서로의 세계를 판단하지 않고 관찰하는 것에서 시작하세요. 이해하려는 노력이 곧 사랑의 언어입니다.",
    );
  }

  return parts.join(" ");
}

// ━━━ 메인 분석 함수 ━━━

export function analyzeCompatibility(input: CompatibilityInput): CompatibilityResult {
  const { person1: p1Input, person2: p2Input } = input;

  // 각 사람의 교차점 분석
  const person1 = analyzeCrosspoint(p1Input.year, p1Input.month, p1Input.day, p1Input.name);
  const person2 = analyzeCrosspoint(p2Input.year, p2Input.month, p2Input.day, p2Input.name);

  // 1. 오행 궁합 (40%)
  const oh1 = person1.saju.day.ohang;
  const oh2 = person2.saju.day.ohang;
  const ohangResult = scoreOhangCompat(oh1, oh2);

  // 2. 별자리 궁합 (30%)
  const westernResult = scoreWesternCompat(
    person1.western.element, person1.western.sunSign.name,
    person2.western.element, person2.western.sunSign.name,
  );

  // 3. 수비학 궁합 (30%)
  const numResult = scoreNumerologyCompat(
    person1.numerology.lifePath, person1.numerology.lifePathInfo.name,
    person2.numerology.lifePath, person2.numerology.lifePathInfo.name,
  );

  // 종합 점수
  const overallScore = Math.round(
    ohangResult.score * 0.4 +
    westernResult.score * 0.3 +
    numResult.score * 0.3
  );

  // 아키타입
  const archetype = getArchetype(overallScore);

  // 특성 분석
  const traits = analyzeTraits(person1, person2);

  // 오행 관계
  const relation = getOhangRelation(oh1, oh2);
  const elementRelation: CompatibilityResult["elementRelation"] = {
    person1Element: `${oh1} ${OHANG_INFO[oh1].kr}`,
    person2Element: `${oh2} ${OHANG_INFO[oh2].kr}`,
    relation,
    description: ohangResult.description,
  };

  // 차원별 점수
  const dimensions: CompatibilityResult["dimensions"] = [
    {
      name: "오행 궁합",
      score: ohangResult.score,
      description: ohangResult.description,
      system: "saju",
    },
    {
      name: "별자리 궁합",
      score: westernResult.score,
      description: westernResult.description,
      system: "western",
    },
    {
      name: "수비학 궁합",
      score: numResult.score,
      description: numResult.description,
      system: "numerology",
    },
  ];

  // 조언
  const advice = generateAdvice(
    overallScore, elementRelation,
    traits.shared, traits.tension, archetype.name,
  );

  // 라벨
  const overallLabel = archetype.name;

  return {
    person1,
    person2,
    overallScore,
    overallLabel,
    dimensions,
    sharedTraits: traits.shared,
    complementaryTraits: traits.complementary,
    tensionTraits: traits.tension,
    archetype: archetype.name,
    archetypeDesc: archetype.desc,
    elementRelation,
    advice,
  };
}
