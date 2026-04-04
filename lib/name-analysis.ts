// lib/name-analysis.ts
// 이름 풀이 엔진 — 획수 기반 성명학 분석 + 사주 조화도

import { analyzeSaju, OHANG_INFO, type Ohang, OHANG_LIST, SANGSAENG, SANGGEUK } from "./saju";

// ━━━ 타입 ━━━

export interface GeokResult {
  strokes: number;
  ohang: Ohang;
  meaning: string;
}

export interface CharBreakdown {
  char: string;
  cho: string;
  jung: string;
  jong: string | null;
  strokes: number;
}

export interface NameAnalysis {
  name: string;
  totalStrokes: number;
  charBreakdowns: CharBreakdown[];

  // 성명학 기본
  cheonGeok: GeokResult;  // 천격 (성)
  inGeok: GeokResult;     // 인격 (성+이름첫글자)
  jiGeok: GeokResult;     // 지격 (이름)

  overallScore: number;   // 1-100
  overallLabel: string;   // "대길", "길", "평", "흉"

  namePersonality: string;
  nameDestiny: string;

  sajuAlignment: string;
  recommendation: string;
}

// ━━━ 자모 획수 매핑 ━━━

const CHO_STROKES: Record<string, number> = {
  "ㄱ": 2, "ㄲ": 4, "ㄴ": 2, "ㄷ": 3, "ㄸ": 6,
  "ㄹ": 5, "ㅁ": 4, "ㅂ": 4, "ㅃ": 8, "ㅅ": 2,
  "ㅆ": 4, "ㅇ": 1, "ㅈ": 3, "ㅉ": 6, "ㅊ": 4,
  "ㅋ": 3, "ㅌ": 4, "ㅍ": 4, "ㅎ": 3,
};

const JUNG_STROKES: Record<string, number> = {
  "ㅏ": 2, "ㅐ": 3, "ㅑ": 3, "ㅒ": 4, "ㅓ": 2,
  "ㅔ": 3, "ㅕ": 3, "ㅖ": 4, "ㅗ": 2, "ㅘ": 4,
  "ㅙ": 5, "ㅚ": 3, "ㅛ": 3, "ㅜ": 2, "ㅝ": 4,
  "ㅞ": 5, "ㅟ": 3, "ㅠ": 3, "ㅡ": 1, "ㅢ": 2,
  "ㅣ": 1,
};

const JONG_STROKES: Record<string, number> = {
  "": 0,
  "ㄱ": 2, "ㄲ": 4, "ㄳ": 4, "ㄴ": 2, "ㄵ": 5,
  "ㄶ": 5, "ㄷ": 3, "ㄹ": 5, "ㄺ": 7, "ㄻ": 9,
  "ㄼ": 9, "ㄽ": 7, "ㄾ": 9, "ㄿ": 9, "ㅀ": 8,
  "ㅁ": 4, "ㅂ": 4, "ㅄ": 6, "ㅅ": 2, "ㅆ": 4,
  "ㅇ": 1, "ㅈ": 3, "ㅊ": 4, "ㅋ": 3, "ㅌ": 4,
  "ㅍ": 4, "ㅎ": 3,
};

