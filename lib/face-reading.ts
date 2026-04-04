// lib/face-reading.ts
// 관상 (physiognomy) — questionnaire-based face reading engine

// ━━━ Types ━━━

export type Ohang = "木" | "火" | "土" | "金" | "水";

export interface FaceQuestion {
  id: string;
  area: string;          // "이마", "눈", "코", "입", "턱"
  areaHanja: string;     // "額", "目", "鼻", "口", "顎"
  question: string;
  options: { label: string; value: string; trait: string; ohang: Ohang }[];
}

export interface FaceReadingResult {
  faceType: string;
  faceTypeDesc: string;
  features: {
    area: string;
    areaHanja: string;
    reading: string;
    ohangElement: Ohang;
  }[];
  overallOhang: Ohang;
  ohangDescription: string;
  sajuConnection: string;
  career: string[];
  personality: string;
}

// ━━━ Questions ━━━

export const FACE_QUESTIONS: FaceQuestion[] = [
  {
    id: "forehead",
    area: "이마",
    areaHanja: "額",
    question: "이마가 넓은 편인가요?",
    options: [
      { label: "넓은 편이다", value: "wide", trait: "넓은 이마는 지혜와 포부를 상징합니다", ohang: "火" },
      { label: "보통이다", value: "medium", trait: "균형 잡힌 이마는 안정된 사고력을 나타냅니다", ohang: "土" },
      { label: "좁은 편이다", value: "narrow", trait: "좁은 이마는 집중력과 실행력을 의미합니다", ohang: "水" },
    ],
  },
  {
    id: "eyes",
    area: "눈",
    areaHanja: "目",
    question: "눈이 어떤 형태에 가까운가요?",
    options: [
      { label: "크고 또렷하다", value: "big", trait: "큰 눈은 열정과 표현력을 상징합니다", ohang: "火" },
      { label: "보통 크기다", value: "medium", trait: "균형 잡힌 눈은 성장과 조화를 나타냅니다", ohang: "木" },
      { label: "가늘고 날카롭다", value: "sharp", trait: "가느다란 눈은 판단력과 정확성을 의미합니다", ohang: "金" },
    ],
  },
  {
    id: "nose",
    area: "코",
    areaHanja: "鼻",
    question: "코의 높이가 어떤 편인가요?",
    options: [
      { label: "높은 편이다", value: "high", trait: "높은 코는 자존심과 추진력을 상징합니다", ohang: "金" },
      { label: "보통이다", value: "medium", trait: "균형 잡힌 코는 안정된 재물운을 나타냅니다", ohang: "土" },
      { label: "낮은 편이다", value: "low", trait: "낮은 코는 유연함과 협조심을 의미합니다", ohang: "水" },
    ],
  },
  {
    id: "mouth",
    area: "입",
    areaHanja: "口",
    question: "입이 어떤 편인가요?",
    options: [
      { label: "큰 편이다", value: "big", trait: "큰 입은 사교성과 리더십을 상징합니다", ohang: "火" },
      { label: "보통이다", value: "medium", trait: "균형 잡힌 입은 신중한 언어를 나타냅니다", ohang: "土" },
      { label: "작은 편이다", value: "small", trait: "작은 입은 절제력과 섬세함을 의미합니다", ohang: "金" },
    ],
  },
  {
    id: "jaw",
    area: "턱",
    areaHanja: "顎",
    question: "턱의 형태가 어떤가요?",
    options: [
      { label: "각진 편이다", value: "angular", trait: "각진 턱은 강한 의지와 결단력을 상징합니다", ohang: "金" },
      { label: "둥근 편이다", value: "round", trait: "둥근 턱은 포용력과 인복을 나타냅니다", ohang: "土" },
      { label: "뾰족한 편이다", value: "pointed", trait: "뾰족한 턱은 예술적 감각과 창의성을 의미합니다", ohang: "火" },
    ],
  },
];

// ━━━ Face type mappings ━━━

interface FaceTypeProfile {
  type: string;
  desc: string;
  personality: string;
  career: string[];
}

