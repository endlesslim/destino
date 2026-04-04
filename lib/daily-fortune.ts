// lib/daily-fortune.ts
// 매일 운세 엔진 — 사주 일주 기반 일간 운세 생성

import {
  estimateDayCheongan,
  estimateDayJiji,
  CHEONGAN,
  CHEONGAN_INFO,
  JIJI_INFO,
  OHANG_LIST,
  OHANG_INFO,
  SANGSAENG,
  SANGGEUK,
  type Ohang,
  type Cheongan,
  type Jiji,
} from "./saju";

// ━━━ 타입 ━━━

export interface DailyFortune {
  date: string;                    // "2026-04-04"
  dayPillar: { cheongan: string; jiji: string; ohang: string };
  todayElement: string;            // 오늘의 오행
  userElement: string;             // 사용자 일간 오행
  elementRelation: string;         // 오늘과 사용자의 관계

  overall: { score: number; label: string; description: string };
  categories: {
    name: string;
    score: number;         // 1-5
    advice: string;
    color: string;
  }[];

  luckyItem: string;
  luckyNumber: number;
  luckyDirection: string;

  crossMessage: string;
}

// ━━━ 결정론적 시드 해시 ━━━

function seedHash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ━━━ 오행 관계 판정 ━━━

type ElementRelation = "비화" | "상생_생" | "상생_받" | "상극_극" | "상극_받";

function getElementRelation(userOh: Ohang, todayOh: Ohang): { relation: ElementRelation; label: string; baseScore: number } {
  if (userOh === todayOh) {
    return { relation: "비화", label: "비화 — 같은 기운이 겹쳐 안정적", baseScore: 75 };
  }
  if (SANGSAENG[userOh] === todayOh) {
    return { relation: "상생_생", label: "상생 — 나의 기운이 오늘을 살림", baseScore: 70 };
  }
  if (SANGSAENG[todayOh] === userOh) {
    return { relation: "상생_받", label: "상생 — 오늘의 기운이 나를 살림", baseScore: 85 };
  }
  if (SANGGEUK[userOh] === todayOh) {
    return { relation: "상극_극", label: "상극 — 나의 기운이 오늘을 누름", baseScore: 60 };
  }
  // SANGGEUK[todayOh] === userOh
  return { relation: "상극_받", label: "상극 — 오늘의 기운이 나를 누름", baseScore: 50 };
}

// ━━━ 카테고리별 조언 풀 ━━━

const ADVICE_POOL: Record<string, string[]> = {
  "재물": [
    "오후 3시 이후 금전 결정은 내일로 미루세요",
    "예상치 못한 소액 수입이 들어올 징조입니다",
    "지갑 속 영수증을 정리하면 재물 흐름이 트입니다",
    "오늘은 투자보다 저축 쪽이 유리합니다",
    "서쪽 방향에서 좋은 소식이 올 수 있습니다",
    "점심값을 아끼지 마세요. 인연이 재물로 돌아옵니다",
    "중고 거래나 할인 기회를 놓치지 마세요",
    "카드보다 현금이 행운을 부르는 날입니다",
    "급한 지출을 삼가고 계획된 소비만 하세요",
    "동쪽에서 오는 제안에 재물운이 숨어 있습니다",
    "오전 중 결제를 마치면 절약할 수 있습니다",
    "작은 나눔이 큰 복으로 돌아오는 날입니다",
  ],
  "연애": [
    "오늘은 먼저 연락하는 쪽이 유리합니다",
    "진심을 담은 짧은 문자가 관계를 바꿉니다",
    "혼자만의 시간이 오히려 매력을 키웁니다",
    "오래된 친구에게서 새로운 인연의 실마리가 옵니다",
    "따뜻한 음료를 함께하면 마음이 가까워집니다",
    "상대방의 말 뒤에 숨은 감정을 읽어보세요",
    "분홍색 소품이 연애 기운을 끌어당깁니다",
    "오늘은 듣는 쪽이 되면 관계가 깊어집니다",
    "눈을 마주치는 순간에 인연이 시작됩니다",
    "솔직한 한마디가 오해를 풀어줍니다",
    "산책 중 좋은 기운을 만날 수 있습니다",
    "용기 있는 한 걸음이 관계를 진전시킵니다",
  ],
  "건강": [
    "오늘은 따뜻한 물을 자주 마시는 것이 좋겠습니다",
    "어깨와 목 스트레칭에 집중하세요",
    "오후 2시경 잠시 눈을 감고 쉬면 에너지가 돌아옵니다",
    "매운 음식보다 담백한 음식이 몸에 맞는 날입니다",
    "가벼운 산책이 하루의 피로를 씻어줍니다",
    "수면 시간을 30분 일찍 잡으면 내일이 달라집니다",
    "녹색 채소를 챙기면 기운이 살아납니다",
    "과식을 삼가고 소식하면 몸이 가벼워집니다",
    "스마트폰 사용을 줄이면 눈의 피로가 풀립니다",
    "허리를 곧게 세우면 기의 흐름이 좋아집니다",
    "아침에 가볍게 몸을 움직이세요",
    "따뜻한 족욕이 체내 순환을 돕습니다",
  ],
  "직장": [
    "오전 중 중요한 보고를 끝내면 순조롭습니다",
    "윗사람의 조언에 귀를 기울이면 돌파구가 보입니다",
    "팀원과의 짧은 대화가 프로젝트를 살립니다",
    "새로운 제안은 내일 오전이 적기입니다",
    "메일보다 직접 얼굴을 보고 이야기하세요",
    "오늘 시작한 일은 빠르게 마무리 지을 수 있습니다",
    "회의에서 먼저 의견을 내면 주도권을 잡을 수 있습니다",
    "꼼꼼한 확인이 큰 실수를 막아줍니다",
    "동료의 작은 부탁을 들어주면 인복이 쌓입니다",
    "오후에 예상치 못한 업무가 들어올 수 있으니 여유를 두세요",
    "창의적 아이디어가 떠오르는 시간대는 오전 10시경입니다",
    "서류 정리를 하면 막혔던 일이 풀립니다",
  ],
};

