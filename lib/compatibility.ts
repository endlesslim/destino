// lib/compatibility.ts
// 궁합 분석 엔진 — 두 사람의 교차점을 비교하는 DESTINO 핵심 수익 기능

import { analyzeCrosspoint, type CrosspointResult, type TraitAxis } from "./cross-engine";
import { OHANG_INFO, SANGSAENG, SANGGEUK, type Ohang } from "./saju";
import type { WesternElement } from "./western";
import { MBTI_DATA } from "./mbti";

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
    detail: string;      // 3-4 sentence detailed explanation
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

  // ━━━ 신규 심화 분석 필드 ━━━

  // 개인 성격 요약
  person1Detail: string;
  person2Detail: string;

  // 원소 이야기 (3-4문장 문학적 서술)
  elementStory: string;

  // 관계 타임라인 조언
  timelineAdvice: { phase: string; advice: string }[];

  // 소통 스타일 비교
  communicationStyle: { person1: string; person2: string; tip: string };

  // 갈등 패턴
  conflictPattern: { trigger: string; resolution: string };
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

// ━━━ MBTI 궁합 ━━━

const MBTI_COMPLEMENTARY_PAIRS: [string, string][] = [
  ["ENTJ", "INFP"], ["ENFP", "INTJ"],
  ["ENTP", "INFJ"], ["ENFJ", "INTP"],
  ["ESTJ", "ISFP"], ["ESFP", "ISTJ"],
  ["ESTP", "ISFJ"], ["ESFJ", "ISTP"],
];

function getMbtiMiddleLetters(type: string): string {
  return type.slice(1, 3); // e.g. "ENTJ" -> "NT"
}

const MBTI_COMPATIBLE_GROUPS = ["NF", "NT", "SF", "ST"];

function scoreMbtiCompat(
  type1: string, type2: string,
  name1: string, name2: string,
): { score: number; description: string; detail: string } {
  const profile1 = MBTI_DATA[type1];
  const profile2 = MBTI_DATA[type2];
  const name1Kr = profile1?.name_kr || type1;
  const name2Kr = profile2?.name_kr || type2;

  // Same type
  if (type1 === type2) {
    return {
      score: 75,
      description: `${type1}(${name1Kr}) 동일 유형입니다. 깊은 이해가 가능하지만 같은 맹점을 공유합니다.`,
      detail: `${name1}과 ${name2}는 모두 ${type1}(${name1Kr}) 유형으로, 서로의 사고방식과 행동 패턴을 직관적으로 이해합니다. 같은 가치관을 공유하기에 갈등이 적지만, 동일한 약점을 보완해줄 사람이 없어 함께 막히는 순간이 올 수 있습니다. 너무 비슷한 관계는 성장의 자극이 줄어들 수 있으므로, 의식적으로 새로운 관점을 탐색하는 노력이 필요합니다.`,
    };
  }

  // Complementary pairs (golden pairs)
  for (const [a, b] of MBTI_COMPLEMENTARY_PAIRS) {
    if ((type1 === a && type2 === b) || (type1 === b && type2 === a)) {
      return {
        score: 90,
        description: `${type1}(${name1Kr})와 ${type2}(${name2Kr})는 심리학에서 '황금 페어'로 불리는 상호보완 조합입니다.`,
        detail: `${type1}와 ${type2}의 조합은 심리학에서 '황금 페어'로 불립니다. ${type1}의 주기능과 ${type2}의 주기능이 서로의 열등 기능을 자연스럽게 보완합니다. ${name1}이 놓치기 쉬운 영역을 ${name2}가 채워주고, ${name2}가 어려워하는 부분을 ${name1}이 이끌어줍니다. 이 조합은 처음에는 신비로운 끌림으로, 시간이 지나면 깊은 존경과 신뢰로 발전합니다.`,
      };
    }
  }

  // Compatible (same middle letters: NF+NF, NT+NT, etc.)
  const mid1 = getMbtiMiddleLetters(type1);
  const mid2 = getMbtiMiddleLetters(type2);
  if (mid1 === mid2 && MBTI_COMPATIBLE_GROUPS.includes(mid1)) {
    const groupNames: Record<string, string> = {
      "NF": "이상주의적 직관형",
      "NT": "전략적 분석형",
      "SF": "현실적 공감형",
      "ST": "실용적 논리형",
    };
    return {
      score: 80,
      description: `${type1}와 ${type2}는 같은 ${groupNames[mid1] || mid1} 기질군으로, 세상을 바라보는 렌즈가 유사합니다.`,
      detail: `${name1}(${type1})과 ${name2}(${type2})는 같은 ${groupNames[mid1] || mid1} 기질을 공유합니다. 정보를 처리하고 결정을 내리는 핵심 방식이 유사하기 때문에, 대화에서 깊은 공감이 자연스럽게 일어납니다. 외향/내향이나 판단/인식의 차이가 적절한 변주를 만들어, 지루하지 않으면서도 편안한 관계가 형성됩니다. 같은 언어로 소통하되 다른 악기를 연주하는 듀엣과 같습니다.`,
    };
  }

  // Check if all 4 axes are opposite (clash)
  const axes = [
    [type1[0], type2[0]], // E/I
    [type1[1], type2[1]], // S/N
    [type1[2], type2[2]], // T/F
    [type1[3], type2[3]], // J/P
  ];
  const allOpposite = axes.every(([a, b]) => a !== b);
  if (allOpposite) {
    return {
      score: 50,
      description: `${type1}(${name1Kr})와 ${type2}(${name2Kr})는 모든 축에서 정반대입니다. 강한 끌림과 동시에 큰 도전이 공존합니다.`,
      detail: `${name1}(${type1})과 ${name2}(${type2})는 네 가지 심리 축 모두에서 정반대에 위치합니다. 에너지 방향, 정보 수집, 의사결정, 생활양식 — 모든 면에서 다른 세계에 살고 있습니다. 이 극단적 차이는 초기에 강렬한 호기심과 끌림을 유발하지만, 일상에서는 끊임없는 조율이 필요합니다. 서로의 방식을 '틀린 것'이 아닌 '다른 렌즈'로 받아들일 때, 이 관계는 가장 큰 성장의 도구가 됩니다.`,
    };
  }

  // Neutral
  return {
    score: 65,
    description: `${type1}(${name1Kr})와 ${type2}(${name2Kr})는 일부 축에서 유사하고 일부에서 다른 중립적 조합입니다.`,
    detail: `${name1}(${type1})과 ${name2}(${type2})는 일부 심리 기능에서 유사성을, 나머지에서는 차이를 보이는 균형 잡힌 조합입니다. 완전한 공감도, 극적인 충돌도 아닌 이 중간 지대에서 관계의 질은 두 사람의 소통 의지에 크게 좌우됩니다. 비슷한 부분에서는 편안함을 찾고, 다른 부분에서는 상대의 관점을 배우는 자세가 이 관계를 풍요롭게 만듭니다.`,
  };
}

