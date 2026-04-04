// lib/love-analysis.ts
// 연애 심화 분석 엔진 — 사주/별자리/수비학/MBTI 데이터 기반 연애 분석

import { analyzeSaju, type SajuResult, CHEONGAN_INFO, OHANG_INFO, type Ohang } from "./saju";
import { analyzeWestern, type WesternResult } from "./western";
import { analyzeNumerology, type NumerologyResult } from "./numerology";
import { analyzeMBTI, type MBTIResult } from "./mbti";

// ━━━ 타입 정의 ━━━

export interface LoveAnalysis {
  loveType: string;
  loveTypeDesc: string;

  idealPartner: {
    saju: string;
    zodiac: string[];
    mbti: string[];
    personality: string;
  };

  lovePattern: {
    attraction: string;
    expression: string;
    conflict: string;
    growth: string;
  };

  currentYearLove: string;
  bestLoveMonths: number[];

  redFlags: string[];
  greenFlags: string[];
}

// ━━━ 연애 유형 데이터 ━━━

interface LoveTypeProfile {
  type: string;
  desc: string;
  keywords: string[];
  pattern: LoveAnalysis["lovePattern"];
  redFlags: string[];
  greenFlags: string[];
}

const LOVE_TYPE_PROFILES: LoveTypeProfile[] = [
  {
    type: "깊은 물의 사랑형",
    desc: "한번 마음을 주면 영혼까지 내어주는 깊은 사랑을 하는 유형입니다. 표면적인 감정이 아닌 영혼의 연결을 갈망하며, 진심이 통하는 단 한 사람을 위해 모든 것을 바칠 수 있습니다. 사랑 앞에서 솔직하고 순수하지만, 그 깊이만큼 상처도 깊게 받습니다. 당신에게 사랑은 인생 그 자체이며, 가벼운 만남은 애초에 관심 밖입니다.",
    keywords: ["깊", "헌신", "감성", "직관", "섬세", "감정", "공감", "통찰", "내면"],
    pattern: {
      attraction: "첫 만남에서 상대의 눈빛과 말투 너머에 숨은 진심을 읽습니다. 외모보다 상대가 내면에 어떤 상처와 강인함을 품고 있는지에 끌리며, 서로의 약함을 보여줄 수 있을 때 비로소 사랑이 시작됩니다.",
      expression: "말보다 행동, 행동보다 존재로 사랑을 표현합니다. 상대가 힘들 때 곁에 있어주는 것, 아무 말 없이 상대의 감정을 알아채는 것이 당신의 사랑 언어입니다. 때로는 직접 쓴 편지나 의미 있는 선물로 마음을 전합니다.",
      conflict: "갈등이 생기면 상대의 의도를 과도하게 해석하며, 작은 말실수에도 큰 상처를 받을 수 있습니다. 감정을 삼키다가 한계에 이르면 갑자기 폭발하는 패턴이 있으며, 이때 상대는 이유를 알지 못해 당황합니다.",
      growth: "상대에게 자신의 감정을 제때 표현하는 연습이 필요합니다. '괜찮다'고 말하면서 속으로 상처받는 패턴을 인지하고, 솔직한 대화를 통해 관계의 깊이를 더하세요.",
    },
    redFlags: [
      "감정을 자주 숨기거나 회피하는 사람",
      "진지한 대화를 불편해하는 가벼운 연애관의 소유자",
      "공감 능력이 현저히 부족하고 자기중심적인 사람",
      "약속을 쉽게 어기고 신뢰를 저버리는 사람",
    ],
    greenFlags: [
      "상대의 감정을 먼저 물어봐주는 섬세함",
      "힘들 때 함께 침묵으로도 곁에 있어줄 수 있는 존재감",
      "관계에서의 깊이를 원하고 진지한 대화를 즐기는 태도",
      "자신의 약한 모습도 솔직하게 보여줄 수 있는 용기",
    ],
  },
  {
    type: "불꽃의 열정형",
    desc: "사랑에 빠지면 온 세상이 멈추는 것 같은 강렬한 연애를 하는 유형입니다. 열정적이고 적극적으로 감정을 표현하며, 상대에게 잊을 수 없는 경험을 선사합니다. 드라마 같은 사랑을 꿈꾸며, 단조로운 일상보다 설렘과 자극이 있는 관계를 원합니다. 사랑의 온도가 항상 뜨겁기에, 그 열기를 유지하는 것이 과제입니다.",
    keywords: ["열정", "에너지", "존재감", "뜨거", "강렬", "적극", "돌진", "소유", "주도"],
    pattern: {
      attraction: "강한 첫인상에 끌립니다. 자신감 있는 태도, 독특한 매력, 또는 특별한 재능을 가진 사람에게 순간적으로 마음을 빼앗기며, 한번 마음이 움직이면 주저 없이 다가갑니다.",
      expression: "사랑을 숨기지 못합니다. 서프라이즈 이벤트, 로맨틱한 데이트, 진심 어린 고백까지 모든 것을 뜨겁고 화려하게 표현합니다. 연인이 세상에서 가장 특별한 존재라는 것을 매일 느끼게 해주려 합니다.",
      conflict: "독점욕과 질투가 갈등의 주원인입니다. 상대의 관심이 다른 곳에 가면 불안해지며, 감정이 격해지면 날카로운 말로 상대를 상처 입힐 수 있습니다. 화해도 빠르지만, 같은 패턴이 반복될 위험이 있습니다.",
      growth: "사랑의 온도가 식는 것이 관계의 끝이 아님을 배워야 합니다. 설렘이 안정으로 변하는 과정을 자연스럽게 받아들이고, 일상 속에서도 작은 행복을 발견하는 연습이 필요합니다.",
    },
    redFlags: [
      "에너지가 낮고 무기력한 생활 패턴의 사람",
      "당신의 열정에 부담을 느끼며 거리를 두려는 사람",
      "변화와 새로운 경험을 거부하는 극도로 보수적인 사람",
      "감정 표현을 억제하고 냉담하게 대하는 사람",
    ],
    greenFlags: [
      "당신의 열정을 있는 그대로 받아들이고 함께 불태울 수 있는 에너지",
      "자신만의 꿈과 목표가 있어 서로 자극을 주고받는 관계",
      "갈등 상황에서도 감정적으로 도망가지 않는 단단함",
      "일상 속에서도 작은 이벤트와 설렘을 만들어가는 센스",
    ],
  },
  {
    type: "바람의 자유형",
    desc: "서로의 독립성을 존중하면서도 깊은 유대를 형성하는 자유로운 사랑의 유형입니다. 구속하거나 구속받는 것을 견디지 못하며, 파트너와 함께 성장하되 각자의 세계를 가지는 관계를 이상적으로 봅니다. 지적 교류와 대화를 사랑의 핵심으로 여기며, 자유 속에서 선택으로 함께하는 관계에서 가장 행복합니다.",
    keywords: ["자유", "독립", "유연", "적응", "대화", "지적", "존중", "모험", "변화"],
    pattern: {
      attraction: "지적인 대화에서 불꽃이 튑니다. 독특한 관점을 가진 사람, 새로운 세계를 보여주는 사람에게 끌리며, 상대의 독립적이고 자유로운 모습에 매력을 느낍니다.",
      expression: "사랑을 질량이 아닌 주파수로 표현합니다. 매일 연락하기보다 만날 때 질 높은 시간을 보내는 것을 중시하며, 상대의 성장을 응원하고 새로운 경험을 함께 나누는 것이 사랑의 방식입니다.",
      conflict: "상대가 지나치게 밀착하거나 통제하려 하면 본능적으로 거리를 둡니다. 이것이 상대에게는 '관심 없음'으로 오해받을 수 있습니다. 감정적 깊이보다 논리적 해결을 추구하여 상대의 감정적 필요를 놓칠 때가 있습니다.",
      growth: "자유가 곧 무관심이 아님을 상대에게 분명히 전달하는 것이 중요합니다. 때로는 불편하더라도 감정적 친밀감을 의식적으로 표현하고, 안정감을 제공하는 연습이 필요합니다.",
    },
    redFlags: [
      "연인의 행동을 통제하고 지나치게 간섭하는 사람",
      "개인 시간과 공간의 필요를 이해하지 못하는 사람",
      "자기 발전에 관심이 없고 현재에 안주하는 사람",
      "변화를 극도로 두려워하고 모험을 거부하는 사람",
    ],
    greenFlags: [
      "서로의 독립적인 시간을 자연스럽게 존중하는 태도",
      "지적 호기심이 강하고 깊은 대화가 가능한 파트너",
      "함께 새로운 경험을 즐기면서도 각자의 취미를 가진 사람",
      "사랑과 자유가 양립할 수 있음을 아는 성숙한 연애관",
    ],
  },
  {
    type: "대지의 헌신형",
    desc: "묵묵히 곁을 지키며 한결같은 사랑을 하는 유형입니다. 화려한 고백보다 일상의 작은 배려로 사랑을 쌓아가며, 한번 시작한 관계를 끝까지 지키려는 의지가 강합니다. 약속의 무게를 누구보다 진지하게 여기며, 연인에게 세상에서 가장 안전한 피난처가 되어줍니다. 느리지만 확실한 사랑이 당신의 방식입니다.",
    keywords: ["안정", "신뢰", "현실", "성실", "인내", "보호", "꾸준", "약속", "책임"],
    pattern: {
      attraction: "시간이 지나면서 서서히 마음이 움직입니다. 첫눈에 반하기보다 상대의 인간성, 성실함, 일관된 태도에 끌리며, 함께하는 시간이 쌓일수록 깊어지는 감정을 중시합니다.",
      expression: "일상의 작은 행동으로 사랑을 증명합니다. 약속을 지키는 것, 매일 따뜻한 밥을 함께 먹는 것, 아플 때 달려가는 것이 당신의 사랑 표현입니다. 말보다 꾸준한 행동이 진심의 증거입니다.",
      conflict: "변화에 대한 두려움이 갈등의 원인이 될 수 있습니다. 관계에 문제가 생겨도 현상 유지를 원하며, 필요한 대화를 회피하거나 미루는 경향이 있습니다. 이미 끝난 관계에도 오래 매달릴 수 있습니다.",
      growth: "안정을 추구하되, 관계 안에서의 변화를 두려워하지 마세요. 때로는 불편한 진실을 직면하고, 필요한 변화를 수용하는 것이 진정한 헌신입니다. 상대의 변화도 수용하는 유연함을 기르세요.",
    },
    redFlags: [
      "빈번하게 약속을 어기고 책임을 회피하는 사람",
      "한순간의 감정에 쉽게 휩쓸려 일관성이 없는 사람",
      "경제적 안정에 무관심하고 미래 계획이 없는 사람",
      "당신의 헌신을 당연하게 여기고 보답하지 않는 사람",
    ],
    greenFlags: [
      "약속을 중요하게 여기고 신뢰를 쌓아가는 일관된 행동",
      "장기적 미래를 함께 그릴 수 있는 성숙한 대화",
      "일상의 작은 것에 감사하고 함께하는 시간을 소중히 여기는 태도",
      "당신의 사랑 방식을 이해하고 같은 방식으로 응답해주는 사람",
    ],
  },
  {
    type: "빛의 표현형",
    desc: "사랑을 아름답게 표현하는 것에 탁월한 유형입니다. 연인에게 특별한 경험과 기억을 선사하며, 관계를 하나의 작품처럼 가꿔나갑니다. 감성적이면서도 사교적이어서 주변에 항상 사람이 많고, 연인에게 세상에서 가장 특별한 존재라는 느낌을 줍니다. 사랑의 기쁨을 세상과 나누고 싶어하며, 관계 속에서 서로를 더 빛나게 하는 시너지를 추구합니다.",
    keywords: ["표현", "포용", "사교", "매력", "소통", "외교", "조화", "공정", "예술"],
    pattern: {
      attraction: "분위기와 에너지에 끌립니다. 함께 있을 때 자연스럽게 웃음이 나고, 서로의 장점을 빛내줄 수 있는 상대에게 마음이 갑니다. 센스와 유머, 그리고 따뜻한 에너지를 가진 사람을 선호합니다.",
      expression: "언어적 표현, 이벤트, SNS 공유까지 사랑을 적극적으로 표현합니다. 데이트 코스를 직접 기획하고, 기념일마다 의미 있는 서프라이즈를 준비하며, 연인을 자랑스러워하는 마음을 숨기지 않습니다.",
      conflict: "관계가 외부의 시선을 의식하는 방향으로 흐를 수 있습니다. 진짜 감정보다 '좋은 관계처럼 보이는 것'에 에너지를 쏟다가, 정작 내면의 문제를 외면할 위험이 있습니다.",
      growth: "관계의 진정한 깊이는 보여주기 위한 것이 아님을 기억하세요. 때로는 화려한 표현을 내려놓고, 조용한 공간에서 서로의 진심만 마주하는 시간이 필요합니다.",
    },
    redFlags: [
      "관계를 비밀로 유지하려 하거나 공개를 꺼리는 사람",
      "당신의 사교적 성격을 질투하고 인간관계를 제한하는 사람",
      "감정 표현에 인색하고 당신의 노력을 무시하는 사람",
      "함께하는 시간보다 자기 일을 항상 우선하는 사람",
    ],
    greenFlags: [
      "당신의 사교성을 존중하면서도 자신만의 매력이 있는 사람",
      "함께 만드는 추억을 소중히 여기고 기억해주는 세심함",
      "감정 표현에 솔직하고, 당신의 사랑에 충분히 반응해주는 사람",
      "관계를 함께 가꿔간다는 의식이 있는 파트너",
    ],
  },
];

