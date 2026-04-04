// src/lib/cross-engine.ts
// 교차점 분석 엔진 — DESTINO의 핵심 차별화 기능

import { analyzeSaju, type SajuResult, type Ohang, OHANG_LIST, OHANG_INFO, SANGSAENG, CHEONGAN_INFO } from "./saju";
import { analyzeWestern, type WesternResult, ELEMENT_TO_OHANG } from "./western";
import { analyzeNumerology, type NumerologyResult, LIFEPATH_TO_CHEONGAN } from "./numerology";

// ━━━ 성격 키워드 축 (20개) ━━━
export const TRAIT_AXES = [
  "리더십","추진력","유연함","적응력","열정","에너지",
  "섬세함","통찰력","안정감","신뢰","포용력","현실감각",
  "결단력","정의감","예민함","완벽주의","자유","지혜",
  "직관","감성"
] as const;
export type TraitAxis = typeof TRAIT_AXES[number];

// 각 체계의 결과를 TraitAxis로 변환하는 매핑
const OHANG_TRAITS: Record<Ohang, TraitAxis[]> = {
  "木": ["추진력","유연함","리더십","적응력"],
  "火": ["열정","에너지","리더십","섬세함"],
  "土": ["안정감","신뢰","포용력","현실감각"],
  "金": ["결단력","정의감","예민함","완벽주의"],
  "水": ["자유","지혜","직관","감성"],
};

const ELEMENT_TRAITS: Record<string, TraitAxis[]> = {
  "Fire": ["열정","에너지","리더십","추진력"],
  "Earth": ["안정감","현실감각","신뢰","완벽주의"],
  "Air": ["유연함","적응력","자유","지혜"],
  "Water": ["직관","감성","섬세함","통찰력"],
};

// 천간 trait → TraitAxis 매핑 (CHEONGAN_INFO.trait에서 매칭되는 것들)
const CHEONGAN_TRAIT_MAP: Record<string, TraitAxis> = {
  "리더십": "리더십",
  "추진력": "추진력",
  "유연함": "유연함",
  "적응력": "적응력",
  "열정": "열정",
  "활력": "에너지",
  "존재감": "에너지",
  "섬세함": "섬세함",
  "통찰력": "통찰력",
  "따뜻함": "포용력",
  "안정감": "안정감",
  "신뢰": "신뢰",
  "포용력": "포용력",
  "포용": "포용력",
  "현실감각": "현실감각",
  "결단력": "결단력",
  "정의감": "정의감",
  "날카로움": "결단력",
  "예민함": "예민함",
  "완벽주의": "완벽주의",
  "심미안": "완벽주의",
  "자유": "자유",
  "지혜": "지혜",
  "직관": "직관",
  "감성": "감성",
  "끈기": "추진력",
  "정직함": "신뢰",
  "외교력": "유연함",
  "양육": "포용력",
};

// 별자리 trait → TraitAxis 매핑 (ZODIAC trait에서 매칭되는 것들)
const ZODIAC_TRAIT_MAP: Record<string, TraitAxis> = {
  "용기": "추진력",
  "주도력": "리더십",
  "열정": "열정",
  "인내": "안정감",
  "감각": "감성",
  "소통": "유연함",
  "호기심": "직관",
  "다재다능": "적응력",
  "양육": "포용력",
  "보호": "안정감",
  "감성": "감성",
  "자존감": "리더십",
  "창의력": "직관",
  "관대함": "포용력",
  "분석력": "통찰력",
  "봉사": "포용력",
  "완벽주의": "완벽주의",
  "조화": "유연함",
  "공정": "정의감",
  "매력": "감성",
  "통찰": "통찰력",
  "집념": "추진력",
  "변환": "적응력",
  "자유": "자유",
  "탐험": "추진력",
  "철학": "지혜",
  "야망": "리더십",
  "책임감": "신뢰",
  "혁신": "추진력",
  "독립": "자유",
  "인도주의": "포용력",
  "공감": "감성",
  "직관": "직관",
  "예술성": "감성",
};

