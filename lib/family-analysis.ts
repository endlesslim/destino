// lib/family-analysis.ts
// 가족 분석 엔진 — 가족 구성원의 교차점을 비교하고 관계 역학을 분석

import { analyzeCrosspoint, type CrosspointResult } from "./cross-engine";
import { OHANG_INFO, SANGSAENG, SANGGEUK, type Ohang, OHANG_LIST } from "./saju";

// ━━━ 타입 ━━━

export interface FamilyMember {
  role: string;        // "나", "아버지", "어머니", "형/오빠", "동생" etc.
  year: number;
  month: number;
  day: number;
  name?: string;
}

export interface FamilyMemberResult {
  role: string;
  archetype: string;
  element: string;
  zodiac: string;
  shortDesc: string;
  crosspoint: CrosspointResult;
}

export interface FamilyRelationship {
  pair: [string, string];
  score: number;
  relation: string;           // "상생", "상극", "비화", "상합"
  description: string;
}

export interface FamilyAnalysis {
  members: FamilyMemberResult[];

  relationships: FamilyRelationship[];

  familyDynamic: string;
  familyElement: string;       // Dominant family element
  advice: string[];
}

// ━━━ 오행 관계 판별 ━━━

function getOhangRelation(oh1: Ohang, oh2: Ohang): { relation: string; score: number } {
  if (oh1 === oh2) {
    return { relation: "비화", score: 72 };
  }
  if (SANGSAENG[oh1] === oh2 || SANGSAENG[oh2] === oh1) {
    return { relation: "상생", score: 88 };
  }
  if (SANGGEUK[oh1] === oh2 || SANGGEUK[oh2] === oh1) {
    return { relation: "상극", score: 45 };
  }
  return { relation: "상합", score: 65 };
}

// ━━━ 관계 설명 생성 ━━━

const ROLE_RELATION_CONTEXT: Record<string, Record<string, string>> = {
  "부모-자녀": {
    "상생": "부모와 자녀 사이에 자연스러운 에너지 흐름이 있습니다. 서로를 키워주는 따뜻한 관계로, 부모의 지혜가 자녀에게 자연스럽게 전해집니다.",
    "상극": "세대 간 가치관의 차이가 갈등으로 나타날 수 있습니다. 하지만 이 긴장감이 오히려 서로의 성장을 촉진하는 원동력이 되기도 합니다.",
    "비화": "같은 성향을 공유하여 깊이 이해하지만, 비슷한 약점도 공유하게 됩니다. 서로의 거울이 되어 자신을 객관적으로 볼 수 있는 관계입니다.",
    "상합": "서로 다른 영역에서 강점을 발휘하는 보완적 관계입니다. 각자의 역할이 분명하여 가정 내 균형을 이루는 데 기여합니다.",
  },
  "형제": {
    "상생": "형제자매 간에 서로를 북돋우는 긍정적 에너지가 흐릅니다. 한 사람의 장점이 다른 사람의 성장에 자양분이 되는 이상적인 관계입니다.",
    "상극": "경쟁적인 에너지가 강하여 갈등이 자주 생길 수 있지만, 이를 통해 서로가 더 강해집니다. 성인이 되어 서로의 가치를 인정하게 되면 가장 든든한 파트너가 됩니다.",
    "비화": "마치 쌍둥이처럼 서로를 이해합니다. 같은 취미, 같은 관심사를 공유하기 쉽지만, 같은 자원을 두고 경쟁할 때 갈등이 커질 수 있습니다.",
    "상합": "서로 다른 세계를 가지고 있어 각자의 영역을 존중합니다. 함께 있으면 새로운 시각을 얻게 되는 관계입니다.",
  },
  "배우자": {
    "상생": "서로의 부족한 부분을 자연스럽게 채워주는 이상적인 배우자 관계입니다. 함께 있을 때 각자의 잠재력이 극대화됩니다.",
    "상극": "강렬한 끌림과 동시에 깊은 갈등을 경험할 수 있는 관계입니다. 서로의 차이를 인정하고 조율하는 노력이 필요하며, 이를 통해 깊은 성숙에 이를 수 있습니다.",
    "비화": "서로를 거울처럼 비추는 관계로, 깊은 공감대를 형성하지만 변화와 자극이 부족할 수 있습니다. 함께 새로운 경험을 찾아 나서는 것이 중요합니다.",
    "상합": "각자의 독립성을 유지하면서도 조화를 이루는 파트너십입니다. 서로 다른 시각이 가정에 풍요로운 다양성을 가져옵니다.",
  },
  "기본": {
    "상생": "두 사람 사이에 에너지가 자연스럽게 흐르는 상생 관계입니다. 한 사람의 강점이 다른 사람의 성장을 돕고, 함께 있을 때 더 큰 시너지를 만들어 냅니다.",
    "상극": "서로 다른 에너지가 부딪히는 상극 관계이지만, 이 긴장감이 서로의 성장을 자극합니다. 차이를 인정하고 존중할 때 강력한 파트너십이 됩니다.",
    "비화": "같은 오행을 공유하는 비화 관계로 서로를 깊이 이해하지만, 같은 방향으로만 치우칠 수 있습니다. 외부의 다양한 자극이 필요합니다.",
    "상합": "서로 보완하는 조화로운 관계입니다. 각자의 강점이 다른 영역에서 발휘되어 균형 잡힌 역학을 만듭니다.",
  },
};