// ━━━ 행운 아이템 풀 ━━━

const LUCKY_ITEMS: string[] = [
  "파란색 볼펜", "커피 한 잔", "흰색 셔츠", "가죽 소품",
  "레몬 향 핸드크림", "나무 재질 악세서리", "검은색 가방",
  "따뜻한 차 한 잔", "베이지색 스카프", "손목시계",
  "민트색 노트", "갈색 구두", "실버 반지", "자수정 소품",
  "파란색 우산", "흰색 손수건", "캔들", "녹색 식물",
  "빈티지 엽서", "도자기 컵", "올리브색 옷", "남색 넥타이",
  "체크무늬 소품", "원목 펜", "라벤더 향 파우치",
  "주황색 머그컵", "회색 니트", "구리색 열쇠고리",
  "물병", "작은 거울",
];

const LUCKY_DIRECTIONS = ["동쪽", "서쪽", "남쪽", "북쪽", "동남쪽", "서남쪽", "동북쪽", "서북쪽"];

// ━━━ 종합 해석 메시지 생성 ━━━

function generateCrossMessage(
  userCheongan: Cheongan,
  todayCheongan: Cheongan,
  todayJiji: Jiji,
  relation: ElementRelation,
  overallScore: number,
): string {
  const userInfo = CHEONGAN_INFO[userCheongan];
  const todayInfo = CHEONGAN_INFO[todayCheongan];
  const jijiInfo = JIJI_INFO[todayJiji];

  const userNature = userInfo.nature;
  const todayNature = todayInfo.nature;

  let first = "";
  switch (relation) {
    case "비화":
      first = `오늘의 ${todayNature}(${todayInfo.kr}) 기운이 당신의 ${userNature}(${userInfo.kr})과 같은 결을 이룹니다. 익숙한 에너지 속에서 안정을 찾을 수 있는 하루입니다.`;
      break;
    case "상생_받":
      first = `오늘의 ${todayNature}(${todayInfo.kr}) 기운이 당신의 ${userNature}(${userInfo.kr})을 키워줍니다. 주변의 도움이 자연스럽게 흘러들어오는 날입니다.`;
      break;
    case "상생_생":
      first = `당신의 ${userNature}(${userInfo.kr}) 기운이 오늘의 ${todayNature}을 살리는 날입니다. 에너지를 나누되, 자신을 위한 시간도 확보하세요.`;
      break;
    case "상극_극":
      first = `당신의 ${userNature}(${userInfo.kr})이 오늘의 ${todayNature}(${todayInfo.kr})과 부딪히는 기운입니다. 밀어붙이기보다 유연하게 대처하면 오히려 돌파구가 보입니다.`;
      break;
    case "상극_받":
      first = `오늘의 ${todayNature}(${todayInfo.kr}) 기운이 당신의 ${userNature}(${userInfo.kr})을 압박합니다. 무리하지 말고, 천천히 움직이는 것이 상책입니다.`;
      break;
  }

  const second = `${jijiInfo.animal_kr}의 시간대(${jijiInfo.time})에 기운이 가장 활발해집니다.`;

  return `${first} ${second}`;
}

// ━━━ 점수 라벨 ━━━