// 수비학 strength → TraitAxis 매핑
const NUMEROLOGY_TRAIT_MAP: Record<string, TraitAxis> = {
  "독립성": "자유",
  "창의성": "직관",
  "결단력": "결단력",
  "자기확신": "리더십",
  "외교력": "유연함",
  "공감": "감성",
  "인내": "안정감",
  "직관": "직관",
  "표현력": "감성",
  "낙관": "에너지",
  "사교성": "유연함",
  "체계": "현실감각",
  "실용": "현실감각",
  "성실": "신뢰",
  "적응력": "적응력",
  "호기심": "직관",
  "다재다능": "적응력",
  "책임감": "신뢰",
  "헌신": "포용력",
  "심미안": "완벽주의",
  "치유": "포용력",
  "분석력": "통찰력",
  "집중": "추진력",
  "영성": "직관",
  "실행력": "추진력",
  "비전": "통찰력",
  "조직력": "리더십",
  "리더십": "리더십",
  "관대함": "포용력",
  "지혜": "지혜",
  "이상주의": "열정",
  "포용": "포용력",
  "영감": "직관",
  "카리스마": "리더십",
  "거시적 비전": "통찰력",
  "실현력": "추진력",
  "영향력": "리더십",
  "끈기": "안정감",
  "무조건적 사랑": "포용력",
  "영적 리더십": "지혜",
};

// ━━━ 교차점 결과 타입 ━━━
export interface CrosspointMatch {
  trait: TraitAxis;
  sources: string[];     // 어떤 체계들이 이 특성을 가리키는지
  count: number;         // 몇 개 체계가 일치하는지
  strength: "강" | "중" | "약";
}

export interface CrosspointResult {
  // 개별 체계 결과
  saju: SajuResult;
  western: WesternResult;
  numerology: NumerologyResult;

  // 교차점 분석
  matches: CrosspointMatch[];        // 일치하는 특성들 (count >= 2)
  top_match: CrosspointMatch | null;  // 가장 강한 교차점
  convergence_rate: number;           // 전체 수렴률 (0~100)
  element_harmony: ElementHarmony;    // 동서양 원소 조화도

  // 종합
  archetype: string;      // "타고난 지휘관", "조용한 혁명가" 등
  archetype_desc: string;  // 아키타입 설명
  system_count: number;    // 분석에 참여한 체계 수

  // 교차 메시지
  cross_message: string;   // 2~3문장 종합 해석

  // 오행 시각화 데이터
  ohang_visual: { ohang: Ohang; ratio: number; label: string }[];
}

export interface ElementHarmony {
  eastern: Ohang;
  western: string;
  relation: "공명" | "상생" | "긴장" | "독특";
  description: string;
  score: number; // 0~100
}

// ━━━ 교차점 분석 로직 ━━━