const FACE_TYPE_MAP: Record<Ohang, FaceTypeProfile> = {
  "木": {
    type: "학자형",
    desc: "목(木)의 기운이 지배하는 얼굴입니다. 학자형은 지적 호기심이 강하고, 어떤 분야든 깊이 파고들어가는 탐구정신을 가지고 있습니다. 나무가 뿌리를 내리듯 한 분야에 꾸준히 매진하며, 그 과정에서 남다른 통찰을 얻습니다. 겉으로는 조용해 보이지만, 내면에는 세상을 이해하고자 하는 뜨거운 열정이 흐르고 있습니다. 인내심이 강하고 원칙을 중시하는 성격으로, 주변 사람들에게 신뢰를 줍니다.",
    personality: "조용하지만 깊은 사고력을 지녔으며, 한번 관심을 가진 분야에 몰입하는 집중력이 뛰어납니다. 원칙을 중시하고 정직하며, 겉으로 드러나지 않지만 내면의 열정이 강한 편입니다.",
    career: ["연구원", "교수", "작가", "프로그래머", "데이터 분석가"],
  },
  "火": {
    type: "지도자형",
    desc: "화(火)의 기운이 지배하는 얼굴입니다. 지도자형은 타고난 카리스마와 추진력으로 주변 사람들을 이끄는 힘을 가지고 있습니다. 불꽃처럼 뜨거운 열정과 에너지로 어떤 상황에서도 앞장서며, 빠른 판단력과 실행력이 돋보입니다. 사람들 사이에서 자연스럽게 중심이 되며, 위기 상황에서 더욱 빛나는 타입입니다. 다만 지나친 열정이 때로는 성급함으로 나타날 수 있으니, 차분함을 함께 기르면 더욱 완성됩니다.",
    personality: "에너지가 넘치고 표현력이 풍부하며, 사람들 앞에 서는 것을 두려워하지 않습니다. 빠른 결단력과 추진력이 있으며, 열정적인 성격으로 주변에 활력을 불어넣습니다.",
    career: ["CEO", "정치인", "방송인", "강연가", "영업 전문가"],
  },
  "土": {
    type: "중재자형",
    desc: "토(土)의 기운이 지배하는 얼굴입니다. 중재자형은 안정적이고 신뢰감을 주는 존재로, 어디에서든 중심을 잡아주는 역할을 합니다. 대지처럼 묵직하고 든든한 성품으로, 주변 사람들이 자연스럽게 기대고 싶어하는 타입입니다. 균형 감각이 뛰어나고 편견 없이 모든 입장을 수용하는 포용력이 있습니다. 급격한 변화보다는 꾸준한 성장을 추구하며, 시간이 갈수록 진가를 발휘하는 대기만성형입니다.",
    personality: "안정적이고 인내심이 강하며, 어떤 상황에서도 흔들리지 않는 중심을 가지고 있습니다. 포용력이 넓고 사람들을 편안하게 해주며, 신뢰를 쌓는 데 뛰어난 능력을 보입니다.",
    career: ["인사 관리자", "상담사", "교육자", "부동산 전문가", "공무원"],
  },
  "金": {
    type: "전략가형",
    desc: "금(金)의 기운이 지배하는 얼굴입니다. 전략가형은 날카로운 판단력과 정확한 분석력으로 상황을 꿰뚫어 보는 능력을 가지고 있습니다. 쇠가 단련될수록 단단해지듯, 경험이 쌓일수록 더욱 빛나는 타입입니다. 효율을 중시하고 불필요한 것을 제거하는 결단력이 있으며, 한번 결정한 일은 반드시 완수합니다. 냉정해 보일 수 있지만, 신뢰하는 사람에게는 한없이 따뜻한 면을 보입니다.",
    personality: "논리적이고 분석적이며, 효율을 중시하는 완벽주의 성향이 있습니다. 감정보다 이성으로 판단하는 편이며, 한번 신뢰를 준 사람에게는 끝까지 의리를 지킵니다.",
    career: ["변호사", "금융 분석가", "외과의사", "엔지니어", "감사관"],
  },
  "水": {
    type: "예술가형",
    desc: "수(水)의 기운이 지배하는 얼굴입니다. 예술가형은 풍부한 감수성과 직관력으로 남들이 보지 못하는 것을 느끼고 표현하는 능력을 가지고 있습니다. 물이 어떤 그릇에든 담기듯, 뛰어난 적응력과 유연함을 갖추고 있으며, 창의적인 발상이 끊임없이 샘솟습니다. 감정의 깊이가 남다르고, 예술적 표현에서 특별한 재능을 보입니다. 자유를 사랑하며 틀에 박힌 것을 싫어하는 독립적인 영혼입니다.",
    personality: "감수성이 풍부하고 직관력이 뛰어나며, 창의적인 생각을 자연스럽게 해냅니다. 자유로운 영혼으로 틀에 얽매이는 것을 싫어하며, 감정의 깊이가 남다릅니다.",
    career: ["디자이너", "음악가", "영화감독", "심리학자", "마케터"],
  },
};

