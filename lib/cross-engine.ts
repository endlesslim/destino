// src/lib/cross-engine.ts
// 교차점 분석 엔진 — DESTINO의 핵심 차별화 기능

import { analyzeSaju, type SajuResult, type Ohang, OHANG_INFO, SANGSAENG, CHEONGAN_INFO } from "./saju";
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

  // 2. 사주 — 연주 오행 (보조)
  const yearOhang = saju.year.ohang;
  if (yearOhang !== sajuOhang) {
    const yearTraits = OHANG_TRAITS[yearOhang] || [];
    addTraits(yearTraits.slice(0, 2), "사주(연)");
  }

  // 3. 서양 점성술 — 태양궁 원소
  const westernTraits = ELEMENT_TRAITS[western.element] || [];
  addTraits(westernTraits, "별자리");

  // 4. 서양 점성술 — 태양궁 개별 특성
  const signTraits = western.sunSign.trait
    .filter((t): t is TraitAxis => TRAIT_AXES.includes(t as TraitAxis));
  addTraits(signTraits, "별자리");

  // 5. 수비학 — 생명경로수 기반 특성
  const lpCheongan = LIFEPATH_TO_CHEONGAN[numerology.lifePath];
  if (lpCheongan) {
    const lpOhang = CHEONGAN_INFO[lpCheongan as keyof typeof CHEONGAN_INFO]?.ohang;
    if (lpOhang) {
      addTraits((OHANG_TRAITS[lpOhang] || []).slice(0, 2), "수비학");
    }
  }

  // 6. 수비학 — 직접 특성
  const lpStrength = numerology.lifePathInfo.strength
    .filter((t): t is TraitAxis => TRAIT_AXES.includes(t as TraitAxis));
  addTraits(lpStrength, "수비학");

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

  // 수렴률 계산
  const totalTraits = traitMap.size;
  const matchedTraits = matches.length;
  const strongMatches = matches.filter(m => m.strength === "강").length;
  const convergenceRate = Math.min(100, Math.round(
    (matchedTraits / Math.max(totalTraits, 1)) * 60 +
    (strongMatches / Math.max(matchedTraits, 1)) * 25 +
    (elementHarmony.score / 100) * 15
  ));

  // 아키타입 결정
  const topTraits = matches.slice(0, 5).map(m => m.trait);
  const archetype = determineArchetype(topTraits);

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
    system_count: 3, // 현재: 사주, 별자리, 수비학
  };
}