// ━━━ 차원별 상세 설명(detail) 생성 ━━━

function generateOhangDetail(
  oh1: Ohang, oh2: Ohang,
  name1: string, name2: string,
): string {
  const kr1 = OHANG_INFO[oh1].kr;
  const kr2 = OHANG_INFO[oh2].kr;

  if (oh1 === oh2) {
    return `${name1}과 ${name2}는 모두 ${oh1}(${kr1})의 기운을 타고났습니다. 같은 원소의 비화(比和) 관계로, 말하지 않아도 통하는 직감적 이해가 있습니다. 하지만 같은 방향으로만 흐르는 에너지는 정체를 만들 수 있으니, 의식적으로 새로운 자극을 도입하는 것이 관계를 신선하게 유지하는 비결입니다.`;
  }
  if (SANGSAENG[oh1] === oh2) {
    return `${oh1}(${kr1})과 ${oh2}(${kr2})의 관계는 ${kr1}이 ${kr2}을 생하는 상생입니다. ${name1}이 ${name2}에게 에너지를 제공하고, ${name2}는 그 에너지를 열정으로 변환합니다. 이 관계에서 ${name1}은 자원 제공자, ${name2}는 실행자 역할을 자연스럽게 맡게 됩니다. 다만 한쪽이 계속 주기만 하면 소진되므로, 감사와 보답의 순환을 만드는 것이 중요합니다.`;
  }
  if (SANGSAENG[oh2] === oh1) {
    return `${oh2}(${kr2})과 ${oh1}(${kr1})의 관계는 ${kr2}이 ${kr1}을 생하는 상생입니다. ${name2}가 ${name1}에게 에너지를 불어넣고, ${name1}은 그 에너지를 받아 성장합니다. 자연의 순환처럼 한 사람의 끝이 다른 사람의 시작이 되는 아름다운 흐름이 있습니다. 이 상생의 고리를 의식적으로 유지하는 것이 관건입니다.`;
  }
  if (SANGGEUK[oh1] === oh2 || SANGGEUK[oh2] === oh1) {
    return `${oh1}(${kr1})과 ${oh2}(${kr2})의 상극은 긴장감이 존재하는 관계입니다. 한쪽이 다른 쪽을 제어하려는 에너지가 흐르기에 갈등의 소지가 있습니다. 하지만 대장간의 불이 무딘 쇳덩이를 명검으로 만들듯, 이 긴장을 단련의 에너지로 승화시키면 어떤 관계보다 강인한 유대가 형성됩니다. 핵심은 상대를 바꾸려 하지 않고, 서로의 강점을 인정하는 것입니다.`;
  }
  return `${oh1}(${kr1})과 ${oh2}(${kr2})은 직접적 상생이나 상극이 아닌 간접적 관계에 있습니다. 정해진 공식이 없다는 것은 두 사람만의 고유한 관계 역학을 만들어갈 수 있다는 의미입니다. 서로의 리듬을 이해하는 데 시간이 필요하지만, 일단 그 리듬을 찾으면 예상 밖의 조화가 펼쳐집니다.`;
}