function getRoleContext(role1: string, role2: string): string {
  const parentRoles = ["아버지", "어머니", "아빠", "엄마"];
  const childRoles = ["나", "아들", "딸", "동생", "막내"];
  const siblingRoles = ["형", "오빠", "누나", "언니", "동생", "막내", "첫째", "둘째", "셋째"];
  const spouseRoles = ["배우자", "남편", "아내", "남자친구", "여자친구"];

  const isParentChild =
    (parentRoles.includes(role1) && childRoles.includes(role2)) ||
    (parentRoles.includes(role2) && childRoles.includes(role1));

  const isSiblings =
    siblingRoles.includes(role1) && siblingRoles.includes(role2);

  const isSpouse =
    spouseRoles.includes(role1) || spouseRoles.includes(role2);

  if (isParentChild) return "부모-자녀";
  if (isSiblings) return "형제";
  if (isSpouse) return "배우자";
  return "기본";
}

// ━━━ 가족 역학 종합 ━━━

function describeFamilyDynamic(members: FamilyMemberResult[], dominantElement: Ohang): string {
  const count = members.length;
  const info = OHANG_INFO[dominantElement];
  const archetypes = members.map(m => `${m.role}(${m.archetype})`).join(", ");

  const dynamicDescriptions: Record<Ohang, string> = {
    "木": `이 가족은 ${info.kr}의 기운이 주도적입니다. 성장과 확장의 에너지가 강하여, 가족 구성원 모두가 각자의 방식으로 발전하고자 하는 의지가 강합니다. ${count}명의 구성원(${archetypes})이 모여 서로의 성장을 격려하는 활기찬 가정 분위기를 만들어 갑니다. 봄바람처럼 새로운 시작을 두려워하지 않는 가족이지만, 때로는 뿌리를 내리고 안정을 찾는 시간도 필요합니다.`,
    "火": `이 가족은 ${info.kr}의 기운이 중심에 있습니다. 열정과 에너지가 넘치는 가정으로, 웃음과 활기가 끊이지 않습니다. ${count}명의 구성원(${archetypes})이 각자의 열정을 가지고 살아가며, 서로를 자극하고 영감을 주는 역동적인 관계를 형성합니다. 다만 모두가 뜨거운 성격이기에, 감정이 과열될 때 서로 한 발 물러설 줄 아는 지혜가 필요합니다.`,
    "土": `이 가족은 ${info.kr}의 기운이 기반을 이룹니다. 안정과 신뢰를 중시하는 든든한 가정으로, 서로에 대한 믿음이 깊습니다. ${count}명의 구성원(${archetypes})이 각자의 자리에서 묵묵히 역할을 다하며, 예측 가능하고 일관된 가정 환경을 만들어 갑니다. 전통을 소중히 여기되, 변화를 받아들이는 유연함도 함께 길러가면 더욱 풍요로운 가정이 됩니다.`,
    "金": `이 가족은 ${info.kr}의 기운이 흐릅니다. 원칙과 질서를 중시하며, 옳고 그름에 대한 기준이 뚜렷한 가정입니다. ${count}명의 구성원(${archetypes})이 각자의 신념을 가지고 있어 때로 의견 충돌이 있지만, 결국 공정함과 정의를 추구하는 방향으로 합의점을 찾습니다. 냉철한 판단력이 강점이지만, 따뜻한 감정 표현에도 노력을 기울이면 좋겠습니다.`,
    "水": `이 가족은 ${info.kr}의 기운이 감돌고 있습니다. 감성적이고 직관적인 가정으로, 말하지 않아도 서로의 마음을 읽는 깊은 유대가 있습니다. ${count}명의 구성원(${archetypes})이 각자의 내면 세계가 풍부하여, 지적이고 감성적인 대화가 오가는 가정입니다. 깊은 감수성이 장점이지만, 때로는 감정에 빠지지 않고 현실적으로 행동하는 균형이 필요합니다.`,
  };

  return dynamicDescriptions[dominantElement];
}

// ━━━ 가족 조언 생성 ━━━

