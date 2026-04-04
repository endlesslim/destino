// lib/marriage-compat.ts
// 결혼 궁합 심화 분석 — 기존 궁합 데이터를 결혼 관점으로 확장

import { analyzeCompatibility, type CompatibilityInput, type CompatibilityResult } from "./compatibility";
import { type Ohang, OHANG_INFO, OHANG_LIST, SANGSAENG, SANGGEUK } from "./saju";

// ━━━ 타입 ━━━

export interface MarriageCompatResult {
  marriageScore: number;
  marriageLabel: string;
  compatibility: CompatibilityResult;

  dimensions: {
    name: string;
    score: number;
    description: string;
  }[];

  timeline: {
    dating: string;
    engagement: string;
    earlyMarriage: string;
    middleYears: string;
    matureYears: string;
  };

  bestWeddingMonths: number[];
  cautionPeriods: string[];

  strengthsAsCouple: string[];
  growthAreas: string[];

  goldenRule: string;
  detailedAdvice: string;
}

// ━━━ 시드 기반 난수 ━━━

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ━━━ 결혼 점수 라벨 ━━━

function getMarriageLabel(score: number): string {
  if (score >= 90) return "천생연분";
  if (score >= 80) return "이상적 부부";
  if (score >= 70) return "조화로운 동반자";
  if (score >= 60) return "노력형 부부";
  if (score >= 50) return "성장형 부부";
  if (score >= 40) return "도전적 관계";
  return "극복형 부부";
}

// ━━━ 감정적 교감 — 수화 밸런스 ━━━

function scoreEmotionalConnection(
  oh1: Ohang, oh2: Ohang,
  name1: string, name2: string,
): { score: number; description: string } {
  // 水(감정) + 火(열정) 밸런스 체크
  const waterFire1 = oh1 === "水" || oh1 === "火";
  const waterFire2 = oh2 === "水" || oh2 === "火";

  let score: number;
  let desc: string;

  if (oh1 === "水" && oh2 === "火" || oh1 === "火" && oh2 === "水") {
    score = 72;
    desc = `${name1}의 ${OHANG_INFO[oh1].kr}과 ${name2}의 ${OHANG_INFO[oh2].kr}은 격정적인 감정 교류가 일어나는 조합입니다. 깊은 감정적 연결이 가능하지만, 한쪽의 열정이 다른 쪽을 압도하지 않도록 균형이 필요합니다. 결혼 생활에서 대화의 온도를 조절하는 연습이 중요합니다.`;
  } else if (oh1 === oh2 && (oh1 === "水" || oh1 === "火")) {
    score = 85;
    desc = `두 사람 모두 ${OHANG_INFO[oh1].kr}의 감정 에너지를 가지고 있어, 말하지 않아도 감정의 흐름을 서로 읽을 수 있습니다. 같은 감정 언어를 쓰기에 결혼 후 깊은 정서적 유대가 형성됩니다. 다만 감정의 파도가 같은 방향으로 커질 때를 주의하세요.`;
  } else if (waterFire1 || waterFire2) {
    score = 78;
    desc = `${waterFire1 ? name1 : name2}이 감정적 교류를 주도하고, 상대가 이를 안정적으로 받아주는 구조입니다. 결혼 후 한 사람이 감정의 다리를 놓는 역할을 자연스럽게 맡게 되며, 이 역할 분담이 잘 작동하면 매우 편안한 관계가 됩니다.`;
  } else if (SANGSAENG[oh1] === oh2 || SANGSAENG[oh2] === oh1) {
    score = 82;
    desc = `상생하는 두 원소는 감정적으로도 자연스러운 흐름을 만듭니다. ${name1}이 감정을 표현하면 ${name2}가 그것을 받아 더 깊은 감정으로 발전시키는 순환이 있습니다. 결혼 후 시간이 지날수록 감정적 교감이 깊어지는 조합입니다.`;
  } else if (SANGGEUK[oh1] === oh2 || SANGGEUK[oh2] === oh1) {
    score = 58;
    desc = `상극 관계에서 감정적 교류는 도전적입니다. 한쪽의 감정 표현 방식이 다른 쪽에게는 부담이나 압박으로 느껴질 수 있습니다. 결혼 후 '감정 사전'을 맞추는 과정이 필요합니다. 서로의 감정 언어를 배우려는 노력이 관계의 질을 결정합니다.`;
  } else {
    score = 70;
    desc = `감정적 교류의 패턴이 서로 다르지만 충돌하지는 않는 조합입니다. ${name1}은 감정을 ${OHANG_INFO[oh1].kr}적으로, ${name2}는 ${OHANG_INFO[oh2].kr}적으로 표현합니다. 결혼 후 서로의 표현 방식을 학습하면 오히려 더 풍부한 감정 교류가 가능해집니다.`;
  }

  return { score, description: desc };
}