function generateWesternDetail(
  el1: WesternElement, sign1: string,
  el2: WesternElement, sign2: string,
  name1: string, name2: string,
): string {
  if (el1 === el2) {
    return `${name1}의 ${sign1}(${el1})와 ${name2}의 ${sign2}(${el2})는 같은 원소로, 감정의 깊이에서 즉각적인 공감이 일어납니다. 말하지 않아도 서로의 기분을 읽는 관계입니다. 다만 두 사람 모두 같은 원소적 한계를 공유하므로, 가끔은 의식적으로 다른 원소의 활동이나 관점을 도입하면 관계가 더 풍성해집니다.`;
  }
  const key = `${el1}-${el2}`;
  const score = ELEMENT_COMPAT[key] ?? 65;
  if (score >= 80) {
    return `${name1}의 ${sign1}(${el1})와 ${name2}의 ${sign2}(${el2})는 서양 점성술에서 상호보완 원소로 분류됩니다. ${el1}이 ${el2}를 활성화하고, ${el2}가 ${el1}에 안정감을 더하는 자연스러운 시너지가 있습니다. 두 사람이 함께할 때 각자의 별자리 에너지가 증폭되어, 혼자일 때보다 더 큰 힘을 발휘합니다.`;
  }
  if (score <= 45) {
    return `${name1}의 ${sign1}(${el1})와 ${name2}의 ${sign2}(${el2})는 정반대 원소입니다. 물과 불, 흙과 바람처럼 본질적으로 다른 에너지가 만나는 관계입니다. 이 차이는 강한 자력과 같은 끌림을 만들면서도, 일상에서는 마찰로 나타날 수 있습니다. 상대의 원소적 특성을 인정하고 배우려는 자세가 이 관계의 열쇠입니다.`;
  }
  return `${name1}의 ${sign1}(${el1})와 ${name2}의 ${sign2}(${el2})는 직접적 충돌도 뚜렷한 시너지도 없는 중립적 관계입니다. 이런 조합에서는 의식적인 노력이 관계를 더 깊게 만듭니다. 서로의 별자리 특성을 학습하고, 상대의 원소적 욕구를 이해하려는 노력이 관계를 한 단계 끌어올립니다.`;
}