function getScoreLabel(score: number): { label: string; description: string } {
  if (score >= 85) return { label: "대길", description: "하늘과 땅의 기운이 당신 편입니다. 적극적으로 움직이세요." };
  if (score >= 75) return { label: "길", description: "순탄한 흐름입니다. 계획한 일을 밀고 나가세요." };
  if (score >= 65) return { label: "소길", description: "작은 행운이 곳곳에 숨어 있습니다. 세심하게 살피세요." };
  if (score >= 55) return { label: "평", description: "무난한 하루입니다. 큰 결정은 내일로 미루는 것도 방법입니다." };
  if (score >= 45) return { label: "소흉", description: "약간의 장애물이 있지만, 침착하면 넘길 수 있습니다." };
  return { label: "주의", description: "기운이 엇갈리는 날입니다. 차분하게 내면을 다스리세요." };
}

// ━━━ 카테고리 컬러 ━━━

const CATEGORY_COLORS: Record<string, string> = {
  "재물": "var(--face)",   // 황토색
  "연애": "var(--seal)",   // 주홍
  "건강": "var(--saju)",   // 소나무 초록
  "직장": "var(--astro)",  // 깊은 남색
};

// ━━━ 메인 함수 ━━━

export function generateDailyFortune(
  year: number,
  month: number,
  day: number,
  date?: string,
): DailyFortune {
  // 오늘 날짜
  const today = date || new Date().toISOString().split("T")[0];

  // 결정론적 시드: 사용자 생년월일 + 오늘 날짜
  const seed = seedHash(`${year}-${month}-${day}:${today}`);
  const rand = seededRandom(seed);

  // 사용자 일간 (생년월일 기준)
  const userCheongan = estimateDayCheongan(year, month, day);
  const userOhangIdx = Math.floor(CHEONGAN.indexOf(userCheongan) / 2);
  const userOhang = OHANG_LIST[userOhangIdx];

  // 오늘의 일주 (오늘 날짜 기준)
  const [tY, tM, tD] = today.split("-").map(Number);
  const todayCheongan = estimateDayCheongan(tY, tM, tD);
  const todayJiji = estimateDayJiji(tY, tM, tD);
  const todayOhangIdx = Math.floor(CHEONGAN.indexOf(todayCheongan) / 2);
  const todayOhang = OHANG_LIST[todayOhangIdx];

  // 오행 관계
  const { relation, label: relationLabel, baseScore } = getElementRelation(userOhang, todayOhang);

  // 전체 점수 (base + 시드 기반 변동 -10 ~ +10)
  const variation = Math.floor(rand() * 21) - 10;
  const overallScore = Math.max(30, Math.min(95, baseScore + variation));

  const { label: overallLabel, description: overallDescription } = getScoreLabel(overallScore);

  // 카테고리별 점수
  const categoryNames = ["재물", "연애", "건강", "직장"];
  const categories = categoryNames.map((name) => {
    // 각 카테고리에 오행 관계 기반 + 시드 변동
    const catBase = baseScore + Math.floor(rand() * 25) - 12;
    const catScore = Math.max(1, Math.min(5, Math.round(catBase / 20)));

    // 조언 선택 (시드 기반)
    const pool = ADVICE_POOL[name];
    const adviceIdx = Math.floor(rand() * pool.length);

    return {
      name: `${name}운`,
      score: catScore,
      advice: pool[adviceIdx],
      color: CATEGORY_COLORS[name],
    };
  });

  // 행운의 아이템
  const luckyItem = LUCKY_ITEMS[Math.floor(rand() * LUCKY_ITEMS.length)];

  // 행운의 숫자 (1-99)
  const luckyNumber = Math.floor(rand() * 99) + 1;

  // 행운의 방향 (오행 방향 기반 + 시드)
  const ohangDirection = OHANG_INFO[userOhang].direction;
  const directionPool = [ohangDirection + "쪽", ...LUCKY_DIRECTIONS];
  const luckyDirection = directionPool[Math.floor(rand() * directionPool.length)];

  // 종합 해석 메시지
  const crossMessage = generateCrossMessage(
    userCheongan, todayCheongan, todayJiji, relation, overallScore,
  );

  return {
    date: today,
    dayPillar: {
      cheongan: todayCheongan,
      jiji: todayJiji,
      ohang: OHANG_INFO[todayOhang].kr,
    },
    todayElement: `${todayOhang}(${OHANG_INFO[todayOhang].kr})`,
    userElement: `${userOhang}(${OHANG_INFO[userOhang].kr})`,
    elementRelation: relationLabel,

    overall: { score: overallScore, label: overallLabel, description: overallDescription },
    categories,

    luckyItem,
    luckyNumber,
    luckyDirection,
    crossMessage,
  };
}