// ━━━ 가치관 일치 — 토 원소 + 수비학 ━━━

function scoreValueAlignment(
  oh1: Ohang, oh2: Ohang,
  lp1: number, lp2: number,
  name1: string, name2: string,
): { score: number; description: string } {
  // 토(土)는 가치관, 안정감, 기반의 원소
  const earthBonus1 = oh1 === "土" ? 5 : 0;
  const earthBonus2 = oh2 === "土" ? 5 : 0;

  // 수비학 경로 유사성
  const lpNorm1 = lp1 === 11 ? 2 : lp1 === 22 ? 4 : lp1 === 33 ? 6 : lp1;
  const lpNorm2 = lp2 === 11 ? 2 : lp2 === 22 ? 4 : lp2 === 33 ? 6 : lp2;
  const lpDiff = Math.abs(lpNorm1 - lpNorm2);

  let baseScore: number;
  if (lpDiff === 0) baseScore = 90;
  else if (lpDiff <= 2) baseScore = 78;
  else if (lpDiff <= 4) baseScore = 68;
  else baseScore = 58;

  const score = Math.min(100, baseScore + earthBonus1 + earthBonus2);

  let desc: string;
  if (lpDiff === 0) {
    desc = `같은 생명경로수 ${lp1}을 가진 두 사람은 인생의 방향과 핵심 가치가 일치합니다. 결혼 후 '어디로 가야 하는가'에 대한 논쟁이 적고, 같은 목표를 향해 함께 나아갈 수 있습니다. 다만 같은 가치관이 맹점도 공유한다는 점을 의식하세요.`;
  } else if (score >= 75) {
    desc = `경로수 ${lp1}과 ${lp2}는 핵심 가치에서 겹치는 부분이 많습니다. 돈, 자녀, 생활 방식에 대한 큰 틀에서의 합의가 비교적 자연스럽게 이루어지는 조합입니다. 세부적인 차이는 대화를 통해 충분히 좁힐 수 있습니다.`;
  } else if (score >= 65) {
    desc = `경로수 ${lp1}과 ${lp2}는 일부 가치관에서 차이를 보이지만, 이 차이가 서로의 시야를 넓혀주는 역할도 합니다. 결혼 전에 돈 관리 방식, 자녀 교육관, 가족과의 관계 등에 대해 충분히 대화하면 갈등을 예방할 수 있습니다.`;
  } else {
    desc = `경로수 ${lp1}과 ${lp2}는 인생의 우선순위가 다를 수 있습니다. ${name1}이 중요하게 생각하는 것을 ${name2}는 덜 중요하게 여기고, 그 반대도 마찬가지입니다. 결혼 전 '양보할 수 없는 가치'를 각자 3가지씩 공유하고 합의점을 찾는 것이 필수적입니다.`;
  }

  return { score, description: desc };
}

// ━━━ 생활 습관 — 띠 기반 ━━━