// ━━━ 연애 유형 결정 ━━━

function determineLoveType(
  saju: SajuResult,
  western: WesternResult,
  numerology: NumerologyResult,
  mbti: MBTIResult,
): LoveTypeProfile {
  const scores = new Map<string, number>();

  for (const profile of LOVE_TYPE_PROFILES) {
    let score = 0;

    // 1. 사주 일간 연애 스타일 키워드
    const dayInfo = CHEONGAN_INFO[saju.day.cheongan];
    const sajuText = [dayInfo.relationship, dayInfo.personality, ...dayInfo.trait].join(" ");
    score += profile.keywords.filter(kw => sajuText.includes(kw)).length * 3;

    // 2. 오행 연애 성향
    const ohangLove: Record<Ohang, string[]> = {
      "木": ["성장", "독립", "자유", "주도"],
      "火": ["열정", "존재감", "뜨거", "적극"],
      "土": ["안정", "신뢰", "헌신", "보호"],
      "金": ["깊", "섬세", "완벽", "내면"],
      "水": ["감성", "직관", "공감", "깊"],
    };
    const dayOhangLove = ohangLove[saju.day.ohang] || [];
    score += profile.keywords.filter(kw => dayOhangLove.includes(kw)).length * 2;

    // 3. 서양 점성술 love_style
    const westernText = [western.sunSign.love_style, ...western.sunSign.trait].join(" ");
    score += profile.keywords.filter(kw => westernText.includes(kw)).length * 2;

    // 4. 수비학 relationship_style
    const numText = numerology.lifePathInfo.relationship_style;
    score += profile.keywords.filter(kw => numText.includes(kw)).length * 2;

    // 5. MBTI loveStyle
    const mbtiText = mbti.loveStyle;
    score += profile.keywords.filter(kw => mbtiText.includes(kw)).length * 2;

    scores.set(profile.type, score);
  }

  let bestProfile = LOVE_TYPE_PROFILES[0];
  let bestScore = 0;
  for (const profile of LOVE_TYPE_PROFILES) {
    const s = scores.get(profile.type) || 0;
    if (s > bestScore) {
      bestScore = s;
      bestProfile = profile;
    }
  }

  return bestProfile;
}