function extractTraits(saju: SajuResult, western: WesternResult, numerology: NumerologyResult): Map<TraitAxis, string[]> {
  const traitMap = new Map<TraitAxis, string[]>();

  function addTraits(traits: TraitAxis[], source: string) {
    for (const t of traits) {
      const existing = traitMap.get(t) || [];
      existing.push(source);
      traitMap.set(t, existing);
    }
  }

  // 1. 사주 — 일간 오행 기준
  const sajuOhang = saju.day.ohang;
  addTraits(OHANG_TRAITS[sajuOhang] || [], "사주");

  // 2. 사주 — 연주 오행 (동등하게 취급)
  const yearOhang = saju.year.ohang;
  if (yearOhang !== sajuOhang) {
    addTraits(OHANG_TRAITS[yearOhang] || [], "사주(연)");
  }

  // 3. 사주 — 일간 천간 성격 특성 (CHEONGAN_INFO.trait)
  const dayCheongan = saju.day.cheongan;
  const dayInfo = CHEONGAN_INFO[dayCheongan];
  if (dayInfo) {
    const mappedDayTraits = dayInfo.trait
      .map(t => CHEONGAN_TRAIT_MAP[t])
      .filter((t): t is TraitAxis => !!t);
    addTraits(mappedDayTraits, "사주(일간)");
  }

  // 4. 사주 — 연간 천간 성격 특성
  const yearCheongan = saju.year.cheongan;
  const yearInfo = CHEONGAN_INFO[yearCheongan];
  if (yearInfo) {
    const mappedYearTraits = yearInfo.trait
      .map(t => CHEONGAN_TRAIT_MAP[t])
      .filter((t): t is TraitAxis => !!t);
    addTraits(mappedYearTraits, "사주(연간)");
  }

  // 5. 서양 점성술 — 태양궁 원소
  const westernTraits = ELEMENT_TRAITS[western.element] || [];
  addTraits(westernTraits, "별자리");

  // 6. 서양 점성술 — 태양궁 trait (넓은 매핑)
  const signTraits = western.sunSign.trait
    .map(t => ZODIAC_TRAIT_MAP[t])
    .filter((t): t is TraitAxis => !!t);
  addTraits(signTraits, "별자리");

  // 7. 서양 점성술 — 직접 TraitAxis에 해당하는 trait
  const directSignTraits = western.sunSign.trait
    .filter((t): t is TraitAxis => TRAIT_AXES.includes(t as TraitAxis));
  addTraits(directSignTraits, "별자리");

  // 8. 수비학 — 생명경로수 → 천간 → 오행 기반 특성
  const lpCheongan = LIFEPATH_TO_CHEONGAN[numerology.lifePath];
  if (lpCheongan) {
    const lpInfo = CHEONGAN_INFO[lpCheongan as keyof typeof CHEONGAN_INFO];
    if (lpInfo) {
      addTraits(OHANG_TRAITS[lpInfo.ohang] || [], "수비학");
      // 추가: 천간 자체의 trait도 활용
      const lpCheonganTraits = lpInfo.trait
        .map(t => CHEONGAN_TRAIT_MAP[t])
        .filter((t): t is TraitAxis => !!t);
      addTraits(lpCheonganTraits, "수비학(천간)");
    }
  }

  // 9. 수비학 — 생명경로수 strength (넓은 매핑)
  const lpStrengthMapped = numerology.lifePathInfo.strength
    .map(t => NUMEROLOGY_TRAIT_MAP[t])
    .filter((t): t is TraitAxis => !!t);
  addTraits(lpStrengthMapped, "수비학");

  // 10. 수비학 — 직접 TraitAxis에 해당하는 strength
  const lpStrengthDirect = numerology.lifePathInfo.strength
    .filter((t): t is TraitAxis => TRAIT_AXES.includes(t as TraitAxis));
  addTraits(lpStrengthDirect, "수비학");

  return traitMap;
}

function analyzeElementHarmony(saju: SajuResult, western: WesternResult): ElementHarmony {
  const eastern = saju.day.ohang;
  const westernEl = western.element;
  const matchingOhang = ELEMENT_TO_OHANG[westernEl] || [];

  // 완벽 공명: 서양 원소의 대응 오행에 동양 오행이 포함
  if (matchingOhang[0] === eastern) {
    return {
      eastern, western: westernEl,
      relation: "공명",
      description: `동양의 ${OHANG_INFO[eastern].kr}과 서양의 ${westernEl}이 같은 원소입니다. 두 문명이 완벽하게 같은 답을 내렸습니다.`,
      score: 95
    };
  }

  // 상생: 서양 원소 대응 오행이 동양 오행을 생해주는 관계
  if (matchingOhang.includes(SANGSAENG[eastern]) || matchingOhang.some(o => SANGSAENG[o as Ohang] === eastern)) {
    return {
      eastern, western: westernEl,
      relation: "상생",
      description: `동양의 ${OHANG_INFO[eastern].kr}과 서양의 ${westernEl}이 서로를 키워주는 상생 관계입니다.`,
      score: 80
    };
  }

  // 긴장: 상극
  if (matchingOhang.length > 0) {
    return {
      eastern, western: westernEl,
      relation: "긴장",
      description: `동양의 ${OHANG_INFO[eastern].kr}과 서양의 ${westernEl} 사이에 긴장이 있습니다. 이 긴장이 성장의 원동력이 됩니다.`,
      score: 60
    };
  }

  return {
    eastern, western: westernEl,
    relation: "독특",
    description: `동양과 서양이 서로 다른 시각으로 당신을 봅니다. 이 다양성이 당신의 복합적인 매력입니다.`,
    score: 50
  };
}