function scoreLifestyle(
  year1: number, year2: number,
  name1: string, name2: string,
): { score: number; description: string } {
  // 12지지(띠) 궁합 — 삼합/육합/형충
  const jiji1 = ((year1 - 4) % 12 + 12) % 12;
  const jiji2 = ((year2 - 4) % 12 + 12) % 12;
  const diff = Math.abs(jiji1 - jiji2);

  // 삼합 (4칸 간격)
  const isSamhap = diff === 4 || diff === 8;
  // 육합 (특정 쌍)
  const sum = (jiji1 + jiji2) % 12;
  const isYukhap = [1, 3, 5, 7, 9, 11].includes((jiji1 + jiji2));
  // 충 (6칸 간격)
  const isChung = diff === 6;

  let score: number;
  let desc: string;

  const ANIMALS = ["쥐", "소", "호랑이", "토끼", "용", "뱀", "말", "양", "원숭이", "닭", "개", "돼지"];
  const a1 = ANIMALS[jiji1];
  const a2 = ANIMALS[jiji2];

  if (isSamhap) {
    score = 88;
    desc = `${a1}띠와 ${a2}띠는 삼합(三合) 관계로, 생활 리듬이 자연스럽게 맞는 조합입니다. 아침형/저녁형, 정리 습관, 여가 활동 등에서 마찰이 적고, 같은 공간에서 편안함을 느낍니다. 결혼 후 일상의 마찰이 적어 안정적인 가정을 꾸릴 수 있습니다.`;
  } else if (isYukhap) {
    score = 84;
    desc = `${a1}띠와 ${a2}띠는 육합(六合) 관계로, 서로의 생활 방식을 자연스럽게 존중하는 조합입니다. 완벽히 같지는 않지만 상대의 습관을 불편해하지 않으며, 함께 사는 데서 오는 스트레스가 적습니다. 결혼 초기 적응이 순조롭습니다.`;
  } else if (isChung) {
    score = 52;
    desc = `${a1}띠와 ${a2}띠는 충(衝) 관계로, 생활 습관에서 부딪히는 지점이 있습니다. 한 사람은 정리하고 싶은데 다른 사람은 흐트러뜨리고, 식사 시간이나 수면 패턴이 다를 수 있습니다. 결혼 전에 동거 기간을 통해 서로의 습관을 조율하는 것을 강력히 권합니다.`;
  } else if (diff === 0) {
    score = 75;
    desc = `같은 ${a1}띠끼리의 만남은 생활 습관이 비슷한 장점이 있지만, 같은 고집으로 부딪힐 때 양보가 어려울 수 있습니다. 결혼 후 '누가 양보할 것인가'에 대한 규칙을 미리 정해두면 불필요한 마찰을 줄일 수 있습니다.`;
  } else {
    score = 72;
    desc = `${a1}띠와 ${a2}띠는 중립적인 생활 습관 궁합을 가집니다. 극적인 충돌은 없지만 의식적으로 서로의 생활 리듬을 맞추는 노력이 필요합니다. 함께 생활 규칙을 만들어가는 과정 자체가 유대감을 강화합니다.`;
  }

  return { score, description: desc };
}

// ━━━ 성장 방향 — 아키타입 기반 ━━━

function scoreGrowthDirection(
  archetype1: string, archetype2: string,
  convergence1: number, convergence2: number,
  name1: string, name2: string,
): { score: number; description: string } {
  const sameArchetype = archetype1 === archetype2;
  const convergenceDiff = Math.abs(convergence1 - convergence2);

  let score: number;
  let desc: string;

  if (sameArchetype) {
    score = 80;
    desc = `두 사람 모두 '${archetype1}' 아키타입으로, 성장의 방향이 같습니다. 같은 목표를 향해 나란히 걷는 부부가 될 수 있지만, 가끔은 서로 다른 방향으로의 탐색을 허용하면 관계가 더 풍요로워집니다. 동반 성장의 기쁨을 가장 깊이 누릴 수 있는 조합입니다.`;
  } else if (convergenceDiff < 10) {
    score = 76;
    desc = `${name1}의 '${archetype1}'과 ${name2}의 '${archetype2}'는 다른 방향으로 성장하지만, 그 열정의 크기가 비슷합니다. 서로의 성장을 응원하면서도 각자의 영역을 존중하는 관계가 가능합니다. 결혼 후 '부부이지만 개인'이라는 건강한 경계를 유지하세요.`;
  } else if (convergenceDiff < 25) {
    score = 68;
    desc = `${name1}(${archetype1})과 ${name2}(${archetype2})의 성장 속도와 방향이 다소 다릅니다. 한 사람이 빠르게 변화하는 동안 다른 사람은 안정을 원할 수 있습니다. 결혼 생활에서 '함께 성장하는 영역'과 '각자 성장하는 영역'을 구분하면 균형을 찾을 수 있습니다.`;
  } else {
    score = 60;
    desc = `두 사람의 성장 방향과 속도 차이가 큰 편입니다. 이 차이를 위협이 아닌 기회로 전환하려면, 정기적으로 '지금 각자 어디에 있는지'를 공유하는 시간이 필요합니다. 서로의 변화를 두려워하지 않고 응원하는 것이 이 부부의 핵심 과제입니다.`;
  }

  return { score, description: desc };
}

// ━━━ 갈등 해소력 — 오행 긴장 + MBTI ━━━

