// src/lib/cross-engine.ts
// 교차점 분석 엔진 — DESTINO의 핵심 차별화 기능

import { analyzeSaju, type SajuResult, type Ohang, OHANG_LIST, OHANG_INFO, SANGSAENG, CHEONGAN_INFO, JIJI_INFO } from "./saju";
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

export interface CareerCrosspoint {
  title: string;
  description: string;
  ideal_fields: string[];
  sources: string[];
}

export interface RelationshipCrosspoint {
  title: string;
  description: string;
  ideal_partner_traits: string[];
  sources: string[];
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
  cross_message: string;   // 6~8문장 종합 해석

  // 오행 시각화 데이터
  ohang_visual: { ohang: Ohang; ratio: number; label: string }[];

  // 신규: 교차점 심화 분석
  career_crosspoint: CareerCrosspoint;
  relationship_crosspoint: RelationshipCrosspoint;
  life_advice: string[];
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

// ━━━ 직업 교차점 분석 ━━━
function analyzeCareerCrosspoint(
  saju: SajuResult,
  western: WesternResult,
  numerology: NumerologyResult,
  topTraits: TraitAxis[],
): CareerCrosspoint {
  const dayInfo = CHEONGAN_INFO[saju.day.cheongan];
  const sign = western.sunSign;
  const lpInfo = numerology.lifePathInfo;

  // 세 체계의 커리어 추천에서 공통 방향 추출
  const sajuCareers = dayInfo.career;
  const westernCareers = sign.career_strengths;
  const numerologyCareers = lpInfo.career_paths;

  // 키워드 기반 커리어 방향 탐지
  const careerKeywords: Record<string, string[]> = {
    "창의적 전략가": ["전략","기획","설계","컨설턴트","분석"],
    "감성의 치유자": ["상담","치유","심리","간호","의료","돌봄"],
    "선봉의 개척자": ["창업","사업","리더","CEO","경영"],
    "표현의 예술가": ["예술","작가","음악","디자인","크리에이터","배우"],
    "체계의 설계자": ["엔지니어","건축","회계","프로젝트","시스템"],
    "지식의 탐험가": ["연구","학자","교수","과학","분석"],
    "연결의 외교관": ["외교","중재","협상","HR","소통","마케팅"],
    "보호의 수호자": ["군인","검사","법조","수사","보호"],
  };

  const allCareers = [...sajuCareers, ...westernCareers, ...numerologyCareers].join(" ");
  let bestTitle = "창의적 전략가";
  let bestScore = 0;

  for (const [title, keywords] of Object.entries(careerKeywords)) {
    const score = keywords.filter(kw => allCareers.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestTitle = title;
    }
  }

  // 상위 3개 공통 커리어 필드 추출
  const idealFields: string[] = [];
  const sources: string[] = [];

  // 사주에서 1~2개
  if (sajuCareers.length > 0) {
    idealFields.push(sajuCareers[0].split(" — ")[0]);
    sources.push("사주");
  }
  // 서양에서 1~2개
  if (westernCareers.length > 0) {
    idealFields.push(westernCareers[0].split(" — ")[0]);
    sources.push("별자리");
  }
  // 수비학에서 1~2개
  if (numerologyCareers.length > 0) {
    idealFields.push(numerologyCareers[0].split(" — ")[0]);
    sources.push("수비학");
  }

  // 교차 분석 기반 설명 생성
  const dayNature = dayInfo.nature;
  const signName = sign.name;
  const lpName = lpInfo.name;

  const description = `사주에서 '${dayNature}'의 기질은 ${sajuCareers[0]?.split(" — ")[1] || "독자적 역할"}을 가리키고, ` +
    `${signName}의 별자리 에너지는 ${westernCareers[0]?.split(" — ")[1] || "창의적 분야"}에서 빛을 발합니다. ` +
    `수비학의 '${lpName}' 경로는 ${numerologyCareers[0]?.split(" — ")[1] || "본질적 가치를 추구하는 일"}을 지향하고 있어, ` +
    `세 체계가 공통으로 가리키는 당신의 직업적 운명은 '${bestTitle}'의 방향입니다.`;

  return {
    title: bestTitle,
    description,
    ideal_fields: idealFields,
    sources,
  };
}

// ━━━ 관계 교차점 분석 ━━━
function analyzeRelationshipCrosspoint(
  saju: SajuResult,
  western: WesternResult,
  numerology: NumerologyResult,
  topTraits: TraitAxis[],
): RelationshipCrosspoint {
  const dayInfo = CHEONGAN_INFO[saju.day.cheongan];
  const sign = western.sunSign;
  const lpInfo = numerology.lifePathInfo;

  // 관계 스타일 키워드 탐지
  const relationKeywords: Record<string, string[]> = {
    "깊은 연결의 수호자": ["헌신","보호","충성","의리","지키"],
    "자유로운 영혼의 동반자": ["자유","독립","존중","자극","모험"],
    "따뜻한 품의 치유자": ["따뜻","돌봄","양육","포용","품"],
    "열정의 불꽃 연인": ["열정","강렬","뜨거","소유","질투"],
    "섬세한 감성의 교감자": ["섬세","감성","감정","공감","읽"],
    "안정적 신뢰의 반려자": ["안정","신뢰","성실","꾸준","약속"],
    "지적 교류의 파트너": ["지적","대화","소통","지성","동지"],
  };

  const allRelation = [dayInfo.relationship, sign.love_style, lpInfo.relationship_style].join(" ");
  let bestTitle = "깊은 연결의 수호자";
  let bestScore = 0;

  for (const [title, keywords] of Object.entries(relationKeywords)) {
    const score = keywords.filter(kw => allRelation.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestTitle = title;
    }
  }

  // 이상적 파트너 특성 추출
  const idealPartnerTraits: string[] = [];

  // 사주 기반
  if (dayInfo.relationship.includes("자유") || dayInfo.relationship.includes("독립")) {
    idealPartnerTraits.push("개인의 공간을 존중해주는 사람");
  }
  if (dayInfo.relationship.includes("헌신") || dayInfo.relationship.includes("의리")) {
    idealPartnerTraits.push("한결같은 마음으로 곁에 있어줄 사람");
  }
  if (dayInfo.relationship.includes("감정") || dayInfo.relationship.includes("섬세")) {
    idealPartnerTraits.push("감정의 깊이를 이해하고 공감해줄 수 있는 사람");
  }

  // 별자리 기반
  if (sign.compatibility_best.length > 0) {
    idealPartnerTraits.push(`${sign.compatibility_best[0]}의 에너지와 잘 어울리는 상대`);
  }

  // 수비학 기반
  if (lpInfo.relationship_style.includes("지적") || lpInfo.relationship_style.includes("대화")) {
    idealPartnerTraits.push("깊은 대화가 가능한 지적 동반자");
  }
  if (lpInfo.relationship_style.includes("안정") || lpInfo.relationship_style.includes("성실")) {
    idealPartnerTraits.push("일상의 작은 것에서 행복을 찾는 안정적인 사람");
  }

  // 최소 3개 보장
  if (idealPartnerTraits.length < 3) {
    const defaults = [
      "당신의 약점을 보완해줄 수 있는 상호보완적 성격의 사람",
      "함께 성장하려는 의지가 있는 사람",
      "진심을 알아봐주는 섬세한 사람",
    ];
    for (const d of defaults) {
      if (idealPartnerTraits.length >= 4) break;
      if (!idealPartnerTraits.includes(d)) idealPartnerTraits.push(d);
    }
  }

  const description = `사주의 ${dayInfo.kr} 일간은 "${dayInfo.relationship.split('.')[0]}"이라는 연애 패턴을 보여주고, ` +
    `${sign.name}의 사랑 방식은 "${sign.love_style.split('.')[0]}"으로 요약됩니다. ` +
    `수비학의 ${lpInfo.name} 경로는 "${lpInfo.relationship_style.split('.')[0]}"이라는 관계 성향을 가리킵니다. ` +
    `이 세 가지가 교차하여 만들어내는 당신의 연애 아키타입은 '${bestTitle}'입니다.`;

  return {
    title: bestTitle,
    description,
    ideal_partner_traits: idealPartnerTraits,
    sources: ["사주", "별자리", "수비학"],
  };
}

// ━━━ 인생 조언 생성 ━━━
function generateLifeAdvice(
  saju: SajuResult,
  western: WesternResult,
  numerology: NumerologyResult,
  topTraits: TraitAxis[],
  elementHarmony: ElementHarmony,
): string[] {
  const dayInfo = CHEONGAN_INFO[saju.day.cheongan];
  const sign = western.sunSign;
  const lpInfo = numerology.lifePathInfo;
  const animalInfo = JIJI_INFO[saju.year.jiji];

  const advice: string[] = [];

  // 1. 사주 기반 조언
  advice.push(`[사주의 가르침] ${dayInfo.advice}`);

  // 2. 별자리 기반 조언
  advice.push(`[별자리의 가르침] ${sign.life_lesson}`);

  // 3. 수비학 기반 조언
  advice.push(`[수비학의 가르침] ${lpInfo.challenge}`);

  // 4. 오행 밸런스 기반 조언
  const balance = saju.ohang_balance;
  const maxOhang = OHANG_LIST.reduce((a, b) => balance[a] >= balance[b] ? a : b);
  const minOhang = OHANG_LIST.reduce((a, b) => balance[a] <= balance[b] ? a : b);
  if (maxOhang !== minOhang) {
    advice.push(
      `[오행의 가르침] 당신의 오행에서 ${OHANG_INFO[maxOhang].kr}(${OHANG_INFO[maxOhang].en})이 강하고 ${OHANG_INFO[minOhang].kr}(${OHANG_INFO[minOhang].en})이 부족합니다. ` +
      `${OHANG_INFO[minOhang].kr}의 기운을 보충하려면 ${OHANG_INFO[minOhang].season}의 에너지를 의식적으로 가까이 하고, ` +
      `${OHANG_INFO[minOhang].direction}쪽 방위의 기운을 활용해보세요.`
    );
  }

  // 5. 동서양 교차 조언
  if (elementHarmony.relation === "긴장") {
    advice.push(
      `[교차점의 가르침] 동양의 ${OHANG_INFO[elementHarmony.eastern].kr}과 서양의 ${elementHarmony.western} 사이의 긴장은 ` +
      `당신 안에 상반된 두 가지 힘이 공존한다는 뜻입니다. 이 긴장을 억누르지 말고 창조적 에너지로 전환하세요. ` +
      `가장 위대한 작품은 모순 속에서 태어납니다.`
    );
  } else if (elementHarmony.relation === "공명") {
    advice.push(
      `[교차점의 가르침] 동서양이 같은 원소로 수렴하는 드문 조합입니다. ` +
      `당신의 방향은 이미 정해져 있으니, 망설이지 말고 그 길을 걸으세요. ` +
      `다만 한쪽으로 치우친 에너지는 보완이 필요하니, 의식적으로 반대 성향의 경험도 하시길 바랍니다.`
    );
  } else {
    advice.push(
      `[교차점의 가르침] ${animalInfo.animal_kr}띠의 ${animalInfo.personality.split('.')[0]}과 ` +
      `${sign.name}의 ${sign.personality.split('.')[0]}이 만나 독특한 에너지를 형성합니다. ` +
      `이 조합이 가진 가장 큰 잠재력은 다양한 시각으로 세상을 바라볼 수 있다는 것입니다.`
    );
  }

  return advice;
}

// 교차 메시지 생성 (6~8문장 심화)
function generateCrossMessage(
  matches: CrosspointMatch[],
  elementHarmony: ElementHarmony,
  archetype: string,
  saju: SajuResult,
  western: WesternResult,
  numerology: NumerologyResult,
): string {
  const topTraits = matches.slice(0, 3).map(m => m.trait);
  const strongCount = matches.filter(m => m.strength === "강").length;

  const signName = western.sunSign.name;
  const dayNature = CHEONGAN_INFO[saju.day.cheongan].nature;
  const dayKr = CHEONGAN_INFO[saju.day.cheongan].kr;
  const animalKr = JIJI_INFO[saju.year.jiji].animal_kr;
  const lpName = numerology.lifePathInfo.name;
  const lpNumber = numerology.lifePath;

  let msg = "";

  // 문장 1-2: 전체 패턴 인식
  if (strongCount >= 2) {
    msg += `세 가지 문명의 지혜가 당신을 바라본 결과, '${topTraits.slice(0, 2).join("'과 '")}'이라는 키워드에서 놀라울 만큼 강한 수렴이 일어났습니다. `;
    msg += `이는 동양과 서양, 그리고 고대의 수(數)의 체계가 각자의 언어로 같은 결론에 도달했다는 의미로, 당신의 핵심 기질이 매우 뚜렷하게 각인되어 있음을 보여줍니다. `;
  } else if (strongCount === 1) {
    msg += `사주명리, 서양 점성술, 수비학이 각각 다른 렌즈로 당신을 들여다본 결과, '${topTraits[0]}'이라는 공통의 실마리가 발견되었습니다. `;
    msg += `하나의 특성이 세 문명에서 동시에 포착된다는 것은 우연이 아니라, 당신 존재의 핵심에 새겨진 고유한 패턴입니다. `;
  } else {
    msg += `세 가지 체계가 당신을 각자의 고유한 방식으로 해석하며, 언뜻 다른 이야기를 하는 듯 보이지만 '${topTraits[0] || "잠재력"}'이라는 깊은 층위에서 만나고 있습니다. `;
    msg += `이처럼 다양한 각도에서 조명되는 성격은 그만큼 복합적이고 풍부한 내면을 가졌다는 증거입니다. `;
  }

  // 문장 3-4: 사주 + 서양 구체적 정렬 설명
  msg += `사주에서 당신의 일간은 ${dayKr}(${dayNature})으로, `;
  if (elementHarmony.relation === "공명") {
    msg += `서양 점성술의 ${signName}이 가리키는 ${western.element} 원소와 같은 기운으로 공명합니다. `;
    msg += `동양의 오행과 서양의 원소가 하나로 겹치는 이 조합은 대단히 드물며, 타고난 방향성이 분명하여 흔들림 없이 자기 길을 갈 수 있는 축복을 받았습니다. `;
  } else if (elementHarmony.relation === "상생") {
    msg += `${signName}(${western.element})의 에너지와 상생의 관계를 이루고 있습니다. `;
    msg += `동양의 ${OHANG_INFO[elementHarmony.eastern].kr}이 서양의 ${elementHarmony.western}을 만나 서로를 키워주는 이 구조는 균형 잡힌 성장이 가능한 길상의 조합으로, 인생의 고비마다 회복력이 강하게 발현됩니다. `;
  } else if (elementHarmony.relation === "긴장") {
    msg += `${signName}(${western.element})과 사이에 흥미로운 긴장이 존재합니다. `;
    msg += `이 긴장은 약점이 아니라 창조적 폭발력의 원천으로, 내면에 상반된 두 가지 힘이 공존하기에 남들이 상상하지 못하는 독창적 관점을 만들어냅니다. `;
  } else {
    msg += `${signName}(${western.element})이 제시하는 방향과 독특한 화학 반응을 일으킵니다. `;
    msg += `여러 문명이 당신을 서로 다른 빛깔로 그리지만, 바로 그 다양성이야말로 복합적이고 매혹적인 인격의 근거입니다. `;
  }

  // 문장 5-6: 실질적 의미 (직업, 관계)
  msg += `${animalKr}띠의 본능적 감각과 수비학 경로수 ${lpNumber}(${lpName})의 인생 방향이 더해지면, `;
  msg += `당신은 직업적으로 자신의 고유한 가치를 발휘할 수 있는 독자적 영역을 만들 때 가장 크게 빛나며, `;
  msg += `관계에서는 ${CHEONGAN_INFO[saju.day.cheongan].relationship.split('.')[0]}의 패턴을 보입니다. `;

  // 문장 7-8: 교차점만이 드러내는 고유 통찰
  msg += `이 세 체계의 교차점에서만 발견되는 당신의 아키타입 '${archetype}'은 `;
  msg += `단일 체계로는 절대 포착되지 않는, 오직 동서양의 지혜가 만나는 지점에서만 드러나는 당신만의 운명적 패턴입니다. `;
  msg += `이것이 DESTINO가 발견한 당신의 고유한 교차점이며, 이 패턴을 의식적으로 살릴 때 삶의 만족도와 성취가 가장 높아집니다.`;

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

  // 교차 메시지 생성 (심화)
  const crossMessage = generateCrossMessage(matches, elementHarmony, archetype.name, saju, western, numerology);

  // 오행 시각화
  const ohangVisual = buildOhangVisual(saju);

  // 신규: 직업 교차점
  const careerCrosspoint = analyzeCareerCrosspoint(saju, western, numerology, topTraits);

  // 신규: 관계 교차점
  const relationshipCrosspoint = analyzeRelationshipCrosspoint(saju, western, numerology, topTraits);

  // 신규: 인생 조언
  const lifeAdvice = generateLifeAdvice(saju, western, numerology, topTraits, elementHarmony);

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
    career_crosspoint: careerCrosspoint,
    relationship_crosspoint: relationshipCrosspoint,
    life_advice: lifeAdvice,
  };
}