// 초성 목록 (Unicode 순서)
const CHO_LIST = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
const JUNG_LIST = ["ㅏ","ㅐ","ㅑ","ㅒ","ㅓ","ㅔ","ㅕ","ㅖ","ㅗ","ㅘ","ㅙ","ㅚ","ㅛ","ㅜ","ㅝ","ㅞ","ㅟ","ㅠ","ㅡ","ㅢ","ㅣ"];
const JONG_LIST = ["","ㄱ","ㄲ","ㄳ","ㄴ","ㄵ","ㄶ","ㄷ","ㄹ","ㄺ","ㄻ","ㄼ","ㄽ","ㄾ","ㄿ","ㅀ","ㅁ","ㅂ","ㅄ","ㅅ","ㅆ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];

// ━━━ 한글 분해 ━━━

function decomposeHangul(char: string): { cho: string; jung: string; jong: string } | null {
  const code = char.charCodeAt(0);
  if (code < 0xAC00 || code > 0xD7A3) return null;

  const offset = code - 0xAC00;
  const choIdx = Math.floor(offset / (21 * 28));
  const jungIdx = Math.floor((offset % (21 * 28)) / 28);
  const jongIdx = offset % 28;

  return {
    cho: CHO_LIST[choIdx],
    jung: JUNG_LIST[jungIdx],
    jong: JONG_LIST[jongIdx],
  };
}

function getCharStrokes(char: string): CharBreakdown | null {
  const decomp = decomposeHangul(char);
  if (!decomp) return null;

  const choStrokes = CHO_STROKES[decomp.cho] || 0;
  const jungStrokes = JUNG_STROKES[decomp.jung] || 0;
  const jongStrokes = decomp.jong ? (JONG_STROKES[decomp.jong] || 0) : 0;

  return {
    char,
    cho: decomp.cho,
    jung: decomp.jung,
    jong: decomp.jong || null,
    strokes: choStrokes + jungStrokes + jongStrokes,
  };
}

// ━━━ 획수 → 오행 매핑 ━━━

function strokesToOhang(strokes: number): Ohang {
  const lastDigit = strokes % 10;
  if (lastDigit === 1 || lastDigit === 2) return "木";
  if (lastDigit === 3 || lastDigit === 4) return "火";
  if (lastDigit === 5 || lastDigit === 6) return "土";
  if (lastDigit === 7 || lastDigit === 8) return "金";
  return "水"; // 9, 0
}

// ━━━ 격수별 의미 ━━━

const GEOK_MEANINGS: Record<string, Record<string, string>> = {
  "천격": {
    "木": "가문의 기운이 성장과 발전을 향해 있습니다. 선조로부터 진취적 에너지를 물려받았습니다.",
    "火": "가문에 열정과 명예의 기운이 있습니다. 밝고 활발한 가계의 흐름을 이어받았습니다.",
    "土": "가문에 안정과 신뢰의 기운이 깃들어 있습니다. 든든한 뿌리에서 자라난 나무와 같습니다.",
    "金": "가문에 결단력과 정의의 기운이 있습니다. 원칙을 중시하는 가계의 전통이 있습니다.",
    "水": "가문에 지혜와 유연함의 기운이 흐릅니다. 깊은 사고와 적응력을 가진 가계입니다.",
  },
  "인격": {
    "木": "인격이 木의 기운으로, 리더십과 추진력이 돋보입니다. 새로운 일을 시작하고 이끌어 나가는 능력이 탁월합니다.",
    "火": "인격이 火의 기운으로, 열정적이고 표현력이 풍부합니다. 사람들에게 영감을 주고 분위기를 밝히는 존재입니다.",
    "土": "인격이 土의 기운으로, 신뢰감과 안정감을 줍니다. 주변 사람들이 믿고 의지할 수 있는 든든한 존재입니다.",
    "金": "인격이 金의 기운으로, 날카로운 판단력과 정의감이 있습니다. 공정하고 체계적인 사고를 가진 사람입니다.",
    "水": "인격이 水의 기운으로, 깊은 지혜와 직관력을 가졌습니다. 상황을 꿰뚫어 보는 통찰력이 남다릅니다.",
  },
  "지격": {
    "木": "초년의 기운이 성장 지향적입니다. 어린 시절부터 호기심이 많고 배움에 대한 열정이 강합니다.",
    "火": "초년의 기운이 활발하고 에너지 넘칩니다. 어린 시절 인기가 많고 사교적인 성격이 두드러집니다.",
    "土": "초년의 기운이 안정적이고 차분합니다. 어린 시절 의젓하고 믿음직한 모습을 보입니다.",
    "金": "초년의 기운이 명확하고 단호합니다. 어린 시절부터 자기 주관이 뚜렷한 성격을 보입니다.",
    "水": "초년의 기운이 감성적이고 직관적입니다. 어린 시절 상상력이 풍부하고 예술적 감각이 있습니다.",
  },
};

// ━━━ 이름 점수 계산 ━━━

function calculateNameScore(cheonOhang: Ohang, inOhang: Ohang, jiOhang: Ohang): { score: number; label: string } {
  let score = 60; // base

  // 천격-인격 관계
  if (SANGSAENG[cheonOhang] === inOhang) score += 15;
  else if (SANGGEUK[cheonOhang] === inOhang) score -= 12;
  else if (cheonOhang === inOhang) score += 5;

  // 인격-지격 관계
  if (SANGSAENG[inOhang] === jiOhang) score += 15;
  else if (SANGGEUK[inOhang] === jiOhang) score -= 12;
  else if (inOhang === jiOhang) score += 5;

  // 천격-지격 관계
  if (SANGSAENG[cheonOhang] === jiOhang) score += 10;
  else if (SANGGEUK[cheonOhang] === jiOhang) score -= 8;

  // 범위 clamp
  score = Math.max(15, Math.min(98, score));

  let label: string;
  if (score >= 85) label = "대길";
  else if (score >= 65) label = "길";
  else if (score >= 45) label = "평";
  else label = "흉";

  return { score, label };
}

// ━━━ 성격/운명 생성 ━━━

const PERSONALITY_MAP: Record<Ohang, string> = {
  "木": "진취적이고 창의적인 면이 강합니다. 새로운 아이디어를 내고 이를 실행에 옮기는 능력이 이름에 담겨 있습니다. 리더십을 발휘할 때 가장 빛나며, 주변 사람들에게 긍정적인 영향을 줍니다. 다만 고집이 지나치지 않도록 유연함을 키우는 것이 좋습니다.",
  "火": "열정적이고 표현력이 풍부한 성격이 이름에 반영되어 있습니다. 사람들 사이에서 자연스럽게 주목받는 존재감이 있으며, 밝은 에너지로 주변을 활기차게 만듭니다. 감정의 기복을 다스리는 법을 익히면 더 큰 성취를 이룰 수 있습니다.",
  "土": "안정적이고 신뢰감을 주는 성격이 이름에 담겨 있습니다. 한번 맡은 일을 끝까지 해내는 꾸준함이 있으며, 주변 사람들의 든든한 기둥이 됩니다. 변화를 두려워하지 않고 새로운 도전에도 열린 마음을 가지면 성장의 폭이 넓어집니다.",
  "金": "정확하고 분석적인 성격이 이름에 나타납니다. 옳고 그름에 대한 기준이 명확하며, 논리적 사고로 복잡한 문제를 해결하는 능력이 있습니다. 타인의 감정에 대한 섬세한 배려를 더하면 인간관계가 더욱 풍요로워집니다.",
  "水": "직관적이고 깊은 사고를 하는 성격이 이름에 담겨 있습니다. 표면 아래의 진실을 꿰뚫어 보는 통찰력이 있으며, 예술적 감성이 풍부합니다. 생각을 행동으로 옮기는 실행력을 기르면 뜻하지 않은 큰 성과를 거둘 수 있습니다.",
};

const DESTINY_MAP: Record<Ohang, string> = {
  "木": "이름이 가리키는 운명의 방향은 '성장과 개척'입니다. 새로운 분야를 개척하거나 조직을 이끄는 역할에서 운명적인 성취를 이룰 가능성이 높습니다. 특히 교육, 문화, 창업 분야에서 두각을 나타낼 수 있으며, 30대 이후 본격적인 도약기를 맞이합니다.",
  "火": "이름이 가리키는 운명의 방향은 '빛남과 영향력'입니다. 많은 사람에게 영감을 주고 변화를 이끄는 역할이 운명적으로 부여되어 있습니다. 예술, 미디어, 대중문화 분야에서 성공할 기질이 있으며, 열정을 쏟을 수 있는 일을 찾을 때 운명이 활짝 열립니다.",
  "土": "이름이 가리키는 운명의 방향은 '기반과 축적'입니다. 오래 지속되는 가치를 만들어 내는 것이 운명적 사명입니다. 부동산, 농업, 건축, 금융 분야에서 안정적인 성공을 거둘 수 있으며, 꾸준한 노력이 결국 큰 결실로 돌아옵니다.",
  "金": "이름이 가리키는 운명의 방향은 '정의와 완성'입니다. 불의를 바로잡고 체계를 세우는 역할에서 운명적 성취를 이룹니다. 법률, 금융, 기술, 경영 분야에서 두각을 나타낼 수 있으며, 원칙에 충실할 때 가장 큰 보상을 받습니다.",
  "水": "이름이 가리키는 운명의 방향은 '지혜와 흐름'입니다. 깊은 통찰로 시대의 흐름을 읽고 이에 맞춰 변화하는 능력이 운명적 재능입니다. 연구, 예술, 철학, 상담 분야에서 성공할 기질이 있으며, 직관을 믿을 때 가장 좋은 선택을 하게 됩니다.",
};

// ━━━ 사주-이름 조화도 ━━━

function analyzeSajuAlignment(inOhang: Ohang, sajuDayOhang: Ohang): string {
  if (inOhang === sajuDayOhang) {
    return `이름의 인격 오행(${OHANG_INFO[inOhang].kr})이 사주의 일간 오행(${OHANG_INFO[sajuDayOhang].kr})과 같은 비화 관계입니다. 이름이 본인의 본질적 성향을 강화하는 구조로, 자신다운 삶을 살 때 가장 큰 힘을 발휘합니다. 다만 한쪽으로 치우치지 않도록 균형을 의식하는 것이 좋습니다.`;
  }
  if (SANGSAENG[sajuDayOhang] === inOhang) {
    return `사주의 일간(${OHANG_INFO[sajuDayOhang].kr})이 이름의 인격(${OHANG_INFO[inOhang].kr})을 생해주는 상생 관계입니다. 타고난 운명이 이름을 통해 더욱 빛나는 최상의 조합입니다. 본인의 잠재력이 이름의 에너지와 시너지를 이루어 큰 성취를 이룰 수 있습니다.`;
  }
  if (SANGSAENG[inOhang] === sajuDayOhang) {
    return `이름의 인격(${OHANG_INFO[inOhang].kr})이 사주의 일간(${OHANG_INFO[sajuDayOhang].kr})을 생해주는 관계입니다. 이름이 운명을 뒷받침하는 좋은 구조이지만, 이름의 에너지가 사주 쪽으로 쏠릴 수 있으니 자기 관리에 신경 쓰세요.`;
  }
  if (SANGGEUK[inOhang] === sajuDayOhang || SANGGEUK[sajuDayOhang] === inOhang) {
    return `이름의 인격 오행(${OHANG_INFO[inOhang].kr})과 사주의 일간 오행(${OHANG_INFO[sajuDayOhang].kr})이 상극 관계입니다. 내면의 갈등이 있을 수 있지만, 이 긴장감이 오히려 성장의 원동력이 됩니다. 양쪽 에너지를 조화시키는 것이 인생의 과제입니다.`;
  }
  return `이름의 인격 오행(${OHANG_INFO[inOhang].kr})과 사주의 일간 오행(${OHANG_INFO[sajuDayOhang].kr})이 중립적 관계입니다. 특별한 충돌 없이 각자의 영역에서 독립적으로 작용하며, 안정적이지만 특별한 시너지를 위해서는 의식적인 노력이 필요합니다.`;
}

// ━━━ 메인 분석 함수 ━━━

export function analyzeKoreanName(
  name: string,
  birthYear?: number,
  birthMonth?: number,
  birthDay?: number,
): NameAnalysis {
  // 1. 각 글자 분해 및 획수 계산
  const chars = [...name];
  const charBreakdowns: CharBreakdown[] = [];
  for (const c of chars) {
    const bd = getCharStrokes(c);
    if (bd) charBreakdowns.push(bd);
  }

  const totalStrokes = charBreakdowns.reduce((s, b) => s + b.strokes, 0);

  // 2. 성명학 격수 계산
  // 성(1자) + 이름(1-3자) 구조 가정
  const surnameStrokes = charBreakdowns[0]?.strokes || 0;
  const firstNameStrokes = charBreakdowns[1]?.strokes || 0;
  const restNameStrokes = charBreakdowns.slice(1).reduce((s, b) => s + b.strokes, 0);

  const cheonStrokes = surnameStrokes;
  const inStrokes = surnameStrokes + firstNameStrokes;
  const jiStrokes = restNameStrokes;

  const cheonOhang = strokesToOhang(cheonStrokes);
  const inOhang = strokesToOhang(inStrokes);
  const jiOhang = strokesToOhang(jiStrokes);

  const cheonGeok: GeokResult = {
    strokes: cheonStrokes,
    ohang: cheonOhang,
    meaning: GEOK_MEANINGS["천격"][cheonOhang],
  };
  const inGeok: GeokResult = {
    strokes: inStrokes,
    ohang: inOhang,
    meaning: GEOK_MEANINGS["인격"][inOhang],
  };
  const jiGeok: GeokResult = {
    strokes: jiStrokes,
    ohang: jiOhang,
    meaning: GEOK_MEANINGS["지격"][jiOhang],
  };

  // 3. 점수 계산
  const { score, label } = calculateNameScore(cheonOhang, inOhang, jiOhang);

  // 4. 성격/운명 생성
  const namePersonality = PERSONALITY_MAP[inOhang];
  const nameDestiny = DESTINY_MAP[inOhang];

  // 5. 사주 조화도 (선택사항)
  let sajuAlignment = "생년월일을 입력하면 이름과 사주의 조화도를 분석할 수 있습니다.";
  if (birthYear && birthMonth && birthDay) {
    const saju = analyzeSaju(birthYear, birthMonth, birthDay);
    sajuAlignment = analyzeSajuAlignment(inOhang, saju.day.ohang);
  }

  // 6. 추천
  const recommendation = generateRecommendation(score, label, inOhang);

  return {
    name,
    totalStrokes,
    charBreakdowns,
    cheonGeok,
    inGeok,
    jiGeok,
    overallScore: score,
    overallLabel: label,
    namePersonality,
    nameDestiny,
    sajuAlignment,
    recommendation,
  };
}

function generateRecommendation(score: number, label: string, inOhang: Ohang): string {
  if (label === "대길") {
    return `이름의 오행 배치가 매우 이상적입니다. ${OHANG_INFO[inOhang].kr}의 인격 에너지를 신뢰하고 자신의 이름처럼 살아가세요.`;
  }
  if (label === "길") {
    return `이름에 좋은 기운이 담겨 있습니다. ${OHANG_INFO[inOhang].kr}의 에너지를 더욱 발전시키면 이름의 힘이 극대화됩니다.`;
  }
  if (label === "평") {
    return `이름이 평범한 기운을 가지고 있지만, 노력으로 충분히 보완할 수 있습니다. ${OHANG_INFO[inOhang].kr}의 장점을 의식적으로 키워 나가세요.`;
  }
  return `이름의 오행 배치에 긴장이 있지만, 이를 인식하고 조화를 추구하면 오히려 강한 성장의 동력이 됩니다. 부족한 기운을 보충하는 노력이 필요합니다.`;
}