// ━━━ Ohang descriptions ━━━

const OHANG_DESC: Record<Ohang, string> = {
  "木": "나무의 기운은 성장, 인내, 그리고 곧은 기질을 나타냅니다. 위로 뻗어 올라가는 에너지로 끊임없이 발전하려는 의지가 있습니다.",
  "火": "불의 기운은 열정, 추진력, 그리고 빛나는 카리스마를 나타냅니다. 따뜻함으로 주변을 밝히고 사람들을 끌어당기는 힘이 있습니다.",
  "土": "흙의 기운은 안정, 포용, 그리고 깊은 신뢰를 나타냅니다. 대지처럼 묵직하게 중심을 잡아주며 모든 것을 품는 힘이 있습니다.",
  "金": "쇠의 기운은 결단, 정확성, 그리고 날카로운 판단력을 나타냅니다. 단련될수록 강해지며, 흔들림 없는 의지를 상징합니다.",
  "水": "물의 기운은 유연함, 감수성, 그리고 깊은 직관을 나타냅니다. 어디에든 스며드는 적응력과 끊임없이 흐르는 창의성이 있습니다.",
};

// ━━━ Saju connection templates ━━━

function buildSajuConnection(faceOhang: Ohang, year: number, month: number, day: number): string {
  // Simple saju element derivation from birth year heavenly stem
  const stemIndex = (year - 4) % 10;
  const sajuElements: Ohang[] = ["木", "木", "火", "火", "土", "土", "金", "金", "水", "水"];
  const sajuOhang = sajuElements[stemIndex];

  if (faceOhang === sajuOhang) {
    return `관상의 오행(${faceOhang})이 사주의 일간 오행(${sajuOhang})과 일치합니다. 이는 내면과 외면이 일관된 사람임을 의미하며, 타고난 기질이 얼굴에도 그대로 드러나는 강한 운명의 소유자입니다. 자신의 본성에 충실할 때 가장 큰 성취를 이룰 수 있습니다.`;
  }

  const relations: Record<string, string> = {
    "木火": "관상의 화(火) 기운이 사주의 목(木)을 돕습니다. 나무가 불을 피우듯, 내면의 성장 에너지가 외적인 열정으로 자연스럽게 표출됩니다.",
    "火木": "관상의 목(木) 기운이 사주의 화(火)를 돕습니다. 불의 열정에 나무의 인내가 더해져, 꾸준히 타오르는 지속력을 가집니다.",
    "火土": "관상의 토(土) 기운이 사주의 화(火)를 받아줍니다. 열정적인 내면이 안정적인 외면으로 균형을 이루어, 신뢰할 수 있는 리더가 됩니다.",
    "土火": "관상의 화(火) 기운이 사주의 토(土)에 활력을 줍니다. 안정적인 본성에 열정이 더해져, 행동하는 중재자가 됩니다.",
    "土金": "관상의 금(金) 기운이 사주의 토(土)에서 태어납니다. 토에서 금이 나오듯, 안정된 기반 위에 날카로운 판단력이 빛납니다.",
    "金土": "관상의 토(土) 기운이 사주의 금(金)을 품어줍니다. 날카로운 내면을 부드러운 외면이 감싸, 따뜻한 전략가가 됩니다.",
    "金水": "관상의 수(水) 기운이 사주의 금(金)을 씻어줍니다. 정확한 판단력에 유연한 감성이 더해져, 균형 잡힌 분석가가 됩니다.",
    "水金": "관상의 금(金) 기운이 사주의 수(水)를 담아냅니다. 자유로운 내면에 단단한 의지가 더해져, 방향 있는 창의성을 발휘합니다.",
    "水木": "관상의 목(木) 기운이 사주의 수(水)를 먹고 자랍니다. 물이 나무를 키우듯, 풍부한 감수성이 꾸준한 성장의 원동력이 됩니다.",
    "木水": "관상의 수(水) 기운이 사주의 목(木)을 키웁니다. 깊은 직관력이 성장의 방향을 제시하여, 올바른 길로 나아갑니다.",
    "木金": "관상의 금(金) 기운이 사주의 목(木)을 다듬습니다. 때로는 긴장이 있지만, 이 긴장이 오히려 성장의 동력이 됩니다.",
    "金木": "관상의 목(木) 기운이 사주의 금(金)에 부드러움을 더합니다. 날카로운 내면에 성장하는 에너지가 더해져 균형을 이룹니다.",
    "木土": "관상의 토(土) 기운이 사주의 목(木)에 뿌리를 내려줍니다. 성장하려는 의지에 안정된 기반이 더해져 흔들림 없는 발전을 이룹니다.",
    "土木": "관상의 목(木) 기운이 사주의 토(土)에서 자라납니다. 안정된 기반 위에 새로운 가능성이 싹트며, 꾸준한 성장이 기대됩니다.",
    "火金": "관상의 금(金) 기운이 사주의 화(火)와 긴장을 이루지만, 불에 단련된 쇠가 더 강해지듯, 시련 속에서 진정한 강함을 얻습니다.",
    "金火": "관상의 화(火) 기운이 사주의 금(金)을 달굽니다. 내면의 단단함이 열정으로 단련되어, 더욱 정제된 힘을 발휘합니다.",
    "火水": "관상의 수(水) 기운이 사주의 화(火)와 대비를 이룹니다. 상반된 기운이 오히려 다채로운 매력을 만들어냅니다.",
    "水火": "관상의 화(火) 기운이 사주의 수(水)와 조화를 이룹니다. 물과 불의 균형이 독특한 카리스마를 만들어냅니다.",
    "土水": "관상의 수(水) 기운이 사주의 토(土)와 만납니다. 대지가 물을 담듯, 안정된 내면에 유연함이 더해져 깊은 지혜를 갖춥니다.",
    "水土": "관상의 토(土) 기운이 사주의 수(水)를 담아냅니다. 자유로운 흐름에 안정적인 방향이 더해져, 목적 있는 창의성을 발휘합니다.",
  };

  const key = `${sajuOhang}${faceOhang}`;
  return relations[key] || `관상의 오행(${faceOhang})과 사주의 오행(${sajuOhang})이 서로 보완하며, 내면과 외면이 조화를 이루어 균형 잡힌 운명을 만들어갑니다.`;
}