// ━━━ 이상적 파트너 분석 ━━━

function analyzeIdealPartner(
  saju: SajuResult,
  western: WesternResult,
  numerology: NumerologyResult,
  mbti: MBTIResult,
): LoveAnalysis["idealPartner"] {
  const dayInfo = CHEONGAN_INFO[saju.day.cheongan];
  const dayOhang = saju.day.ohang;

  // 사주: 상생 오행의 파트너가 이상적
  const ohangPartnerMap: Record<Ohang, string> = {
    "木": "水(지혜)나 火(열정)의 기운을 가진 사람이 당신과 상생합니다. 당신의 곧은 에너지를 키워주거나 함께 밝히는 관계가 이상적입니다.",
    "火": "木(성장)이나 土(안정)의 기운을 가진 사람이 좋은 궁합입니다. 당신의 열정을 이해하면서도 따뜻하게 받아줄 수 있는 상대입니다.",
    "土": "火(열정)이나 金(날카로움)의 기운을 가진 사람이 어울립니다. 당신의 안정감에 활력을 불어넣거나 함께 단단해지는 관계가 좋습니다.",
    "金": "土(안정)이나 水(지혜)의 기운을 가진 사람이 상생합니다. 당신의 예리함을 부드럽게 감싸거나 깊이를 더해주는 상대가 이상적입니다.",
    "水": "金(결단)이나 木(성장)의 기운을 가진 사람이 좋습니다. 당신의 유연함에 방향을 제시하거나 함께 성장하는 관계가 맞습니다.",
  };

  // 별자리: compatibility_best
  const bestZodiacs = western.sunSign.compatibility_best.slice(0, 3);

  // MBTI: compatibility_best
  const bestMbtis = mbti.compatibility_best.slice(0, 3);

  // 종합 파트너 성격 설명
  const partnerDesc = `사주의 ${dayInfo.nature} 기질에 가장 잘 어울리는 파트너는 ${dayInfo.relationship.split('.')[0]}을 이해하는 사람입니다. ` +
    `${western.sunSign.name}와 잘 맞는 ${bestZodiacs[0]}의 에너지처럼 ` +
    `당신과 보완적이면서도 자극을 주는 상대가 이상적입니다. ` +
    `MBTI ${mbti.primaryType}와 가장 좋은 궁합인 ${bestMbtis[0]}처럼, ` +
    `당신의 강점을 인정하고 약점을 보완해줄 수 있는 사람을 찾으세요.`;

  return {
    saju: ohangPartnerMap[dayOhang] || ohangPartnerMap["木"],
    zodiac: bestZodiacs,
    mbti: bestMbtis,
    personality: partnerDesc,
  };
}