function generateNumerologyDetail(
  lp1: number, lp1Name: string,
  lp2: number, lp2Name: string,
  name1: string, name2: string,
  score: number,
): string {
  if (lp1 === lp2) {
    return `${name1}과 ${name2}는 동일한 경로수 ${lp1}(${lp1Name})을 가지고 있습니다. 인생의 큰 방향과 핵심 과제가 같기에 깊은 공감이 가능합니다. 하지만 같은 도전을 함께 마주하기에 서로의 거울이 되어 때로는 불편한 진실을 비추기도 합니다.`;
  }
  if (score >= 85) {
    return `경로수 ${lp1}(${lp1Name})과 경로수 ${lp2}(${lp2Name})의 만남은 비전과 표현의 결합입니다. ${lp1}이 큰 그림을 그리면 ${lp2}가 그것을 매력적으로 포장합니다. 수비학적으로 이 두 숫자는 강한 시너지를 만들어내며, 함께할 때 각자의 잠재력이 극대화됩니다.`;
  }
  if (score >= 70) {
    return `경로수 ${lp1}(${lp1Name})과 경로수 ${lp2}(${lp2Name})는 자연스러운 균형을 이루는 숫자 조합입니다. ${name1}의 숫자 에너지가 ${name2}의 약점을 보완하고, 그 반대도 마찬가지입니다. 의식하지 않아도 서로의 빈 곳을 채우는 관계로, 시간이 지날수록 그 보완의 가치를 더 깊이 느끼게 됩니다.`;
  }
  return `경로수 ${lp1}(${lp1Name})과 경로수 ${lp2}(${lp2Name})는 각자 다른 인생 리듬을 가진 조합입니다. 서로의 숫자 에너지가 때로는 엇갈리기도 하지만, 그 차이 속에서 배움을 찾는 것이 이 관계의 성장 포인트입니다. 상대의 인생 경로를 판단하지 않고 존중하는 것에서 진정한 연결이 시작됩니다.`;
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

// ━━━ 개인 성격 요약 생성 ━━━

function generatePersonDetail(p: CrosspointResult, name: string): string {
  const ohang = p.saju.day.ohang;
  const sign = p.western.sunSign.name;
  const lp = p.numerology.lifePathInfo;
  const nature = p.saju.personality.nature;
  const traits = p.matches.slice(0, 3).map(m => m.trait).join(", ");

  return `${name}은(는) ${OHANG_INFO[ohang].kr}(${ohang})의 기운을 타고난 ${sign}자리입니다. ` +
    `사주의 일간이 보여주는 본성은 "${nature}"이며, ` +
    `수비학 생명경로수 ${lp.number}번(${lp.name})의 에너지가 삶의 방향을 이끕니다. ` +
    `가장 두드러지는 특성은 ${traits}이며, ${lp.personality}`;
}

// ━━━ 원소 이야기 생성 ━━━

function generateElementStory(
  oh1: Ohang, oh2: Ohang,
  el1: string, el2: string,
  sign1: string, sign2: string,
  relation: "상생" | "상극" | "비화" | "상합",
): string {
  const kr1 = OHANG_INFO[oh1].kr;
  const kr2 = OHANG_INFO[oh2].kr;

  const stories: Record<string, string> = {
    "상생": `${kr1}이 ${kr2}를 생하는 흐름 속에, ${sign1}의 ${el1} 에너지와 ${sign2}의 ${el2} 에너지가 서로를 감싸 안습니다. ` +
      `한 사람의 끝이 다른 사람의 시작이 되는, 물이 나무를 키우듯 자연스러운 순환의 이야기입니다. ` +
      `동양의 상생과 서양의 원소가 같은 방향을 가리킬 때, 그 관계에는 우주적 리듬이 깃듭니다. ` +
      `이 흐름을 거스르지 않는 것, 그것이 두 사람에게 주어진 가장 큰 축복입니다.`,
    "상극": `${kr1}과 ${kr2}이 마주할 때, 불이 금을 녹이듯 강렬한 변형의 에너지가 생겨납니다. ` +
      `${sign1}(${el1})과 ${sign2}(${el2})의 만남 역시 정반대의 극성이 부딪치는 드라마를 암시합니다. ` +
      `하지만 대장간의 불이 무딘 쇳덩이를 명검으로 만들듯, 이 긴장은 파괴가 아닌 단련의 힘입니다. ` +
      `서로를 깨뜨리는 것이 아니라 서로를 빚어내는 관계 — 그것이 상극의 진짜 의미입니다.`,
    "비화": `같은 ${kr1}의 기운을 가진 두 사람. 거울을 마주 보듯, 상대에게서 자기 자신을 발견합니다. ` +
      `${sign1}과 ${sign2}, ${el1}과 ${el2}의 공명이 이 유사성을 더욱 깊게 만듭니다. ` +
      `같은 파장이 만나면 증폭되듯, 두 사람의 에너지는 함께할 때 배가됩니다. ` +
      `다만 같은 방향으로만 흐르는 물은 고이기 쉽습니다 — 의식적으로 새로운 물줄기를 만드는 것이 관건입니다.`,
    "상합": `${kr1}과 ${kr2} 사이에는 직접적 충돌도, 뚜렷한 상생도 없는 미묘한 간격이 있습니다. ` +
      `${sign1}(${el1})과 ${sign2}(${el2})의 조합이 이 간격에 색을 입힙니다. ` +
      `쉽게 읽히지 않는 관계이기에, 서로를 이해하려는 노력 하나하나가 보석이 됩니다. ` +
      `정해진 공식이 없다는 것은 두 사람만의 공식을 쓸 수 있다는 뜻이기도 합니다.`,
  };

  return stories[relation] || stories["상합"];
}

// ━━━ 관계 타임라인 조언 ━━━

function generateTimelineAdvice(
  score: number,
  relation: "상생" | "상극" | "비화" | "상합",
  shared: string[],
  tension: string[],
): { phase: string; advice: string }[] {
  const sharedStr = shared.length > 0 ? shared.slice(0, 2).join(", ") : "공통된 가치";
  const tensionStr = tension.length > 0 ? tension[0] : "서로의 차이";

  if (score >= 80) {
    return [
      { phase: "만남", advice: `첫 만남에서부터 자연스러운 편안함을 느낄 수 있습니다. ${sharedStr}에 대한 공감이 빠르게 형성됩니다. 하지만 이 편안함에 안주하지 말고, 상대의 독특한 면을 발견하려는 호기심을 유지하세요.` },
      { phase: "연애 초기", advice: `서로의 리듬이 잘 맞아 함께하는 시간이 자연스럽습니다. 이 시기에 각자의 가치관과 미래 비전을 솔직하게 나누세요. 좋은 궁합일수록 초기에 깊은 대화가 관계의 기반을 단단하게 만듭니다.` },
      { phase: "깊어지는 시기", advice: `${sharedStr}이라는 공통분모가 관계의 단단한 뿌리가 됩니다. 이 시기에는 함께 성장할 수 있는 공동 목표를 세워보세요. 두 사람의 시너지가 가장 빛나는 때입니다.` },
      { phase: "위기", advice: `높은 조화도에도 위기는 찾아옵니다. ${tensionStr}에서 오는 마찰은 피하지 말고 정면으로 마주하세요. 서로를 너무 잘 안다는 착각이 가장 큰 적입니다. 매번 새롭게 상대를 발견하려는 자세가 필요합니다.` },
      { phase: "성숙", advice: `오래된 관계일수록 서로의 성장 공간을 지켜주는 것이 중요합니다. 함께하는 시간만큼 각자만의 시간도 소중히 하세요. 이 관계는 세월이 흐를수록 더 깊어지는 종류의 인연입니다.` },
    ];
  }
  if (score >= 60) {
    return [
      { phase: "만남", advice: `처음에는 서로의 다름에 호기심을 느낍니다. 완전히 같지 않기에 오히려 탐구하고 싶은 매력이 있습니다. 첫인상에 너무 많은 의미를 두지 말고, 천천히 알아가세요.` },
      { phase: "연애 초기", advice: `서로의 리듬을 맞추는 데 약간의 노력이 필요합니다. ${sharedStr}에서 접점을 찾되, 차이점도 인정하는 연습을 시작하세요. 이 시기의 소통이 관계의 방향을 결정합니다.` },
      { phase: "깊어지는 시기", advice: `서로의 보완적 특성이 빛을 발하기 시작합니다. 한쪽이 부족한 부분을 다른 쪽이 채워주는 경험이 신뢰를 쌓습니다. 감사를 표현하는 습관을 만드세요.` },
      { phase: "위기", advice: `${tensionStr}이 수면 위로 올라올 수 있습니다. 이때 중요한 것은 승패를 가리는 것이 아니라, 서로의 입장을 충분히 듣는 것입니다. 48시간 룰 — 큰 결정은 이틀 후에 내리세요.` },
      { phase: "성숙", advice: `차이를 극복한 경험이 관계의 가장 큰 자산이 됩니다. 서로의 다름을 존중하면서도 함께하는 의미를 잃지 않는 것, 그것이 이 관계의 성숙한 모습입니다.` },
    ];
  }
  return [
    { phase: "만남", advice: `강렬한 첫인상이거나, 반대로 서로를 이해하기 어려울 수 있습니다. 어느 쪽이든 판단을 유보하고, 상대를 있는 그대로 관찰하세요. 이 관계는 시간이 필요한 종류입니다.` },
    { phase: "연애 초기", advice: `서로의 세계가 매우 다르다는 것을 실감하는 시기입니다. 차이에 놀라기보다, "왜 그렇게 생각하는지"를 물어보세요. 이해하려는 노력 자체가 이 관계의 언어입니다.` },
    { phase: "깊어지는 시기", advice: `${sharedStr}이라는 작은 공통분모에서 출발하세요. 큰 것을 함께하기보다 작은 것을 꾸준히 함께하는 것이 유효합니다. 서로의 페이스를 존중하는 것이 핵심입니다.` },
    { phase: "위기", advice: `${tensionStr}의 충돌이 깊어질 수 있습니다. 하지만 이 관계에서의 위기는 곧 성장의 기회입니다. 서로를 바꾸려 하지 말고, 자신이 변화할 수 있는 부분을 찾으세요.` },
    { phase: "성숙", advice: `이 관계를 유지해왔다면, 그 자체가 대단한 성취입니다. 쉽지 않았기에 더 강하고, 힘들었기에 더 소중한 관계. 서로에 대한 존경을 잃지 마세요. 이 관계는 두 사람을 가장 크게 성장시킵니다.` },
  ];
}

// ━━━ 소통 스타일 생성 ━━━

function generateCommunicationStyle(
  p1: CrosspointResult, p2: CrosspointResult,
  name1: string, name2: string,
): { person1: string; person2: string; tip: string } {
  const oh1 = p1.saju.day.ohang;
  const oh2 = p2.saju.day.ohang;
  const el1 = p1.western.element;
  const el2 = p2.western.element;

  const commStyles: Record<Ohang, string> = {
    "木": "나무처럼 위로 뻗어나가는 소통을 합니다. 비전과 이상을 말하고, 성장 가능성에 대해 이야기하는 것을 좋아합니다. 직선적이고 진솔하지만, 때때로 자기 주장이 강할 수 있습니다.",
    "火": "불꽃처럼 열정적으로 소통합니다. 감정을 즉시 표현하고, 분위기를 주도하며, 칭찬과 인정에 민감합니다. 대화에 에너지를 불어넣지만, 감정적으로 과열될 수 있습니다.",
    "土": "대지처럼 안정적으로 소통합니다. 경청을 잘하고, 실질적인 조언을 선호하며, 일관성 있는 태도를 유지합니다. 신뢰감을 주지만, 변화에 대한 저항이 있을 수 있습니다.",
    "金": "금속처럼 명확하고 날카롭게 소통합니다. 핵심을 짚고, 논리적으로 말하며, 효율을 중시합니다. 명쾌하지만, 감정적 여유가 부족해 보일 수 있습니다.",
    "水": "물처럼 유연하고 깊이 있게 소통합니다. 분위기를 읽고, 상대의 감정에 공감하며, 직감적으로 이해합니다. 깊은 연결을 만들지만, 자기 의견을 명확히 밝히지 않을 수 있습니다.",
  };

  const westernTips: Record<string, string> = {
    "Fire": "열정과 즉각적 반응을 보입니다",
    "Earth": "현실적이고 구체적인 대화를 선호합니다",
    "Air": "아이디어와 토론을 즐깁니다",
    "Water": "감정과 직관에 기반한 소통을 합니다",
  };

  const p1Style = `${commStyles[oh1]} 서양 별자리의 ${el1} 원소가 더해져, ${westernTips[el1] || "독특한 소통 패턴을 보입니다"}.`;
  const p2Style = `${commStyles[oh2]} 서양 별자리의 ${el2} 원소가 더해져, ${westernTips[el2] || "독특한 소통 패턴을 보입니다"}.`;

  // Generate tip based on combination
  let tip: string;
  if (oh1 === oh2) {
    tip = `두 사람의 소통 파장이 비슷해 말하지 않아도 통하는 부분이 많습니다. 하지만 같은 스타일이기에 놓치는 부분도 같을 수 있습니다. 의식적으로 "상대가 말하지 않은 것"에 주의를 기울여 보세요. 서로의 약점이 겹칠 때, 제3자의 시선을 빌리는 것도 방법입니다.`;
  } else if (SANGSAENG[oh1] === oh2 || SANGSAENG[oh2] === oh1) {
    tip = `한 사람이 시작한 대화를 다른 사람이 자연스럽게 발전시키는 흐름이 있습니다. ${name1}의 ${OHANG_INFO[oh1].kr} 에너지가 ${name2}의 ${OHANG_INFO[oh2].kr} 에너지를 활성화합니다. 이 자연스러운 흐름을 활용하되, 받는 쪽만 되지 않도록 역할을 번갈아 하는 연습을 하세요.`;
  } else if (SANGGEUK[oh1] === oh2 || SANGGEUK[oh2] === oh1) {
    tip = `소통 방식의 차이가 가장 크게 느껴지는 조합입니다. ${name1}이(가) 중요하게 생각하는 것과 ${name2}이(가) 중요하게 생각하는 것이 다릅니다. 상대의 소통 방식을 "틀린 것"이 아닌 "다른 것"으로 받아들이세요. 대화 전 "지금 나는 감정을 나누고 싶은지, 해결책을 원하는지"를 먼저 말해주면 오해가 줄어듭니다.`;
  } else {
    tip = `서로의 소통 스타일이 다르지만, 직접적 충돌보다는 미묘한 엇갈림으로 나타납니다. 중요한 대화는 충분한 시간을 확보하고 시작하세요. "나는 이렇게 느꼈어"로 시작하는 아이-메시지(I-message)가 이 관계에서 특히 효과적입니다.`;
  }

  return { person1: p1Style, person2: p2Style, tip };
}

// ━━━ 갈등 패턴 생성 ━━━

function generateConflictPattern(
  p1: CrosspointResult, p2: CrosspointResult,
  score: number,
  tension: string[],
  relation: "상생" | "상극" | "비화" | "상합",
): { trigger: string; resolution: string } {
  const oh1 = OHANG_INFO[p1.saju.day.ohang].kr;
  const oh2 = OHANG_INFO[p2.saju.day.ohang].kr;
  const tensionStr = tension.length > 0 ? tension[0] : "가치관의 차이";

  let trigger: string;
  let resolution: string;

  if (relation === "상극") {
    trigger = `${oh1}과 ${oh2}의 상극 에너지는 "${tensionStr}" 영역에서 가장 두드러지게 충돌합니다. ` +
      `한쪽이 주도하려 할 때 다른 쪽이 저항하고, 해결 방식의 차이가 감정적 골을 만들 수 있습니다. ` +
      `특히 피로하거나 스트레스가 쌓였을 때, 이 상극의 에너지가 증폭됩니다. ` +
      `일상적인 결정(식사, 여행, 소비 습관)에서부터 마찰이 시작되는 경우가 많습니다.`;
    resolution = `상극은 파괴가 아닌 변환의 에너지입니다. 갈등이 시작되면 즉시 해결하려 하지 말고, 각자 30분의 냉각 시간을 가지세요. ` +
      `"네가 틀렸어"가 아닌 "나는 이렇게 느꼈어"로 대화를 시작하세요. ` +
      `주간 체크인 — 매주 한 번, 부담 없는 환경에서 서로의 감정 온도를 확인하는 시간을 만들면, 작은 불씨가 큰불로 번지는 것을 막을 수 있습니다.`;
  } else if (relation === "비화") {
    trigger = `같은 ${oh1}의 기운을 가진 두 사람은 역설적으로 "너무 같기에" 갈등이 생깁니다. ` +
      `서로의 약점이 동일하기 때문에 보완이 되지 않고, 같은 문제 앞에서 둘 다 막히는 상황이 반복됩니다. ` +
      `"당연히 알아줄 거야"라는 기대가 좌절될 때 실망이 크고, ` +
      `비슷한 자존심 구조가 화해를 어렵게 만들 수 있습니다.`;
    resolution = `"같음"을 당연시하지 마세요. 같은 원소라도 각자의 표현 방식은 다릅니다. ` +
      `의식적으로 새로운 경험을 함께 시도하고, 서로의 미세한 차이를 발견하는 즐거움을 찾으세요. ` +
      `갈등 시에는 제3자(신뢰할 수 있는 친구나 전문가)의 시선이 특히 도움이 됩니다. ` +
      `"우리는 같으니까"라는 전제를 내려놓는 것이 해결의 첫걸음입니다.`;
  } else if (relation === "상생") {
    trigger = `상생 관계에서의 갈등은 "주는 사람"과 "받는 사람"의 역할이 고정될 때 발생합니다. ` +
      `${oh1}이 ${oh2}를 생하는 흐름이 지속되면, 한쪽은 소진을, 다른 쪽은 의존을 경험하게 됩니다. ` +
      `"${tensionStr}" 영역에서 이 불균형이 가장 먼저 드러납니다. ` +
      `감사가 줄어들고 당연함이 늘어날 때, 상생의 에너지가 한쪽으로만 빠져나갑니다.`;
    resolution = `역할을 의식적으로 교대하세요. 항상 주는 쪽이 때로는 받을 수 있어야 하고, 받는 쪽도 능동적으로 줄 수 있어야 합니다. ` +
      `감사를 구체적으로 표현하는 습관 — "고마워"보다 "네가 이렇게 해줘서 내가 이런 기분이 들었어"가 효과적입니다. ` +
      `분기에 한 번, 관계의 에너지 밸런스를 점검하는 솔직한 대화 시간을 가져보세요.`;
  } else {
    trigger = `간접적 관계에서의 갈등은 서로의 의도를 오해하는 데서 시작됩니다. ` +
      `${oh1}과 ${oh2}는 직접적으로 연결되지 않기에, 상대의 행동을 자신의 프레임으로 해석하는 오류가 잦습니다. ` +
      `"${tensionStr}" 상황에서 "왜 저렇게 행동하지?"라는 의문이 불신으로 번질 수 있습니다. ` +
      `소통의 빈도가 줄어들면 이 간격이 더 벌어집니다.`;
    resolution = `의도를 명시적으로 말하세요. "이런 의도로 한 건데, 어떻게 느꼈어?"라고 물어보는 것이 이 관계의 황금 질문입니다. ` +
      `서로의 세계를 이해하기 위한 "체험"을 만드세요 — 상대가 좋아하는 것을 함께 해보는 경험이 말보다 효과적입니다. ` +
      `갈등이 깊어지기 전에 "나 요즘 이런 점이 아쉬워"라고 작은 신호를 보내는 연습을 하세요.`;
  }

  return { trigger, resolution };
}

// ━━━ 메인 분석 함수 ━━━

export function analyzeCompatibility(input: CompatibilityInput): CompatibilityResult {
  const { person1: p1Input, person2: p2Input } = input;

  // 이름 문자열 (여러 곳에서 사용)
  const p1NameStr = p1Input.name || "첫 번째 사람";
  const p2NameStr = p2Input.name || "두 번째 사람";

  // 각 사람의 교차점 분석
  const person1 = analyzeCrosspoint(p1Input.year, p1Input.month, p1Input.day, p1Input.name);
  const person2 = analyzeCrosspoint(p2Input.year, p2Input.month, p2Input.day, p2Input.name);

  // 1. 오행 궁합 (30%)
  const oh1 = person1.saju.day.ohang;
  const oh2 = person2.saju.day.ohang;
  const ohangResult = scoreOhangCompat(oh1, oh2);

  // 2. 별자리 궁합 (25%)
  const westernResult = scoreWesternCompat(
    person1.western.element, person1.western.sunSign.name,
    person2.western.element, person2.western.sunSign.name,
  );

  // 3. 수비학 궁합 (25%)
  const numResult = scoreNumerologyCompat(
    person1.numerology.lifePath, person1.numerology.lifePathInfo.name,
    person2.numerology.lifePath, person2.numerology.lifePathInfo.name,
  );

  // 4. MBTI 궁합 (20%)
  const mbtiResult = scoreMbtiCompat(
    person1.mbti.primaryType, person2.mbti.primaryType,
    p1NameStr, p2NameStr,
  );

  // 종합 점수
  const overallScore = Math.round(
    ohangResult.score * 0.3 +
    westernResult.score * 0.25 +
    numResult.score * 0.25 +
    mbtiResult.score * 0.2
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

  // 차원별 점수 + 상세 설명(detail)
  const ohangDetail = generateOhangDetail(oh1, oh2, p1NameStr, p2NameStr);
  const westernDetail = generateWesternDetail(
    person1.western.element, person1.western.sunSign.name,
    person2.western.element, person2.western.sunSign.name,
    p1NameStr, p2NameStr,
  );
  const numDetail = generateNumerologyDetail(
    person1.numerology.lifePath, person1.numerology.lifePathInfo.name,
    person2.numerology.lifePath, person2.numerology.lifePathInfo.name,
    p1NameStr, p2NameStr,
    numResult.score,
  );

  const dimensions: CompatibilityResult["dimensions"] = [
    {
      name: "오행 궁합",
      score: ohangResult.score,
      description: ohangResult.description,
      detail: ohangDetail,
      system: "saju",
    },
    {
      name: "별자리 궁합",
      score: westernResult.score,
      description: westernResult.description,
      detail: westernDetail,
      system: "western",
    },
    {
      name: "수비학 궁합",
      score: numResult.score,
      description: numResult.description,
      detail: numDetail,
      system: "numerology",
    },
    {
      name: "MBTI 궁합",
      score: mbtiResult.score,
      description: mbtiResult.description,
      detail: mbtiResult.detail,
      system: "mbti",
    },
  ];

  // 조언
  const advice = generateAdvice(
    overallScore, elementRelation,
    traits.shared, traits.tension, archetype.name,
  );

  // 라벨
  const overallLabel = archetype.name;

  // ━━━ 신규 심화 분석 ━━━

  const person1Detail = generatePersonDetail(person1, p1NameStr);
  const person2Detail = generatePersonDetail(person2, p2NameStr);

  const elementStory = generateElementStory(
    oh1, oh2,
    person1.western.element, person2.western.element,
    person1.western.sunSign.name, person2.western.sunSign.name,
    relation,
  );

  const timelineAdvice = generateTimelineAdvice(
    overallScore, relation,
    traits.shared, traits.tension,
  );

  const communicationStyle = generateCommunicationStyle(
    person1, person2,
    p1NameStr, p2NameStr,
  );

  const conflictPattern = generateConflictPattern(
    person1, person2,
    overallScore, traits.tension, relation,
  );

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
    person1Detail,
    person2Detail,
    elementStory,
    timelineAdvice,
    communicationStyle,
    conflictPattern,
  };
}