function generateFamilyAdvice(members: FamilyMemberResult[], relationships: FamilyRelationship[]): string[] {
  const advice: string[] = [];

  // 상극 관계가 있으면 조언
  const conflictPairs = relationships.filter(r => r.relation === "상극");
  if (conflictPairs.length > 0) {
    const pair = conflictPairs[0];
    advice.push(
      `${pair.pair[0]}와(과) ${pair.pair[1]} 사이에 상극 에너지가 있습니다. 서로의 차이를 약점이 아닌 강점으로 바라보는 연습을 해보세요. 다름은 틀림이 아닙니다.`
    );
  }

  // 상생 관계가 있으면 조언
  const harmonyPairs = relationships.filter(r => r.relation === "상생");
  if (harmonyPairs.length > 0) {
    const pair = harmonyPairs[0];
    advice.push(
      `${pair.pair[0]}와(과) ${pair.pair[1]}의 상생 에너지를 가족 전체의 윤활유로 활용하세요. 이 두 사람이 가족 모임의 분위기를 이끌면 좋습니다.`
    );
  }

  // 오행 밸런스 조언
  const elements = members.map(m => m.crosspoint.saju.day.ohang);
  const elementSet = new Set(elements);
  const missingElements = OHANG_LIST.filter(e => !elementSet.has(e));

  if (missingElements.length > 0) {
    const missing = missingElements.map(e => `${OHANG_INFO[e].kr}(${e})`).join(", ");
    advice.push(
      `가족 전체에 ${missing}의 기운이 부족합니다. 이 기운을 보충할 수 있는 활동이나 환경을 함께 만들어 보세요.`
    );
  }

  // 일반 조언
  advice.push(
    "가족은 서로 다른 기운이 모여 하나의 우주를 이루는 것입니다. 각자의 고유한 에너지를 존중하고, 부족한 부분은 함께 채워 나가세요."
  );

  return advice.slice(0, 4);
}

// ━━━ 메인 분석 함수 ━━━

export function analyzeFamilyRelationships(members: FamilyMember[]): FamilyAnalysis {
  // 1. 각 구성원 개별 분석
  const memberResults: FamilyMemberResult[] = members.map(member => {
    const cp = analyzeCrosspoint(member.year, member.month, member.day, member.name);
    return {
      role: member.role,
      archetype: cp.archetype,
      element: cp.saju.day.ohang,
      zodiac: cp.western.sunSign.name,
      shortDesc: cp.archetype_desc.slice(0, 80) + (cp.archetype_desc.length > 80 ? "..." : ""),
      crosspoint: cp,
    };
  });

  // 2. 모든 쌍의 관계 분석
  const relationships: FamilyRelationship[] = [];
  for (let i = 0; i < memberResults.length; i++) {
    for (let j = i + 1; j < memberResults.length; j++) {
      const m1 = memberResults[i];
      const m2 = memberResults[j];
      const oh1 = m1.crosspoint.saju.day.ohang;
      const oh2 = m2.crosspoint.saju.day.ohang;
      const { relation, score } = getOhangRelation(oh1, oh2);

      // 별자리 궁합 보정
      const best1 = m1.crosspoint.western.sunSign.compatibility_best || [];
      const best2 = m2.crosspoint.western.sunSign.compatibility_best || [];
      let adjustedScore = score;
      if (best1.includes(m2.crosspoint.western.sunSign.name) || best2.includes(m1.crosspoint.western.sunSign.name)) {
        adjustedScore = Math.min(100, adjustedScore + 10);
      }
      const worst1 = m1.crosspoint.western.sunSign.compatibility_worst || [];
      const worst2 = m2.crosspoint.western.sunSign.compatibility_worst || [];
      if (worst1.includes(m2.crosspoint.western.sunSign.name) || worst2.includes(m1.crosspoint.western.sunSign.name)) {
        adjustedScore = Math.max(20, adjustedScore - 8);
      }

      // 관계 맥락에 맞는 설명
      const context = getRoleContext(m1.role, m2.role);
      const descriptions = ROLE_RELATION_CONTEXT[context] || ROLE_RELATION_CONTEXT["기본"];
      const description = descriptions[relation] || descriptions["상합"];

      relationships.push({
        pair: [m1.role, m2.role],
        score: adjustedScore,
        relation,
        description,
      });
    }
  }

  // 3. 가족 지배 오행 계산
  const elementCounts: Record<string, number> = {};
  for (const m of memberResults) {
    const el = m.crosspoint.saju.day.ohang;
    elementCounts[el] = (elementCounts[el] || 0) + 1;
  }
  const dominantElement = (Object.entries(elementCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "木") as Ohang;

  // 4. 가족 역학 종합
  const familyDynamic = describeFamilyDynamic(memberResults, dominantElement);

  // 5. 조언 생성
  const advice = generateFamilyAdvice(memberResults, relationships);

  return {
    members: memberResults,
    relationships,
    familyDynamic,
    familyElement: dominantElement,
    advice,
  };
}