// ━━━ 올해 연애운 & 좋은 달 ━━━

function generateCurrentYearLove(
  saju: SajuResult,
  western: WesternResult,
  numerology: NumerologyResult,
): { forecast: string; bestMonths: number[] } {
  const currentYear = new Date().getFullYear();
  const personalYear = numerology.personalYear;
  const dayInfo = CHEONGAN_INFO[saju.day.cheongan];
  const dayOhang = saju.day.ohang;
  const sign = western.sunSign;

  // 연도 오행
  const yearStemIdx = (currentYear - 4) % 10;
  const yearOhangMap: Ohang[] = ["木", "木", "火", "火", "土", "土", "金", "金", "水", "水"];
  const yearOhang = yearOhangMap[yearStemIdx];

  const isHarmony = dayOhang === yearOhang ||
    (dayOhang === "木" && yearOhang === "水") || (dayOhang === "火" && yearOhang === "木") ||
    (dayOhang === "土" && yearOhang === "火") || (dayOhang === "金" && yearOhang === "土") ||
    (dayOhang === "水" && yearOhang === "金");

  const pyRelationTexts: Record<number, string> = {
    1: "새로운 만남의 가능성이 높은 해",
    2: "기존 관계가 깊어지는 해",
    3: "사교 활동에서 인연을 만나기 좋은 해",
    4: "관계의 기초를 다지는 해",
    5: "예상치 못한 인연이 찾아오는 해",
    6: "사랑과 헌신이 깊어지는 해",
    7: "자신을 돌아보며 관계의 의미를 되새기는 해",
    8: "관계에서 실질적 진전이 있는 해",
    9: "낡은 관계 패턴을 정리하는 해",
  };

  const pyText = pyRelationTexts[personalYear] || "변화와 성장의 해";

  let forecast: string;
  if (isHarmony) {
    forecast = `${currentYear}년은 ${OHANG_INFO[yearOhang].kr}의 기운이 당신의 ${OHANG_INFO[dayOhang].kr} 에너지와 상생하여 연애운이 좋은 해입니다. ` +
      `${sign.name}의 연애 에너지도 활발해져, 새로운 인연이든 기존 관계든 긍정적인 발전이 기대됩니다. ` +
      `수비학적으로는 ${pyText}이며, ${dayInfo.nature}의 본질적 매력이 한층 빛나는 시기입니다. ` +
      `적극적으로 사람들과 만나고, 진심을 표현하는 것이 좋은 결과를 가져옵니다.`;
  } else {
    forecast = `${currentYear}년은 ${OHANG_INFO[yearOhang].kr}의 기운이 당신의 ${OHANG_INFO[dayOhang].kr} 에너지와 긴장 관계에 있어, 연애에서 성장통이 있을 수 있는 해입니다. ` +
      `하지만 이 긴장은 더 깊은 자기 이해와 관계의 질적 성장으로 이어질 수 있습니다. ` +
      `수비학적으로 ${pyText}의 에너지와 맞물려, 관계에서 진정 원하는 것이 무엇인지 명확해지는 시기입니다. ` +
      `서두르지 말고, 자신의 감정에 솔직해지는 연습을 하세요.`;
  }

  // 연애 좋은 달: 일간 오행 기반
  const loveMontMap: Record<Ohang, number[]> = {
    "木": [3, 5, 11],
    "火": [4, 7, 10],
    "土": [2, 6, 9],
    "金": [1, 8, 10],
    "水": [3, 9, 12],
  };

  return {
    forecast,
    bestMonths: loveMontMap[dayOhang] || [3, 6, 9],
  };
}

// ━━━ 메인 분석 함수 ━━━

export function analyzeLove(
  year: number, month: number, day: number,
  name?: string, hour?: number
): LoveAnalysis {
  const saju = analyzeSaju(year, month, day, hour);
  const western = analyzeWestern(month, day);
  const numerology = analyzeNumerology(year, month, day, name);
  const mbti = analyzeMBTI(saju.day.cheongan, western.sunSign.name, western.element);

  const profile = determineLoveType(saju, western, numerology, mbti);
  const idealPartner = analyzeIdealPartner(saju, western, numerology, mbti);
  const { forecast, bestMonths } = generateCurrentYearLove(saju, western, numerology);

  return {
    loveType: profile.type,
    loveTypeDesc: profile.desc,
    idealPartner,
    lovePattern: profile.pattern,
    currentYearLove: forecast,
    bestLoveMonths: bestMonths,
    redFlags: profile.redFlags,
    greenFlags: profile.greenFlags,
  };
}