// 아키타입 결정
function determineArchetype(topTraits: TraitAxis[]): { name: string; desc: string } {
  const archetypes: { traits: TraitAxis[]; name: string; desc: string }[] = [
    { traits:["리더십","추진력","결단력"], name:"타고난 지휘관", desc:"여러 문명이 당신에게 리더의 기질을 봅니다. 앞장서서 길을 만드는 사람." },
    { traits:["직관","감성","섬세함"], name:"조용한 예언자", desc:"표면 아래를 읽는 눈을 가졌습니다. 여러 체계가 당신의 직관력을 가리킵니다." },
    { traits:["안정감","신뢰","현실감각"], name:"흔들리지 않는 대지", desc:"어떤 체계로 보든 당신은 안정의 중심입니다. 주변을 단단하게 지탱하는 사람." },
    { traits:["자유","유연함","적응력"], name:"바람의 여행자", desc:"동서양 모두 당신에게서 자유로운 영혼을 봅니다. 경계를 넘나드는 사람." },
    { traits:["열정","에너지","리더십"], name:"불꽃의 전사", desc:"여러 문명이 당신 안의 불을 봅니다. 세상을 밝히고 변화시키는 에너지." },
    { traits:["통찰력","지혜","완벽주의"], name:"진리의 탐구자", desc:"깊이 파고드는 분석력. 동서양이 모두 당신의 지적 깊이에 주목합니다." },
    { traits:["포용력","감성","유연함"], name:"만물의 양육자", desc:"모든 것을 품는 넓은 마음. 여러 체계가 당신의 포용하는 기질을 가리킵니다." },
    { traits:["예민함","직관","감성"], name:"빛과 그림자의 예술가", desc:"경계에 서서 양쪽을 모두 보는 사람. 예민함이 곧 창조의 원천." },
    // 새로운 아키타입들
    { traits:["추진력","열정","자유"], name:"폭풍의 항해사", desc:"거친 파도 속에서도 방향을 잃지 않는 모험가. 열정이 나침반이 되어 미지의 바다를 개척합니다." },
    { traits:["통찰력","감성","포용력"], name:"달빛의 치유자", desc:"상처를 읽고 마음을 어루만지는 사람. 동서양이 모두 당신의 깊은 공감력에 주목합니다." },
    { traits:["현실감각","결단력","추진력"], name:"시대의 건축가", desc:"꿈을 설계도로 바꾸는 실행가. 체계적 사고와 행동력이 만나 현실을 재구성합니다." },
    { traits:["지혜","직관","안정감"], name:"고요한 현자", desc:"깊은 고요 속에서 진리를 길어올리는 사람. 흔들림 없는 내면에서 통찰이 피어납니다." },
    { traits:["유연함","에너지","감성"], name:"무지개의 연금술사", desc:"다양한 빛깔을 자유롭게 섞어내는 창조자. 변화를 두려워하지 않고 새로운 조합을 만듭니다." },
    { traits:["리더십","포용력","신뢰"], name:"수호자의 방패", desc:"앞에 서서 이끌되, 뒤에 있는 사람을 잊지 않는 보호자. 신뢰가 곧 당신의 힘입니다." },
  ];

  let bestMatch = archetypes[0];
  let bestScore = 0;

  for (const arch of archetypes) {
    const score = arch.traits.filter(t => topTraits.includes(t)).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = arch;
    }
  }

  return { name: bestMatch.name, desc: bestMatch.desc };
}

// 교차 메시지 생성
function generateCrossMessage(
  matches: CrosspointMatch[],
  elementHarmony: ElementHarmony,
  archetype: string,
  saju: SajuResult,
  western: WesternResult,
): string {
  const topTraits = matches.slice(0, 3).map(m => m.trait);
  const strongCount = matches.filter(m => m.strength === "강").length;

  const signName = western.sunSign.name;
  const dayNature = CHEONGAN_INFO[saju.day.cheongan].nature;

  let msg = "";

  // 첫 문장: 체계 간 공명 요약
  if (strongCount >= 2) {
    msg += `사주의 '${dayNature}'과 ${signName}가 ${topTraits.slice(0, 2).join(", ")}에서 강하게 공명합니다. `;
  } else if (strongCount === 1) {
    msg += `${signName}와 사주가 '${topTraits[0]}'이라는 키워드에서 만납니다. `;
  } else {
    msg += `세 가지 체계가 당신을 각자의 언어로 이야기하지만, '${topTraits[0] || "잠재력"}'이라는 교차점에서 만납니다. `;
  }

  // 둘째 문장: 원소 조화 해석
  if (elementHarmony.relation === "공명") {
    msg += `동서양의 원소가 하나로 겹치는 드문 조합으로, 타고난 방향이 뚜렷합니다. `;
  } else if (elementHarmony.relation === "상생") {
    msg += `동양의 ${OHANG_INFO[elementHarmony.eastern].kr}과 서양의 ${elementHarmony.western}이 서로를 키우는 관계라, 균형 잡힌 성장이 가능합니다. `;
  } else if (elementHarmony.relation === "긴장") {
    msg += `동서양 원소 사이의 긴장은 당신 안에 숨은 창조적 에너지의 원천입니다. `;
  } else {
    msg += `문명마다 다른 색으로 당신을 그리지만, 그 다양성이 복합적인 매력을 만듭니다. `;
  }

  // 셋째 문장: 아키타입 연결
  msg += `당신의 교차점 아키타입 '${archetype}'은 이 조합에서만 나타나는 고유한 패턴입니다.`;

  return msg;
}