// ━━━ Main engine ━━━

export type FaceAnswers = Record<string, string>; // questionId -> option value

export function generateFaceReading(
  answers: FaceAnswers,
  birthYear?: number,
  birthMonth?: number,
  birthDay?: number,
): FaceReadingResult {
  // Build features from answers
  const features: FaceReadingResult["features"] = [];
  const ohangCounts: Record<Ohang, number> = { "木": 0, "火": 0, "土": 0, "金": 0, "水": 0 };

  for (const q of FACE_QUESTIONS) {
    const selectedValue = answers[q.id];
    const option = q.options.find((o) => o.value === selectedValue) || q.options[1]; // default to medium

    features.push({
      area: q.area,
      areaHanja: q.areaHanja,
      reading: option.trait,
      ohangElement: option.ohang,
    });

    ohangCounts[option.ohang]++;
  }

  // Determine dominant ohang
  const overallOhang = (Object.entries(ohangCounts) as [Ohang, number][])
    .sort((a, b) => b[1] - a[1])[0][0];

  const profile = FACE_TYPE_MAP[overallOhang];

  // Build saju connection
  const sajuConnection = birthYear && birthMonth && birthDay
    ? buildSajuConnection(overallOhang, birthYear, birthMonth, birthDay)
    : "생년월일 정보가 없어 사주와의 연결을 분석할 수 없습니다. 교차 분석 페이지에서 생년월일을 입력하시면 더 깊은 분석이 가능합니다.";

  return {
    faceType: profile.type,
    faceTypeDesc: profile.desc,
    features,
    overallOhang,
    ohangDescription: OHANG_DESC[overallOhang],
    sajuConnection,
    career: profile.career,
    personality: profile.personality,
  };
}