function scoreConflictResolution(
  oh1: Ohang, oh2: Ohang,
  mbti1: string, mbti2: string,
  name1: string, name2: string,
): { score: number; description: string } {
  // 오행 긴장도
  const isConflict = SANGGEUK[oh1] === oh2 || SANGGEUK[oh2] === oh1;
  const ohangBase = isConflict ? 55 : oh1 === oh2 ? 70 : 75;

  // MBTI 소통 유형 분석
  // F(감정) vs T(사고) — 갈등 해소 방식의 차이
  const isF1 = mbti1.includes("F");
  const isF2 = mbti2.includes("F");
  const bothF = isF1 && isF2;
  const bothT = !isF1 && !isF2;
  const mixed = isF1 !== isF2;

  // J(판단) vs P(인식) — 갈등 대응 속도
  const isJ1 = mbti1.includes("J");
  const isJ2 = mbti2.includes("J");

  let mbtiBonus: number;
  if (mixed) {
    mbtiBonus = 8; // 감정+논리 보완
  } else if (bothF) {
    mbtiBonus = 3; // 감정 공감은 좋지만 해결보다 위로에 치우칠 수 있음
  } else {
    mbtiBonus = 5; // 논리적 해결은 가능하지만 감정 돌봄이 부족할 수 있음
  }

  // J+J는 결론을 빨리 내지만 고집 충돌, P+P는 해결을 미루는 경향
  if (isJ1 && isJ2) mbtiBonus -= 2;
  else if (!isJ1 && !isJ2) mbtiBonus -= 3;

  const score = Math.max(30, Math.min(100, ohangBase + mbtiBonus));

  let desc: string;
  if (score >= 80) {
    desc = `${name1}과 ${name2}는 갈등이 생겨도 비교적 빠르고 건강하게 해결하는 역량을 가지고 있습니다. 한 사람이 감정을 다루는 동안 다른 사람이 해결책을 모색하는 자연스러운 역할 분담이 가능합니다. 결혼 후 대부분의 갈등이 하루 안에 해소될 수 있는 조합입니다.`;
  } else if (score >= 65) {
    desc = `갈등 해소에 약간의 시간과 노력이 필요한 조합입니다. ${isF1 ? name1 : name2}이 감정적 접근을, ${isF1 ? name2 : name1}이 논리적 접근을 하므로, '먼저 감정을 인정한 후 해결책을 찾는' 순서를 약속하면 갈등이 훨씬 수월하게 풀립니다.`;
  } else {
    desc = `갈등 해소가 이 부부의 중요한 과제입니다. ${isConflict ? "오행의 상극 에너지가 갈등을 증폭시킬 수 있어" : "소통 방식의 차이가 오해를 만들 수 있어"} 의식적인 대화 훈련이 필요합니다. '비폭력 대화법'을 함께 배우거나, 초기에 부부 상담을 받는 것을 강력히 권합니다.`;
  }

  return { score, description: desc };
}

// ━━━ 최적 결혼 월 계산 ━━━

function calcBestWeddingMonths(oh1: Ohang, oh2: Ohang, year1: number, year2: number): number[] {
  const results: { month: number; score: number }[] = [];

  for (let m = 1; m <= 12; m++) {
    const monthOhang = ["土","木","木","火","火","土","金","金","水","水","土","木"][m - 1] as Ohang;
    let score = 0;

    // 월 오행이 두 사람 모두에게 상생
    if (SANGSAENG[monthOhang] === oh1 || SANGSAENG[monthOhang] === oh2) score += 3;
    if (monthOhang === oh1 || monthOhang === oh2) score += 2;
    if (SANGGEUK[monthOhang] === oh1 || SANGGEUK[monthOhang] === oh2) score -= 2;

    // 토(土) 에너지는 결혼에 유리 (안정, 기반)
    if (monthOhang === "土") score += 2;

    // 화(火) 에너지는 열정 (축하 분위기)
    if (monthOhang === "火") score += 1;

    results.push({ month: m, score });
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, 3).map(r => r.month);
}

// ━━━ 주의 시기 ━━━