// 오행 시각화 데이터 생성
function buildOhangVisual(saju: SajuResult): { ohang: Ohang; ratio: number; label: string }[] {
  const balance = saju.ohang_balance;
  const total = Object.values(balance).reduce((a, b) => a + b, 0) || 1;

  return OHANG_LIST.map(oh => ({
    ohang: oh,
    ratio: Math.round((balance[oh] / total) * 100),
    label: `${OHANG_INFO[oh].kr}(${OHANG_INFO[oh].en})`,
  }));
}

// ━━━ 메인 분석 함수 ━━━
export function analyzeCrosspoint(
  year: number, month: number, day: number,
  name?: string
): CrosspointResult {
  // 개별 체계 분석
  const saju = analyzeSaju(year, month, day);
  const western = analyzeWestern(month, day);
  const numerology = analyzeNumerology(year, month, day, name);

  // 특성 추출 & 교차점 찾기
  const traitMap = extractTraits(saju, western, numerology);

  const matches: CrosspointMatch[] = [];
  for (const [trait, sources] of traitMap) {
    // 중복 소스 제거 (같은 체계에서 여러 번 나올 수 있음)
    const uniqueSources = [...new Set(sources)];
    if (uniqueSources.length >= 2) {
      matches.push({
        trait,
        sources: uniqueSources,
        count: uniqueSources.length,
        strength: uniqueSources.length >= 3 ? "강" : "중",
      });
    }
  }

  // 강도순 정렬
  matches.sort((a, b) => b.count - a.count);

  // 원소 조화도
  const elementHarmony = analyzeElementHarmony(saju, western);

  // 수렴률 계산 (개선: 40~95% 범위, 관대하지만 거짓 아님)
  const totalTraits = traitMap.size;
  const matchedTraits = matches.length;
  const strongMatches = matches.filter(m => m.strength === "강").length;

  // 기본값: 3개 체계를 비교한다는 것 자체에 기본 점수
  const baseRate = 35;
  // 매칭 비율 기여 (최대 30점)
  const matchRatio = Math.min(30, (matchedTraits / Math.max(totalTraits, 1)) * 40);
  // 강한 매칭 보너스 (최대 15점)
  const strongBonus = Math.min(15, strongMatches * 5);
  // 원소 조화 기여 (최대 15점) — 가중치 높임
  const harmonyBonus = (elementHarmony.score / 100) * 15;
  // 아키타입 명확성 보너스 (최대 5점)
  const topTraits = matches.slice(0, 5).map(m => m.trait);
  const archetype = determineArchetype(topTraits);
  const archetypeClarity = Math.min(5, topTraits.length >= 3 ? 5 : topTraits.length * 2);

  const rawRate = baseRate + matchRatio + strongBonus + harmonyBonus + archetypeClarity;
  const convergenceRate = Math.min(95, Math.max(40, Math.round(rawRate)));

  // 교차 메시지 생성
  const crossMessage = generateCrossMessage(matches, elementHarmony, archetype.name, saju, western);

  // 오행 시각화
  const ohangVisual = buildOhangVisual(saju);

  return {
    saju,
    western,
    numerology,
    matches,
    top_match: matches[0] || null,
    convergence_rate: convergenceRate,
    element_harmony: elementHarmony,
    archetype: archetype.name,
    archetype_desc: archetype.desc,
    system_count: 3,
    cross_message: crossMessage,
    ohang_visual: ohangVisual,
  };
}