function calcCautionPeriods(oh1: Ohang, oh2: Ohang): string[] {
  const periods: string[] = [];

  // 상극 원소의 계절에 주의
  if (SANGGEUK[oh1] === oh2) {
    const season = OHANG_INFO[oh1].season;
    periods.push(`${season}에 감정적 갈등이 고조될 수 있으니 의식적으로 대화 시간을 늘리세요`);
  }
  if (SANGGEUK[oh2] === oh1) {
    const season = OHANG_INFO[oh2].season;
    periods.push(`${season}에 한쪽이 지치기 쉬우니 서로의 컨디션을 체크하세요`);
  }

  // 공통 약점 시기
  if (oh1 === oh2) {
    periods.push(`환절기(3월, 6월, 9월, 12월)에 같은 원소의 에너지가 과잉될 수 있으니 외부 활동으로 분산하세요`);
  }

  // 기본 주의 사항
  if (periods.length === 0) {
    periods.push("결혼 기념일 전후로 관계를 점검하는 대화 시간을 가지세요");
    periods.push("큰 재정 결정은 봄과 가을에 내리는 것이 유리합니다");
  }

  return periods.slice(0, 3);
}

// ━━━ 타임라인 조언 생성 ━━━

function generateTimeline(
  score: number,
  oh1: Ohang, oh2: Ohang,
  relation: string,
  name1: string, name2: string,
): MarriageCompatResult["timeline"] {
  const isConflict = relation === "상극";
  const isSame = relation === "비화";
  const isGood = relation === "상생";

  return {
    dating: isGood
      ? `연애 시기에 자연스러운 끌림과 편안함을 느끼게 됩니다. ${name1}과 ${name2}는 함께 있을 때 에너지가 충전되는 경험을 하며, 이 시기에 서로의 핵심 가치를 확인하는 깊은 대화를 나누세요. 여행을 함께 가면 관계의 진정한 궁합을 알 수 있습니다.`
      : isConflict
        ? `연애 초기의 강한 끌림 뒤에 숨어 있는 '다름'을 미리 인식하는 것이 중요합니다. 서로에게 매료된 부분이 결혼 후에는 갈등의 원인이 될 수 있으므로, 연애 시기에 충분한 대화와 갈등 경험을 통해 서로의 패턴을 파악하세요.`
        : `비슷한 리듬으로 관계가 발전하므로 편안한 연애가 가능합니다. 다만 편안함에 안주하면 관계의 깊이가 얕아질 수 있으니, 의식적으로 서로의 내면을 탐색하는 질문을 주고받으세요.`,

    engagement: score >= 75
      ? `약혼 기간에 결혼 준비 과정에서의 의견 차이를 건강하게 다루는 연습을 하세요. 이 시기의 갈등 해결 방식이 결혼 후에도 그대로 이어집니다. 가족 소개, 예식 계획, 신혼집 등 현실적 주제에 대해 '우리만의 규칙'을 만들어가세요.`
      : `약혼 기간은 이 관계의 내구성을 시험하는 중요한 시기입니다. 결혼 준비 과정에서 서로의 다른 면이 드러나며, 이때 발견하는 차이를 '빨간 신호'가 아닌 '필요한 정보'로 받아들이세요. 부부 상담을 미리 받아보는 것도 좋은 투자입니다.`,

    earlyMarriage: isGood
      ? `신혼기에 상생의 에너지가 가장 크게 작용합니다. 서로에게 에너지를 주고받는 선순환이 자연스럽게 형성되며, 이 시기에 '부부만의 루틴'을 만들면 관계의 기초가 단단해집니다. 주말 아침 함께 요리하기, 월 1회 데이트 등의 의식(ritual)을 만드세요.`
      : `신혼기에 생활 습관의 차이가 처음으로 부각됩니다. 사소한 것(칫솔 위치, 세탁 방식, 식사 시간)에서 시작되는 마찰을 무시하지 마세요. 작은 것을 조율하는 과정이 큰 문제를 예방합니다. '100일 규칙' — 결혼 후 100일간 매일 30분 대화하기를 실천하세요.`,

    middleYears: score >= 70
      ? `결혼 중반기에는 자녀, 경력, 재정 등의 과제가 함께 찾아옵니다. 이 시기에 '부부'보다 '부모'나 '직장인'의 역할이 앞서면 관계가 소홀해질 수 있습니다. 한 달에 한 번은 '연인으로서의 우리'를 위한 시간을 반드시 확보하세요.`
      : `결혼 중반기에 관계의 진가가 드러납니다. 초기의 열정이 줄어들면서 '왜 결혼했는가'를 스스로에게 묻는 시기가 올 수 있습니다. 이때 서로의 성장을 인정하고 변화한 모습을 새롭게 발견하려는 노력이 관계를 지속시킵니다.`,

    matureYears: isSame
      ? `성숙기에 같은 원소의 부부는 깊은 동반자 의식으로 발전합니다. 말하지 않아도 통하는 교감이 극대화되며, 함께한 세월의 무게가 관계를 더 단단하게 만듭니다. 이 시기에 새로운 공통 취미를 시작하면 관계에 신선한 활력이 생깁니다.`
      : `성숙기에 지나온 여정을 돌아보며 서로에 대한 감사가 깊어지는 시기입니다. 초기에 어려웠던 차이들이 이제는 관계의 깊이를 만든 원동력이었음을 발견하게 됩니다. 건강에 함께 투자하고, 남은 시간을 어떻게 보낼지 꿈을 나누세요.`,
  };
}

// ━━━ 강점 & 성장 영역 ━━━

function generateStrengths(
  compat: CompatibilityResult,
  dimensions: { name: string; score: number }[],
): string[] {
  const strengths: string[] = [];
  const sorted = [...dimensions].sort((a, b) => b.score - a.score);

  if (sorted[0].score >= 75) {
    strengths.push(`'${sorted[0].name}'이 매우 강한 부부로, 이것이 관계의 핵심 토대가 됩니다`);
  }

  if (compat.sharedTraits.length >= 2) {
    strengths.push(`${compat.sharedTraits.slice(0, 2).join(", ")} 등 공통 특성이 있어 기본적인 공감대가 탄탄합니다`);
  }

  if (compat.complementaryTraits.length >= 1) {
    strengths.push(`${compat.complementaryTraits[0]}이 서로를 보완하여 함께할 때 더 완전한 팀이 됩니다`);
  }

  if (compat.overallScore >= 70) {
    strengths.push("전반적 궁합이 좋아 일상적 교류에서 마찰이 적습니다");
  }

  if (compat.elementRelation.relation === "상생") {
    strengths.push("오행 상생 관계로 한 사람의 에너지가 다른 사람을 자연스럽게 키워줍니다");
  }

  return strengths.slice(0, 4);
}

function generateGrowthAreas(
  compat: CompatibilityResult,
  dimensions: { name: string; score: number }[],
): string[] {
  const areas: string[] = [];
  const sorted = [...dimensions].sort((a, b) => a.score - b.score);

  if (sorted[0].score < 70) {
    areas.push(`'${sorted[0].name}' 영역에서 의식적인 노력이 필요합니다`);
  }

  if (compat.tensionTraits.length > 0) {
    areas.push(`${compat.tensionTraits[0]} 긴장을 건설적으로 활용하는 법을 함께 배우세요`);
  }

  if (compat.elementRelation.relation === "상극") {
    areas.push("오행 상극 에너지를 성장의 도구로 전환하는 지혜가 필요합니다");
  }

  if (compat.overallScore < 65) {
    areas.push("정기적인 관계 점검(월 1회)으로 작은 불씨가 큰불이 되는 것을 예방하세요");
  }

  areas.push("서로의 원가족(부모) 관계 패턴이 결혼 생활에 미치는 영향을 함께 탐색하세요");

  return areas.slice(0, 4);
}

// ━━━ 황금률 생성 ━━━

function generateGoldenRule(
  oh1: Ohang, oh2: Ohang,
  relation: string,
  score: number,
): string {
  if (relation === "상생" && score >= 75) {
    return `${OHANG_INFO[oh1].kr}이 ${OHANG_INFO[oh2].kr}을 키우듯, 이 부부의 비밀은 '주는 기쁨'에 있습니다 — 베풀되 계산하지 마세요.`;
  }
  if (relation === "상극") {
    return `${OHANG_INFO[oh1].kr}과 ${OHANG_INFO[oh2].kr}의 긴장은 명검을 만드는 불꽃입니다 — 상대를 바꾸려 하지 말고, 함께 단련되세요.`;
  }
  if (relation === "비화") {
    return `같은 ${OHANG_INFO[oh1].kr}의 부부는 거울을 마주 보는 것과 같습니다 — 서로에게서 자신을 발견하되, 그 안에서 새로움을 찾으세요.`;
  }
  if (score >= 80) {
    return "천생연분도 노력 없이는 완성되지 않습니다 — 타고난 궁합 위에 매일의 선택을 쌓아가세요.";
  }
  if (score >= 60) {
    return "완벽한 궁합은 없습니다 — 서로의 부족함을 채워주려는 의지가 최고의 궁합을 만듭니다.";
  }
  return "가장 강한 부부는 역경을 함께 넘은 부부입니다 — 차이를 인정하고, 함께 성장하세요.";
}

// ━━━ 메인 분석 함수 ━━━

export function analyzeMarriageCompat(input: CompatibilityInput): MarriageCompatResult {
  const compatibility = analyzeCompatibility(input);
  const { person1, person2 } = compatibility;

  const name1 = input.person1.name || "첫 번째 사람";
  const name2 = input.person2.name || "두 번째 사람";

  const oh1 = person1.saju.day.ohang;
  const oh2 = person2.saju.day.ohang;
  const lp1 = person1.numerology.lifePath;
  const lp2 = person2.numerology.lifePath;
  const mbti1 = person1.mbti.primaryType;
  const mbti2 = person2.mbti.primaryType;

  // 5개 차원 분석
  const emotional = scoreEmotionalConnection(oh1, oh2, name1, name2);
  const values = scoreValueAlignment(oh1, oh2, lp1, lp2, name1, name2);
  const lifestyle = scoreLifestyle(input.person1.year, input.person2.year, name1, name2);
  const growth = scoreGrowthDirection(
    person1.archetype, person2.archetype,
    person1.convergence_rate, person2.convergence_rate,
    name1, name2,
  );
  const conflict = scoreConflictResolution(oh1, oh2, mbti1, mbti2, name1, name2);

  const dimensions = [
    { name: "감정적 교감", score: emotional.score, description: emotional.description },
    { name: "가치관 일치", score: values.score, description: values.description },
    { name: "생활 습관", score: lifestyle.score, description: lifestyle.description },
    { name: "성장 방향", score: growth.score, description: growth.description },
    { name: "갈등 해소력", score: conflict.score, description: conflict.description },
  ];

  // 결혼 점수: 기존 궁합 40% + 결혼 차원 60%
  const dimAvg = dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length;
  const marriageScore = Math.round(compatibility.overallScore * 0.4 + dimAvg * 0.6);

  const relation = compatibility.elementRelation.relation;

  // 타임라인
  const timeline = generateTimeline(marriageScore, oh1, oh2, relation, name1, name2);

  // 최적 결혼 월
  const bestWeddingMonths = calcBestWeddingMonths(oh1, oh2, input.person1.year, input.person2.year);

  // 주의 시기
  const cautionPeriods = calcCautionPeriods(oh1, oh2);

  // 강점 & 성장
  const strengthsAsCouple = generateStrengths(compatibility, dimensions);
  const growthAreas = generateGrowthAreas(compatibility, dimensions);

  // 황금률
  const goldenRule = generateGoldenRule(oh1, oh2, relation, marriageScore);

  // 상세 조언
  const detailedAdvice = marriageScore >= 75
    ? `${name1}과 ${name2}는 결혼 생활의 기본기가 탄탄한 조합입니다. 타고난 궁합에 안주하지 않고 매일의 작은 노력을 더하면, 시간이 지날수록 더 깊어지는 관계를 만들 수 있습니다. 주 1회 '파트너 감사 일기'를 작성해보세요 — 상대에게 고마운 점 3가지를 적는 간단한 습관이 관계의 온도를 일정하게 유지해줍니다.`
    : marriageScore >= 60
      ? `${name1}과 ${name2}의 결혼은 '성장형 관계'가 될 가능성이 높습니다. 서로의 차이가 때로는 불편하지만, 이 차이가 각자를 더 나은 사람으로 만드는 원동력이 됩니다. 결혼 초기 3년간 부부 성장 프로그램이나 커플 상담에 투자하면, 이후 수십 년의 관계 품질이 달라집니다.`
      : `${name1}과 ${name2}의 결혼은 의식적인 노력이 특히 중요합니다. 타고난 궁합의 도전을 '함께 넘어야 할 산'으로 인식하고, 전문가의 도움을 주저하지 마세요. 결혼 전 최소 6개월간의 부부 상담과, 결혼 후 정기적인 관계 점검이 이 관계를 성공적으로 만드는 핵심 전략입니다.`;

  return {
    marriageScore,
    marriageLabel: getMarriageLabel(marriageScore),
    compatibility,
    dimensions,
    timeline,
    bestWeddingMonths,
    cautionPeriods,
    strengthsAsCouple,
    growthAreas,
    goldenRule,
    detailedAdvice,
  };
}
